<?php

namespace App\Http\Controllers;

use App\Http\Requests\Tickets\StoreTicketRequest;
use App\Http\Requests\Tickets\UpdateTicketRequest;
use App\Http\Resources\TicketActivityResource;
use App\Http\Resources\TicketDetailResource;
use App\Http\Resources\TicketSummaryResource;
use App\Models\Ticket;
use App\Models\TicketActivity;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function index(Request $request): Response
    {
        // Collect the incoming filter parameters so they can be re-used both for
        // querying and for re-populating the UI controls on the Inertia page.
        $filters = [
            'status' => $request->query('status'),
            'priority' => $request->query('priority'),
            'assignee' => $request->query('assignee'),
            'search' => $request->query('search'),
            'tag' => $request->query('tag'),
        ];

        $filters = array_filter(
            $filters,
            static fn ($value) => !is_null($value) && $value !== ''
        );

        // Base ticket query eager loads the minimal relationships required for
        // the list view and precomputes comment counts to avoid N+1 queries.
        $ticketsQuery = Ticket::query()
            ->with(['assignee:id,name,email', 'requester:id,name,email'])
            ->withCount('comments');

        if (isset($filters['status'])) {
            $ticketsQuery->where('status', $filters['status']);
        }

        if (isset($filters['priority'])) {
            $ticketsQuery->where('priority', $filters['priority']);
        }

        if (isset($filters['assignee'])) {
            if ($filters['assignee'] === 'unassigned') {
                // The special "unassigned" keyword helps the front-end expose a
                // single toggle without knowing the underlying query semantics.
                $ticketsQuery->whereNull('assignee_id');
            } else {
                $ticketsQuery->where('assignee_id', $filters['assignee']);
            }
        }

        if (isset($filters['search'])) {
            $searchTerm = $filters['search'];
            $ticketsQuery->where(function ($query) use ($searchTerm) {
                // A loose LIKE search across multiple columns provides a simple
                // global search experience for agents without needing full text.
                $query
                    ->where('subject', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%")
                    ->orWhere('reference', 'like', "%{$searchTerm}%");
            });
        }

        if (isset($filters['tag'])) {
            // Tags are stored as JSON arrays, so we use the JSON contains helper
            // to find tickets that include the requested keyword.
            $ticketsQuery->whereJsonContains('tags', $filters['tag']);
        }

        // Most recent activity surfaces the freshest tickets first, which is the
        // default queue ordering for support teams.
        $ticketsQuery->orderByDesc('last_activity_at')->orderByDesc('updated_at');

        $paginator = $ticketsQuery->paginate(10)->withQueryString();

        $tickets = TicketSummaryResource::collection($paginator);

        $selectedTicketId = $request->integer('ticket');

        if (!$selectedTicketId && $paginator->count() > 0) {
            // When no explicit ticket is selected, fall back to the first result
            // so the detail panel in the UI is never empty for populated queues.
            $selectedTicketId = optional($paginator->first())->id;
        }

        $selectedTicket = $selectedTicketId
            ? Ticket::query()
                ->with(['assignee:id,name,email', 'requester:id,name,email', 'comments.user:id,name,email'])
                ->withCount('comments')
                ->find($selectedTicketId)
            : null;

        $now = now();
        $activeStatuses = [
            Ticket::STATUS_OPEN,
            Ticket::STATUS_IN_PROGRESS,
            Ticket::STATUS_WAITING,
        ];

        // Dashboard style metrics power the quick stats in the sidebar. Each
        // query is intentionally simple so the page stays performant.
        $openCount = Ticket::where('status', Ticket::STATUS_OPEN)->count();
        $inProgressCount = Ticket::where('status', Ticket::STATUS_IN_PROGRESS)->count();
        $waitingCount = Ticket::where('status', Ticket::STATUS_WAITING)->count();
        $resolvedThisWeek = Ticket::where('status', Ticket::STATUS_RESOLVED)
            ->whereBetween('resolved_at', [$now->copy()->startOfWeek(), $now])
            ->count();
        $unassignedCount = Ticket::whereNull('assignee_id')->count();
        $dueSoonCount = Ticket::whereIn('status', $activeStatuses)
            ->whereNotNull('due_at')
            ->whereBetween('due_at', [$now, $now->copy()->addDays(3)])
            ->count();
        $pastDueCount = Ticket::whereIn('status', $activeStatuses)
            ->whereNotNull('due_at')
            ->where('due_at', '<', $now)
            ->count();
        $activeCount = Ticket::whereIn('status', $activeStatuses)->count();
        $slaBreachRate = $activeCount > 0 ? round(($pastDueCount / $activeCount) * 100) : 0;
        $avgFirstResponse = (int) round((float) Ticket::whereNotNull('first_response_minutes')->avg('first_response_minutes'));
        $reopenedCount = Ticket::where('reopen_count', '>', 0)->count();

        $assignees = User::query()
            ->select(['id', 'name', 'email'])
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]);

        $tags = Ticket::query()
            ->whereNotNull('tags')
            ->pluck('tags')
            ->flatMap(fn ($tags) => $tags ?? [])
            ->unique()
            ->values()
            ->all();

        $recentActivity = TicketActivityResource::collection(
            TicketActivity::query()
                ->with(['ticket:id,reference,subject', 'performedBy:id,name,email'])
                ->latest()
                ->limit(10)
                ->get()
        );

        return Inertia::render('tickets/index', [
            'tickets' => $tickets,
            'filters' => $filters,
            'statusOptions' => Ticket::statuses(),
            'priorityOptions' => Ticket::priorities(),
            'assignees' => $assignees,
            'tags' => $tags,
            'stats' => [
                'open' => $openCount,
                'inProgress' => $inProgressCount,
                'waiting' => $waitingCount,
                'resolvedThisWeek' => $resolvedThisWeek,
                'avgFirstResponseMinutes' => $avgFirstResponse,
                'slaBreachRate' => $slaBreachRate,
                'dueSoon' => $dueSoonCount,
                'unassigned' => $unassignedCount,
                'reopened' => $reopenedCount,
            ],
            'selectedTicket' => $selectedTicket ? new TicketDetailResource($selectedTicket) : null,
            'recentActivity' => $recentActivity,
        ]);
    }

    public function store(StoreTicketRequest $request): RedirectResponse
    {
        $data = $request->validated();

        /** @var \App\Models\User $user */
        $user = $request->user();

        // Wrapping creation in a transaction ensures the ticket and the initial
        // activity log entry are either both persisted or both rolled back.
        $ticket = DB::transaction(function () use ($data, $user) {
            $ticket = new Ticket();
            $ticket->fill(Arr::except($data, ['tags']));
            $ticket->requester_id = $user->id;
            $ticket->tags = $data['tags'] ?? [];
            $ticket->status = $data['status'] ?? Ticket::STATUS_OPEN;
            $ticket->last_activity_at = now();
            $ticket->save();

            TicketActivity::create([
                'ticket_id' => $ticket->id,
                'performed_by' => $user->id,
                'type' => 'created',
                'details' => [
                    'status' => $ticket->status,
                    'priority' => $ticket->priority,
                ],
            ]);

            return $ticket;
        });

        return redirect()
            ->route('tickets', ['ticket' => $ticket->id])
            ->with('success', 'Ticket created successfully.');
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket): RedirectResponse
    {
        $data = $request->validated();

        /** @var \App\Models\User $user */
        $user = $request->user();

        // Updating a ticket can trigger cascading side effects (reopen counts,
        // activity logs). A transaction keeps the record in sync if something
        // fails midway through the process.
        DB::transaction(function () use ($ticket, $data, $user) {
            $originalStatus = $ticket->status;
            $resolvedStatuses = [Ticket::STATUS_RESOLVED, Ticket::STATUS_CLOSED];

            if (array_key_exists('status', $data) && in_array($data['status'], $resolvedStatuses, true)) {
                // When transitioning into a resolved/closed state, stamp the time
                // the first resolution occurred so metrics can track resolution SLA.
                $ticket->resolved_at = $ticket->resolved_at ?? now();
            }

            if (
                array_key_exists('status', $data)
                && in_array($originalStatus, $resolvedStatuses, true)
                && !in_array($data['status'], $resolvedStatuses, true)
            ) {
                // Moving from a resolved state back to an active one removes the
                // resolved timestamp, ensuring future reports reflect the reopen.
                $ticket->resolved_at = null;
            }

            $ticket->fill(Arr::except($data, ['tags']));

            if (array_key_exists('tags', $data)) {
                // Tag updates bypass fill() because we need to run the attribute
                // mutator which normalizes the values.
                $ticket->tags = $data['tags'];
            }

            if ($ticket->isDirty()) {
                // Any modification should bump the last activity timestamp so
                // the index ordering reflects recent changes.
                $ticket->last_activity_at = now();
            }

            $ticket->save();

            if (
                $ticket->wasChanged('status')
                && in_array($originalStatus, $resolvedStatuses, true)
                && !in_array($ticket->status, $resolvedStatuses, true)
            ) {
                // If a previously resolved ticket re-enters an active state, we
                // increment the reopen counter for reporting/analytics.
                $ticket->increment('reopen_count');
            }

            $activities = [];

            if ($ticket->wasChanged('status')) {
                // Capture the "from" and "to" values so agents can understand
                // what changed when scanning the activity timeline.
                $activities[] = [
                    'type' => 'status_changed',
                    'details' => [
                        'from' => $originalStatus,
                        'to' => $ticket->status,
                    ],
                ];
            }

            if ($ticket->wasChanged('priority')) {
                $activities[] = [
                    'type' => 'priority_changed',
                    'details' => [
                        'to' => $ticket->priority,
                    ],
                ];
            }

            if ($ticket->wasChanged('assignee_id')) {
                // Include the new assignee metadata; the optional helper defends
                // against null assignee IDs (unassigned tickets).
                $activities[] = [
                    'type' => 'assignee_changed',
                    'details' => [
                        'assignee_id' => $ticket->assignee_id,
                        'assignee_name' => optional($ticket->assignee)->name,
                    ],
                ];
            }

            if ($ticket->wasChanged('due_at')) {
                $activities[] = [
                    'type' => 'due_date_changed',
                    'details' => [
                        'due_at' => optional($ticket->due_at)->toIso8601String(),
                    ],
                ];
            }

            if ($ticket->wasChanged('tags')) {
                // Tags are stored as JSON; logging the full array provides a
                // snapshot that can be diffed in the UI if desired.
                $activities[] = [
                    'type' => 'tags_updated',
                    'details' => [
                        'tags' => $ticket->tags,
                    ],
                ];
            }

            if ($ticket->wasChanged('category')) {
                // Category updates typically correspond to routing changes, so
                // exposing the new category aids in historical auditing.
                $activities[] = [
                    'type' => 'category_updated',
                    'details' => [
                        'category' => $ticket->category,
                    ],
                ];
            }

            foreach ($activities as $activity) {
                // Persist each activity so the timeline stays granular; each
                // change maps to a dedicated entry instead of a combined blob.
                TicketActivity::create([
                    'ticket_id' => $ticket->id,
                    'performed_by' => $user->id,
                    'type' => $activity['type'],
                    'details' => $activity['details'],
                ]);
            }
        });

        return back()->with('success', 'Ticket updated successfully.');
    }
}
