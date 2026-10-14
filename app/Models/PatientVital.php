<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientVital extends Model
{
    public const SIGNS = ['bp_systolic', 'bp_diastolic', 'height_cm', 'weight_kg', 'temperature_c', 'pulse_rate'];

    protected $fillable = [
        'patient_id',
        'recorded_by',
        'bp_systolic',
        'bp_diastolic',
        'height_cm',
        'weight_kg',
        'temperature_c',
        'pulse_rate',
    ];

    protected function casts(): array
    {
        return [
            'height_cm' => 'float',
            'weight_kg' => 'float',
            'temperature_c' => 'float',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
