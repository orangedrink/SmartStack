<?php

namespace App\Http\Resources;

use App\Models\TicketActivity;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin TicketActivity
 */
class TicketActivityResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Lazy load relationships only when needed so background jobs/tests that
        // already eager loaded them are not penalized with duplicate queries.
        $this->resource->loadMissing(['ticket:id,reference,subject', 'performedBy:id,name,email']);

        return [
            // The resource flattens model instances into primitive arrays that
            // the Inertia front-end can easily hydrate.
            'id' => $this->id,
            'type' => $this->type,
            'ticket' => $this->ticket
                ? [
                    // Embed minimal ticket context to show quick links/details
                    // within activity feeds.
                    'id' => $this->ticket->id,
                    'reference' => $this->ticket->reference,
                    'subject' => $this->ticket->subject,
                ]
                : null,
            'performed_by' => $this->performedBy
                ? [
                    // Provide enough actor information to display avatars and
                    // allow filtering by user on the front-end.
                    'id' => $this->performedBy->id,
                    'name' => $this->performedBy->name,
                    'email' => $this->performedBy->email,
                ]
                : null,
            'details' => $this->details ?? [],
            // Use ISO dates to keep timezones explicit for downstream clients.
            'created_at' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
