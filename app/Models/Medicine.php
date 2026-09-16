<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Medicine extends Model
{
    protected $fillable = [
        'generic_name',
        'brand_name',
        'category',
        'dosage_form',
        'strength',
        'description',
    ];

    public function inventories(): HasMany
    {
        return $this->hasMany(MedicineInventory::class);
    }

    public function prescriptionItems(): HasMany
    {
        return $this->hasMany(PrescriptionItem::class);
    }

    public function getTotalStockAttribute(): int
    {
        return $this->inventories()->sum('quantity');
    }
}
