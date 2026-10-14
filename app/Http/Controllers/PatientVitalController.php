<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Patient;
use Illuminate\Http\Request;

class PatientVitalController extends Controller
{
    public static function rules(): array
    {
        return [
            'bp_systolic' => 'nullable|integer|between:50,300|required_with:bp_diastolic',
            'bp_diastolic' => 'nullable|integer|between:30,200|required_with:bp_systolic|lt:bp_systolic',
            'height_cm' => 'nullable|numeric|between:30,250',
            'weight_kg' => 'nullable|numeric|between:1,500',
            'temperature_c' => 'nullable|numeric|between:30,45',
            'pulse_rate' => 'nullable|integer|between:20,250',
        ];
    }

    public static function messages(): array
    {
        return ['bp_diastolic.lt' => 'Diastolic must be lower than systolic.'];
    }

    public function store(Request $request, Patient $patient)
    {
        if ($request->user()->isPharmacist()) {
            abort(403, 'Pharmacists cannot record patient vitals.');
        }

        $validated = $request->validate(self::rules(), self::messages());

        if (collect($validated)->filter(fn ($v) => $v !== null && $v !== '')->isEmpty()) {
            return back()->withErrors(['bp_systolic' => 'Enter at least one vital sign.']);
        }

        $patient->vitals()->create($validated + ['recorded_by' => $request->user()->id]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'record_vitals',
            'description' => "Recorded vitals for {$patient->full_name}",
        ]);

        return back()->with('success', 'Vitals recorded.');
    }
}
