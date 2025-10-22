<?php

it('returns a successful response', function () {
    // Basic smoke test to confirm the marketing home route is reachable.
    $response = $this->get('/');

    $response->assertStatus(200);
});
