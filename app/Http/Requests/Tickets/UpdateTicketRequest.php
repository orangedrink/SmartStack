<?php

namespace App\Http\Requests\Tickets;

use App\Models\Ticket;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
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
