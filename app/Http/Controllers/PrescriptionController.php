<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Patient;
use App\Models\Medicine;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PrescriptionController extends Controller
{
    public function index(Request $request)
    {
        $query = Prescription::with(['patient', 'doctor', 'items.medicine']);

        // Doctors only see their own prescriptions
        if ($request->user()->isDoctor()) {
            $query->where('doctor_id', $request->user()->id);
        }

        // Filter by status if provided
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = (int) $request->get('per_page', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $prescriptions = $query->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Prescriptions/Index', [
            'prescriptions' => $prescriptions,
            'filters' => ['status' => $request->status],
        ]);
    }

    public function create()
    {
        $patients = Patient::orderBy('last_name')->get();

        $medicines = Medicine::withSum('inventories as total_stock', 'quantity')
            ->get()
            ->map(function ($medicine) {
                $stock = $medicine->total_stock ?? 0;
                $medicine->stock_status = $stock <= 0 ? 'out_of_stock' : ($stock <= 10 ? 'low_stock' : 'in_stock');
                return $medicine;
            });

        return Inertia::render('Prescriptions/Create', [
            'patients' => $patients,
            'medicines' => $medicines,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'diagnosis' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.dosage' => 'required|string',
            'items.*.frequency' => 'required|string',
            'items.*.duration' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.instructions' => 'nullable|string',
        ]);

        $prescription = Prescription::create([
            'patient_id' => $validated['patient_id'],
            'doctor_id' => $request->user()->id,
            'prescription_number' => Prescription::generatePrescriptionNumber(),
            'diagnosis' => $validated['diagnosis'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        foreach ($validated['items'] as $item) {
            $prescription->items()->create($item);
        }

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'create_prescription',
            'description' => "Created prescription {$prescription->prescription_number}",
        ]);

        return redirect()->route('prescriptions.index')
            ->with('success', 'Prescription created successfully.');
    }

    public function show(Prescription $prescription)
    {
        $prescription->load(['patient', 'doctor', 'items.medicine', 'dispensingRecord.pharmacist', 'dispensingRecord.dispensedItems.medicineInventory.medicine']);

        return Inertia::render('Prescriptions/Show', [
            'prescription' => $prescription,
        ]);
    }

    public function updateStatus(Request $request, Prescription $prescription)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,validated,dispensed,cancelled',
            'notes' => 'nullable|string',
        ]);

        // Only the prescribing doctor or a pharmacist can cancel
        if ($validated['status'] === 'cancelled') {
            $isOwner = $request->user()->isDoctor() && $prescription->doctor_id === $request->user()->id;
            if (!$isOwner && !$request->user()->isPharmacist()) {
                abort(403, 'You can only cancel your own prescriptions.');
            }
        }

        // Only pharmacists can change status back to pending
        if ($validated['status'] === 'pending' && !$request->user()->isPharmacist()) {
            abort(403, 'Only pharmacists can reopen prescriptions.');
        }

        // Prevent status regression (e.g., dispensed → validated)
        $allowedTransitions = [
            'pending'   => ['validated', 'cancelled'],
            'validated' => ['dispensed', 'cancelled'],
            'dispensed' => [],
            'cancelled' => ['pending'],
        ];

        $current = $prescription->status;
        if (!in_array($validated['status'], $allowedTransitions[$current] ?? [])) {
            return redirect()->back()->with('error', "Cannot change status from '{$current}' to '{$validated['status']}'.");
        }

        // Only pharmacists can validate and dispense
        if (in_array($validated['status'], ['validated', 'dispensed']) && !$request->user()->isPharmacist()) {
            abort(403, 'Only pharmacists can validate or dispense prescriptions.');
        }

        $prescription->update($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => "{$validated['status']}_prescription",
            'description' => "Prescription {$prescription->prescription_number} {$validated['status']}",
        ]);

        return redirect()->back()
            ->with('success', "Prescription {$validated['status']} successfully.");
    }
}
