<?php

namespace App\Http\Requests\Tickets;

use App\Models\Ticket;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
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
            $tags = collect(explode(',', $tags));
        }

        if (is_array($tags)) {
            $tags = collect($tags);
        }

        return $tags
            ->map(fn ($tag) => trim((string) $tag))
            ->filter()
            ->values()
            ->all();
    }
}
