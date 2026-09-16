<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $perPage = in_array($request->integer('per_page', 10), [10, 25, 50], true)
            ? $request->integer('per_page', 10)
            : 10;

        $patients = Patient::query()
            ->withCount('prescriptions')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->input('search'));
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('contact_number', 'like', "%{$search}%");
                });
            })
            ->orderBy('last_name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Patients/Index', [
            'patients' => $patients,
        ]);
    }

    public function create(Request $request)
    {
        if ($request->user()->isPharmacist()) {
            abort(403, 'Only doctors can create patient records.');
        }
        return Inertia::render('Patients/Create');
    }

    public function store(Request $request)
    {
        if ($request->user()->isPharmacist()) {
            abort(403, 'Only doctors can create patient records.');
        }
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $patient = Patient::create($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'create_patient',
            'description' => "Created patient {$patient->full_name}",
        ]);

        return redirect()->route('patients.index')
            ->with('success', 'Patient created successfully.');
    }

    public function edit(Request $request, Patient $patient)
    {
        if ($request->user()->isPharmacist()) {
            abort(403, 'Only doctors can edit patient records.');
        }
        return Inertia::render('Patients/Edit', [
            'patient' => $patient,
        ]);
    }

    public function update(Request $request, Patient $patient)
    {
        if ($request->user()->isPharmacist()) {
            abort(403, 'Only doctors can edit patient records.');
        }
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $patient->update($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update_patient',
            'description' => "Updated patient {$patient->full_name}",
        ]);

        return redirect()->route('patients.index')
            ->with('success', 'Patient updated successfully.');
    }

    public function destroy(Request $request, Patient $patient)
    {
        if ($request->user()->isPharmacist()) {
            abort(403, 'Only doctors can delete patient records.');
        }
        $name = $patient->full_name;
        $patient->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'delete_patient',
            'description' => "Deleted patient {$name}",
        ]);

        return redirect()->route('patients.index')
            ->with('success', 'Patient deleted successfully.');
    }
}
