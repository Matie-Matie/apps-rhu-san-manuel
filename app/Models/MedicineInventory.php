<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MedicineInventory extends Model
{
    protected $fillable = [
        'medicine_id',
        'batch_number',
        'expiry_date',
        'quantity',
        'unit_price',
        'reorder_level',
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'archived_at' => 'datetime',
        ];
    }

    /**
     * Archived batches drop out of every stock count, alert, picker and the
     * dispensing screen automatically. The Inventory > Archive tab opts back in
     * with withoutGlobalScope('notArchived').
     */
    protected static function booted(): void
    {
        static::addGlobalScope('notArchived', fn (Builder $q) => $q->whereNull($q->getModel()->getTable().'.archived_at'));
    }

    /** True for a batch that is expired or expires within 30 days (the ones that may be archived). */
    public function isArchivable(): bool
    {
        return $this->expiry_date !== null && \Carbon\Carbon::parse($this->expiry_date)->lte(now()->addDays(30));
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    public function dispensedItems(): HasMany
    {
        return $this->hasMany(DispensedItem::class, 'medicine_inventory_id');
    }
}
