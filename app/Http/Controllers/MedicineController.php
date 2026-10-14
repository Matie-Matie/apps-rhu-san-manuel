<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\MedicineInventory;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MedicineController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;
        $showingArchived = $request->boolean('archived');

        $medicines = Medicine::withSum('inventories as total_stock', 'quantity')
            ->when($showingArchived, fn ($q) => $q->archived(), fn ($q) => $q->active())
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->input('search'));
                $query->where(function ($q) use ($search) {
                    $q->where('generic_name', 'like', "%{$search}%")
                        ->orWhere('brand_name', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->orderBy('generic_name')
            ->paginate($perPage)
            ->withQueryString();

        $archivedCount = Medicine::archived()->count();

        return Inertia::render('Medicines/Index', [
            'medicines' => $medicines,
            'showingArchived' => $showingArchived,
            'archivedCount' => $archivedCount,
        ]);
    }

    public function create(Request $request)
    {
        if ($request->user()->isDoctor()) {
            abort(403, 'Only pharmacists can manage medicines.');
        }
        return Inertia::render('Medicines/Create');
    }

    public function store(Request $request)
    {
        if ($request->user()->isDoctor()) {
            abort(403, 'Only pharmacists can manage medicines.');
        }
        $validated = $request->validate([
            'generic_name' => 'required|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'dosage_form' => 'nullable|string|max:255',
            'strength' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $medicine = Medicine::create($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'create_medicine',
            'description' => "Created medicine {$medicine->generic_name}",
        ]);

        return redirect()->route('medicines.index')
            ->with('success', 'Medicine created successfully.');
    }

    public function edit(Request $request, Medicine $medicine)
    {
        if ($request->user()->isDoctor()) {
            abort(403, 'Only pharmacists can manage medicines.');
        }
        $medicine->load('inventories');
        return Inertia::render('Medicines/Edit', [
            'medicine' => $medicine,
        ]);
    }

    public function update(Request $request, Medicine $medicine)
    {
        if ($request->user()->isDoctor()) {
            abort(403, 'Only pharmacists can manage medicines.');
        }
        $validated = $request->validate([
            'generic_name' => 'required|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'dosage_form' => 'nullable|string|max:255',
            'strength' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $medicine->update($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update_medicine',
            'description' => "Updated medicine {$medicine->generic_name}",
        ]);

        return redirect()->route('medicines.index')
            ->with('success', 'Medicine updated successfully.');
    }

    public function destroy(Request $request, Medicine $medicine)
    {
        if ($request->user()->isDoctor()) {
            abort(403, 'Only pharmacists can manage medicines.');
        }
        $name = $medicine->generic_name;
        $medicine->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'delete_medicine',
            'description' => "Deleted medicine {$name}",
        ]);

        return redirect()->route('medicines.index')
            ->with('success', 'Medicine deleted successfully.');
    }

    /** Move a medicine to the archive (hidden everywhere, auto-purged after 6 months). */
    public function archive(Request $request, Medicine $medicine)
    {
        if ($request->user()->isDoctor()) {
            abort(403, 'Only pharmacists can manage medicines.');
        }
        if ($medicine->isArchived()) {
            return back()->with('error', "{$medicine->generic_name} is already archived.");
        }

        $medicine->update(['archived_at' => now()]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'archive_medicine',
            'description' => "Archived medicine {$medicine->generic_name}",
        ]);

        return redirect()->route('medicines.index')
            ->with('success', "{$medicine->generic_name} moved to archive.");
    }

    /** Bring an archived medicine back to the live list. */
    public function restore(Request $request, Medicine $medicine)
    {
        if ($request->user()->isDoctor()) {
            abort(403, 'Only pharmacists can manage medicines.');
        }
        if (!$medicine->isArchived()) {
            return back()->with('error', "{$medicine->generic_name} is not archived.");
        }

        $medicine->update(['archived_at' => null]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'restore_medicine',
            'description' => "Restored medicine {$medicine->generic_name} from archive",
        ]);

        return redirect()->route('medicines.index', ['archived' => 1])
            ->with('success', "{$medicine->generic_name} restored.");
    }

    public function inventory(Request $request, Medicine $medicine)
    {
        if ($request->user()->isDoctor()) {
            abort(403, 'Only pharmacists can manage inventory.');
        }
        return Inertia::render('Medicines/Inventory', [
            'medicine' => $medicine,
            'stockEntries' => $medicine->inventories()->orderBy('expiry_date')->get(),
        ]);
    }

    public function addStock(Request $request, Medicine $medicine)
    {
        if ($request->user()->isDoctor()) {
            abort(403, 'Only pharmacists can manage inventory.');
        }
        if ($medicine->isArchived()) {
            return back()->with('error', 'Restore this medicine from the archive before adding stock.');
        }
        $validated = $request->validate([
            'batch_number' => 'nullable|string|max:255',
            'expiry_date' => 'nullable|date',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
            'reorder_level' => 'required|integer|min:0',
        ]);

        $inventory = $medicine->inventories()->create($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'add_stock',
            'description' => "Added {$validated['quantity']} units to {$medicine->generic_name}",
        ]);

        return redirect()->route('medicines.inventory', $medicine)
            ->with('success', 'Stock added successfully.');
    }

    public function adjustStock(Request $request)
    {
        if ($request->user()->isDoctor()) {
            abort(403, 'Only pharmacists can manage inventory.');
        }

        $validated = $request->validate([
            'adjustments' => 'required|array|min:1|max:200',
            'adjustments.*.medicine_id' => 'required|integer|exists:medicines,id|distinct',
            'adjustments.*.delta' => 'required|integer|not_in:0|between:-100000,100000',
        ]);

        try {
            $changed = DB::transaction(function () use ($validated, $request) {
                foreach ($validated['adjustments'] as $adjustment) {
                    $this->applyAdjustment(
                        Medicine::active()->findOrFail($adjustment['medicine_id']),
                        (int) $adjustment['delta'],
                        $request->user()->id
                    );
                }

                return count($validated['adjustments']);
            });
        } catch (\DomainException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', "Stock updated for {$changed} " . ($changed === 1 ? 'medicine.' : 'medicines.'));
    }

    // Removals come out of the batches expiring first; additions go to the newest
    // unexpired batch (or a fresh batch when none exists).
    private function applyAdjustment(Medicine $medicine, int $delta, int $userId): void
    {
        $batches = $medicine->inventories()
            ->orderByRaw('expiry_date IS NULL')
            ->orderBy('expiry_date')
            ->orderBy('id')
            ->lockForUpdate()
            ->get();

        $before = (int) $batches->sum('quantity');

        if ($delta < 0) {
            $remaining = -$delta;
            if ($remaining > $before) {
                throw new \DomainException(
                    "Cannot remove {$remaining} from {$medicine->generic_name}; only {$before} in stock."
                );
            }
            foreach ($batches as $batch) {
                if ($remaining === 0) {
                    break;
                }
                $take = min($remaining, (int) $batch->quantity);
                if ($take > 0) {
                    $batch->decrement('quantity', $take);
                    $remaining -= $take;
                }
            }
        } else {
            $target = $batches
                ->filter(fn ($b) => $b->expiry_date === null || $b->expiry_date >= today()->toDateString())
                ->sortByDesc('id')
                ->first();

            if ($target) {
                $target->increment('quantity', $delta);
            } else {
                $latest = $batches->sortByDesc('id')->first();
                $medicine->inventories()->create([
                    'quantity' => $delta,
                    'unit_price' => $latest->unit_price ?? 0,
                    'reorder_level' => $latest->reorder_level ?? 10,
                ]);
            }
        }

        $after = $before + $delta;
        $sign = $delta > 0 ? '+' : '';
        ActivityLog::create([
            'user_id' => $userId,
            'action' => 'adjust_stock',
            'description' => "Adjusted stock for {$medicine->generic_name}: {$sign}{$delta} ({$before} → {$after})",
        ]);
    }
}
