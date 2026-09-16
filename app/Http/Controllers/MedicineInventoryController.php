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

        $inventories = MedicineInventory::with('medicine')
            ->orderBy('expiry_date')
            ->paginate($perPage)
            ->withQueryString();

        $lowStock = Medicine::whereHas('inventories', function ($q) {
            $q->whereColumn('quantity', '<=', 'reorder_level');
        })->withSum('inventories as total_stock', 'quantity')->get();

        return Inertia::render('Inventory/Index', [
            'inventories' => $inventories,
            'lowStock' => $lowStock,
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
