<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->unsignedBigInteger('prescription_id')->nullable()->index();
        });

        // Link existing prescription log rows by the RX number in their description.
        $numbers = DB::table('prescriptions')->pluck('id', 'prescription_number');
        DB::table('activity_logs')
            ->whereNull('prescription_id')
            ->where('description', 'like', '%RX-%')
            ->orderBy('id')
            ->each(function ($log) use ($numbers) {
                if (preg_match('/RX-\d{8}-\d+/', $log->description, $m) && isset($numbers[$m[0]])) {
                    DB::table('activity_logs')->where('id', $log->id)->update(['prescription_id' => $numbers[$m[0]]]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex(['prescription_id']);
            $table->dropColumn('prescription_id');
        });
    }
};
