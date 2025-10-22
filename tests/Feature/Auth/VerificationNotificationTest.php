<?php

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;

test('sends verification notification', function () {
    // Faking notifications lets us assert emails were queued without hitting
    // external services.
    Notification::fake();

    $user = User::factory()->create([
        'email_verified_at' => null,
    ]);

    // Unverified users should be redirected home and receive a new email.
    $this->actingAs($user)
        ->post(route('verification.send'))
        ->assertRedirect(route('home'));

    Notification::assertSentTo($user, VerifyEmail::class);
});

test('does not send verification notification if email is verified', function () {
    Notification::fake();

    $user = User::factory()->create([
        'email_verified_at' => now(),
    ]);

    // Already verified accounts should skip sending another email and be
    // redirected to the dashboard instead.
    $this->actingAs($user)
        ->post(route('verification.send'))
        ->assertRedirect(route('dashboard', absolute: false));

    Notification::assertNothingSent();
});