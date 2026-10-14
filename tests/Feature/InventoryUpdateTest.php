<?php

namespace Tests\Feature;

use App\Models\Medicine;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryUpdateTest extends TestCase
{
    use RefreshDatabase;

    private function makeBatch()
    {
        $medicine = Medicine::create(['generic_name' => 'Paracetamol']);

        return $medicine->inventories()->create([
            'batch_number' => 'B-001',
            'expiry_date' => '2027-01-01',
            'quantity' => 50,
            'unit_price' => 2.5,
            'reorder_level' => 10,
        ]);
    }

    public function test_pharmacist_can_update_stock(): void
    {
        $pharmacist = User::factory()->create(['role' => 'pharmacist']);
        $batch = $this->makeBatch();

        $this->actingAs($pharmacist)
            ->put(route('inventory.update', $batch), [
                'batch_number' => 'B-001',
                'expiry_date' => '2027-01-01',
                'quantity' => 120,
                'unit_price' => 3,
                'reorder_level' => 15,
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('inventory.index'));

        $batch->refresh();
        $this->assertSame(120, (int) $batch->quantity);
        $this->assertSame(15, (int) $batch->reorder_level);
    }

    public function test_update_without_reorder_level_is_rejected(): void
    {
        $pharmacist = User::factory()->create(['role' => 'pharmacist']);
        $batch = $this->makeBatch();

        $this->actingAs($pharmacist)
            ->put(route('inventory.update', $batch), [
                'quantity' => 120,
                'unit_price' => 3,
            ])
            ->assertSessionHasErrors('reorder_level');

        $this->assertSame(50, (int) $batch->fresh()->quantity);
    }
}
