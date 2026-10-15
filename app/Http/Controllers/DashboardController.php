<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Medicine;
use App\Models\Prescription;
use App\Models\DispensingRecord;
use App\Models\MedicineInventory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Front-desk staff work out of the patients list (registration + vitals).
        if ($user->isStaff()) {
            return redirect()->route('patients.index');
        }

        // The admin account only reviews activity logs.
        if ($user->isAdmin()) {
            return redirect()->route('activity-logs.index');
        }

        if ($user->isPharmacist()) {
            return $this->pharmacistDashboard();
        }

        return $this->doctorDashboard($user);
    }

    private function doctorDashboard($user)
    {
        $myPrescriptions = Prescription::where('doctor_id', $user->id)
            ->with(['patient', 'items.medicine'])
            ->latest()
            ->take(10)
            ->get();

        $stats = [
            'total_patients' => Patient::count(),
            'my_prescriptions_total' => Prescription::where('doctor_id', $user->id)->count(),
            'my_pending' => Prescription::where('doctor_id', $user->id)->where('status', 'pending')->count(),
            'my_dispensed' => Prescription::where('doctor_id', $user->id)->where('status', 'dispensed')->count(),
            'my_recent' => $myPrescriptions,
        ];

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'role' => 'doctor',
        ]);
    }

    private function pharmacistDashboard()
    {
        $pendingPrescriptions = Prescription::where('status', 'pending')
            ->with(['patient', 'doctor'])
            ->latest()
            ->take(10)
            ->get();

        $lowStockItems = MedicineInventory::whereHas('medicine', fn ($q) => $q->active())
            ->whereColumn('quantity', '<=', 'reorder_level')
            ->where('quantity', '>', 0)
            ->with('medicine')
            ->take(10)
            ->get();

        $expiringItems = MedicineInventory::whereHas('medicine', fn ($q) => $q->active())
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<=', now()->addDays(30))
            ->where('expiry_date', '>', now())
            ->with('medicine')
            ->take(10)
            ->get();

        $outOfStock = MedicineInventory::whereHas('medicine', fn ($q) => $q->active())
            ->where('quantity', '<=', 0)
            ->with('medicine')
            ->take(10)
            ->get();

        $stats = [
            'pending_prescriptions' => Prescription::where('status', 'pending')->count(),
            'dispensed_today' => DispensingRecord::whereDate('dispensed_at', today())->count(),
            'low_stock_count' => $lowStockItems->count(),
            'expiring_count' => $expiringItems->count(),
            'out_of_stock_count' => $outOfStock->count(),
            'pending_list' => $pendingPrescriptions,
            'low_stock_list' => $lowStockItems,
            'expiring_list' => $expiringItems,
            'out_of_stock_list' => $outOfStock,
        ];

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'role' => 'pharmacist',
        ]);
    }
}
