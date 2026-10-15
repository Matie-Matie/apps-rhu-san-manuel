<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\DispensingRecord;
use App\Models\MedicineInventory;
use App\Models\ActivityLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DispensingController extends Controller
{
    public function create(Prescription $prescription)
    {
        // Only pharmacists can dispense
        if (!request()->user()->isPharmacist()) {
            abort(403, 'Only pharmacists can dispense medications.');
        }

        // Can only dispense pending prescriptions (V2: no validate step —
        // the doctor's signature already validates). Legacy 'validated' rows
        // are still dispensable.
        if (!in_array($prescription->status, ['pending', 'validated'], true)) {
            return redirect()->back()->with('error', 'Only pending prescriptions can be dispensed.');
        }

        $prescription->load(['patient', 'doctor', 'items.medicine']);

        // Get all available inventory (with stock > 0, not expired, medicine not archived)
        $allMedicineIds = $prescription->items->pluck('medicine_id');
        $inventory = MedicineInventory::with('medicine')
            ->whereIn('medicine_id', $allMedicineIds)
            ->whereHas('medicine', fn ($q) => $q->active())
            ->where('quantity', '>', 0)
            ->where(function ($q) {
                $q->whereNull('expiry_date')->orWhere('expiry_date', '>', now());
            })
            ->orderBy('expiry_date')
            ->get();

        // Attach available stock info to each prescription item
        $allOutOfStock = true;
        $prescription->items->map(function ($item) use ($inventory) {
            $itemInventories = $inventory->where('medicine_id', $item->medicine_id);
            $totalAvailable = $itemInventories->sum('quantity');
            $firstBatch = $itemInventories->first();
            $item->available_stock = $totalAvailable;
            $item->inventory_id = $firstBatch ? $firstBatch->id : null;
            $item->unit_price = $firstBatch ? $firstBatch->unit_price : 0;
            return $item;
        });

        $allOutOfStock = $prescription->items->every(fn($i) => $i->available_stock === 0);

        return Inertia::render('Dispensing/Create', [
            'prescription' => $prescription,
            'inventory' => $inventory,
            'allOutOfStock' => $allOutOfStock,
        ]);
    }

    public function store(Request $request, Prescription $prescription)
    {
        if (!$request->user()->isPharmacist()) {
            abort(403, 'Only pharmacists can dispense medications.');
        }

        if (!in_array($prescription->status, ['pending', 'validated'], true)) {
            return redirect()->back()->with('error', 'Only pending prescriptions can be dispensed.');
        }

        $validated = $request->validate([
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.prescription_item_id' => ['required', Rule::exists('prescription_items', 'id')->where('prescription_id', $prescription->id)],
            'items.*.medicine_inventory_id' => 'required|exists:medicine_inventories,id',
            'items.*.quantity' => 'required|integer|min:1',
        ], [
            'items.*.medicine_inventory_id.required' => 'This medicine is not available, so it cannot be dispensed.',
        ]);

        $prescription->load('items.medicine');

        // Every medicine on the prescription must be covered by a batch.
        $covered = collect($validated['items'])->pluck('prescription_item_id')->map(fn ($id) => (int) $id);
        if ($prescription->items->pluck('id')->diff($covered)->isNotEmpty()) {
            return redirect()->back()->with('error', 'Every medicine on the prescription needs a batch before it can be dispensed.');
        }

        // Re-check availability server-side: right medicine, not expired, enough stock.
        foreach ($validated['items'] as $item) {
            $rxItem = $prescription->items->firstWhere('id', (int) $item['prescription_item_id']);
            $inventory = MedicineInventory::with('medicine')->find($item['medicine_inventory_id']);
            $medicineName = $rxItem?->medicine?->generic_name ?? 'Unknown';

            if (!$inventory || (int) $inventory->medicine_id !== (int) $rxItem->medicine_id) {
                return redirect()->back()->with('error', "The selected batch is not '{$medicineName}'.");
            }

            if ($inventory->expiry_date && Carbon::parse($inventory->expiry_date)->lte(now())) {
                return redirect()->back()->with('error', "'{$medicineName}' batch is expired and cannot be dispensed.");
            }

            if ($inventory->quantity < $item['quantity']) {
                return redirect()->back()->with('error',
                    "Not enough stock for '{$medicineName}'. " .
                    "Requested: {$item['quantity']}, Available: {$inventory->quantity}"
                );
            }
        }

        DB::transaction(function () use ($request, $prescription, $validated) {
            $record = DispensingRecord::create([
                'prescription_id' => $prescription->id,
                'pharmacist_id' => $request->user()->id,
                'dispensed_at' => now(),
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $inventory = MedicineInventory::findOrFail($item['medicine_inventory_id']);

                // Create dispensed item with price from inventory record
                $record->dispensedItems()->create([
                    'medicine_inventory_id' => $item['medicine_inventory_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $inventory->unit_price,
                ]);

                // Deduct from inventory
                $inventory->decrement('quantity', $item['quantity']);
            }

            $prescription->update(['status' => 'dispensed']);
        });

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'dispense_prescription',
            'description' => "Dispensed prescription {$prescription->prescription_number}",
            'prescription_id' => $prescription->id,
        ]);

        return redirect()->route('prescriptions.print', $prescription)
            ->with('success', 'Prescription dispensed successfully.');
    }
}
