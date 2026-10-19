<?php

namespace App\Http\Controllers;

use App\Models\MedicineInventory;
use App\Models\Medicine;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MedicineInventoryController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->isDoctor()) {
            abort(403, 'Only pharmacists can manage inventory.');
        }

        $perPage = (int) $request->get('per_page', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $tab = $request->get('tab') === 'archived' ? 'archived' : 'active';

        // Dashboard deep-links: ?filter=low_stock | expiring_soon
        $filter = $request->get('filter');
        $filter = in_array($filter, ['low_stock', 'expiring_soon'], true) ? $filter : null;

        $inventories = MedicineInventory::with('medicine')
            ->whereHas('medicine', fn ($q) => $q->active())
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->input('search'));
                $query->where(function ($q) use ($search) {
                    $q->where('batch_number', 'like', "%{$search}%")
                        ->orWhereHas('medicine', function ($m) use ($search) {
                            $m->where('generic_name', 'like', "%{$search}%")
                                ->orWhere('brand_name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($filter === 'low_stock', fn ($query) => $query->whereColumn('quantity', '<=', 'reorder_level'))
            ->when($filter === 'expiring_soon', fn ($query) => $query
                ->whereNotNull('expiry_date')
                ->where('expiry_date', '<=', now()->addDays(30))
                ->where('expiry_date', '>', now()))
            ->orderBy('expiry_date')
            ->paginate($perPage)
            ->withQueryString();

        $lowStock = Medicine::active()->whereHas('inventories', function ($q) {
            $q->whereColumn('quantity', '<=', 'reorder_level');
        })->withSum('inventories as total_stock', 'quantity')->get();

        // Batches that still hold stock but are expired or expire within 30 days.
        $expiring = MedicineInventory::with('medicine:id,generic_name')
            ->whereHas('medicine', fn ($q) => $q->active())
            ->where('quantity', '>', 0)
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<=', now()->addDays(30))
            ->orderBy('expiry_date')
            ->get(['id', 'medicine_id', 'batch_number', 'expiry_date', 'quantity']);

        // Archive tab: batches moved out of live stock + whole medicines archived earlier.
        $archivedBatches = null;
        $archivedMedicines = [];
        if ($tab === 'archived') {
            $archivedBatches = MedicineInventory::withoutGlobalScope('notArchived')
                ->whereNotNull('archived_at')
                ->with('medicine:id,generic_name,brand_name')
                ->orderByDesc('archived_at')
                ->paginate($perPage, ['*'], 'archive_page')
                ->withQueryString();
            $archivedMedicines = Medicine::archived()
                ->withSum('inventories as total_stock', 'quantity')
                ->orderBy('generic_name')
                ->get();
        }

        return Inertia::render('Inventory/Index', [
            'inventories' => $inventories,
            'lowStock' => $lowStock,
            'expiring' => $expiring,
            'filter' => $filter,
            'tab' => $tab,
            'archivedBatches' => $archivedBatches,
            'archivedMedicines' => $archivedMedicines,
            'archivedCount' => MedicineInventory::withoutGlobalScope('notArchived')->whereNotNull('archived_at')->count()
                + Medicine::archived()->count(),
            // Live batches that are expired or expire within 30 days (what "Archive all" would move).
            'archivableCount' => MedicineInventory::whereHas('medicine', fn ($q) => $q->active())
                ->whereNotNull('expiry_date')
                ->where('expiry_date', '<=', now()->addDays(30))
                ->count(),
        ]);
    }

    public function edit(Request $request, MedicineInventory $inventory)
    {
        if ($request->user()->isDoctor()) {
            abort(403, 'Only pharmacists can manage inventory.');
        }
        $inventory->load('medicine');
        return Inertia::render('Inventory/Edit', [
            'inventory' => $inventory,
        ]);
    }

    public function update(Request $request, MedicineInventory $inventory)
    {
        if ($request->user()->isDoctor()) {
            abort(403, 'Only pharmacists can manage inventory.');
        }
        $validated = $request->validate([
            'batch_number' => 'nullable|string|max:255',
            'expiry_date' => 'nullable|date',
            'quantity' => 'required|integer|min:0',
            'unit_price' => 'required|numeric|min:0',
            'reorder_level' => 'required|integer|min:0',
        ]);

        $inventory->update($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update_inventory',
            'description' => "Updated inventory for {$inventory->medicine->generic_name}",
        ]);

        return redirect()->route('inventory.index')
            ->with('success', 'Inventory updated successfully.');
    }

    /** Move one expired / near-expiry batch into the Inventory archive. */
    public function archive(Request $request, MedicineInventory $inventory)
    {
        $this->authorizePharmacy($request);
        $inventory->load('medicine');

        if (! $inventory->isArchivable()) {
            return back()->with('error', 'Only expired batches or batches expiring within 30 days can be archived.');
        }

        $inventory->update(['archived_at' => now()]);
        $this->logBatch($request, 'archive_batch', 'Archived', $inventory);

        return back()->with('success', "{$inventory->medicine->generic_name} batch moved to the archive.");
    }

    /** Move every live expired / near-expiry batch into the archive in one go. */
    public function archiveExpiring(Request $request)
    {
        $this->authorizePharmacy($request);

        $batches = MedicineInventory::with('medicine:id,generic_name')
            ->whereHas('medicine', fn ($q) => $q->active())
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<=', now()->addDays(30))
            ->get();

        foreach ($batches as $batch) {
            $batch->update(['archived_at' => now()]);
        }

        if ($batches->isNotEmpty()) {
            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'archive_batch',
                'description' => "Archived {$batches->count()} expired / near-expiry batch(es)",
            ]);
        }

        return back()->with('success', $batches->isEmpty()
            ? 'Nothing to archive right now.'
            : "{$batches->count()} batch(es) moved to the archive.");
    }

    /** Bring an archived batch back into live stock. */
    public function restore(Request $request, int $inventoryId)
    {
        $this->authorizePharmacy($request);

        $inventory = MedicineInventory::withoutGlobalScope('notArchived')
            ->whereNotNull('archived_at')
            ->with('medicine:id,generic_name')
            ->findOrFail($inventoryId);

        $inventory->update(['archived_at' => null]);
        $this->logBatch($request, 'restore_batch', 'Restored', $inventory);

        return back()->with('success', "{$inventory->medicine->generic_name} batch restored to live stock.");
    }

    private function authorizePharmacy(Request $request): void
    {
        if ($request->user()->isDoctor()) {
            abort(403, 'Only pharmacists can manage inventory.');
        }
    }

    private function logBatch(Request $request, string $action, string $verb, MedicineInventory $inventory): void
    {
        $batch = $inventory->batch_number ? " (batch {$inventory->batch_number})" : '';
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => $action,
            'description' => "{$verb} {$inventory->medicine->generic_name}{$batch}",
        ]);
    }
}
