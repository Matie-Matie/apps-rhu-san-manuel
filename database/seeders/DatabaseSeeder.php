<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Demo login accounts. Created with plain inserts (no factories) so
        // seeding works even on machines where faker's helpers are missing.
        User::create([
            'name' => 'Dr. Juan Dela Cruz',
            'email' => 'doctor@apps.test',
            'password' => Hash::make('password'),
            'role' => 'doctor',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Maria Santos, RPh',
            'email' => 'pharmacist@apps.test',
            'password' => Hash::make('password'),
            'role' => 'pharmacist',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Ana Reyes (Staff)',
            'email' => 'staff@apps.test',
            'password' => Hash::make('password'),
            'role' => 'staff',
            'is_active' => true,
            'email_verified_at' => now(),
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
