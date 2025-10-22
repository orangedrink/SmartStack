<?php

namespace Database\Factories;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Arr;

/**
 * @extends Factory<Ticket>
 */
class TicketFactory extends Factory
{
    protected $model = Ticket::class;

    public function definition(): array
    {
        $status = Arr::random(Ticket::statuses());
        $priority = Arr::random(Ticket::priorities());

        $createdAt = fake()->dateTimeBetween('-2 months', 'now');
        $dueAt = fake()->boolean(60)
            ? fake()->dateTimeBetween($createdAt, '+3 weeks')
            : null;

        $resolvedAt = in_array($status, [Ticket::STATUS_RESOLVED, Ticket::STATUS_CLOSED], true)
            ? fake()->dateTimeBetween($createdAt, 'now')
            : null;

        return [
            'requester_id' => User::factory(),
            'assignee_id' => fake()->boolean(70) ? User::factory() : null,
            'subject' => fake()->sentence(),
            'description' => fake()->paragraphs(2, true),
            'status' => $status,
            'priority' => $priority,
            'category' => fake()->randomElement(['General', 'Billing', 'Technical', 'Access', null]),
            'tags' => fake()->randomElements([
                'billing',
                'onboarding',
                'integration',
                'bug',
                'vip',
                'sla-risk',
            ], fake()->numberBetween(0, 3)),
            'due_at' => $dueAt,
            'resolved_at' => $resolvedAt,
            'first_response_at' => null,
            'first_response_minutes' => null,
            'reopen_count' => 0,
            'last_activity_at' => $createdAt,
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ];
    }
}
