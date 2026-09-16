<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\DispensingRecord;
use App\Models\MedicineInventory;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DispensingController extends Controller
{
    public function create(Prescription $prescription)
    {
        // Only pharmacists can dispense
        if (!request()->user()->isPharmacist()) {
            abort(403, 'Only pharmacists can dispense medications.');
        }

        // Can only dispense validated prescriptions
        if ($prescription->status !== 'validated') {
            return redirect()->back()->with('error', 'Prescription must be validated before dispensing.');
        }

        $prescription->load(['patient', 'doctor', 'items.medicine']);

        // Get all available inventory (with stock > 0, not expired)
        $allMedicineIds = $prescription->items->pluck('medicine_id');
        $inventory = MedicineInventory::with('medicine')
            ->whereIn('medicine_id', $allMedicineIds)
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

        if ($prescription->status !== 'validated') {
            return redirect()->back()->with('error', 'Prescription must be validated before dispensing.');
        }

        $validated = $request->validate([
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.medicine_inventory_id' => 'required|exists:medicine_inventories,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        // Check stock availability before processing
        foreach ($validated['items'] as $item) {
            $inventory = MedicineInventory::with('medicine')->find($item['medicine_inventory_id']);
            if (!$inventory || $inventory->quantity < $item['quantity']) {
                $medicineName = $inventory?->medicine?->generic_name ?? 'Unknown';
                return redirect()->back()->with('error',
                    "Insufficient stock for '{$medicineName}'. " .
                    "Requested: {$item['quantity']}, Available: " . ($inventory->quantity ?? 0)
                );
            }
        }

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

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'dispense_prescription',
            'description' => "Dispensed prescription {$prescription->prescription_number}",
        ]);

        return redirect()->route('prescriptions.show', $prescription)
            ->with('success', 'Prescription dispensed successfully.');
    }
}
