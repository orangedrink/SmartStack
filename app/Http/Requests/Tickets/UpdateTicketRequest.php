<?php

namespace App\Http\Requests\Tickets;

use App\Models\Ticket;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Ticket updates are restricted to authenticated users to prevent
        // anonymous edits via the API.
        return $this->user() !== null;
    }

    public function rules(): array
    {
        // "Sometimes" rules allow partial updates while still enforcing strong
        // validation when a field is present in the payload.
        return [
            'subject' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'status' => ['sometimes', 'required', Rule::in(Ticket::statuses())],
            'priority' => ['sometimes', 'required', Rule::in(Ticket::priorities())],
            'category' => ['nullable', 'string', 'max:120'],
            'tags' => ['nullable', 'array', 'max:10'],
            'tags.*' => ['string', 'max:30'],
            'due_at' => ['nullable', 'date'],
            'assignee_id' => ['nullable', 'exists:users,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Normalize nullable fields to null and ensure tags follow the same
        // transformation path regardless of input format (array or CSV).
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
            // Convert CSV strings to collections so they share the same pipeline
            // as array inputs.
            $tags = collect(explode(',', $tags));
        }

        if (is_array($tags)) {
            $tags = collect($tags);
        }

        return $tags
            // Remove whitespace and empty entries, leaving a clean array of tags
            // that can be fed directly into the Ticket model mutator.
            ->map(fn ($tag) => trim((string) $tag))
            ->filter()
            ->values()
            ->all();
    }
}
