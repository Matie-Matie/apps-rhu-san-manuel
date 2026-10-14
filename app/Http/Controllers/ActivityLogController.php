<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 10);
        $perPage = in_array($perPage, [10, 25, 50], true) ? $perPage : 10;

        $type = $request->get('type') === 'dispensed' ? 'dispensed' : 'all';

        $logs = ActivityLog::with([
            'user:id,name',
            'prescription.patient:id,first_name,last_name',
            'prescription.dispensingRecord.pharmacist:id,name',
            'prescription.dispensingRecord.dispensedItems.medicineInventory.medicine:id,generic_name,strength',
        ])
            ->when($type === 'dispensed', fn ($q) => $q->where('action', 'dispense_prescription'))
            ->latest()
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString()
            ->through(function (ActivityLog $log) {
                $record = $log->action === 'dispense_prescription'
                    ? $log->prescription?->dispensingRecord
                    : null;

                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'description' => $log->description,
                    'created_at' => $log->created_at,
                    'user' => $log->user ? ['name' => $log->user->name] : null,
                    'received' => $record ? [
                        'prescription_id' => $log->prescription->id,
                        'prescription_number' => $log->prescription->prescription_number,
                        'patient' => $log->prescription->patient?->full_name,
                        'dispensed_at' => $record->dispensed_at,
                        'pharmacist' => $record->pharmacist?->name,
                        'items' => $record->dispensedItems->map(fn ($item) => [
                            'medicine' => $item->medicineInventory?->medicine?->generic_name ?? 'Unknown',
                            'strength' => $item->medicineInventory?->medicine?->strength,
                            'quantity' => $item->quantity,
                        ])->values(),
                    ] : null,
                ];
            });

        return Inertia::render('ActivityLogs/Index', [
            'logs' => $logs,
            'type' => $type,
        ]);
    }
}
