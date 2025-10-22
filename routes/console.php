<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

// Register a sample artisan command used primarily for demonstration/testing.
Artisan::command('inspire', function () {
    // Output a random quote to the CLI, showcasing how to define simple commands.
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
