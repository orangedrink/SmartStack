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
        $this->resource->loadMissing(['assignee:id,name,email', 'requester:id,name,email']);

        return [
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
        ];
    }
}
