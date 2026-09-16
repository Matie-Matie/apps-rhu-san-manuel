<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PatientController;
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
        : Inertia::render('Welcome');
})->name('welcome');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // PatientController has no show() method and there is no frontend show page.
    Route::resource('patients', PatientController::class)->except(['show']);

    Route::resource('medicines', MedicineController::class)->except(['show']);
    Route::get('/medicines/{medicine}/inventory', [MedicineController::class, 'inventory'])->name('medicines.inventory');
    Route::post('/medicines/{medicine}/add-stock', [MedicineController::class, 'addStock'])->name('medicines.add-stock');

    Route::get('/inventory', [MedicineInventoryController::class, 'index'])->name('inventory.index');
    Route::get('/inventory/{inventory}/edit', [MedicineInventoryController::class, 'edit'])->name('inventory.edit');
    Route::put('/inventory/{inventory}', [MedicineInventoryController::class, 'update'])->name('inventory.update');

    Route::resource('prescriptions', PrescriptionController::class)->except(['edit', 'update', 'destroy']);
    Route::patch('/prescriptions/{prescription}/status', [PrescriptionController::class, 'updateStatus'])->name('prescriptions.update-status');

    Route::get('/dispensing/{prescription}/create', [DispensingController::class, 'create'])->name('dispensing.create');
    Route::post('/dispensing/{prescription}', [DispensingController::class, 'store'])->name('dispensing.store');

    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');

    Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
});

require __DIR__ . '/auth.php';
