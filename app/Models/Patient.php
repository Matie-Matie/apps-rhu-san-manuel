<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Patient extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'contact_number',
        'address',
    ];

    protected $appends = ['age'];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date:Y-m-d',
        ];
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function vitals(): HasMany
    {
        return $this->hasMany(PatientVital::class);
    }

    public function latestVital(): HasOne
    {
        return $this->hasOne(PatientVital::class)->latestOfMany();
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getAgeAttribute(): ?int
    {
        return $this->date_of_birth?->age;
    }
}
