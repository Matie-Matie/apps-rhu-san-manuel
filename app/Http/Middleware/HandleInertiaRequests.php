<?php

namespace App\Http\Middleware;

use App\Models\MedicineInventory;
use App\Models\Patient;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'notifications' => fn () => $this->notificationsFor($request->user()),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }

    /**
     * Bell-icon alerts, per role. Only things someone has to act on or know
     * about; an empty list means "all caught up".
     *
     * @return array<int, array{id: string, tone: string, title: string, body: string, href: string}>
     */
    private function notificationsFor($user): array
    {
        if (! $user) {
            return [];
        }

        $items = [];

        if ($user->isPharmacist()) {
            $pending = Prescription::where('status', 'pending')->count();
            if ($pending > 0) {
                $items[] = [
                    'id' => 'pending-rx',
                    'tone' => 'info',
                    'title' => $pending === 1 ? '1 prescription to dispense' : "{$pending} prescriptions to dispense",
                    'body' => 'Waiting for the pharmacy.',
                    'href' => route('prescriptions.index', ['status' => 'pending']),
                ];
            }

            $active = fn ($q) => $q->active();

            $outOfStock = MedicineInventory::whereHas('medicine', $active)->where('quantity', '<=', 0)->count();
            if ($outOfStock > 0) {
                $items[] = [
                    'id' => 'out-of-stock',
                    'tone' => 'danger',
                    'title' => $outOfStock === 1 ? '1 batch is out of stock' : "{$outOfStock} batches are out of stock",
                    'body' => 'These cannot be dispensed.',
                    'href' => route('inventory.index', ['filter' => 'low_stock']),
                ];
            }

            $low = MedicineInventory::whereHas('medicine', $active)
                ->whereColumn('quantity', '<=', 'reorder_level')
                ->where('quantity', '>', 0)
                ->count();
            if ($low > 0) {
                $items[] = [
                    'id' => 'low-stock',
                    'tone' => 'warning',
                    'title' => $low === 1 ? '1 batch is running low' : "{$low} batches are running low",
                    'body' => 'At or below the reorder level.',
                    'href' => route('inventory.index', ['filter' => 'low_stock']),
                ];
            }

            $expiring = MedicineInventory::whereHas('medicine', $active)
                ->where('quantity', '>', 0)
                ->whereNotNull('expiry_date')
                ->where('expiry_date', '<=', now()->addDays(30))
                ->where('expiry_date', '>', now())
                ->count();
            if ($expiring > 0) {
                $items[] = [
                    'id' => 'expiring',
                    'tone' => 'warning',
                    'title' => $expiring === 1 ? '1 batch expires soon' : "{$expiring} batches expire soon",
                    'body' => 'Within the next 30 days.',
                    'href' => route('inventory.index', ['filter' => 'expiring_soon']),
                ];
            }
        }

        if ($user->isDoctor()) {
            // Patients the front desk just registered that no doctor has seen yet.
            Patient::whereHas('creator', fn ($q) => $q->where('role', 'staff'))
                ->whereDoesntHave('prescriptions')
                ->where('created_at', '>=', now()->subDays(3))
                ->with('creator:id,name')
                ->latest()
                ->take(5)
                ->get()
                ->each(function (Patient $patient) use (&$items) {
                    $items[] = [
                        'id' => 'new-patient-'.$patient->id,
                        'tone' => 'info',
                        'title' => 'New patient: '.$patient->first_name.' '.$patient->last_name,
                        'body' => 'Added by '.($patient->creator?->name ?? 'front desk').' · waiting for a doctor.',
                        'href' => route('patients.show', $patient->id),
                    ];
                });

            Prescription::where('doctor_id', $user->id)
                ->where('status', 'dispensed')
                ->where('updated_at', '>=', now()->subDays(3))
                ->with('patient:id,first_name,last_name')
                ->latest('updated_at')
                ->take(5)
                ->get()
                ->each(function (Prescription $rx) use (&$items) {
                    $items[] = [
                        'id' => 'dispensed-'.$rx->id,
                        'tone' => 'success',
                        'title' => "{$rx->prescription_number} was dispensed",
                        'body' => trim(($rx->patient?->first_name ?? '').' '.($rx->patient?->last_name ?? '')),
                        'href' => route('prescriptions.show', $rx->id),
                    ];
                });
        }

        return $items;
    }
}
