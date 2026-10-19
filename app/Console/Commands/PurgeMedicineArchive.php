<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use App\Models\Medicine;
use App\Models\MedicineInventory;
use Illuminate\Console\Command;

class PurgeMedicineArchive extends Command
{
    protected $signature = 'medicines:purge-archive';

    protected $description = 'Permanently delete medicines archived for more than 6 months (only when no prescription history references them).';

    public function handle(): int
    {
        $cutoff = now()->subMonths(6);

        $candidates = Medicine::archived()
            ->where('archived_at', '<', $cutoff)
            ->get();

        $purged = 0;
        $skipped = 0;

        foreach ($candidates as $medicine) {
            // Never destroy prescription history: medicines referenced by any
            // prescription item are kept in the archive instead.
            if ($medicine->prescriptionItems()->exists()) {
                $skipped++;
                continue;
            }

            $name = $medicine->generic_name;
            $medicine->delete(); // cascades its inventory batches

            ActivityLog::create([
                'user_id' => null,
                'action' => 'purge_medicine',
                'description' => "Auto-purged archived medicine {$name} (archived over 6 months)",
            ]);

            $purged++;
        }

        // Archived batches follow the same 6-month rule; any batch that was ever
        // dispensed stays so the dispensing history keeps resolving.
        $batchesPurged = 0;
        MedicineInventory::withoutGlobalScope('notArchived')
            ->whereNotNull('archived_at')
            ->where('archived_at', '<', $cutoff)
            ->get()
            ->each(function (MedicineInventory $batch) use (&$batchesPurged) {
                if ($batch->dispensedItems()->exists()) {
                    return;
                }
                $batch->delete();
                $batchesPurged++;
            });

        $this->info("Purged {$purged} medicine(s), kept {$skipped} with prescription history; purged {$batchesPurged} archived batch(es).");

        return self::SUCCESS;
    }
}
