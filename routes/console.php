<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// V2: auto-purge medicines archived for more than 6 months.
// On localhost this runs whenever the OS scheduler hits `php artisan schedule:run`
// (see LOCALHOST.md). On a server, the usual * * * * * cron covers it.
Schedule::command('medicines:purge-archive')->daily();
