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

        return Inertia::render('Inventory/Index', [
            'inventories' => $inventories,
            'lowStock' => $lowStock,
            'expiring' => $expiring,
            'filter' => $filter,
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
}
