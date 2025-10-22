<?php

namespace App\Http\Resources;

use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Ticket
 */
class TicketSummaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Ensure the lightweight relations are available so the resource can
        // expose consistent structures without requiring callers to eager load
        // them manually every time.
        $this->resource->loadMissing(['assignee:id,name,email', 'requester:id,name,email']);

        return [
            // Provide the high-level data points used on the ticket queue. The
            // front-end expects ISO 8601 strings for dates to simplify parsing.
            'id' => $this->id,
            'reference' => $this->reference,
            'subject' => $this->subject,
            'status' => $this->status,
            'priority' => $this->priority,
            'category' => $this->category,
            'tags' => $this->tags ?? [],
            'due_at' => optional($this->due_at)->toIso8601String(),
            'updated_at' => optional($this->updated_at)->toIso8601String(),
            'last_activity_at' => optional($this->last_activity_at)->toIso8601String(),
            'comment_count' => $this->comments_count ?? 0,
            'requester' => $this->requester
                ? [
                    // Embed a minimal requester payload so avatars/names can be
                    // rendered without additional HTTP requests.
                    'id' => $this->requester->id,
                    'name' => $this->requester->name,
                    'email' => $this->requester->email,
                ]
                : null,
            'assignee' => $this->assignee
                ? [
                    // Similar metadata for the assigned agent, allowing the UI
                    // to show escalation paths at a glance.
                    'id' => $this->assignee->id,
                    'name' => $this->assignee->name,
                    'email' => $this->assignee->email,
                ]
                : null,
        ];
    }
}
