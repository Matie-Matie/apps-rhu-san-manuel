<?php

namespace Tests\Feature;

use App\Models\Medicine;
use App\Models\MedicineInventory;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Kamille's third round: new-patient bell, Inventory archive, Medicine Inventory Report. */
class ClinicRound3Test extends TestCase
{
    use RefreshDatabase;

    private function user(string $role): User
    {
        return User::factory()->create(['role' => $role]);
    }

    private function batch(Medicine $m, int $qty, string $expiry, int $reorder = 5): MedicineInventory
    {
        return $m->inventories()->create(['quantity' => $qty, 'unit_price' => 2, 'reorder_level' => $reorder, 'expiry_date' => $expiry]);
    }

    private function patientData(): array
    {
        return [
            'first_name' => 'Maria', 'last_name' => 'Santos', 'date_of_birth' => '1991-02-03',
            'gender' => 'female', 'address' => 'Brgy. Agliam, San Manuel, Isabela',
        ];
    }

    // ---- Doctor bell: patients added by the front desk ---------------------

    public function test_doctor_bell_shows_a_patient_the_front_desk_just_added(): void
    {
        $staff = $this->user('staff');
        $this->actingAs($staff)->post(route('patients.store'), $this->patientData())->assertSessionHasNoErrors();

        $patient = Patient::firstOrFail();
        $this->assertSame($staff->id, $patient->created_by);

        $this->actingAs($this->user('doctor'))->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('notifications', 1)
                ->where('notifications.0.id', 'new-patient-'.$patient->id)
                ->where('notifications.0.title', 'New patient: Maria Santos'));
    }

    public function test_patients_a_doctor_registered_do_not_ring_the_doctor_bell(): void
    {
        $doctor = $this->user('doctor');
        $this->actingAs($doctor)->post(route('patients.store'), $this->patientData())->assertSessionHasNoErrors();

        $this->actingAs($doctor)->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page->has('notifications', 0));
    }

    public function test_old_front_desk_patients_leave_the_bell(): void
    {
        $this->actingAs($this->user('staff'))->post(route('patients.store'), $this->patientData());
        Patient::query()->update(['created_at' => now()->subDays(5)]);

        $this->actingAs($this->user('doctor'))->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page->has('notifications', 0));
    }

    // ---- Inventory archive --------------------------------------------------

    public function test_archiving_a_near_expiry_batch_removes_it_from_stock_alerts_and_dispensing_lists(): void
    {
        $m = Medicine::create(['generic_name' => 'Amoxicillin']);
        $near = $this->batch($m, 20, now()->addDays(10)->toDateString());
        $this->batch($m, 30, now()->addYear()->toDateString());
        $pharmacist = $this->user('pharmacist');

        $this->actingAs($pharmacist)->post(route('inventory.archive', $near->id))->assertSessionHas('success');

        $this->assertNotNull(MedicineInventory::withoutGlobalScope('notArchived')->find($near->id)->archived_at);
        $this->assertSame(30, (int) $m->fresh()->total_stock);

        $this->actingAs($pharmacist)->get(route('inventory.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('inventories.data', 1)
                ->has('expiring', 0)
                ->where('archivedCount', 1));
    }

    public function test_only_expired_or_near_expiry_batches_can_be_archived(): void
    {
        $m = Medicine::create(['generic_name' => 'Amoxicillin']);
        $fresh = $this->batch($m, 20, now()->addYear()->toDateString());

        $this->actingAs($this->user('pharmacist'))->post(route('inventory.archive', $fresh->id))->assertSessionHas('error');
        $this->assertNull($fresh->fresh()->archived_at);
    }

    public function test_archive_tab_lists_archived_batches_and_restore_brings_them_back(): void
    {
        $m = Medicine::create(['generic_name' => 'Amoxicillin']);
        $expired = $this->batch($m, 4, now()->subDays(3)->toDateString());
        $pharmacist = $this->user('pharmacist');

        $this->actingAs($pharmacist)->post(route('inventory.archive', $expired->id));

        $this->actingAs($pharmacist)->get(route('inventory.index', ['tab' => 'archived']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('tab', 'archived')
                ->has('archivedBatches.data', 1)
                ->where('archivedBatches.data.0.medicine.generic_name', 'Amoxicillin'));

        $this->actingAs($pharmacist)->post(route('inventory.restore', $expired->id))->assertSessionHas('success');
        $this->assertNull(MedicineInventory::find($expired->id)->archived_at);
    }

    public function test_archive_all_moves_every_expired_and_near_expiry_batch(): void
    {
        $m = Medicine::create(['generic_name' => 'Amoxicillin']);
        $this->batch($m, 4, now()->subDays(3)->toDateString());
        $this->batch($m, 4, now()->addDays(20)->toDateString());
        $keep = $this->batch($m, 4, now()->addYear()->toDateString());

        $this->actingAs($this->user('pharmacist'))->post(route('inventory.archive-expiring'))->assertSessionHas('success');

        $this->assertSame(1, MedicineInventory::count());
        $this->assertSame($keep->id, MedicineInventory::first()->id);
        $this->assertSame(2, MedicineInventory::withoutGlobalScope('notArchived')->whereNotNull('archived_at')->count());
    }

    public function test_doctors_and_staff_cannot_archive_batches(): void
    {
        $m = Medicine::create(['generic_name' => 'Amoxicillin']);
        $b = $this->batch($m, 4, now()->addDays(5)->toDateString());

        $this->actingAs($this->user('doctor'))->post(route('inventory.archive', $b->id))->assertForbidden();
        $this->actingAs($this->user('staff'))->post(route('inventory.archive', $b->id))->assertForbidden();
        $this->assertNull($b->fresh()->archived_at);
    }

    public function test_catalog_no_longer_has_the_archive_and_old_links_land_in_inventory(): void
    {
        Medicine::create(['generic_name' => 'Amoxicillin']);
        $pharmacist = $this->user('pharmacist');

        $this->actingAs($pharmacist)->get(route('medicines.index'))
            ->assertInertia(fn (Assert $page) => $page->component('Medicines/Index')->missing('archivedCount')->missing('showingArchived'));

        $this->actingAs($pharmacist)->get(route('medicines.index', ['archived' => 1]))
            ->assertRedirect(route('inventory.index', ['tab' => 'archived']));
    }

    public function test_purge_removes_old_archived_batches_but_keeps_recent_ones(): void
    {
        $m = Medicine::create(['generic_name' => 'Amoxicillin']);
        $old = $this->batch($m, 4, now()->subYear()->toDateString());
        $recent = $this->batch($m, 4, now()->subMonth()->toDateString());
        $old->forceFill(['archived_at' => now()->subMonths(7)])->save();
        $recent->forceFill(['archived_at' => now()->subMonth()])->save();

        $this->artisan('medicines:purge-archive')->assertSuccessful();

        $this->assertNull(MedicineInventory::withoutGlobalScope('notArchived')->find($old->id));
        $this->assertNotNull(MedicineInventory::withoutGlobalScope('notArchived')->find($recent->id));
    }

    // ---- Medicine Inventory Report -----------------------------------------

    public function test_pharmacist_gets_the_medicine_inventory_report_and_doctor_keeps_the_clinical_one(): void
    {
        $m = Medicine::create(['generic_name' => 'Amoxicillin']);
        $this->batch($m, 3, now()->addYear()->toDateString(), 5);          // low
        $this->batch($m, 10, now()->addDays(9)->toDateString());           // expiring
        $gone = Medicine::create(['generic_name' => 'Paracetamol']);
        $this->batch($gone, 0, now()->addYear()->toDateString());         // out

        $this->actingAs($this->user('pharmacist'))->get(route('reports.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Reports/Inventory')
                ->where('report.summary.medicines', 2)
                ->where('report.summary.units', 13)
                ->where('report.summary.low', 1)
                ->where('report.summary.expiring', 1)
                ->where('report.summary.out', 1)  // medicines with nothing on hand
                ->where('report.rows.0.generic_name', 'Amoxicillin')
                ->where('report.rows.0.status', 'low')
                ->where('report.rows.1.status', 'out'));

        $this->actingAs($this->user('doctor'))->get(route('reports.index'))
            ->assertInertia(fn (Assert $page) => $page->component('Reports/Index'));
    }

    public function test_inventory_report_ignores_archived_batches_and_prints(): void
    {
        $m = Medicine::create(['generic_name' => 'Amoxicillin']);
        $b = $this->batch($m, 7, now()->subDays(2)->toDateString());
        $pharmacist = $this->user('pharmacist');
        $this->actingAs($pharmacist)->post(route('inventory.archive', $b->id));

        $this->actingAs($pharmacist)->get(route('reports.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('report.summary.units', 0)
                ->where('report.summary.expired', 0)
                ->where('report.summary.archived_batches', 1));

        $this->actingAs($pharmacist)->get(route('reports.print'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Reports/InventoryPrint')->has('generatedBy'));
    }
}
