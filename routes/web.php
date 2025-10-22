<?php

use App\Http\Controllers\TicketCommentController;
use App\Http\Controllers\TicketController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    // Landing page exposes registration availability so the hero CTA can adjust
    // based on whether self-service signups are enabled.
    return Inertia::render('home', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/welcome', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('welcome');

Route::middleware(['auth', 'verified'])->group(function () {
    // Authenticated users gain access to the internal dashboard and support tooling.
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('products', function () {
        // Simple static page rendered via Inertia, demonstrating nested nav sections.
        return Inertia::render('products');
    })->name('products');

    // Ticketing routes rely on controllers to provide rich Inertia props.
    Route::get('tickets', [TicketController::class, 'index'])->name('tickets');
    Route::post('tickets', [TicketController::class, 'store'])->name('tickets.store');
    Route::patch('tickets/{ticket}', [TicketController::class, 'update'])->name('tickets.update');
    Route::post('tickets/{ticket}/comments', [TicketCommentController::class, 'store'])->name('tickets.comments.store');
});

require __DIR__.'/settings.php';
