<?php

namespace Database\Seeders;

use App\Models\Patient;
use Illuminate\Database\Seeder;

/**
 * Bulk dummy patients for the APPS demo / testing.
 *
 * Generates a large set of realistic Filipino patients from San Manuel,
 * Isabela. Name/DOB/contact/address generation is deterministic, so re-running
 * this seeder adds the same records (skipped via firstOrCreate) — no duplicates.
 *
 * Usage:
 *   php artisan db:seed --class=BulkPatientsSeeder
 */
class BulkPatientsSeeder extends Seeder
{
    /** How many additional patients to create. */
    private int $target = 200;

    private array $maleFirstNames = [
        'Juan', 'Jose', 'Pedro', 'Ramon', 'Mario', 'Rene', 'Ronaldo', 'Jomar', 'Bryan', 'Kevin',
        'Nestor', 'Danilo', 'Eduardo', 'Santiago', 'Mark', 'Michael', 'John', 'Paolo', 'Carlo', 'Vincent',
        'Arnel', 'Boyet', 'Ricky', 'Dennis', 'Rodel', 'Jun', 'Erwin', 'Fernando', 'Rogelio', 'Benjamin',
        'Dominic', 'Alvin', 'Roland', 'Jerome', 'Rommel', 'Allan', 'Edwin', 'Noli', 'Rodolfo', 'Wilfredo',
        'Gener', 'Leandro', 'Rafael', 'Salvador', 'Tomas', 'Victor', 'Walter', 'Zandro', 'Antonio', 'Manuel',
        'Francisco', 'Roberto', 'Gregorio', 'Isidro', 'Teodoro', 'Mauro', 'Feliciano', 'Nicanor', 'Honorio', 'Lorenzo',
    ];

    private array $femaleFirstNames = [
        'Maria', 'Ana', 'Liza', 'Rose', 'Grace', 'Jennifer', 'Marites', 'Jonalyn', 'Kristine', 'Michelle',
        'Angelica', 'Kimberly', 'Joanna', 'Catherine', 'Maricel', 'Analyn', 'Lovely', 'Jessa', 'Karen', 'Aileen',
        'Diana', 'Evelyn', 'Gloria', 'Imelda', 'Jocelyn', 'Luzviminda', 'Melissa', 'Nenita', 'Nora', 'Rowena',
        'Sandra', 'Teresita', 'Vilma', 'Yolanda', 'Zenaida', 'Babylyn', 'Cherry', 'Divina', 'Elaine', 'Fely',
        'Gina', 'Hazel', 'Ivy', 'Janice', 'Lerma', 'Margarita', 'Nimfa', 'Odessa', 'Pauline', 'Rachelle',
        'Sheila', 'Theresa', 'Ursula', 'Vivian', 'Wendy', 'Alyssa', 'Beverly', 'Clarissa', 'Daisy', 'Elena',
    ];

    private array $lastNames = [
        'Santos', 'Reyes', 'Garcia', 'Mendoza', 'Flores', 'Ramos', 'Bautista', 'Aquino', 'Cruz', 'Torres',
        'Rivera', 'Castillo', 'Villanueva', 'Domingo', 'Guzman', 'Agustin', 'Ballesteros', 'Aggabao', 'Cauilan', 'Lacambra',
        'Binag', 'Alviar', 'Tumaliuan', 'Panganiban', 'Dacumos', 'Carino', 'Uy', 'Tan', 'Lim', 'Chua',
        'Lucas', 'Abel', 'Agcaoili', 'Aguinaldo', 'Alonzo', 'Alvarez', 'Andres', 'Antonio', 'Apostol', 'Arceo',
        'Arellano', 'Austria', 'Bagaoisan', 'Balbin', 'Balderama', 'Barcelo', 'Baysa', 'Bernardo', 'Borja', 'Bucad',
        'Cabrera', 'Caluya', 'Castañeda', 'Castro', 'Cayabyab', 'Claveria', 'Collado', 'Corpuz', 'Cortez', 'Dalangin',
        'Dancel', 'Dizon', 'Dumlao', 'Escobar', 'Estrada', 'Fabian', 'Fernandez', 'Florendo', 'Ganal', 'Gatchalian',
        'Geronimo', 'Gonzales', 'Guinto', 'Hermoso', 'Ignacio', 'Ilagan', 'Javier', 'Jimenez', 'Lacsamana', 'Laguerta',
        'Lansang', 'Laxamana', 'Layug', 'Leoncio', 'Ligon', 'Lising', 'Mabini', 'Macaraeg', 'Madrigal', 'Magtoto',
        'Magsino', 'Mallari', 'Manalo', 'Manansala', 'Mangalindan', 'Manlangit', 'Marquez', 'Matias', 'Medina', 'Mercado',
        'Miranda', 'Molina', 'Montero', 'Moreno', 'Navarro', 'Nicolas', 'Nobleza', 'Obias', 'Ocampo', 'Ochoco',
        'Oliveros', 'Ordonez', 'Ortega', 'Padilla', 'Paguio', 'Palacio', 'Palma', 'Paredes', 'Pascual', 'Pelayo',
        'Perez', 'Policarpio', 'Prado', 'Quijano', 'Quinto', 'Rances', 'Regalado', 'Remigio', 'Rillera', 'Robles',
        'Rosales', 'Roxas', 'Sabado', 'Saguin', 'Salazar', 'Salonga', 'Samson', 'Sebastian', 'Sison', 'Solano',
        'Soriano', 'Suarez', 'Taguinod', 'Talavera', 'Tamayo', 'Teodoro', 'Tolentino', 'Trinidad', 'Tuazon', 'Umali',
        'Valdez', 'Valenzuela', 'Ventura', 'Villacorta', 'Villalobos', 'Villar', 'Villarama', 'Villarica', 'Yabut', 'Yap',
        'Zabala', 'Zulueta',
    ];

    private array $barangays = [
        'Brgy. Centro', 'Brgy. Malalinta', 'Brgy. Salay', 'Brgy. San Juan',
        'Brgy. Calanigan', 'Brgy. San Vicente', 'Brgy. San Gabriel', 'Brgy. San Marcos',
    ];

    public function run(): void
    {
        $created = 0;
        $skipped = 0;
        $i = 0;

        // Deterministic combo walk: (first index, last index) is a bijection for
        // i < 35 * count(lastNames), so we never repeat a full name.
        while ($created < $this->target) {
            $isMale = ($i % 2) === 0;
            $firstList = $isMale ? $this->maleFirstNames : $this->femaleFirstNames;
            $firstName = $firstList[($i % count($firstList))];
            $lastName = $this->lastNames[intdiv($i, count($firstList)) % count($this->lastNames)];

            $patient = Patient::firstOrCreate(
                ['first_name' => $firstName, 'last_name' => $lastName],
                $this->makeAttributes($firstName, $lastName, $i, $isMale)
            );

            if ($patient->wasRecentlyCreated) {
                $created++;
            } else {
                $skipped++;
            }

            $i++;
        }

        $this->command->info("Bulk patients done: {$created} created, {$skipped} skipped (already existed).");
    }

    private function makeAttributes(string $firstName, string $lastName, int $i, bool $isMale): array
    {
        // Deterministic pseudo-random spread: ages ~6 to ~85.
        $year = 1940 + (($i * 37) % 76);
        $month = 1 + (($i * 13) % 12);
        $day = 1 + (($i * 7) % 28);

        $purok = 1 + ($i % 7);
        $barangay = $this->barangays[($i * 3) % count($this->barangays)];

        return [
            'date_of_birth' => sprintf('%04d-%02d-%02d', $year, $month, $day),
            'gender' => $isMale ? 'male' : 'female',
            'contact_number' => '09' . str_pad(($i * 12345) % 100000000, 8, '0', STR_PAD_LEFT),
            'address' => "Purok {$purok}, {$barangay}, San Manuel, Isabela",
        ];
    }
}
