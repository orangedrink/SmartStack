<?php

namespace App\Http\Requests\Tickets;

use App\Models\Ticket;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Only authenticated users can create tickets through this request; this
        // guards the endpoint against anonymous submissions.
        return $this->user() !== null;
    }

    public function rules(): array
    {
        // Validation keeps inbound API payloads clean. Limits prevent runaway
        // input sizes from causing performance issues or skewing analytics.
        return [
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'priority' => ['required', Rule::in(Ticket::priorities())],
            'status' => ['nullable', Rule::in(Ticket::statuses())],
            'category' => ['nullable', 'string', 'max:120'],
            'tags' => ['nullable', 'array', 'max:10'],
            'tags.*' => ['string', 'max:30'],
            'due_at' => ['nullable', 'date'],
            'assignee_id' => ['nullable', 'exists:users,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Normalizing inputs ahead of validation simplifies rule definitions by
        // ensuring nullable values are consistently represented as null/arrays.
        $this->merge([
            'assignee_id' => $this->filled('assignee_id') ? $this->input('assignee_id') : null,
            'tags' => $this->prepareTags($this->input('tags')),
        ]);
    }

    /**
     * @return array<int, string>
     */
    protected function prepareTags(mixed $tags): array
    {
        if (blank($tags)) {
            return [];
        }

        if (is_string($tags)) {
            // Accept comma separated strings to support simple text inputs.
            $tags = collect(explode(',', $tags));
        }

        if (is_array($tags)) {
            $tags = collect($tags);
        }

        return $tags
            // Trim whitespace, drop empty values, and reset the indices so the
            // resulting array is ready for JSON storage without extra cleanup.
            ->map(fn ($tag) => trim((string) $tag))
            ->filter()
            ->values()
            ->all();
    }
}
