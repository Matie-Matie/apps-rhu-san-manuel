<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Medicine;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ClinicRevisionsTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $role): User
    {
        return User::factory()->create(['role' => $role]);
    }

    private function patientData(array $overrides = []): array
    {
        return array_merge([
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'date_of_birth' => '1990-05-01',
            'gender' => 'male',
            'address' => 'Brgy. Agliam, San Manuel, Isabela',
        ], $overrides);
    }

    private function prescription(User $doctor, Patient $patient, ?string $diagnosis, string $status = 'pending'): Prescription
    {
        return Prescription::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'prescription_number' => Prescription::generatePrescriptionNumber(),
            'diagnosis' => $diagnosis,
            'status' => $status,
        ]);
    }

    // ---- Birthday validation -------------------------------------------------

    public function test_future_birthday_is_rejected(): void
    {
        $this->actingAs($this->user('doctor'))
            ->post(route('patients.store'), $this->patientData(['date_of_birth' => now()->addDay()->toDateString()]))
            ->assertSessionHasErrors('date_of_birth');

        $this->assertSame(0, Patient::count());
    }

    public function test_birthday_today_and_past_are_accepted_and_ancient_dates_rejected(): void
    {
        $doctor = $this->user('doctor');

        $this->actingAs($doctor)
            ->post(route('patients.store'), $this->patientData(['date_of_birth' => now()->toDateString()]))
            ->assertSessionHasNoErrors();

        $this->actingAs($doctor)
            ->post(route('patients.store'), $this->patientData(['first_name' => 'Old', 'date_of_birth' => '1850-01-01']))
            ->assertSessionHasErrors('date_of_birth');

        $this->assertSame(1, Patient::count());
    }

    public function test_update_also_rejects_future_birthday(): void
    {
        $patient = Patient::create($this->patientData());

        $this->actingAs($this->user('doctor'))
            ->put(route('patients.update', $patient), $this->patientData(['date_of_birth' => now()->addYear()->toDateString()]))
            ->assertSessionHasErrors('date_of_birth');
    }

    // ---- Staff role / vitals -------------------------------------------------

    public function test_staff_can_register_patients_and_record_vitals(): void
    {
        $staff = $this->user('staff');

        $this->actingAs($staff)->post(route('patients.store'), $this->patientData())->assertSessionHasNoErrors();
        $patient = Patient::first();

        $this->actingAs($staff)->post(route('patients.vitals.store', $patient), [
            'bp_systolic' => 120, 'bp_diastolic' => 80, 'height_cm' => 165.5, 'weight_kg' => 62, 'pulse_rate' => 72,
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('patient_vitals', [
            'patient_id' => $patient->id, 'recorded_by' => $staff->id, 'bp_systolic' => 120, 'bp_diastolic' => 80,
        ]);
    }

    public function test_patient_and_vitals_save_together_in_one_form(): void
    {
        $staff = $this->user('staff');

        $this->actingAs($staff)->post(route('patients.store'), [
            'first_name' => 'Ana', 'last_name' => 'Cruz',
            'bp_systolic' => 120, 'bp_diastolic' => 80,
            'weight_kg' => 60, 'height_cm' => 165,
        ])->assertRedirect(route('patients.index'));

        $patient = \App\Models\Patient::where('last_name', 'Cruz')->firstOrFail();
        $this->assertSame(1, $patient->vitals()->count());
        $this->assertSame($staff->id, $patient->vitals()->first()->recorded_by);

        // Vitals are optional; blank fields create no vitals row.
        $this->actingAs($staff)->post(route('patients.store'), [
            'first_name' => 'Ben', 'last_name' => 'Diaz', 'weight_kg' => '',
        ])->assertRedirect(route('patients.index'));
        $this->assertSame(0, \App\Models\Patient::where('last_name', 'Diaz')->first()->vitals()->count());

        // Invalid vitals reject the whole form, so no half-saved patient.
        $this->actingAs($staff)->post(route('patients.store'), [
            'first_name' => 'Cy', 'last_name' => 'Eve', 'bp_systolic' => 80, 'bp_diastolic' => 120,
        ])->assertSessionHasErrors('bp_diastolic');
        $this->assertDatabaseMissing('patients', ['last_name' => 'Eve']);
    }

    public function test_vitals_validation(): void
    {
        $patient = Patient::create($this->patientData());
        $staff = $this->user('staff');

        $this->actingAs($staff)->post(route('patients.vitals.store', $patient), [])->assertSessionHasErrors('bp_systolic');
        $this->actingAs($staff)->post(route('patients.vitals.store', $patient), ['bp_systolic' => 80, 'bp_diastolic' => 120])
            ->assertSessionHasErrors('bp_diastolic');
        $this->actingAs($staff)->post(route('patients.vitals.store', $patient), ['weight_kg' => 9999])
            ->assertSessionHasErrors('weight_kg');
        $this->assertSame(0, $patient->vitals()->count());
    }

    public function test_pharmacist_cannot_record_vitals(): void
    {
        $patient = Patient::create($this->patientData());

        $this->actingAs($this->user('pharmacist'))
            ->post(route('patients.vitals.store', $patient), ['weight_kg' => 60])
            ->assertForbidden();
    }

    public function test_staff_is_locked_out_of_clinical_and_pharmacy_pages(): void
    {
        $staff = $this->user('staff');

        foreach (['prescriptions.index', 'prescriptions.create', 'reports.index', 'medicines.index', 'inventory.index', 'activity-logs.index'] as $name) {
            $this->actingAs($staff)->get(route($name))->assertForbidden();
        }

        $this->actingAs($staff)->get(route('dashboard'))->assertRedirect(route('patients.index'));
    }

    public function test_staff_cannot_delete_patients_and_do_not_get_prescription_history(): void
    {
        $doctor = $this->user('doctor');
        $patient = Patient::create($this->patientData());
        $this->prescription($doctor, $patient, 'Fever');
        $staff = $this->user('staff');

        $this->actingAs($staff)->delete(route('patients.destroy', $patient))->assertForbidden();
        $this->actingAs($staff)->getJson(route('patients.history', $patient))->assertForbidden();

        $this->actingAs($staff)->get(route('patients.show', $patient))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('prescriptions', null));
    }

    // ---- Patient history -----------------------------------------------------

    public function test_doctor_sees_patient_prescription_history(): void
    {
        $doctor = $this->user('doctor');
        $patient = Patient::create($this->patientData());
        $medicine = Medicine::create(['generic_name' => 'Paracetamol', 'strength' => '500mg']);
        $rx = $this->prescription($doctor, $patient, 'Fever');
        $rx->items()->create(['medicine_id' => $medicine->id, 'dosage' => '1 tablet', 'frequency' => 'Twice a day (BID)', 'duration' => '3 days', 'quantity' => 6]);

        $this->actingAs($doctor)->getJson(route('patients.history', $patient))
            ->assertOk()
            ->assertJsonPath('prescriptions.0.diagnosis', 'Fever')
            ->assertJsonPath('prescriptions.0.items.0.medicine', 'Paracetamol')
            ->assertJsonPath('prescriptions_total', 1);

        $this->actingAs($doctor)->get(route('patients.show', $patient))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Patients/Show')->has('prescriptions', 1));
    }

    // ---- Select-only prescription fields -------------------------------------

    private function rxPayload(Patient $patient, Medicine $medicine, array $item = []): array
    {
        return [
            'patient_id' => $patient->id,
            'diagnosis' => 'Hypertension',
            'items' => [array_merge([
                'medicine_id' => $medicine->id,
                'dosage' => '1 tablet',
                'frequency' => 'Once a day (OD)',
                'duration' => '30 days',
                'quantity' => 30,
                'unit' => 'piece',
            ], $item)],
        ];
    }

    public function test_prescription_accepts_listed_options_and_redirects_to_print(): void
    {
        $doctor = $this->user('doctor');
        $patient = Patient::create($this->patientData());
        $medicine = Medicine::create(['generic_name' => 'Amlodipine']);

        $this->actingAs($doctor)->post(route('prescriptions.store'), $this->rxPayload($patient, $medicine))
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('prescriptions.print', Prescription::first()));
    }

    public function test_prescription_rejects_free_typed_values(): void
    {
        $doctor = $this->user('doctor');
        $patient = Patient::create($this->patientData());
        $medicine = Medicine::create(['generic_name' => 'Amlodipine']);

        foreach ([['frequency' => 'whenever'], ['duration' => 'a while'], ['quantity' => 9999], ['dosage' => 'lots'], ['unit' => 'sack']] as $bad) {
            $this->actingAs($doctor)->post(route('prescriptions.store'), $this->rxPayload($patient, $medicine, $bad))
                ->assertSessionHasErrors('items.0.' . array_key_first($bad));
        }
        $this->assertSame(0, Prescription::count());
    }

    public function test_quantity_options_cover_typical_totals(): void
    {
        $doctor = $this->user('doctor');
        $patient = Patient::create($this->patientData());
        $medicine = Medicine::create(['generic_name' => 'Amoxicillin']);

        // TID x 14 days = 42, QID x 14 days = 56
        foreach ([42, 56] as $qty) {
            $this->actingAs($doctor)->post(route('prescriptions.store'), $this->rxPayload($patient, $medicine, ['quantity' => $qty]))
                ->assertSessionHasNoErrors();
        }
    }

    public function test_printable_prescription_renders_for_doctor(): void
    {
        $doctor = $this->user('doctor');
        $patient = Patient::create($this->patientData());
        $rx = $this->prescription($doctor, $patient, 'Fever');

        $this->actingAs($doctor)->get(route('prescriptions.print', $rx))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Prescriptions/Print')->where('prescription.prescription_number', $rx->prescription_number));
    }

    // ---- Reports -------------------------------------------------------------

    public function test_report_groups_diagnoses_case_insensitively_and_ranks_them(): void
    {
        $doctor = $this->user('doctor');
        $patient = Patient::create($this->patientData());
        foreach (['Hypertension', 'hypertension ', 'HYPERTENSION', 'Fever', null] as $dx) {
            $this->prescription($doctor, $patient, $dx);
        }

        $this->actingAs($doctor)->get(route('reports.index', ['period' => 'daily']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Reports/Index')
                ->where('report.total_prescriptions', 5)
                ->where('report.diagnosed_total', 4)
                ->where('report.top_diagnoses.0.count', 3)
                ->where('report.top_diagnoses.1.diagnosis', 'Fever'));
    }

    public function test_report_periods_cover_the_expected_ranges(): void
    {
        $user = $this->user('pharmacist');
        $expect = [
            'daily' => ['2026-05-14', '2026-05-14'],
            'weekly' => ['2026-05-11', '2026-05-17'],
            'monthly' => ['2026-05-01', '2026-05-31'],
            'quarterly' => ['2026-04-01', '2026-06-30'],
            'annual' => ['2026-01-01', '2026-12-31'],
        ];

        foreach ($expect as $period => [$start, $end]) {
            $this->actingAs($user)->get(route('reports.index', ['period' => $period, 'date' => '2026-05-14']))
                ->assertInertia(fn (Assert $page) => $page
                    ->where('range.start_date', $start)
                    ->where('range.end_date', $end));
        }
    }

    public function test_report_excludes_prescriptions_outside_the_period_and_prints(): void
    {
        $doctor = $this->user('doctor');
        $patient = Patient::create($this->patientData());
        $old = $this->prescription($doctor, $patient, 'Old case');
        $old->forceFill(['created_at' => '2025-01-10 09:00:00'])->save();
        $this->prescription($doctor, $patient, 'New case');

        $this->actingAs($doctor)->get(route('reports.print', ['period' => 'daily']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Reports/Print')
                ->where('report.total_prescriptions', 1)
                ->where('report.top_diagnoses.0.diagnosis', 'New case'));
    }

    // ---- Stock +/- ------------------------------------------------------------

    private function medicineWithBatches(): Medicine
    {
        $m = Medicine::create(['generic_name' => 'Amoxicillin']);
        $m->inventories()->create(['batch_number' => 'OLD', 'expiry_date' => now()->addMonths(2)->toDateString(), 'quantity' => 10, 'unit_price' => 5, 'reorder_level' => 5]);
        $m->inventories()->create(['batch_number' => 'NEW', 'expiry_date' => now()->addYear()->toDateString(), 'quantity' => 20, 'unit_price' => 6, 'reorder_level' => 5]);

        return $m;
    }

    public function test_stock_add_goes_to_newest_unexpired_batch(): void
    {
        $m = $this->medicineWithBatches();

        $this->actingAs($this->user('pharmacist'))
            ->post(route('medicines.adjust-stock'), ['adjustments' => [['medicine_id' => $m->id, 'delta' => 5]]])
            ->assertSessionHasNoErrors();

        $this->assertSame(35, (int) $m->inventories()->sum('quantity'));
        $this->assertSame(25, (int) $m->inventories()->where('batch_number', 'NEW')->value('quantity'));
        $this->assertDatabaseHas('activity_logs', ['action' => 'adjust_stock']);
    }

    public function test_stock_removal_takes_from_earliest_expiring_batch_first(): void
    {
        $m = $this->medicineWithBatches();

        $this->actingAs($this->user('pharmacist'))
            ->post(route('medicines.adjust-stock'), ['adjustments' => [['medicine_id' => $m->id, 'delta' => -15]]])
            ->assertSessionHasNoErrors();

        $this->assertSame(0, (int) $m->inventories()->where('batch_number', 'OLD')->value('quantity'));
        $this->assertSame(15, (int) $m->inventories()->where('batch_number', 'NEW')->value('quantity'));
    }

    public function test_over_removal_rolls_back_every_adjustment(): void
    {
        $a = $this->medicineWithBatches();
        $b = Medicine::create(['generic_name' => 'Cetirizine']);
        $b->inventories()->create(['quantity' => 3, 'unit_price' => 1, 'reorder_level' => 5]);

        $this->actingAs($this->user('pharmacist'))
            ->post(route('medicines.adjust-stock'), ['adjustments' => [
                ['medicine_id' => $a->id, 'delta' => 10],
                ['medicine_id' => $b->id, 'delta' => -4],
            ]])
            ->assertSessionHas('error');

        $this->assertSame(30, (int) $a->inventories()->sum('quantity'));
        $this->assertSame(3, (int) $b->inventories()->sum('quantity'));
        $this->assertSame(0, ActivityLog::where('action', 'adjust_stock')->count());
    }

    public function test_adding_stock_with_no_batches_creates_one_and_doctor_is_forbidden(): void
    {
        $m = Medicine::create(['generic_name' => 'Losartan']);

        $this->actingAs($this->user('doctor'))
            ->post(route('medicines.adjust-stock'), ['adjustments' => [['medicine_id' => $m->id, 'delta' => 5]]])
            ->assertForbidden();

        $this->actingAs($this->user('pharmacist'))
            ->post(route('medicines.adjust-stock'), ['adjustments' => [['medicine_id' => $m->id, 'delta' => 5]]])
            ->assertSessionHasNoErrors();

        $this->assertSame(5, (int) $m->inventories()->sum('quantity'));
    }

    // ---- Activity feed: patient received medicine ------------------------------

    public function test_dispensing_shows_up_in_feed_with_what_the_patient_received(): void
    {
        $doctor = $this->user('doctor');
        $pharmacist = $this->user('pharmacist');
        $patient = Patient::create($this->patientData());
        $m = Medicine::create(['generic_name' => 'Paracetamol', 'strength' => '500mg']);
        $batch = $m->inventories()->create(['quantity' => 50, 'unit_price' => 2, 'reorder_level' => 5]);
        $rx = $this->prescription($doctor, $patient, 'Fever', 'validated');
        $rx->items()->create(['medicine_id' => $m->id, 'dosage' => '1 tablet', 'frequency' => 'Twice a day (BID)', 'duration' => '3 days', 'quantity' => 6]);
        $this->prescription($doctor, $patient, 'Cough'); // unrelated log noise

        $this->actingAs($pharmacist)->post(route('dispensing.store', $rx), [
            'items' => [['medicine_inventory_id' => $batch->id, 'quantity' => 6]],
        ])->assertSessionHasNoErrors();

        $this->actingAs($pharmacist)->get(route('activity-logs.index', ['type' => 'dispensed']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('logs.total', 1)
                ->where('logs.data.0.received.patient', 'Juan Dela Cruz')
                ->where('logs.data.0.received.items.0.medicine', 'Paracetamol')
                ->where('logs.data.0.received.items.0.quantity', 6));
    }
}
