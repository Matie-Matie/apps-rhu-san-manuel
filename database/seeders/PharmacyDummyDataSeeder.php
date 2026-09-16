<?php

namespace Database\Seeders;

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
 * Dummy data for the APPS demo / testing.
 *
 * Safe to re-run — every record is created with firstOrCreate-style checks,
 * so running this multiple times will NOT duplicate data.
 *
 * Adds:
 *  - 24 additional medicines (32 total with base seed)
 *  - Inventory batches for ALL medicines, including:
 *      * low-stock items (below reorder level) for alert demos
 *      * out-of-stock items for OOS demos
 *      * soon-to-expire batches for expiry tracking demos
 *  - 15 additional patients
 *  - 14 sample prescriptions across pending / validated / cancelled / dispensed,
 *    with dispensing records + dispensed items for the dispensed ones
 */
class PharmacyDummyDataSeeder extends Seeder
{
    /**
     * [generic_name, brand_name, category, dosage_form, strength, description]
     */
    private array $medicines = [
        ['Cetirizine', 'Zyrtec', 'Antihistamine', 'Tablet', '10mg', 'For allergies, hay fever, and hives'],
        ['Mefenamic Acid', 'Dolfenal', 'Analgesic', 'Capsule', '500mg', 'For mild to moderate pain, dysmenorrhea'],
        ['Cefalexin', 'Ceporex', 'Antibiotic', 'Capsule', '500mg', 'Cephalosporin antibiotic for bacterial infections'],
        ['Cotrimoxazole', 'Bactrim', 'Antibiotic', 'Tablet', '480mg', 'Sulfonamide combination for UTIs and RTIs'],
        ['Azithromycin', 'Zithromax', 'Antibiotic', 'Tablet', '500mg', 'Macrolide antibiotic, short-course therapy'],
        ['Ciprofloxacin', null, 'Antibiotic', 'Tablet', '500mg', 'Fluoroquinolone for UTIs and GI infections'],
        ['Co-Amoxiclav', 'Augmentin', 'Antibiotic', 'Tablet', '625mg', 'Amoxicillin + clavulanic acid, broad spectrum'],
        ['Metoprolol', 'Lopressor', 'Antihypertensive', 'Tablet', '50mg', 'Beta blocker for hypertension'],
        ['Nifedipine', 'Adalat', 'Antihypertensive', 'Capsule', '10mg', 'Calcium channel blocker for hypertension'],
        ['Hydrochlorothiazide', 'Esidrex', 'Diuretic', 'Tablet', '25mg', 'Thiazide diuretic for hypertension and edema'],
        ['Glimepiride', 'Amaryl', 'Antidiabetic', 'Tablet', '2mg', 'Sulfonylurea for type 2 diabetes'],
        ['Simvastatin', 'Zocor', 'Antihyperlipidemic', 'Tablet', '20mg', 'Statin for high cholesterol'],
        ['Atorvastatin', 'Lipitor', 'Antihyperlipidemic', 'Tablet', '20mg', 'Statin for high cholesterol'],
        ['Bisacodyl', 'Dulcolax', 'Laxative', 'Tablet', '5mg', 'Stimulant laxative for constipation'],
        ['Loperamide', 'Imodium', 'Antidiarrheal', 'Capsule', '2mg', 'For acute diarrhea'],
        ['Carbamazepine', 'Tegretol', 'Anticonvulsant', 'Tablet', '200mg', 'For seizures and trigeminal neuralgia'],
        ['Mebendazole', 'Vermox', 'Anthelmintic', 'Tablet', '100mg', 'For intestinal worms — deworming program'],
        ['Ferrous Sulfate', 'Ferlin', 'Hematinic', 'Tablet', '200mg', 'Iron supplement for anemia'],
        ['Ascorbic Acid', 'Cecon', 'Vitamin', 'Tablet', '500mg', 'Vitamin C supplement'],
        ['Multivitamins', 'Revicon', 'Vitamin', 'Tablet', '—', 'Daily multivitamin with minerals'],
        ['Dextromethorphan', null, 'Antitussive', 'Syrup', '15mg/5mL', 'Cough suppressant syrup (bottle)'],
        ['Ambroxol', 'Mucosolvan', 'Mucolytic', 'Tablet', '30mg', 'Loosens mucus for productive cough'],
        ['Hydrocortisone', null, 'Dermatological', 'Cream', '1%', 'Topical steroid for itching and rashes (tube)'],
        ['Povidone-Iodine', 'Betadine', 'Antiseptic', 'Solution', '10%', 'Antiseptic solution (bottle)'],
    ];

    /**
     * Inventory per medicine (key = "Generic|Strength").
     * expiry supports "+X days" (relative to now) or "YYYY-MM-DD".
     * Includes second batches for the base-seeded medicines too.
     */
    private array $inventory = [
        'Paracetamol|500mg'     => [['expiry' => '+260 days', 'qty' => 400, 'price' => 5.50,  'reorder' => 50]],
        'Amoxicillin|500mg'     => [['expiry' => '+300 days', 'qty' => 350, 'price' => 12.50, 'reorder' => 40]],
        'Metformin|500mg'       => [['expiry' => '+330 days', 'qty' => 300, 'price' => 8.00,  'reorder' => 30]],
        'Amlodipine|10mg'       => [['expiry' => '+280 days', 'qty' => 250, 'price' => 15.00, 'reorder' => 30]],
        'Omeprazole|20mg'       => [['expiry' => '+55 days',  'qty' => 150, 'price' => 6.50,  'reorder' => 30]],
        'Ibuprofen|400mg'       => [['expiry' => '+240 days', 'qty' => 200, 'price' => 9.00,  'reorder' => 40]],
        'Salbutamol|100mcg'     => [['expiry' => '+365 days', 'qty' => 80,  'price' => 85.00, 'reorder' => 10]],
        'Losartan|50mg'         => [['expiry' => '+310 days', 'qty' => 180, 'price' => 14.00, 'reorder' => 30]],
        'Cetirizine|10mg'       => [['expiry' => '+270 days', 'qty' => 220, 'price' => 7.00,  'reorder' => 30]],
        'Mefenamic Acid|500mg'  => [['expiry' => '+260 days', 'qty' => 160, 'price' => 8.50,  'reorder' => 30]],
        'Cefalexin|500mg'       => [['expiry' => '+290 days', 'qty' => 140, 'price' => 18.00, 'reorder' => 25]],
        'Cotrimoxazole|480mg'   => [['expiry' => '+250 days', 'qty' => 190, 'price' => 6.00,  'reorder' => 30]],
        'Azithromycin|500mg'    => [['expiry' => '+270 days', 'qty' => 60,  'price' => 95.00, 'reorder' => 10]],
        'Ciprofloxacin|500mg'   => [['expiry' => '+300 days', 'qty' => 8,   'price' => 20.00, 'reorder' => 30]],   // LOW STOCK demo
        'Co-Amoxiclav|625mg'    => [['expiry' => '+330 days', 'qty' => 0,   'price' => 45.00, 'reorder' => 20]],   // OUT OF STOCK demo
        'Metoprolol|50mg'       => [['expiry' => '+280 days', 'qty' => 170, 'price' => 12.00, 'reorder' => 25]],
        'Nifedipine|10mg'       => [['expiry' => '+260 days', 'qty' => 130, 'price' => 10.00, 'reorder' => 25]],
        'Hydrochlorothiazide|25mg' => [['expiry' => '+300 days', 'qty' => 200, 'price' => 4.00, 'reorder' => 30]],
        'Glimepiride|2mg'       => [['expiry' => '+320 days', 'qty' => 90,  'price' => 25.00, 'reorder' => 15]],
        'Simvastatin|20mg'      => [['expiry' => '+290 days', 'qty' => 120, 'price' => 22.00, 'reorder' => 20]],
        'Atorvastatin|20mg'     => [['expiry' => '+310 days', 'qty' => 12,  'price' => 30.00, 'reorder' => 25]],   // LOW STOCK demo
        'Bisacodyl|5mg'         => [['expiry' => '+45 days',  'qty' => 110, 'price' => 9.00,  'reorder' => 20]],   // EXPIRING SOON demo
        'Loperamide|2mg'        => [['expiry' => '+240 days', 'qty' => 140, 'price' => 8.00,  'reorder' => 25]],
        'Carbamazepine|200mg'   => [['expiry' => '+330 days', 'qty' => 100, 'price' => 15.00, 'reorder' => 15]],
        'Mebendazole|100mg'     => [['expiry' => '+280 days', 'qty' => 0,   'price' => 11.00, 'reorder' => 40]],   // OUT OF STOCK demo
        'Ferrous Sulfate|200mg' => [['expiry' => '+300 days', 'qty' => 260, 'price' => 7.00,  'reorder' => 40]],
        'Ascorbic Acid|500mg'   => [['expiry' => '+240 days', 'qty' => 320, 'price' => 4.50,  'reorder' => 50]],
        'Multivitamins|—'       => [['expiry' => '+260 days', 'qty' => 10,  'price' => 6.00,  'reorder' => 50]],   // LOW STOCK demo
        'Dextromethorphan|15mg/5mL' => [['expiry' => '+30 days', 'qty' => 25, 'price' => 60.00, 'reorder' => 8]],  // EXPIRING SOON demo
        'Ambroxol|30mg'         => [['expiry' => '+280 days', 'qty' => 150, 'price' => 14.00, 'reorder' => 25]],
        'Hydrocortisone|1%'     => [['expiry' => '+20 days',  'qty' => 40,  'price' => 55.00, 'reorder' => 10]],   // EXPIRING SOON demo
        'Povidone-Iodine|10%'   => [['expiry' => '+330 days', 'qty' => 5,   'price' => 70.00, 'reorder' => 15]],   // LOW STOCK demo
    ];

    /**
     * [first_name, last_name, date_of_birth, gender, contact_number, address]
     */
    private array $patients = [
        ['Ramon', 'Aggabao', '1958-02-14', 'male', '09171234501', 'Purok 2, Brgy. Malalinta, San Manuel, Isabela'],
        ['Liza', 'Cauilan', '1990-08-23', 'female', '09181234502', 'Purok 1, Brgy. Centro, San Manuel, Isabela'],
        ['Jomar', 'Binag', '1985-11-05', 'male', '09171234503', 'Purok 3, Brgy. Salay, San Manuel, Isabela'],
        ['Rosalinda', 'Lacambra', '1972-04-30', 'female', '09181234504', 'Purok 2, Brgy. San Juan, San Manuel, Isabela'],
        ['Bryan', 'Tumaliuan', '1997-01-19', 'male', '09171234505', 'Purok 1, Brgy. Calanigan, San Manuel, Isabela'],
        ['Nenita', 'Agustin', '1960-12-08', 'female', '09181234506', 'Purok 4, Brgy. San Vicente, San Manuel, Isabela'],
        ['Kevin', 'Alviar', '2006-06-17', 'male', '09171234507', 'Purok 3, Brgy. Malalinta, San Manuel, Isabela'],
        ['Marites', 'Domingo', '1993-09-27', 'female', '09181234508', 'Purok 1, Brgy. Centro, San Manuel, Isabela'],
        ['Eduardo', 'Panganiban', '1949-03-02', 'male', '09171234509', 'Purok 2, Brgy. Salay, San Manuel, Isabela'],
        ['Angelica', 'Reyes', '2015-05-11', 'female', '09181234510', 'Purok 1, Brgy. San Juan, San Manuel, Isabela'],
        ['Nestor', 'Guzman', '1978-07-25', 'male', '09171234511', 'Purok 4, Brgy. Calanigan, San Manuel, Isabela'],
        ['Jonalyn', 'Ballesteros', '2001-10-14', 'female', '09181234512', 'Purok 2, Brgy. San Vicente, San Manuel, Isabela'],
        ['Danilo', 'Castillo', '1968-12-30', 'male', '09171234513', 'Purok 3, Brgy. Centro, San Manuel, Isabela'],
        ['Kimberly', 'Flores', '2010-02-09', 'female', '09181234514', 'Purok 1, Brgy. Malalinta, San Manuel, Isabela'],
        ['Santiago', 'Bautista', '1939-06-21', 'male', '09171234515', 'Purok 2, Brgy. Salay, San Manuel, Isabela'],
    ];

    /**
     * Sample prescriptions. days_ago = how many days back to set created_at.
     * items: [med key, dosage, frequency, duration, qty, instructions]
     */
    private array $prescriptions = [
        [
            'patient' => 'Jomar Binag', 'diagnosis' => 'Acute pharyngitis',
            'notes' => 'Advise warm fluids and rest. Return if fever persists beyond 3 days.',
            'status' => 'pending', 'days_ago' => 0,
            'items' => [
                ['med' => 'Paracetamol|500mg', 'dosage' => '1 tablet', 'frequency' => '3 times a day', 'duration' => '5 days', 'qty' => 15, 'instructions' => 'Take after meals'],
                ['med' => 'Ambroxol|30mg', 'dosage' => '1 tablet', 'frequency' => '3 times a day', 'duration' => '5 days', 'qty' => 15, 'instructions' => 'Take after meals'],
            ],
        ],
        [
            'patient' => 'Liza Cauilan', 'diagnosis' => 'Hypertension, Stage 1',
            'notes' => 'Low-salt diet. Monitor BP weekly. Follow up in 1 month.',
            'status' => 'pending', 'days_ago' => 1,
            'items' => [
                ['med' => 'Amlodipine|10mg', 'dosage' => '1 tablet', 'frequency' => 'once a day', 'duration' => '30 days', 'qty' => 30, 'instructions' => 'Take every morning'],
            ],
        ],
        [
            'patient' => 'Angelica Reyes', 'diagnosis' => 'Helminthiasis (school deworming)',
            'notes' => 'Deworming campaign — schedule repeat dose after 6 months.',
            'status' => 'pending', 'days_ago' => 1,
            'items' => [
                ['med' => 'Mebendazole|100mg', 'dosage' => '1 tablet', 'frequency' => '2 times a day', 'duration' => '3 days', 'qty' => 6, 'instructions' => 'Take with or without food'],
            ],
        ],
        [
            'patient' => 'Ramon Aggabao', 'diagnosis' => 'Type 2 Diabetes Mellitus',
            'notes' => 'Diet control and daily walking. Check FBS after 2 weeks.',
            'status' => 'validated', 'days_ago' => 3,
            'items' => [
                ['med' => 'Metformin|500mg', 'dosage' => '1 tablet', 'frequency' => '2 times a day', 'duration' => '30 days', 'qty' => 60, 'instructions' => 'Take after breakfast and dinner'],
                ['med' => 'Glimepiride|2mg', 'dosage' => '1 tablet', 'frequency' => 'once a day', 'duration' => '30 days', 'qty' => 30, 'instructions' => 'Take before breakfast'],
            ],
        ],
        [
            'patient' => 'Bryan Tumaliuan', 'diagnosis' => 'Urinary Tract Infection',
            'notes' => 'Drink plenty of water. Finish the full course even if symptoms improve.',
            'status' => 'validated', 'days_ago' => 4,
            'items' => [
                ['med' => 'Cefalexin|500mg', 'dosage' => '1 capsule', 'frequency' => '4 times a day', 'duration' => '7 days', 'qty' => 28, 'instructions' => 'Take every 6 hours after meals'],
            ],
        ],
        [
            'patient' => 'Eduardo Panganiban', 'diagnosis' => 'Bronchial Asthma',
            'notes' => 'Patient declined treatment this visit. Advised to return when symptoms flare.',
            'status' => 'cancelled', 'days_ago' => 5,
            'items' => [
                ['med' => 'Salbutamol|100mcg', 'dosage' => '2 puffs', 'frequency' => 'as needed', 'duration' => '30 days', 'qty' => 1, 'instructions' => 'Use inhaler when wheezing'],
            ],
        ],
        [
            'patient' => 'Rosalinda Lacambra', 'diagnosis' => 'Gastroesophageal reflux disease (GERD)',
            'notes' => 'Avoid fatty and spicy food. Elevate head when sleeping.',
            'status' => 'dispensed', 'days_ago' => 2,
            'items' => [
                ['med' => 'Omeprazole|20mg', 'dosage' => '1 capsule', 'frequency' => 'once a day', 'duration' => '14 days', 'qty' => 14, 'instructions' => 'Take 30 minutes before breakfast'],
            ],
        ],
        [
            'patient' => 'Marites Domingo', 'diagnosis' => 'Primary Dysmenorrhea',
            'notes' => 'Warm compress on lower abdomen. Follow up if pain persists.',
            'status' => 'dispensed', 'days_ago' => 3,
            'items' => [
                ['med' => 'Mefenamic Acid|500mg', 'dosage' => '1 capsule', 'frequency' => '3 times a day', 'duration' => '3 days', 'qty' => 9, 'instructions' => 'Take after meals'],
                ['med' => 'Ibuprofen|400mg', 'dosage' => '1 tablet', 'frequency' => '3 times a day', 'duration' => '3 days', 'qty' => 9, 'instructions' => 'Take after meals'],
            ],
        ],
        [
            'patient' => 'Kevin Alviar', 'diagnosis' => 'Community-acquired Pneumonia',
            'notes' => 'Finish the full antibiotic course. Return immediately if breathing worsens.',
            'status' => 'dispensed', 'days_ago' => 6,
            'items' => [
                ['med' => 'Amoxicillin|500mg', 'dosage' => '1 capsule', 'frequency' => '3 times a day', 'duration' => '7 days', 'qty' => 21, 'instructions' => 'Take every 8 hours after meals'],
                ['med' => 'Paracetamol|500mg', 'dosage' => '1 tablet', 'frequency' => '4 times a day', 'duration' => '5 days', 'qty' => 20, 'instructions' => 'Take for fever every 6 hours'],
            ],
        ],
        [
            'patient' => 'Nestor Guzman', 'diagnosis' => 'Acute Gastroenteritis',
            'notes' => 'ORS and plenty of fluids. Watch for signs of dehydration.',
            'status' => 'dispensed', 'days_ago' => 8,
            'items' => [
                ['med' => 'Loperamide|2mg', 'dosage' => '2 capsules stat, then 1', 'frequency' => 'after each loose stool', 'duration' => '3 days', 'qty' => 10, 'instructions' => 'Do not exceed 8 capsules per day'],
                ['med' => 'Paracetamol|500mg', 'dosage' => '1 tablet', 'frequency' => '4 times a day', 'duration' => '3 days', 'qty' => 12, 'instructions' => 'Take for fever every 6 hours'],
            ],
        ],
        [
            'patient' => 'Jonalyn Ballesteros', 'diagnosis' => 'Acute Bronchospasm',
            'notes' => 'Avoid cold drinks and dust. Refer to pulmo if recurrent.',
            'status' => 'dispensed', 'days_ago' => 10,
            'items' => [
                ['med' => 'Salbutamol|100mcg', 'dosage' => '2 puffs', 'frequency' => '4 times a day', 'duration' => '14 days', 'qty' => 1, 'instructions' => 'Shake inhaler before each use'],
                ['med' => 'Cetirizine|10mg', 'dosage' => '1 tablet', 'frequency' => 'once a day', 'duration' => '7 days', 'qty' => 7, 'instructions' => 'Take at bedtime'],
            ],
        ],
        [
            'patient' => 'Santiago Bautista', 'diagnosis' => 'Hyperlipidemia',
            'notes' => 'Low-fat diet. Repeat lipid profile after 3 months.',
            'status' => 'dispensed', 'days_ago' => 14,
            'items' => [
                ['med' => 'Simvastatin|20mg', 'dosage' => '1 tablet', 'frequency' => 'once a day', 'duration' => '30 days', 'qty' => 30, 'instructions' => 'Take every evening'],
            ],
        ],
        [
            'patient' => 'Nenita Agustin', 'diagnosis' => 'Type 2 Diabetes Mellitus — follow-up',
            'notes' => 'Continue maintenance meds. FBS improved. Next check-up in 1 month.',
            'status' => 'dispensed', 'days_ago' => 20,
            'items' => [
                ['med' => 'Metformin|500mg', 'dosage' => '1 tablet', 'frequency' => '2 times a day', 'duration' => '30 days', 'qty' => 60, 'instructions' => 'Take after breakfast and dinner'],
                ['med' => 'Ascorbic Acid|500mg', 'dosage' => '1 tablet', 'frequency' => 'once a day', 'duration' => '30 days', 'qty' => 30, 'instructions' => 'Take after meals'],
            ],
        ],
        [
            'patient' => 'Kimberly Flores', 'diagnosis' => 'Acute Tonsillitis',
            'notes' => 'Soft diet, warm saline gargle. Return if fever spikes.',
            'status' => 'dispensed', 'days_ago' => 26,
            'items' => [
                ['med' => 'Amoxicillin|500mg', 'dosage' => '1 capsule', 'frequency' => '3 times a day', 'duration' => '7 days', 'qty' => 21, 'instructions' => 'Take every 8 hours after meals'],
                ['med' => 'Paracetamol|500mg', 'dosage' => '1 tablet', 'frequency' => '4 times a day', 'duration' => '5 days', 'qty' => 20, 'instructions' => 'Take for fever every 6 hours'],
            ],
        ],
    ];

    public function run(): void
    {
        $doctor = User::where('role', 'doctor')->first();
        $pharmacist = User::where('role', 'pharmacist')->first();

        $this->seedMedicines();
        $this->seedInventory();

        $this->seedPatients();

        if (! $doctor || ! $pharmacist) {
            $this->command->warn('Doctor/pharmacist users not found — skipping sample prescriptions. Run `db:seed` first.');

            return;
        }

        $this->seedPrescriptions($doctor->id, $pharmacist->id);

        $this->command->info('Dummy data complete!');
    }

    private function seedMedicines(): void
    {
        foreach ($this->medicines as [$generic, $brand, $category, $form, $strength, $description]) {
            Medicine::firstOrCreate(
                ['generic_name' => $generic, 'strength' => $strength],
                [
                    'brand_name' => $brand,
                    'category' => $category,
                    'dosage_form' => $form,
                    'description' => $description,
                ]
            );
        }
    }

    private function seedInventory(): void
    {
        $batchNumber = 200;

        foreach ($this->inventory as $key => $batches) {
            [$generic, $strength] = explode('|', $key);
            $medicine = Medicine::where('generic_name', $generic)->where('strength', $strength)->first();

            if (! $medicine) {
                $this->command->warn("Medicine not found for inventory key: {$key}");

                continue;
            }

            foreach ($batches as $batch) {
                $batchNumber++;

                MedicineInventory::firstOrCreate(
                    ['batch_number' => "BATCH-{$batchNumber}"],
                    [
                        'medicine_id' => $medicine->id,
                        'expiry_date' => Carbon::parse($batch['expiry'])->toDateString(),
                        'quantity' => $batch['qty'],
                        'unit_price' => $batch['price'],
                        'reorder_level' => $batch['reorder'],
                    ]
                );
            }
        }
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
            $patient = Patient::where('first_name', explode(' ', $spec['patient'])[0])
                ->where('last_name', explode(' ', $spec['patient'])[1])
                ->first();

            if (! $patient) {
                $this->command->warn("Patient not found: {$spec['patient']}");

                continue;
            }

            $createdAt = Carbon::now()->subDays($spec['days_ago']);

            $prescription = Prescription::firstOrCreate(
                ['prescription_number' => Prescription::generatePrescriptionNumber()],
                [
                    'patient_id' => $patient->id,
                    'doctor_id' => $doctorId,
                    'diagnosis' => $spec['diagnosis'],
                    'notes' => $spec['notes'],
                    'status' => $spec['status'],
                    'created_at' => $createdAt,
                ]
            );

            // Re-running must not double-create items for an existing prescription.
            if ($prescription->wasRecentlyCreated) {
                foreach ($spec['items'] as $item) {
                    [$generic, $strength] = explode('|', $item['med']);
                    $medicine = Medicine::where('generic_name', $generic)->where('strength', $strength)->first();

                    if (! $medicine) {
                        $this->command->warn("Medicine not found for RX item: {$item['med']}");

                        continue;
                    }

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

                if ($spec['status'] === 'dispensed') {
                    $this->createDispensingRecord($prescription, $pharmacistId);
                }
            }
        }
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
            // Pick the first batch that has enough stock; fall back to any batch with stock.
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

            // Only deduct stock when we actually created the dispensed item.
            if ($dispensedItem->wasRecentlyCreated) {
                $batch->decrement('quantity', $item->quantity);
            }
        }
    }
}
