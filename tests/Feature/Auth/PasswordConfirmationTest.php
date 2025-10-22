<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('confirm password screen can be rendered', function () {
    // Authenticated users should be able to access the password confirmation UI.
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('password.confirm'));

    $response->assertStatus(200);

    $response->assertInertia(fn (Assert $page) => $page
        ->component('auth/confirm-password')
    );
});

test('password confirmation requires authentication', function () {
    // Unauthenticated visitors should be redirected to login instead of seeing
    // the confirmation form.
    $response = $this->get(route('password.confirm'));

    $response->assertRedirect(route('login'));
});