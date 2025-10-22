<?php

use App\Models\Ticket;
use App\Models\TicketActivity;
use App\Models\TicketComment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('ticket index renders the queue overview', function () {
    // Create a signed-in agent and a handful of tickets to populate the queue.
    $user = User::factory()->create();
    Ticket::factory()->count(3)->create();

    // Visit the ticket index while impersonating the agent.
    $response = $this->actingAs($user)->get(route('tickets'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('tickets/index')
            // The page should include paginated results, high-level stats, and
            // the filter dropdown options expected by the React component.
            ->has('tickets.data')
            ->has('stats')
            ->has('statusOptions')
            ->has('priorityOptions'));
});

test('agents can create a ticket with metadata and activity log', function () {
    // Create both the requester (current user) and an agent to assign the ticket to.
    $user = User::factory()->create();
    $assignee = User::factory()->create();

    // Submit a full payload with metadata that should be persisted to the ticket.
    $response = $this->actingAs($user)->post(route('tickets.store'), [
        'subject' => 'Migration assistance required',
        'description' => 'Customer needs help migrating historic webhooks into the SmartStack event bus.',
        'priority' => Ticket::PRIORITY_HIGH,
        'assignee_id' => $assignee->id,
        'category' => 'Migration',
        'tags' => ['vip', 'migration'],
        'due_at' => now()->addDay()->toISOString(),
    ]);

    $ticket = Ticket::latest('id')->first();

    // Confirm the record exists and mirrors the submitted data.
    expect($ticket)
        ->not()->toBeNull()
        ->and($ticket->subject)->toBe('Migration assistance required')
        ->and($ticket->assignee_id)->toBe($assignee->id)
        ->and($ticket->tags)->toMatchArray(['vip', 'migration']);

    $response->assertRedirect(route('tickets', ['ticket' => $ticket->id]));

    // Activity log should include an entry describing the creation event.
    expect(TicketActivity::where('ticket_id', $ticket->id)->where('type', 'created')->exists())->toBeTrue();
});

test('ticket updates adjust status and log activity', function () {
    // Build a ticket in a default state and an assignee for future updates.
    $user = User::factory()->create();
    $assignee = User::factory()->create();
    $ticket = Ticket::factory()->create([
        'status' => Ticket::STATUS_OPEN,
        'priority' => Ticket::PRIORITY_NORMAL,
        'assignee_id' => null,
    ]);

    // Issue a patch request that changes multiple attributes at once.
    $response = $this->actingAs($user)->patch(route('tickets.update', $ticket), [
        'status' => Ticket::STATUS_IN_PROGRESS,
        'priority' => Ticket::PRIORITY_URGENT,
        'assignee_id' => $assignee->id,
        'tags' => ['escalated'],
        'due_at' => now()->addDays(2)->toDateString(),
    ]);

    $response->assertRedirect();

    $ticket->refresh();

    // Updated fields should reflect the new values from the request payload.
    expect($ticket->status)->toBe(Ticket::STATUS_IN_PROGRESS)
        ->and($ticket->priority)->toBe(Ticket::PRIORITY_URGENT)
        ->and($ticket->assignee_id)->toBe($assignee->id)
        ->and($ticket->tags)->toMatchArray(['escalated']);

    // Each changed attribute should also emit a corresponding activity record.
    expect(TicketActivity::where('ticket_id', $ticket->id)->where('type', 'status_changed')->exists())->toBeTrue()
        ->and(TicketActivity::where('ticket_id', $ticket->id)->where('type', 'priority_changed')->exists())->toBeTrue()
        ->and(TicketActivity::where('ticket_id', $ticket->id)->where('type', 'assignee_changed')->exists())->toBeTrue();
});

test('posting a comment records responses and activity', function () {
    // Comments should flip the first response metrics when an agent replies to
    // a requester for the first time.
    $requester = User::factory()->create();
    $agent = User::factory()->create();
    $ticket = Ticket::factory()->create([
        'requester_id' => $requester->id,
        'first_response_at' => null,
        'first_response_minutes' => null,
    ]);

    $response = $this->actingAs($agent)->post(route('tickets.comments.store', $ticket), [
        'body' => 'Thanks for raising this! We are checking the integration logs now.',
        'is_internal' => false,
    ]);

    $response->assertRedirect();

    $ticket->refresh();

    // Ensure the SLA timestamps are captured and related records exist.
    expect($ticket->first_response_at)->not()->toBeNull()
        ->and($ticket->first_response_minutes)->not()->toBeNull();

    expect(TicketComment::where('ticket_id', $ticket->id)->count())->toBe(1)
        ->and(TicketActivity::where('ticket_id', $ticket->id)->where('type', 'comment_added')->exists())->toBeTrue();
});
