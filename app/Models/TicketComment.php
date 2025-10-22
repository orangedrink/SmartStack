<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketComment extends Model
{
    use HasFactory;

    // Comment records mirror the conversation history on a ticket. The fillable
    // attributes outline the minimal dataset required to persist a reply.

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'ticket_id',
        'user_id',
        'body',
        'is_internal',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        // Internal comments are hidden from customers. Casting to boolean ensures
        // downstream logic can trust a strict true/false value regardless of how
        // the attribute was supplied (string, integer, etc.).
        'is_internal' => 'boolean',
    ];

    public function ticket(): BelongsTo
    {
        // Each comment is associated with exactly one ticket; this relationship
        // is used for eager loading and for cascaded queries when a ticket is
        // displayed in the UI.
        return $this->belongsTo(Ticket::class);
    }

    public function user(): BelongsTo
    {
        // The user relation identifies who authored the comment. Nullable in the
        // database, but when present provides metadata for avatar/name rendering.
        return $this->belongsTo(User::class);
    }
}
