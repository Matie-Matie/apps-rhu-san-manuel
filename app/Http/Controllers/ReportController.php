<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\DispensingRecord;
use App\Models\Medicine;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    private const PERIODS = ['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'custom'];

    public function index(Request $request)
    {
        [$period, $start, $end, $anchor] = $this->resolveRange($request);

        // Group in PHP by Carbon date instead of SQL strftime('%Y-%m-%d', ...),
        // which is SQLite-only and would break on MySQL/MariaDB (InfinityFree).
        // Each query loads only the timestamp column for the 30-day window, then
        // groups in memory — no N+1, and day/total JSON shape is preserved.
        $cutoff = now()->subDays(29)->startOfDay();

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
            'period' => $period,
            'range' => $this->describeRange($period, $start, $end, $anchor),
            'report' => $this->buildReport($start, $end),
            'dailyData' => $dailyData,
            'dispensedDailyData' => $dispensedDailyData,
        ]);
    }

    public function print(Request $request)
    {
        [$period, $start, $end, $anchor] = $this->resolveRange($request);

        return Inertia::render('Reports/Print', [
            'period' => $period,
            'range' => $this->describeRange($period, $start, $end, $anchor),
            'report' => $this->buildReport($start, $end),
            'generatedBy' => $request->user()->name,
            'generatedAt' => now()->toIso8601String(),
        ]);
    }

    private function resolveRange(Request $request): array
    {
        $request->validate([
            'period' => 'nullable|in:' . implode(',', self::PERIODS),
            'date' => 'nullable|date',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $period = $request->input('period');
        if (! $period) {
            $period = $request->filled('start_date') || $request->filled('end_date') ? 'custom' : 'monthly';
        }

        $anchor = ($request->filled('date') ? Carbon::parse($request->input('date')) : now())->startOfDay();

        if ($period === 'custom') {
            $start = Carbon::parse($request->input('start_date', now()->startOfMonth()->toDateString()))->startOfDay();
            $end = Carbon::parse($request->input('end_date', now()->toDateString()))->endOfDay();
            if ($start->gt($end)) {
                [$start, $end] = [$end->copy()->startOfDay(), $start->copy()->endOfDay()];
            }

            return [$period, $start, $end, $anchor];
        }

        [$start, $end] = match ($period) {
            'daily' => [$anchor->copy()->startOfDay(), $anchor->copy()->endOfDay()],
            'weekly' => [$anchor->copy()->startOfWeek(Carbon::MONDAY), $anchor->copy()->endOfWeek(Carbon::SUNDAY)],
            'quarterly' => [$anchor->copy()->startOfQuarter(), $anchor->copy()->endOfQuarter()],
            'annual' => [$anchor->copy()->startOfYear(), $anchor->copy()->endOfYear()],
            default => [$anchor->copy()->startOfMonth(), $anchor->copy()->endOfMonth()],
        };

        return [$period, $start, $end, $anchor];
    }

    private function describeRange(string $period, Carbon $start, Carbon $end, Carbon $anchor): array
    {
        $label = match ($period) {
            'daily' => $start->format('F j, Y'),
            'monthly' => $start->format('F Y'),
            'quarterly' => 'Q' . $start->quarter . ' ' . $start->year . ' (' . $start->format('M') . ' – ' . $end->format('M') . ')',
            'annual' => (string) $start->year,
            default => $start->isSameYear($end)
                ? $start->format('M j') . ' – ' . $end->format('M j, Y')
                : $start->format('M j, Y') . ' – ' . $end->format('M j, Y'),
        };

        $shift = fn (int $dir) => match ($period) {
            'daily' => $anchor->copy()->addDays($dir),
            'weekly' => $anchor->copy()->addWeeks($dir),
            'quarterly' => $anchor->copy()->addMonthsNoOverflow(3 * $dir),
            'annual' => $anchor->copy()->addYearsNoOverflow($dir),
            default => $anchor->copy()->addMonthsNoOverflow($dir),
        };
        $isCustom = $period === 'custom';

        return [
            'label' => $label,
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
            'anchor' => $anchor->toDateString(),
            'prev' => $isCustom ? null : $shift(-1)->toDateString(),
            'next' => $isCustom || $end->gte(now()->endOfDay()) ? null : $shift(1)->toDateString(),
        ];
    }

    private function buildReport(Carbon $start, Carbon $end): array
    {
        $prescriptions = Prescription::whereBetween('created_at', [$start, $end]);

        $byStatus = (clone $prescriptions)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $topMedicines = Medicine::active()->select('medicines.*')
            ->selectSub(function ($q) use ($start, $end) {
                $q->from('dispensed_items')
                    ->join('medicine_inventories', 'dispensed_items.medicine_inventory_id', '=', 'medicine_inventories.id')
                    ->join('dispensing_records', 'dispensed_items.dispensing_record_id', '=', 'dispensing_records.id')
                    ->whereColumn('medicine_inventories.medicine_id', 'medicines.id')
                    ->whereBetween('dispensing_records.dispensed_at', [$start, $end])
                    ->selectRaw('COALESCE(SUM(dispensed_items.quantity), 0)');
            }, 'dispensed_quantity')
            ->orderBy('dispensed_quantity', 'desc')
            ->take(5)
            ->get(['medicines.id', 'medicines.generic_name'])
            ->filter(fn ($m) => (int) $m->dispensed_quantity > 0)
            ->values();

        // Diagnosis is free text: normalise case/whitespace so "Hypertension"
        // and "hypertension " count as one, and show the most-used spelling.
        $diagnoses = (clone $prescriptions)
            ->whereNotNull('diagnosis')
            ->pluck('diagnosis')
            ->map(fn ($d) => trim(preg_replace('/\s+/', ' ', $d)))
            ->filter();

        $diagnosed = $diagnoses->count();
        $topDiagnoses = $diagnoses
            ->groupBy(fn ($d) => mb_strtolower($d))
            ->map(fn ($group) => [
                'diagnosis' => $group->countBy()->sortDesc()->keys()->first(),
                'count' => $group->count(),
                'percent' => $diagnosed > 0 ? round($group->count() / $diagnosed * 100, 1) : 0,
            ])
            ->sortByDesc('count')
            ->take(10)
            ->values();

        return [
            'total_prescriptions' => (clone $prescriptions)->count(),
            'total_dispensed' => DispensingRecord::whereBetween('dispensed_at', [$start, $end])->count(),
            'unique_patients' => (clone $prescriptions)->distinct()->count('patient_id'),
            'by_status' => [
                'pending' => (int) ($byStatus['pending'] ?? 0),
                'validated' => (int) ($byStatus['validated'] ?? 0),
                'dispensed' => (int) ($byStatus['dispensed'] ?? 0),
                'cancelled' => (int) ($byStatus['cancelled'] ?? 0),
            ],
            'top_diagnoses' => $topDiagnoses,
            'diagnosed_total' => $diagnosed,
            'top_medicines' => $topMedicines,
        ];
    }
}
