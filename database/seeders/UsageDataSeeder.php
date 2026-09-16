<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\DispensedItem;
use App\Models\DispensingRecord;
use App\Models\Medicine;
use App\Models\MedicineInventory;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

/**
 * Usage data for the APPS demo — makes the system look actively used.
 *
 * Adds:
 *  - 6 additional patients
 *  - 16 additional prescriptions (12 pending, 2 validated, 2 dispensed)
 *  - Activity logs for every prescription's lifecycle (created / validated /
 *    dispensed / cancelled), backfilled for existing prescriptions too
 *  - Generic system activity (patient/medicine/inventory events) spread over
 *    the last ~30 days so the Activity Feed looks busy
 *
 * Safe to re-run — every record is created with firstOrCreate-style checks,
 * so running this multiple times will NOT duplicate data.
 *
 * Usage:
 *   php artisan db:seed --class=UsageDataSeeder
 */
class UsageDataSeeder extends Seeder
{
    /**
     * [first_name, last_name, date_of_birth, gender, contact_number, address]
     */
    private array $patients = [
        ['Rodel', 'Aguinaldo', '1964-09-12', 'male', '09174561001', 'Purok 1, Brgy. San Marcos, San Manuel, Isabela'],
        ['Babylyn', 'Soriano', '1998-03-27', 'female', '09174561002', 'Purok 2, Brgy. Calanigan, San Manuel, Isabela'],
        ['Teodoro', 'Magtoto', '1955-11-30', 'male', '09174561003', 'Purok 3, Brgy. San Gabriel, San Manuel, Isabela'],
        ['Janice', 'Villanueva', '1988-06-18', 'female', '09174561004', 'Purok 1, Brgy. Centro, San Manuel, Isabela'],
        ['Gregorio', 'Salazar', '1972-02-05', 'male', '09174561005', 'Purok 2, Brgy. Malalinta, San Manuel, Isabela'],
        ['Melissa', 'Talavera', '2003-10-09', 'female', '09174561006', 'Purok 4, Brgy. San Juan, San Manuel, Isabela'],
    ];

    /**
     * New prescriptions. patient = index into $this->patients.
     * days_ago = how many days back to set created_at.
     * items: [med key, dosage, frequency, duration, qty, instructions]
     */
    private array $prescriptions = [
        [
            'patient' => 0, 'diagnosis' => 'Hypertension, Stage 2',
            'notes' => 'Low-salt diet. Monitor BP twice weekly. Follow up in 2 weeks.',
            'status' => 'pending', 'days_ago' => 0,
            'items' => [
                ['med' => 'Amlodipine|10mg', 'dosage' => '1 tablet', 'frequency' => 'once a day', 'duration' => '30 days', 'qty' => 30, 'instructions' => 'Take every morning'],
                ['med' => 'Losartan|50mg', 'dosage' => '1 tablet', 'frequency' => 'once a day', 'duration' => '30 days', 'qty' => 30, 'instructions' => 'Take every evening'],
            ],
        ],
        [
            'patient' => 1, 'diagnosis' => 'Acute Urinary Tract Infection',
            'notes' => 'Finish the full antibiotic course. Drink plenty of water.',
            'status' => 'pending', 'days_ago' => 0,
            'items' => [
                ['med' => 'Cefalexin|500mg', 'dosage' => '1 capsule', 'frequency' => '4 times a day', 'duration' => '7 days', 'qty' => 28, 'instructions' => 'Take every 6 hours after meals'],
            ],
        ],
        [
            'patient' => 2, 'diagnosis' => 'Type 2 Diabetes Mellitus',
            'notes' => 'Diet control and daily walking. Check FBS after 2 weeks.',
            'status' => 'pending', 'days_ago' => 0,
            'items' => [
                ['med' => 'Metformin|500mg', 'dosage' => '1 tablet', 'frequency' => '2 times a day', 'duration' => '30 days', 'qty' => 60, 'instructions' => 'Take after breakfast and dinner'],
                ['med' => 'Ascorbic Acid|500mg', 'dosage' => '1 tablet', 'frequency' => 'once a day', 'duration' => '30 days', 'qty' => 30, 'instructions' => 'Take after meals'],
            ],
        ],
        [
            'patient' => 3, 'diagnosis' => 'Iron Deficiency Anemia',
            'notes' => 'Iron-rich diet. Repeat CBC after 1 month.',
            'status' => 'pending', 'days_ago' => 1,
            'items' => [
                ['med' => 'Ferrous Sulfate|200mg', 'dosage' => '1 tablet', 'frequency' => '2 times a day', 'duration' => '30 days', 'qty' => 60, 'instructions' => 'Take on empty stomach with orange juice'],
                ['med' => 'Ascorbic Acid|500mg', 'dosage' => '1 tablet', 'frequency' => 'once a day', 'duration' => '30 days', 'qty' => 30, 'instructions' => 'Take after meals'],
            ],
        ],
        [
            'patient' => 4, 'diagnosis' => 'Bronchial Asthma — acute exacerbation',
            'notes' => 'Avoid dust and cold drinks. Refer to pulmo if recurrent.',
            'status' => 'pending', 'days_ago' => 1,
            'items' => [
                ['med' => 'Salbutamol|100mcg', 'dosage' => '2 puffs', 'frequency' => 'as needed', 'duration' => '14 days', 'qty' => 1, 'instructions' => 'Shake inhaler before each use'],
                ['med' => 'Cetirizine|10mg', 'dosage' => '1 tablet', 'frequency' => 'once a day', 'duration' => '7 days', 'qty' => 7, 'instructions' => 'Take at bedtime'],
            ],
        ],
        [
            'patient' => 5, 'diagnosis' => 'Acute Pharyngitis',
            'notes' => 'Warm saline gargle. Return if fever persists beyond 3 days.',
            'status' => 'pending', 'days_ago' => 1,
            'items' => [
                ['med' => 'Amoxicillin|500mg', 'dosage' => '1 capsule', 'frequency' => '3 times a day', 'duration' => '7 days', 'qty' => 21, 'instructions' => 'Take every 8 hours after meals'],
                ['med' => 'Paracetamol|500mg', 'dosage' => '1 tablet', 'frequency' => '3 times a day', 'duration' => '5 days', 'qty' => 15, 'instructions' => 'Take for fever every 6 hours'],
            ],
        ],
        [
            'patient' => 0, 'diagnosis' => 'Osteoarthritis — knee',
            'notes' => 'Weight reduction advised. Warm compress on painful joints.',
            'status' => 'pending', 'days_ago' => 2,
            'items' => [
                ['med' => 'Mefenamic Acid|500mg', 'dosage' => '1 capsule', 'frequency' => '3 times a day', 'duration' => '5 days', 'qty' => 15, 'instructions' => 'Take after meals'],
                ['med' => 'Ibuprofen|400mg', 'dosage' => '1 tablet', 'frequency' => '3 times a day', 'duration' => '5 days', 'qty' => 15, 'instructions' => 'Take after meals'],
            ],
        ],
        [
            'patient' => 2, 'diagnosis' => 'Hyperlipidemia',
            'notes' => 'Low-fat diet. Repeat lipid profile after 3 months.',
            'status' => 'pending', 'days_ago' => 2,
            'items' => [
                ['med' => 'Atorvastatin|20mg', 'dosage' => '1 tablet', 'frequency' => 'once a day', 'duration' => '30 days', 'qty' => 30, 'instructions' => 'Take every evening'],
            ],
        ],
        [
            'patient' => 3, 'diagnosis' => 'Allergic Rhinitis',
            'notes' => 'Avoid known allergens. Nasal saline rinse twice daily.',
            'status' => 'pending', 'days_ago' => 3,
            'items' => [
                ['med' => 'Cetirizine|10mg', 'dosage' => '1 tablet', 'frequency' => 'once a day', 'duration' => '14 days', 'qty' => 14, 'instructions' => 'Take at bedtime'],
            ],
        ],
        [
            'patient' => 1, 'diagnosis' => 'Gastroesophageal reflux disease (GERD)',
            'notes' => 'Avoid fatty and spicy food. Elevate head when sleeping.',
            'status' => 'pending', 'days_ago' => 3,
            'items' => [
                ['med' => 'Omeprazole|20mg', 'dosage' => '1 capsule', 'frequency' => 'once a day', 'duration' => '14 days', 'qty' => 14, 'instructions' => 'Take 30 minutes before breakfast'],
            ],
        ],
        [
            'patient' => 5, 'diagnosis' => 'Acute Gastroenteritis',
            'notes' => 'ORS and plenty of fluids. Watch for signs of dehydration.',
            'status' => 'pending', 'days_ago' => 4,
            'items' => [
                ['med' => 'Loperamide|2mg', 'dosage' => '2 capsules stat, then 1', 'frequency' => 'after each loose stool', 'duration' => '3 days', 'qty' => 10, 'instructions' => 'Do not exceed 8 capsules per day'],
                ['med' => 'Paracetamol|500mg', 'dosage' => '1 tablet', 'frequency' => '4 times a day', 'duration' => '3 days', 'qty' => 12, 'instructions' => 'Take for fever every 6 hours'],
            ],
        ],
        [
            'patient' => 4, 'diagnosis' => 'Hypertension with Diabetes — follow-up',
            'notes' => 'Continue maintenance meds. BP improved. Next check-up in 1 month.',
            'status' => 'pending', 'days_ago' => 5,
            'items' => [
                ['med' => 'Amlodipine|10mg', 'dosage' => '1 tablet', 'frequency' => 'once a day', 'duration' => '30 days', 'qty' => 30, 'instructions' => 'Take every morning'],
                ['med' => 'Metformin|500mg', 'dosage' => '1 tablet', 'frequency' => '2 times a day', 'duration' => '30 days', 'qty' => 60, 'instructions' => 'Take after breakfast and dinner'],
            ],
        ],
        [
            'patient' => 2, 'diagnosis' => 'Community-acquired Pneumonia',
            'notes' => 'Finish the full antibiotic course. Return immediately if breathing worsens.',
            'status' => 'validated', 'days_ago' => 1,
            'items' => [
                ['med' => 'Amoxicillin|500mg', 'dosage' => '1 capsule', 'frequency' => '3 times a day', 'duration' => '7 days', 'qty' => 42, 'instructions' => 'Take every 8 hours after meals'],
                ['med' => 'Paracetamol|500mg', 'dosage' => '1 tablet', 'frequency' => '4 times a day', 'duration' => '5 days', 'qty' => 20, 'instructions' => 'Take for fever every 6 hours'],
            ],
        ],
        [
            'patient' => 3, 'diagnosis' => 'Migraine without aura',
            'notes' => 'Rest in a quiet, dark room. Keep a headache diary.',
            'status' => 'validated', 'days_ago' => 2,
            'items' => [
                ['med' => 'Mefenamic Acid|500mg', 'dosage' => '1 capsule', 'frequency' => '3 times a day', 'duration' => '4 days', 'qty' => 12, 'instructions' => 'Take after meals'],
            ],
        ],
        [
            'patient' => 5, 'diagnosis' => 'Skin Infection — cellulitis',
            'notes' => 'Keep the area clean and dry. Elevate affected limb.',
            'status' => 'dispensed', 'days_ago' => 3,
            'items' => [
                ['med' => 'Amoxicillin|500mg', 'dosage' => '1 capsule', 'frequency' => '3 times a day', 'duration' => '7 days', 'qty' => 21, 'instructions' => 'Take every 8 hours after meals'],
            ],
        ],
        [
            'patient' => 1, 'diagnosis' => 'Helminthiasis — deworming',
            'notes' => 'Repeat dose after 6 months. Good hygiene emphasized.',
            'status' => 'dispensed', 'days_ago' => 5,
            'items' => [
                ['med' => 'Mebendazole|100mg', 'dosage' => '1 tablet', 'frequency' => '2 times a day', 'duration' => '3 days', 'qty' => 6, 'instructions' => 'Take with or without food'],
            ],
        ],
    ];

    /**
     * Generic system activity spread over the last ~30 days.
     * [days_ago, hour, role (doctor|pharmacist), action, description]
     */
    private array $activityEvents = [
        [29, 9, 'doctor', 'create_patient', 'Created patient Feliciano Lacambra'],
        [28, 10, 'pharmacist', 'create_medicine', 'Created medicine Hydrocortisone'],
        [26, 14, 'pharmacist', 'add_stock', 'Added 200 units to Paracetamol'],
        [25, 9, 'doctor', 'create_patient', 'Created patient Nimfa Ochoco'],
        [24, 11, 'pharmacist', 'update_inventory', 'Updated inventory for Amoxicillin'],
        [22, 15, 'pharmacist', 'add_stock', 'Added 100 units to Metformin'],
        [21, 9, 'doctor', 'create_patient', 'Created patient Walter Villar'],
        [20, 13, 'pharmacist', 'create_medicine', 'Created medicine Carbamazepine'],
        [19, 10, 'pharmacist', 'update_inventory', 'Updated inventory for Amlodipine'],
        [17, 16, 'pharmacist', 'add_stock', 'Added 150 units to Ibuprofen'],
        [16, 9, 'doctor', 'update_patient', 'Updated patient Nenita Agustin'],
        [15, 11, 'pharmacist', 'add_stock', 'Added 120 units to Losartan'],
        [14, 14, 'pharmacist', 'update_inventory', 'Updated inventory for Salbutamol'],
        [13, 9, 'doctor', 'create_patient', 'Created patient Vivian Sabado'],
        [12, 15, 'pharmacist', 'add_stock', 'Added 80 units to Cetirizine'],
        [11, 10, 'pharmacist', 'update_inventory', 'Updated inventory for Omeprazole'],
        [10, 9, 'doctor', 'update_patient', 'Updated patient Santiago Bautista'],
        [9, 13, 'pharmacist', 'add_stock', 'Added 60 units to Ferrous Sulfate'],
        [8, 16, 'pharmacist', 'create_medicine', 'Created medicine Povidone-Iodine'],
        [7, 10, 'pharmacist', 'update_inventory', 'Updated inventory for Metformin'],
        [6, 9, 'doctor', 'create_patient', 'Created patient Ursula Balderama'],
        [5, 14, 'pharmacist', 'add_stock', 'Added 300 units to Ascorbic Acid'],
        [4, 11, 'pharmacist', 'update_inventory', 'Updated inventory for Atorvastatin'],
        [3, 9, 'doctor', 'update_patient', 'Updated patient Jomar Binag'],
        [2, 15, 'pharmacist', 'add_stock', 'Added 100 units to Multivitamins'],
        [1, 10, 'pharmacist', 'update_inventory', 'Updated inventory for Loperamide'],
        [0, 9, 'doctor', 'create_patient', 'Created patient Alyssa Dizon'],
        [0, 13, 'pharmacist', 'add_stock', 'Added 50 units to Ambroxol'],
    ];

    public function run(): void
    {
        $doctor = User::where('role', 'doctor')->first();
        $pharmacist = User::where('role', 'pharmacist')->first();

        if (! $doctor || ! $pharmacist) {
            $this->command->warn('Doctor/pharmacist users not found — run `db:seed` first.');

            return;
        }

        $this->seedPatients();
        $this->seedPrescriptions($doctor->id, $pharmacist->id);
        $this->reconcilePrescriptionLogs($doctor->id, $pharmacist->id);
        $this->seedSystemActivity($doctor->id, $pharmacist->id);

        $pending = Prescription::where('status', 'pending')->count();
        $logs = ActivityLog::count();

        $this->command->info("Usage data complete! Pending prescriptions: {$pending}, activity logs: {$logs}.");
    }

    private function seedPatients(): void
    {
        foreach ($this->patients as [$first, $last, $dob, $gender, $contact, $address]) {
            Patient::firstOrCreate(
                ['first_name' => $first, 'last_name' => $last],
                [
                    'date_of_birth' => $dob,
                    'gender' => $gender,
                    'contact_number' => $contact,
                    'address' => $address,
                ]
            );
        }
    }

    private function seedPrescriptions(int $doctorId, int $pharmacistId): void
    {
        foreach ($this->prescriptions as $spec) {
            $patient = $this->patients[$spec['patient']];
            $patientModel = Patient::where('first_name', $patient[0])
                ->where('last_name', $patient[1])
                ->first();

            if (! $patientModel) {
                $this->command->warn("Patient not found: {$patient[0]} {$patient[1]}");

                continue;
            }

            // Skip if this patient already has this diagnosis (idempotency).
            if (Prescription::where('patient_id', $patientModel->id)
                ->where('diagnosis', $spec['diagnosis'])
                ->exists()) {
                continue;
            }

            $createdAt = $this->businessHours(Carbon::now()->subDays($spec['days_ago']));

            // A dispensed prescription requires stock for every item. If any
            // medicine is out of stock (e.g., the Mebendazole OOS demo), keep
            // the prescription pending instead — you can't dispense what you
            // don't have.
            $status = $spec['status'];
            if ($status === 'dispensed' && ! $this->hasStockForAllItems($spec['items'])) {
                $status = 'pending';
                $this->command->warn("RX for {$patient[0]} {$patient[1]} ({$spec['diagnosis']}) kept pending — item out of stock.");
            }

            $prescription = Prescription::create([
                'patient_id' => $patientModel->id,
                'doctor_id' => $doctorId,
                'prescription_number' => Prescription::generatePrescriptionNumber(),
                'diagnosis' => $spec['diagnosis'],
                'notes' => $spec['notes'],
                'status' => $status,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            foreach ($spec['items'] as $item) {
                [$generic, $strength] = explode('|', $item['med']);
                $medicine = Medicine::firstOrCreate(
                    ['generic_name' => $generic, 'strength' => $strength]
                );

                PrescriptionItem::create([
                    'prescription_id' => $prescription->id,
                    'medicine_id' => $medicine->id,
                    'dosage' => $item['dosage'],
                    'frequency' => $item['frequency'],
                    'duration' => $item['duration'],
                    'quantity' => $item['qty'],
                    'instructions' => $item['instructions'],
                ]);
            }

            if ($status === 'dispensed') {
                $this->createDispensingRecord($prescription, $pharmacistId);
            }
        }
    }

    /**
     * True if every item in the spec has at least one inventory batch with
     * enough quantity to cover it.
     */
    private function hasStockForAllItems(array $items): bool
    {
        foreach ($items as $item) {
            [$generic, $strength] = explode('|', $item['med']);
            $medicine = Medicine::where('generic_name', $generic)->where('strength', $strength)->first();

            if (! $medicine) {
                return false;
            }

            $hasStock = $medicine->inventories()
                ->where('quantity', '>=', $item['qty'])
                ->exists();

            if (! $hasStock) {
                return false;
            }
        }

        return true;
    }

    private function createDispensingRecord(Prescription $prescription, int $pharmacistId): void
    {
        $dispensing = DispensingRecord::firstOrCreate(
            ['prescription_id' => $prescription->id],
            [
                'pharmacist_id' => $pharmacistId,
                'dispensed_at' => $prescription->created_at->copy()->addDay()->addHours(3),
                'notes' => 'Dispensed per prescription. Advised on proper medication use.',
            ]
        );

        foreach ($prescription->items as $item) {
            $batch = $item->medicine->inventories()
                ->where('quantity', '>=', $item->quantity)
                ->orderBy('id')->first()
                ?? $item->medicine->inventories()->where('quantity', '>', 0)->orderBy('id')->first();

            if (! $batch) {
                $this->command->warn("No stock batch for {$item->medicine->generic_name} — RX {$prescription->prescription_number}");

                continue;
            }

            $dispensedItem = DispensedItem::firstOrCreate(
                [
                    'dispensing_record_id' => $dispensing->id,
                    'medicine_inventory_id' => $batch->id,
                ],
                [
                    'quantity' => $item->quantity,
                    'unit_price' => $batch->unit_price,
                ]
            );

            if ($dispensedItem->wasRecentlyCreated) {
                $batch->decrement('quantity', $item->quantity);
            }
        }
    }

    /**
     * Reconcile lifecycle logs (created → validated → dispensed/cancelled) for
     * EVERY prescription in the system, including ones created earlier by
     * other seeders or real usage.
     *
     * Self-healing: any existing lifecycle log that does not match the current
     * status is removed first, so re-runs never leave stale entries behind.
     */
    private function reconcilePrescriptionLogs(int $doctorId, int $pharmacistId): void
    {
        $prescriptions = Prescription::with('dispensingRecord')->get();

        foreach ($prescriptions as $prescription) {
            $rx = $prescription->prescription_number;

            // Drop any existing lifecycle log for this RX so state is rebuilt
            // from scratch — no stale validated/dispensed entries on re-runs.
            ActivityLog::whereIn('action', [
                'create_prescription',
                'validated_prescription',
                'dispense_prescription',
                'cancelled_prescription',
            ])->where('description', 'like', "%{$rx}%")->delete();

            $this->logOnce($prescription->doctor_id ?? $doctorId, 'create_prescription',
                "Created prescription {$rx}", $this->businessHours($prescription->created_at));

            $validatedAt = $this->businessHours($prescription->created_at->copy()->addHours(2));

            if (in_array($prescription->status, ['validated', 'dispensed'], true)) {
                $this->logOnce($pharmacistId, 'validated_prescription',
                    "Prescription {$rx} validated", $validatedAt);
            }

            if ($prescription->status === 'dispensed') {
                $dispensedAt = $prescription->dispensingRecord?->dispensed_at
                    ?? $this->businessHours($prescription->created_at->copy()->addDay()->addHours(3));
                $this->logOnce($pharmacistId, 'dispense_prescription',
                    "Dispensed prescription {$rx}", $dispensedAt);
            }

            if ($prescription->status === 'cancelled') {
                $this->logOnce($pharmacistId, 'cancelled_prescription',
                    "Prescription {$rx} cancelled", $this->businessHours($prescription->created_at->copy()->addDay()));
            }
        }
    }

    /**
     * Generic patient / medicine / inventory activity over the last ~30 days.
     */
    private function seedSystemActivity(int $doctorId, int $pharmacistId): void
    {
        foreach ($this->activityEvents as $index => [$daysAgo, $hour, $role, $action, $description]) {
            $userId = $role === 'doctor' ? $doctorId : $pharmacistId;

            // Deterministic minute so re-runs stay byte-for-byte identical.
            $minute = ($index * 17) % 60;
            $at = Carbon::now()->subDays($daysAgo)->setTime($hour, $minute, 0);

            $this->logOnce($userId, $action, $description, $at);
        }
    }

    /**
     * Snap a timestamp into realistic clinic hours (08:00–17:00) so backdated
     * entries don't land at odd times like 04:07 AM.
     */
    private function businessHours(Carbon $at): Carbon
    {
        $hour = $at->hour;

        if ($hour < 8) {
            return $at->copy()->setTime(8, 15, 0);
        }

        if ($hour > 17) {
            return $at->copy()->setTime(16, 45, 0);
        }

        return $at;
    }

    /**
     * Create an activity log only if the same user/action/description does not
     * already exist, preserving the original timestamp on re-runs.
     */
    private function logOnce(int $userId, string $action, string $description, Carbon $at): void
    {
        $exists = ActivityLog::where('user_id', $userId)
            ->where('action', $action)
            ->where('description', $description)
            ->exists();

        if ($exists) {
            return;
        }

        ActivityLog::create([
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'created_at' => $at,
            'updated_at' => $at,
        ]);
    }
}
