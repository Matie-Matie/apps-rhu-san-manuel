<?php

namespace Database\Seeders;

use App\Models\Patient;
use Illuminate\Database\Seeder;

/**
 * Dummy patients for the APPS demo / school walkthrough.
 *
 * Re-adds the realistic Filipino patient roster that was previously part of
 * the demo data. The official medicine catalog (OfficialMedicineSeeder) is
 * the source of truth for medicines; these patients exist only so the
 * Patients page and prescription flow have data to work with during the
 * school review.
 *
 * Safe to re-run — every record is created with firstOrCreate-style checks,
 * so running this multiple times does NOT duplicate data.
 *
 * Adds:
 *  - The 2 base patients from the original database seeder
 *  - 15 named patients from the original demo (San Manuel addresses)
 *  - 6 additional named patients from the usage-data pass
 *
 * The 200 deterministic bulk patients come from BulkPatientsSeeder, which is
 * invoked separately from DatabaseSeeder.
 */
class DummyPatientsSeeder extends Seeder
{
    /**
     * [first_name, last_name, date_of_birth, gender, contact_number, address]
     */
    private array $patients = [
        ['Pedro', 'Penduko', '1985-03-15', 'male', '09171234567', '123 Rizal St., San Manuel, Isabela'],
        ['Juana', 'Dela Cruz', '1992-07-22', 'female', '09189876543', '456 Mabini St., San Manuel, Isabela'],
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
        ['Rodel', 'Aguinaldo', '1964-09-12', 'male', '09174561001', 'Purok 1, Brgy. San Marcos, San Manuel, Isabela'],
        ['Babylyn', 'Soriano', '1998-03-27', 'female', '09174561002', 'Purok 2, Brgy. Calanigan, San Manuel, Isabela'],
        ['Teodoro', 'Magtoto', '1955-11-30', 'male', '09174561003', 'Purok 3, Brgy. San Gabriel, San Manuel, Isabela'],
        ['Janice', 'Villanueva', '1988-06-18', 'female', '09174561004', 'Purok 1, Brgy. Centro, San Manuel, Isabela'],
        ['Gregorio', 'Salazar', '1972-02-05', 'male', '09174561005', 'Purok 2, Brgy. Malalinta, San Manuel, Isabela'],
        ['Melissa', 'Talavera', '2003-10-09', 'female', '09174561006', 'Purok 4, Brgy. San Juan, San Manuel, Isabela'],
    ];

    public function run(): void
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

        $this->command->info('Dummy patients seeded.');
    }
}
