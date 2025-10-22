<?php

use App\Models\Ticket;
use App\Models\TicketActivity;
use App\Models\TicketComment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('ticket index renders the queue overview', function () {
    $user = User::factory()->create();
    Ticket::factory()->count(3)->create();

    $response = $this->actingAs($user)->get(route('tickets'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('tickets/index')
            ->has('tickets.data')
            ->has('stats')
            ->has('statusOptions')
            ->has('priorityOptions'));
});

test('agents can create a ticket with metadata and activity log', function () {
    $user = User::factory()->create();
    $assignee = User::factory()->create();

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

    expect($ticket)
        ->not()->toBeNull()
        ->and($ticket->subject)->toBe('Migration assistance required')
        ->and($ticket->assignee_id)->toBe($assignee->id)
        ->and($ticket->tags)->toMatchArray(['vip', 'migration']);

    $response->assertRedirect(route('tickets', ['ticket' => $ticket->id]));

    expect(TicketActivity::where('ticket_id', $ticket->id)->where('type', 'created')->exists())->toBeTrue();
});

test('ticket updates adjust status and log activity', function () {
    $user = User::factory()->create();
    $assignee = User::factory()->create();
    $ticket = Ticket::factory()->create([
        'status' => Ticket::STATUS_OPEN,
        'priority' => Ticket::PRIORITY_NORMAL,
        'assignee_id' => null,
    ]);

    $response = $this->actingAs($user)->patch(route('tickets.update', $ticket), [
        'status' => Ticket::STATUS_IN_PROGRESS,
        'priority' => Ticket::PRIORITY_URGENT,
        'assignee_id' => $assignee->id,
        'tags' => ['escalated'],
        'due_at' => now()->addDays(2)->toDateString(),
    ]);

    $response->assertRedirect();

    $ticket->refresh();

    expect($ticket->status)->toBe(Ticket::STATUS_IN_PROGRESS)
        ->and($ticket->priority)->toBe(Ticket::PRIORITY_URGENT)
        ->and($ticket->assignee_id)->toBe($assignee->id)
        ->and($ticket->tags)->toMatchArray(['escalated']);

    expect(TicketActivity::where('ticket_id', $ticket->id)->where('type', 'status_changed')->exists())->toBeTrue()
        ->and(TicketActivity::where('ticket_id', $ticket->id)->where('type', 'priority_changed')->exists())->toBeTrue()
        ->and(TicketActivity::where('ticket_id', $ticket->id)->where('type', 'assignee_changed')->exists())->toBeTrue();
});

test('posting a comment records responses and activity', function () {
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

    expect($ticket->first_response_at)->not()->toBeNull()
        ->and($ticket->first_response_minutes)->not()->toBeNull();

    expect(TicketComment::where('ticket_id', $ticket->id)->count())->toBe(1)
        ->and(TicketActivity::where('ticket_id', $ticket->id)->where('type', 'comment_added')->exists())->toBeTrue();
});
