<?php

namespace Database\Seeders;

use App\Models\Medicine;
use Illuminate\Database\Seeder;

/**
 * Official Medicine Catalog — transcribed from the San Manuel clinic
 * medicine list (photo supplied by Kamille). This is the source of truth
 * for the final seed.
 *
 * Contains EXACTLY the 72 entries visible in the photo, grouped by the
 * photo's section header:
 *
 *   - Tablet/Capsule      (42)
 *   - Syrup/Suspension    (13)
 *   - Drops                (8)
 *   - Ointment/Cream       (6)
 *   - Inhaler/Nebule       (3)
 *   -------------------------
 *   Total                  72
 *
 * Transcription rules:
 *  - The photo's section header is stored VERBATIM in `category`
 *    (e.g. "Tablet/Capsule", "Syrup/Suspension", "Drops",
 *    "Ointment/Cream", "Inhaler/Nebule").
 *  - `generic_name` preserves the visible wording. Nothing is expanded,
 *    "cleaned up", or clinically re-described (e.g. "Chlorphen+PPA+APAP",
 *    "Aluminium + Magnesium OH", "Ferrous Sulfate + Folic Acid").
 *  - `dosage_form` is normalized from the visible wording: "tab" -> Tablet,
 *    "cap" -> Capsule, "nebule" -> Nebule. Where the list gives no form
 *    hint, the section's primary form is used (Syrup, Drops, Ointment,
 *    Inhaler). "ORS" is stored as "Powder", its standard dosage form.
 *  - `strength` carries the visible strength exactly as written, with form
 *    suffixes dropped ("300mg/tab" -> "300mg", "500mg/cap" -> "500mg").
 *    Entries with no strength in the list keep `strength` = null.
 *  - `brand_name` and `description` are ALWAYS null — the photo contains
 *    no brands and no clinical descriptions.
 *
 * IMPORTANT: the photo contains NO stock metadata — no batch numbers,
 * prices, expiry dates, or quantities. Inventory must be entered
 * separately in the app after this catalog is seeded.
 *
 * Idempotency: every row is matched on the composite key
 *   generic_name + category + dosage_form + strength
 * so re-running is safe, and same-name items that appear in multiple
 * sections (Ascorbic Acid, Zinc, Lagundi, Multivitamins, Paracetamol,
 * Amoxicillin, Cefalexin, Cetirizine, Cloxacillin, Co-amoxiclav,
 * Salbutamol, Mefenamic) are kept as separate rows — never collapsed.
 */
class OfficialMedicineSeeder extends Seeder
{
    /**
     * Each row: [generic_name, category, dosage_form, strength]
     * `brand_name` and `description` are intentionally not listed here;
     * they are always null.
     */
    private array $medicines = [
        // ================= Tablet/Capsule (42) =================
        ['Allopurinol', 'Tablet/Capsule', 'Tablet', '300mg'],
        ['Aluminium + Magnesium OH', 'Tablet/Capsule', 'Tablet', '200mg'],
        ['Amlodipine', 'Tablet/Capsule', 'Tablet', '10mg'],
        ['Amlodipine', 'Tablet/Capsule', 'Tablet', '5mg'],
        ['Amoxicillin', 'Tablet/Capsule', 'Capsule', '500mg'],
        ['Aspirin', 'Tablet/Capsule', 'Tablet', '80mg'],
        ['Atorvastatin', 'Tablet/Capsule', 'Tablet', '20mg'],
        ['Azithromycin', 'Tablet/Capsule', 'Tablet', '500mg'],
        ['Calcium Carbonate', 'Tablet/Capsule', 'Tablet', null],
        ['Cefuroxime', 'Tablet/Capsule', 'Tablet', '500mg'],
        ['Celecoxib', 'Tablet/Capsule', 'Tablet', '200mg'],
        ['Cetirizine', 'Tablet/Capsule', 'Tablet', '10mg'],
        ['Chlorphen+PPA+APAP', 'Tablet/Capsule', 'Tablet', null],
        ['Ciprofloxacin', 'Tablet/Capsule', 'Tablet', '500mg'],
        ['Clopidogrel', 'Tablet/Capsule', 'Tablet', '75mg'],
        ['Cloxacillin', 'Tablet/Capsule', 'Capsule', '500mg'],
        ['Co-amoxiclav', 'Tablet/Capsule', 'Tablet', '625mg'],
        ['Doxofylline', 'Tablet/Capsule', 'Tablet', '400mg'],
        ['Doxycycline', 'Tablet/Capsule', 'Capsule', '100mg'],
        ['Febuxostat', 'Tablet/Capsule', 'Tablet', '40mg'],
        ['Fenofibrate', 'Tablet/Capsule', 'Tablet', '160mg'],
        ['Ferrous Sulfate + Folic Acid', 'Tablet/Capsule', 'Tablet', null],
        ['Ferrous Sulfate', 'Tablet/Capsule', 'Tablet', '325mg'],
        ['Gliclazide', 'Tablet/Capsule', 'Tablet', '80mg'],
        ['Lagundi', 'Tablet/Capsule', 'Tablet', '300mg'],
        ['Losartan + HCTZ', 'Tablet/Capsule', 'Tablet', '50mg/12.5mg'],
        ['Losartan', 'Tablet/Capsule', 'Tablet', '100mg'],
        ['Losartan', 'Tablet/Capsule', 'Tablet', '50mg'],
        ['Mefenamic Acid', 'Tablet/Capsule', 'Capsule', '500mg'],
        ['Metformin', 'Tablet/Capsule', 'Tablet', '500mg'],
        ['Metoprolol', 'Tablet/Capsule', 'Tablet', '100mg'],
        ['Metoprolol', 'Tablet/Capsule', 'Tablet', '50mg'],
        ['Montelukast + Levocetirizine', 'Tablet/Capsule', 'Tablet', '10/5mg'],
        ['Multiple Micronutrient Supplement', 'Tablet/Capsule', 'Tablet', null],
        ['Omeprazole', 'Tablet/Capsule', 'Tablet', '40mg'],
        ['ORS', 'Tablet/Capsule', 'Powder', null],
        ['Paracetamol', 'Tablet/Capsule', 'Tablet', '500mg'],
        ['Salbutamol', 'Tablet/Capsule', 'Tablet', '2mg'],
        ['Sambong', 'Tablet/Capsule', 'Tablet', null],
        ['Telmisartan', 'Tablet/Capsule', 'Tablet', '40mg'],
        ['Trimetazidine', 'Tablet/Capsule', 'Tablet', '35mg'],
        ['Vitamin B complex', 'Tablet/Capsule', 'Tablet', null],

        // ================= Syrup/Suspension (13) =================
        ['Amoxicillin', 'Syrup/Suspension', 'Syrup', '250mg/5ml'],
        ['Ascorbic Acid', 'Syrup/Suspension', 'Syrup', null],
        ['Cefalexin', 'Syrup/Suspension', 'Syrup', '125mg/5ml'],
        ['Cefalexin', 'Syrup/Suspension', 'Syrup', '250mg/5ml'],
        ['Cetirizine', 'Syrup/Suspension', 'Syrup', '5mg/5ml'],
        ['Cloxacillin', 'Syrup/Suspension', 'Syrup', '125mg/5ml'],
        ['Cloxacillin', 'Syrup/Suspension', 'Syrup', '250mg/5ml'],
        ['Co-amoxiclav', 'Syrup/Suspension', 'Syrup', '312.5mg/5ml'],
        ['Lagundi', 'Syrup/Suspension', 'Syrup', null],
        ['Mefenamic', 'Syrup/Suspension', 'Syrup', '50mg/5ml'],
        ['Multivitamins', 'Syrup/Suspension', 'Syrup', null],
        ['Paracetamol', 'Syrup/Suspension', 'Syrup', '250mg/5ml'],
        ['Zinc', 'Syrup/Suspension', 'Syrup', null],

        // ================= Drops (8) =================
        ['Amoxicillin', 'Drops', 'Drops', '100mg/ml'],
        ['Ascorbic Acid', 'Drops', 'Drops', null],
        ['Carbocisteine', 'Drops', 'Drops', null],
        ['Cefalexin', 'Drops', 'Drops', '100mg/ml'],
        ['Cetirizine', 'Drops', 'Drops', '2.5mg/ml'],
        ['Multivitamins', 'Drops', 'Drops', null],
        ['Paracetamol', 'Drops', 'Drops', '100mg/ml'],
        ['Zinc', 'Drops', 'Drops', null],

        // ================= Ointment/Cream (6) =================
        ['Betamethasone', 'Ointment/Cream', 'Ointment', null],
        ['Calamine + Zinc Oxide', 'Ointment/Cream', 'Ointment', null],
        ['Clobetasol', 'Ointment/Cream', 'Ointment', null],
        ['Clotrimazole', 'Ointment/Cream', 'Ointment', null],
        ['Mupirocin', 'Ointment/Cream', 'Ointment', null],
        ['Silver Sulfadiazine', 'Ointment/Cream', 'Ointment', null],

        // ================= Inhaler/Nebule (3) =================
        ['Budesonide + Formoterol Fumarate', 'Inhaler/Nebule', 'Inhaler', '160mcg/4.5mcg'],
        ['Salbutamol', 'Inhaler/Nebule', 'Nebule', null],
        ['Salmeterol + Fluticasone Propionate', 'Inhaler/Nebule', 'Inhaler', '25mcg/250mcg'],
    ];

    public function run(): void
    {
        $created = 0;
        $matched = 0;

        foreach ($this->medicines as [$generic, $category, $form, $strength]) {
            Medicine::firstOrCreate(
                [
                    'generic_name' => $generic,
                    'category' => $category,
                    'dosage_form' => $form,
                    'strength' => $strength,
                ],
                [
                    'brand_name' => null,
                    'description' => null,
                ]
            )->wasRecentlyCreated ? $created++ : $matched++;
        }

        $this->command->info(
            sprintf(
                'Official medicine catalog seeded: %d created, %d already present (catalog total: %d).',
                $created,
                $matched,
                count($this->medicines)
            )
        );
    }
}
