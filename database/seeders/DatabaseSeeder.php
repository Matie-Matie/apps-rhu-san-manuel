<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // The two existing login accounts.
        User::factory()->create([
            'name' => 'Dr. Juan Dela Cruz',
            'email' => 'doctor@apps.test',
            'password' => bcrypt('password'),
            'role' => 'doctor',
        ]);

        User::factory()->create([
            'name' => 'Maria Santos, RPh',
            'email' => 'pharmacist@apps.test',
            'password' => bcrypt('password'),
            'role' => 'pharmacist',
        ]);

        // Official San Manuel clinic medicine list (72 real entries
        // transcribed from Kamille's photo). No fabricated prescriptions,
        // inventory, or activity logs are seeded here.
        $this->call([
            OfficialMedicineSeeder::class,
            DummyPatientsSeeder::class,
            BulkPatientsSeeder::class,
        ]);
    }
}
