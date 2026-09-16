<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Prescription extends Model
{
    protected $fillable = [
        'patient_id',
        'doctor_id',
        'prescription_number',
        'diagnosis',
        'notes',
        'status',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PrescriptionItem::class);
    }

    public function dispensingRecord(): HasOne
    {
        return $this->hasOne(DispensingRecord::class);
    }

    public static function generatePrescriptionNumber(): string
    {
        // Sequence by ID, not created_at — created_at can be backdated (seeders,
        // imports), which would otherwise generate duplicate RX numbers.
        $lastId = self::max('id');
        $next = $lastId ? $lastId + 1 : 1;
        return 'RX-' . now()->format('Ymd') . '-' . str_pad($next, 4, '0', STR_PAD_LEFT);
    }
}
