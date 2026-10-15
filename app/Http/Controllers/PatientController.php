<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\PatientVital;
use App\Models\Prescription;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
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
            // Most recently added patients first (clinic request, V2).
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Patients/Index', [
            'patients' => $patients,
        ]);
    }

    public function show(Request $request, Patient $patient)
    {
        return Inertia::render('Patients/Show', $this->historyPayload($patient, $request->user(), 50));
    }

    public function history(Request $request, Patient $patient)
    {
        if ($request->user()->isStaff()) {
            abort(403, 'Prescription history is not available to your role.');
        }

        return response()->json($this->historyPayload($patient, $request->user(), 10));
    }

    private function historyPayload(Patient $patient, $user, int $limit): array
    {
        $vitals = $patient->vitals()->with('recorder:id,name')->latest()->latest('id')->take(50)->get();

        $payload = [
            'patient' => $patient->only([
                'id', 'first_name', 'last_name', 'age', 'gender',
                'date_of_birth', 'address', 'contact_number',
            ]),
            'vitals' => $vitals,
            'latest_vital' => $vitals->first(),
            'prescriptions' => null,
            'prescriptions_total' => null,
            'can_record_vitals' => ! $user->isPharmacist(),
        ];

        // Staff record vitals but do not see clinical prescription history.
        if (! $user->isStaff()) {
            $payload['prescriptions_total'] = $patient->prescriptions()->count();
            $payload['prescriptions'] = $patient->prescriptions()
                ->with(['doctor:id,name', 'items.medicine:id,generic_name,strength', 'dispensingRecord:id,prescription_id,dispensed_at'])
                ->latest()
                ->latest('id')
                ->take($limit)
                ->get()
                ->map(fn (Prescription $rx) => [
                    'id' => $rx->id,
                    'prescription_number' => $rx->prescription_number,
                    'diagnosis' => $rx->diagnosis,
                    'status' => $rx->status,
                    'created_at' => $rx->created_at,
                    'dispensed_at' => $rx->dispensingRecord?->dispensed_at,
                    'doctor' => $rx->doctor?->name,
                    'items' => $rx->items->map(fn ($item) => [
                        'medicine' => $item->medicine?->generic_name,
                        'strength' => $item->medicine?->strength,
                        'dosage' => $item->dosage,
                        'frequency' => $item->frequency,
                        'duration' => $item->duration,
                        'quantity' => $item->quantity,
                        'unit' => $item->unit,
                    ])->values(),
                ])->values();
        }

        return $payload;
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
        $validated = $request->validate(
            $this->rules() + PatientVitalController::rules(),
            $this->messages() + PatientVitalController::messages()
        );

        $vitals = collect(Arr::only($validated, PatientVital::SIGNS))
            ->filter(fn ($v) => $v !== null && $v !== '')
            ->all();

        $patient = DB::transaction(function () use ($validated, $vitals, $request) {
            $patient = Patient::create(Arr::except($validated, PatientVital::SIGNS));

            if ($vitals) {
                $patient->vitals()->create($vitals + ['recorded_by' => $request->user()->id]);
            }

            return $patient;
        });

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'create_patient',
            'description' => "Created patient {$patient->full_name}",
        ]);

        if ($vitals) {
            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action' => 'record_vitals',
                'description' => "Recorded vitals for {$patient->full_name}",
            ]);
        }

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
        $validated = $request->validate($this->rules(), $this->messages());

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
        if (! $request->user()->isDoctor()) {
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

    private function rules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'nullable|date|date_format:Y-m-d|before_or_equal:today|after_or_equal:1900-01-01',
            'gender' => 'nullable|in:male,female,other',
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ];
    }

    private function messages(): array
    {
        return [
            'date_of_birth.before_or_equal' => 'Date of birth cannot be in the future.',
            'date_of_birth.after_or_equal' => 'Date of birth is too far in the past.',
        ];
    }
}
