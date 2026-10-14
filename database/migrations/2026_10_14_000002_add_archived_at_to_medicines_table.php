<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            // Null = live. Timestamp = archived (hidden everywhere, auto-purged after 6 months).
            $table->timestamp('archived_at')->nullable()->after('description');
            $table->index('archived_at');
        });
    }

    public function down(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            $table->dropIndex(['archived_at']);
            $table->dropColumn('archived_at');
        });
    }
};
