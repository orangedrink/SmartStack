<?php

test('registration screen can be rendered', function () {
    // Guests should be able to load the registration form.
    $response = $this->get(route('register'));

    $response->assertStatus(200);
});

test('new users can register', function () {
    // Posting valid registration data should create the user, log them in, and
    // redirect toward the dashboard onboarding experience.
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});