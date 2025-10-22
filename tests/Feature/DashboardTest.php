<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    // Visitors without an authenticated session should be forced to authenticate
    // before reaching the dashboard route.
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    // Once signed in, the dashboard should respond successfully.
    $this->actingAs($user = User::factory()->create());

    $this->get(route('dashboard'))->assertOk();
});