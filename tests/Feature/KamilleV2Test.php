<?php

namespace Tests\Feature;

use App\Models\Medicine;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class KamilleV2Test extends TestCase
{
    use RefreshDatabase;

    private function user(string $role, array $overrides = []): User
    {
        return User::factory()->create(array_merge(['role' => $role], $overrides));
    }

    // ---- Registration closed -------------------------------------------------

    public function test_public_registration_is_gone(): void
    {
        $this->get('/register')->assertNotFound();
        $this->post('/register', [
            'name' => 'Intruder', 'email' => 'x@y.test',
            'password' => 'password', 'password_confirmation' => 'password',
            'role' => 'doctor',
        ])->assertNotFound();
        $this->assertSame(0, User::count());
    }

    public function test_welcome_shows_version_and_no_register_link(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Welcome')
                ->where('appVersion', 'V2'));
    }

    // ---- Email verification gate ----------------------------------------------

    public function test_unverified_users_are_gated_to_verify_email(): void
    {
        $user = $this->user('doctor', ['email_verified_at' => null]);

        $this->actingAs($user)->get(route('dashboard'))
            ->assertRedirect(route('verification.notice'));
    }

    public function test_verified_users_reach_the_dashboard(): void
    {
        $this->actingAs($this->user('doctor'))->get(route('dashboard'))->assertOk();
    }

    // ---- Patients: recent first + strict dates ---------------------------------

    public function test_patient_list_shows_most_recent_first(): void
    {
        $doctor = $this->user('doctor');
        $old = Patient::create(['first_name' => 'Old', 'last_name' => 'Patient']);
        $new = Patient::create(['first_name' => 'New', 'last_name' => 'Patient']);

        $this->actingAs($doctor)->get(route('patients.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('patients.data.0.id', $new->id)
                ->where('patients.data.1.id', $old->id));
    }

    public function test_impossible_february_date_is_rejected(): void
    {
        $this->actingAs($this->user('doctor'))
            ->post(route('patients.store'), [
                'first_name' => 'Feb', 'last_name' => 'Tester',
                'date_of_birth' => '2026-02-30',
            ])
            ->assertSessionHasErrors('date_of_birth');

        $this->assertSame(0, Patient::count());
    }

    // ---- Prescriptions: units + auto-print --------------------------------------

    private function rxPayload(Patient $patient, Medicine $medicine, array $item = []): array
    {
        return [
            'patient_id' => $patient->id,
            'items' => [array_merge([
                'medicine_id' => $medicine->id,
                'dosage' => '1 tablet',
                'frequency' => 'Once a day (OD)',
                'duration' => '30 days',
                'quantity' => 30,
                'unit' => 'banig',
            ], $item)],
        ];
    }

    public function test_unit_is_required_and_prints_on_the_sheet(): void
    {
        $doctor = $this->user('doctor');
        $patient = Patient::create(['first_name' => 'Juan', 'last_name' => 'Cruz']);
        $medicine = Medicine::create(['generic_name' => 'Paracetamol']);

        // Missing unit → rejected.
        $payload = $this->rxPayload($patient, $medicine);
        unset($payload['items'][0]['unit']);
        $this->actingAs($doctor)->post(route('prescriptions.store'), $payload)
            ->assertSessionHasErrors('items.0.unit');
        $this->assertSame(0, Prescription::count());

        // All three units accepted.
        foreach (['piece', 'banig', 'box'] as $unit) {
            $this->actingAs($doctor)->post(route('prescriptions.store'), $this->rxPayload($patient, $medicine, ['unit' => $unit]))
                ->assertSessionHasNoErrors()
                ->assertRedirect(route('prescriptions.print', Prescription::latest('id')->first()));
        }

        $rx = Prescription::latest('id')->first();
        $this->actingAs($doctor)->get(route('prescriptions.print', $rx))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('prescription.items.0.unit', 'box'));
    }

    // ---- No validate step ---------------------------------------------------------

    public function test_validate_transition_is_gone_and_pending_dispenses_directly(): void
    {
        $doctor = $this->user('doctor');
        $pharmacist = $this->user('pharmacist');
        $patient = Patient::create(['first_name' => 'Juan', 'last_name' => 'Cruz']);
        $medicine = Medicine::create(['generic_name' => 'Amlodipine']);
        $batch = $medicine->inventories()->create(['quantity' => 50, 'unit_price' => 2, 'reorder_level' => 5]);

        $rx = Prescription::create([
            'patient_id' => $patient->id, 'doctor_id' => $doctor->id,
            'prescription_number' => Prescription::generatePrescriptionNumber(),
            'status' => 'pending',
        ]);
        $rx->items()->create([
            'medicine_id' => $medicine->id, 'dosage' => '1 tablet',
            'frequency' => 'Once a day (OD)', 'duration' => '30 days',
            'quantity' => 30, 'unit' => 'piece',
        ]);

        // 'validated' is no longer a legal target.
        $this->actingAs($pharmacist)->patch(route('prescriptions.update-status', $rx), ['status' => 'validated'])
            ->assertSessionHasErrors('status');

        // Pending dispenses straight away and lands on the print sheet.
        $this->actingAs($pharmacist)->post(route('dispensing.store', $rx), [
            'items' => [['prescription_item_id' => $rx->items()->first()->id, 'medicine_inventory_id' => $batch->id, 'quantity' => 30]],
        ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('prescriptions.print', $rx));

        $this->assertSame('dispensed', $rx->fresh()->status);
        $this->assertSame(20, (int) $batch->fresh()->quantity);
    }

    // ---- Archive + 6-month purge ------------------------------------------------------

    public function test_archive_hides_medicine_everywhere_and_restore_brings_it_back(): void
    {
        $doctor = $this->user('doctor');
        $pharmacist = $this->user('pharmacist');
        $medicine = Medicine::create(['generic_name' => 'Doomed Drug']);
        $medicine->inventories()->create(['quantity' => 5, 'unit_price' => 1, 'reorder_level' => 10]);

        // Doctor cannot archive.
        $this->actingAs($doctor)->post(route('medicines.archive', $medicine))->assertForbidden();

        $this->actingAs($pharmacist)->post(route('medicines.archive', $medicine))
            ->assertSessionHasNoErrors();
        $this->assertNotNull($medicine->fresh()->archived_at);

        // Hidden from catalog, Rx picker, and inventory.
        $this->actingAs($pharmacist)->get(route('medicines.index'))
            ->assertInertia(fn (Assert $page) => $page->where('medicines.total', 0));
        $this->actingAs($doctor)->get(route('prescriptions.create'))
            ->assertInertia(fn (Assert $page) => $page->has('medicines', 0));
        $this->actingAs($pharmacist)->get(route('inventory.index'))
            ->assertInertia(fn (Assert $page) => $page->where('inventories.total', 0));

        // Restore brings it back.
        $this->actingAs($pharmacist)->post(route('medicines.restore', $medicine))
            ->assertSessionHasNoErrors();
        $this->assertNull($medicine->fresh()->archived_at);
        $this->actingAs($pharmacist)->get(route('medicines.index'))
            ->assertInertia(fn (Assert $page) => $page->where('medicines.total', 1));
    }

    public function test_purge_deletes_only_old_archived_medicines_without_history(): void
    {
        $doctor = $this->user('doctor');
        $patient = Patient::create(['first_name' => 'Juan', 'last_name' => 'Cruz']);

        $old = Medicine::create(['generic_name' => 'Old Stock', 'archived_at' => now()->subMonths(7)]);
        $fresh = Medicine::create(['generic_name' => 'Fresh Archive', 'archived_at' => now()->subMonth()]);
        $referenced = Medicine::create(['generic_name' => 'Has History', 'archived_at' => now()->subYear()]);
        $rx = Prescription::create([
            'patient_id' => $patient->id, 'doctor_id' => $doctor->id,
            'prescription_number' => Prescription::generatePrescriptionNumber(),
        ]);
        $rx->items()->create([
            'medicine_id' => $referenced->id, 'dosage' => '1 tablet',
            'frequency' => 'Once a day (OD)', 'duration' => '30 days',
            'quantity' => 10, 'unit' => 'piece',
        ]);

        $this->artisan('medicines:purge-archive')->assertSuccessful();

        $this->assertDatabaseMissing('medicines', ['id' => $old->id]);
        $this->assertDatabaseHas('medicines', ['id' => $fresh->id]);
        $this->assertDatabaseHas('medicines', ['id' => $referenced->id]);
    }

    // ---- Dashboard deep-links --------------------------------------------------------------

    public function test_inventory_filters_match_the_dashboard_cards(): void
    {
        $pharmacist = $this->user('pharmacist');

        $low = Medicine::create(['generic_name' => 'Almost Gone']);
        $low->inventories()->create([
            'quantity' => 3, 'unit_price' => 1, 'reorder_level' => 10,
            'expiry_date' => now()->addYear()->toDateString(),
        ]);
        $expiring = Medicine::create(['generic_name' => 'Going Stale']);
        $expiring->inventories()->create([
            'quantity' => 100, 'unit_price' => 1, 'reorder_level' => 10,
            'expiry_date' => now()->addDays(10)->toDateString(),
        ]);

        $this->actingAs($pharmacist)->get(route('inventory.index', ['filter' => 'low_stock']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filter', 'low_stock')
                ->where('inventories.total', 1)
                ->where('inventories.data.0.medicine.generic_name', 'Almost Gone'));

        $this->actingAs($pharmacist)->get(route('inventory.index', ['filter' => 'expiring_soon']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filter', 'expiring_soon')
                ->where('inventories.total', 1)
                ->where('inventories.data.0.medicine.generic_name', 'Going Stale'));
    }
}
