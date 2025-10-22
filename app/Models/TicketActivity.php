<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketActivity extends Model
{
    use HasFactory;

    // Ticket activities capture automated events (status changes, assignments,
    // SLA milestones, etc.) so agents can audit a ticket's history alongside
    // human-authored comments.

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'ticket_id',
        'performed_by',
        'type',
        'details',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        // Arbitrary metadata for the activity (e.g. "from" and "to" values) is
        // stored as JSON. Casting ensures consumers always receive an array.
        'details' => 'array',
    ];

    public function ticket(): BelongsTo
    {
        // A single ticket can own many activities; this inverse relation allows
        // us to traverse from an activity back to its parent ticket.
        return $this->belongsTo(Ticket::class);
    }

    public function performedBy(): BelongsTo
    {
        // Not every activity has a human actor, but when it does the "performed by"
        // relationship links the record to the responsible user for auditing.
        return $this->belongsTo(User::class, 'performed_by');
    }
}
