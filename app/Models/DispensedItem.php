<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DispensedItem extends Model
{
    protected $fillable = [
        'dispensing_record_id',
        'medicine_inventory_id',
        'quantity',
        'unit_price',
    ];

    public function dispensingRecord(): BelongsTo
    {
        return $this->belongsTo(DispensingRecord::class);
    }

    public function medicineInventory(): BelongsTo
    {
        return $this->belongsTo(MedicineInventory::class);
    }
}
