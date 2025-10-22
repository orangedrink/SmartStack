<?php

namespace App\Http\Resources;

use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Ticket
 */
class TicketDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $this->resource->loadMissing(['assignee:id,name,email', 'requester:id,name,email', 'comments.user:id,name,email']);

        $participants = $this->comments
            ->pluck('user')
            ->push($this->assignee, $this->requester)
            ->filter()
            ->unique('id')
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ])
            ->values();

        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'subject' => $this->subject,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'category' => $this->category,
            'tags' => $this->tags ?? [],
            'requester' => $this->requester
                ? [
                    'id' => $this->requester->id,
                    'name' => $this->requester->name,
                    'email' => $this->requester->email,
                ]
                : null,
            'assignee' => $this->assignee
                ? [
                    'id' => $this->assignee->id,
                    'name' => $this->assignee->name,
                    'email' => $this->assignee->email,
                ]
                : null,
            'due_at' => optional($this->due_at)->toIso8601String(),
            'resolved_at' => optional($this->resolved_at)->toIso8601String(),
            'first_response_at' => optional($this->first_response_at)->toIso8601String(),
            'first_response_minutes' => $this->first_response_minutes,
            'reopen_count' => $this->reopen_count,
            'comment_count' => $this->comments_count ?? $this->comments()->count(),
            'created_at' => optional($this->created_at)->toIso8601String(),
            'updated_at' => optional($this->updated_at)->toIso8601String(),
            'last_activity_at' => optional($this->last_activity_at)->toIso8601String(),
            'timeline' => $this->timeline(),
            'participants' => $participants,
        ];
    }
}
