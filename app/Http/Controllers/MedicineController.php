<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\MedicineInventory;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MedicineController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $medicines = Medicine::withSum('inventories as total_stock', 'quantity')
            ->orderBy('generic_name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Medicines/Index', [
            'medicines' => $medicines,
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

    public function inventory(Request $request, Medicine $medicine)
    {
        if ($request->user()->isDoctor()) {
            abort(403, 'Only pharmacists can manage inventory.');
        }
        $medicine->load('inventories');
        return Inertia::render('Medicines/Inventory', [
            'medicine' => $medicine,
        ]);
    }

    public function addStock(Request $request, Medicine $medicine)
    {
        if ($request->user()->isDoctor()) {
            abort(403, 'Only pharmacists can manage inventory.');
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
}
