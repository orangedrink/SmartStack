<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class Ticket extends Model
{
    use HasFactory;

    // These status constants provide a centralized enumeration that the rest of the
    // application can rely on when checking or mutating a ticket's lifecycle state.
    public const STATUS_OPEN = 'open';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_WAITING = 'waiting_on_customer';
    public const STATUS_RESOLVED = 'resolved';
    public const STATUS_CLOSED = 'closed';

    // Priority levels define the urgency of the request. Having explicit constants
    // keeps database values consistent and avoids magic strings in business logic.
    public const PRIORITY_LOW = 'low';
    public const PRIORITY_NORMAL = 'normal';
    public const PRIORITY_HIGH = 'high';
    public const PRIORITY_URGENT = 'urgent';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'requester_id',
        'assignee_id',
        'subject',
        'description',
        'status',
        'priority',
        'category',
        'tags',
        'due_at',
        'resolved_at',
        'first_response_at',
        'first_response_minutes',
        'reopen_count',
        'last_activity_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'tags' => 'array',
        'due_at' => 'datetime',
        'resolved_at' => 'datetime',
        'first_response_at' => 'datetime',
        'last_activity_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Ticket $ticket): void {
            // Ensure that new tickets always start in a predictable state if the
            // caller omitted certain attributes. The defaults mirror common help
            // desk behavior: new tickets are open, normal priority, and receive
            // a generated reference/timestamp.
            if (blank($ticket->status)) {
                $ticket->status = self::STATUS_OPEN;
            }

            if (blank($ticket->priority)) {
                $ticket->priority = self::PRIORITY_NORMAL;
            }

            if (blank($ticket->reference)) {
                $ticket->reference = static::generateReference();
            }

            if (blank($ticket->last_activity_at)) {
                $ticket->last_activity_at = now();
            }
        });
    }

    public static function statuses(): array
    {
        return [
            self::STATUS_OPEN,
            self::STATUS_IN_PROGRESS,
            self::STATUS_WAITING,
            self::STATUS_RESOLVED,
            self::STATUS_CLOSED,
        ];
    }

    public static function priorities(): array
    {
        return [
            self::PRIORITY_LOW,
            self::PRIORITY_NORMAL,
            self::PRIORITY_HIGH,
            self::PRIORITY_URGENT,
        ];
    }

    public static function generateReference(): string
    {
        // Use a date prefix so support agents can quickly identify when a ticket
        // was created, while the random sequence prevents collisions in high-
        // volume environments.
        $datePrefix = now()->format('Ymd');

        do {
            // The padded random sequence keeps the reference uniform (e.g. 0001)
            // which is more legible and sorts naturally when displayed.
            $sequence = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
            $reference = "TCK-{$datePrefix}-{$sequence}";
        } while (static::where('reference', $reference)->exists());

        return $reference;
    }

    /**
     * Scope for tickets that are considered active (not closed/resolved).
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNotIn('status', [self::STATUS_RESOLVED, self::STATUS_CLOSED]);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TicketComment::class)->orderBy('created_at');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(TicketActivity::class)->orderByDesc('created_at');
    }

    /**
     * Build a chronological timeline of activity for the ticket.
     */
    public function timeline(): Collection
    {
        // Load the relationships needed to build the timeline only when missing
        // to avoid unnecessary database queries if the associations were eager
        // loaded earlier in the request lifecycle.
        $this->loadMissing(['comments.user', 'activities.performedBy']);

        $commentItems = $this->comments->map(function (TicketComment $comment) {
            // Flatten each comment into a serializable structure that the front-end
            // can consume without needing to understand Eloquent internals.
            return [
                'id' => "comment-{$comment->id}",
                'type' => 'comment',
                'created_at' => $comment->created_at,
                'actor' => $comment->user
                    ? [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                        'email' => $comment->user->email,
                    ]
                    : null,
                'is_internal' => $comment->is_internal,
                'body' => $comment->body,
            ];
        });

        $activityItems = $this->activities->map(function (TicketActivity $activity) {
            // Activities are normalized similarly to comments so both datasets can
            // be merged and sorted chronologically with minimal effort.
            return [
                'id' => "activity-{$activity->id}",
                'type' => $activity->type,
                'created_at' => $activity->created_at,
                'actor' => $activity->performedBy
                    ? [
                        'id' => $activity->performedBy->id,
                        'name' => $activity->performedBy->name,
                        'email' => $activity->performedBy->email,
                    ]
                    : null,
                'details' => $activity->details ?? [],
            ];
        });

        return $commentItems
            ->concat($activityItems)
            ->sortBy('created_at')
            ->values()
            ->map(function (array $item) {
                // Convert timestamps to ISO-8601 strings so the API payload is
                // timezone-aware and consistent across JavaScript consumers.
                $item['created_at'] = optional($item['created_at'])->toIso8601String();

                return $item;
            });
    }

    /**
     * Mutator for normalizing the tags input.
     */
    public function setTagsAttribute($value): void
    {
        $this->attributes['tags'] = $this->normalizeTags($value);
    }

    /**
     * Normalize incoming tags to a consistent array shape.
     */
    protected function normalizeTags(mixed $value): array
    {
        if (blank($value)) {
            return [];
        }

        $tags = $value;

        if (is_string($value)) {
            // Accept comma separated strings, trimming whitespace and ignoring
            // empty segments so UI inputs remain forgiving to user formatting.
            $tags = Str::of($value)
                ->explode(',')
                ->map(fn ($tag) => trim((string) $tag))
                ->filter()
                ->all();
        }

        if (is_array($tags)) {
            // Normalize arrays by lowercasing, de-duplicating, and replacing
            // whitespace with dashes. This keeps stored tags clean regardless
            // of how they were supplied.
            $tags = collect($tags)
                ->map(fn ($tag) => trim((string) $tag))
                ->filter()
                ->map(fn ($tag) => Str::of($tag)->lower()->replaceMatches('/\s+/', '-')->toString())
                ->unique()
                ->values()
                ->all();
        }

        return $tags instanceof Collection ? $tags->all() : $tags;
    }
}
