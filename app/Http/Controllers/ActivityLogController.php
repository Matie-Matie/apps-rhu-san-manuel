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

        $logs = ActivityLog::with('user')
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('ActivityLogs/Index', [
            'logs' => $logs,
        ]);
    }
}
