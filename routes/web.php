<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientVitalController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\MedicineInventoryController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\DispensingController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : Inertia::render('Welcome', ['appVersion' => config('app.version')]);
})->name('welcome');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Staff, doctors and pharmacists can all see patients; the controller
    // decides who may edit and who may see prescription history.
    // The admin account is for activity logs only, so it is kept out of here.
    Route::middleware('role:doctor,pharmacist,staff')->group(function () {
        Route::resource('patients', PatientController::class);
        Route::get('/patients/{patient}/history', [PatientController::class, 'history'])->name('patients.history');
        Route::post('/patients/{patient}/vitals', [PatientVitalController::class, 'store'])->name('patients.vitals.store');
    });

    // Activity logs belong to the separate admin account only.
    Route::get('/activity-logs', [ActivityLogController::class, 'index'])
        ->middleware('role:admin')
        ->name('activity-logs.index');

    // Clinical + pharmacy pages are closed to front-desk staff.
    Route::middleware('role:doctor,pharmacist')->group(function () {
        Route::post('/medicines/adjust-stock', [MedicineController::class, 'adjustStock'])->name('medicines.adjust-stock');
        Route::post('/medicines/{medicine}/archive', [MedicineController::class, 'archive'])->name('medicines.archive');
        Route::post('/medicines/{medicine}/restore', [MedicineController::class, 'restore'])->name('medicines.restore');
        Route::resource('medicines', MedicineController::class)->except(['show']);
        Route::get('/medicines/{medicine}/inventory', [MedicineController::class, 'inventory'])->name('medicines.inventory');
        Route::post('/medicines/{medicine}/add-stock', [MedicineController::class, 'addStock'])->name('medicines.add-stock');

        Route::get('/inventory', [MedicineInventoryController::class, 'index'])->name('inventory.index');
        Route::post('/inventory/archive-expiring', [MedicineInventoryController::class, 'archiveExpiring'])->name('inventory.archive-expiring');
        Route::post('/inventory/{inventory}/archive', [MedicineInventoryController::class, 'archive'])->name('inventory.archive');
        Route::post('/inventory/{inventoryId}/restore', [MedicineInventoryController::class, 'restore'])->name('inventory.restore');
        Route::get('/inventory/{inventory}/edit', [MedicineInventoryController::class, 'edit'])->name('inventory.edit');
        Route::put('/inventory/{inventory}', [MedicineInventoryController::class, 'update'])->name('inventory.update');

        Route::get('/prescriptions/{prescription}/print', [PrescriptionController::class, 'print'])->name('prescriptions.print');
        Route::resource('prescriptions', PrescriptionController::class)->except(['edit', 'update', 'destroy']);
        Route::patch('/prescriptions/{prescription}/status', [PrescriptionController::class, 'updateStatus'])->name('prescriptions.update-status');

        Route::get('/dispensing/{prescription}/create', [DispensingController::class, 'create'])->name('dispensing.create');
        Route::post('/dispensing/{prescription}', [DispensingController::class, 'store'])->name('dispensing.store');

        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/print', [ReportController::class, 'print'])->name('reports.print');
    });
});

require __DIR__ . '/auth.php';
