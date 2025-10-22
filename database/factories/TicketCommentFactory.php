<?php

namespace Database\Factories;

use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TicketComment>
 */
class TicketCommentFactory extends Factory
{
    protected $model = TicketComment::class;

    public function definition(): array
    {
        // Generate a comment tied to newly created ticket/user instances so
        // relationship tests have complete data graphs.
        return [
            'ticket_id' => Ticket::factory(),
            'user_id' => User::factory(),
            'body' => fake()->paragraph(),
            // About a third of the comments are internal notes to mimic real
            // support desk behavior.
            'is_internal' => fake()->boolean(30),
        ];
    }
}
