<?php

namespace App\Http\Controllers;

use App\Http\Requests\Tickets\StoreTicketCommentRequest;
use App\Models\Ticket;
use App\Models\TicketActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TicketCommentController extends Controller
{
    public function store(StoreTicketCommentRequest $request, Ticket $ticket): RedirectResponse
    {
        $data = $request->validated();

        /** @var \App\Models\User $user */
        $user = $request->user();

        DB::transaction(function () use ($ticket, $user, $data) {
            $comment = $ticket->comments()->create([
                'user_id' => $user->id,
                'body' => $data['body'],
                'is_internal' => $data['is_internal'] ?? false,
            ]);

            if (is_null($ticket->first_response_at) && $ticket->requester_id !== $user->id) {
                $ticket->first_response_at = now();
                $ticket->first_response_minutes = $ticket->created_at
                    ? (int) round($ticket->created_at->diffInMinutes(now()))
                    : 0;
            }

            $ticket->last_activity_at = now();
            $ticket->save();

            TicketActivity::create([
                'ticket_id' => $ticket->id,
                'performed_by' => $user->id,
                'type' => $data['is_internal'] ? 'internal_note_added' : 'comment_added',
                'details' => [
                    'body_preview' => Str::limit($comment->body, 160),
                    'is_internal' => (bool) ($data['is_internal'] ?? false),
                ],
            ]);
        });

        return back()->with('success', 'Reply posted successfully.');
    }
}
