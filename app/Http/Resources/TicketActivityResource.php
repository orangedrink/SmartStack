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
        $this->resource->loadMissing(['ticket:id,reference,subject', 'performedBy:id,name,email']);

        return [
            'id' => $this->id,
            'type' => $this->type,
            'ticket' => $this->ticket
                ? [
                    'id' => $this->ticket->id,
                    'reference' => $this->ticket->reference,
                    'subject' => $this->ticket->subject,
                ]
                : null,
            'performed_by' => $this->performedBy
                ? [
                    'id' => $this->performedBy->id,
                    'name' => $this->performedBy->name,
                    'email' => $this->performedBy->email,
                ]
                : null,
            'details' => $this->details ?? [],
            'created_at' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
