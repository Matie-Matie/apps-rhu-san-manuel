<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\DispensingRecord;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());

        $prescriptions = Prescription::whereBetween('created_at', [$startDate, $endDate . ' 23:59:59'])
            ->count();

        $dispensed = DispensingRecord::whereBetween('dispensed_at', [$startDate, $endDate . ' 23:59:59'])
            ->count();

        $topMedicines = Medicine::select('medicines.*')
            ->selectSub(function ($q) use ($startDate, $endDate) {
                $q->from('dispensed_items')
                    ->join('medicine_inventories', 'dispensed_items.medicine_inventory_id', '=', 'medicine_inventories.id')
                    ->join('dispensing_records', 'dispensed_items.dispensing_record_id', '=', 'dispensing_records.id')
                    ->whereColumn('medicine_inventories.medicine_id', 'medicines.id')
                    ->whereBetween('dispensing_records.dispensed_at', [$startDate, $endDate . ' 23:59:59'])
                    ->selectRaw('COALESCE(SUM(dispensed_items.quantity), 0)');
            }, 'dispensed_quantity')
            ->orderBy('dispensed_quantity', 'desc')
            ->take(5)
            ->get();

        $cutoff = now()->subDays(29)->startOfDay();

        // Group in PHP by Carbon date instead of SQL strftime('%Y-%m-%d', ...),
        // which is SQLite-only and would break on MySQL/MariaDB (InfinityFree).
        // Each query loads only the timestamp column for the 30-day window, then
        // groups in memory — no N+1, and day/total JSON shape is preserved.
        $dailyData = Prescription::where('created_at', '>=', $cutoff)
            ->get(['created_at'])
            ->groupBy(fn (Prescription $prescription) => $prescription->created_at->toDateString())
            ->map(fn ($records, $day) => ['day' => $day, 'total' => $records->count()])
            ->sortKeys()
            ->values();

        $dispensedDailyData = DispensingRecord::where('dispensed_at', '>=', $cutoff)
            ->get(['dispensed_at'])
            ->groupBy(fn (DispensingRecord $record) => $record->dispensed_at->toDateString())
            ->map(fn ($records, $day) => ['day' => $day, 'total' => $records->count()])
            ->sortKeys()
            ->values();

        return Inertia::render('Reports/Index', [
            'filters' => ['start_date' => $startDate, 'end_date' => $endDate],
            'stats' => [
                'total_prescriptions' => $prescriptions,
                'total_dispensed' => $dispensed,
            ],
            'topMedicines' => $topMedicines,
            'dailyData' => $dailyData,
            'dispensedDailyData' => $dispensedDailyData,
        ]);
    }
}
