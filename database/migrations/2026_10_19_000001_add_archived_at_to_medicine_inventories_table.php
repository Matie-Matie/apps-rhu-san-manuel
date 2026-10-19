<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medicine_inventories', function (Blueprint $table) {
            // Null = live stock. Timestamp = batch moved to the Inventory archive
            // (expired / near-expiry). Hidden from stock, alerts and dispensing.
            $table->timestamp('archived_at')->nullable();
            $table->index('archived_at');
        });
    }

    public function down(): void
    {
        Schema::table('medicine_inventories', function (Blueprint $table) {
            $table->dropIndex(['archived_at']);
            $table->dropColumn('archived_at');
        });
    }
};
