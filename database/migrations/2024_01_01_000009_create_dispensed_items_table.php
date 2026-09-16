<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dispensed_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dispensing_record_id')->constrained()->cascadeOnDelete();
            $table->foreignId('medicine_inventory_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispensed_items');
    }
};
