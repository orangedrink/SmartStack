<?php

namespace App\Http\Requests\Tickets;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Commenting requires an authenticated user to ensure accountability for
        // each response added to a ticket's conversation history.
        return $this->user() !== null;
    }

    public function rules(): array
    {
        // Comments are bounded so the UI stays responsive and to prevent overly
        // large payloads from bloating the activity feed.
        return [
            'body' => ['required', 'string', 'max:4000'],
            'is_internal' => ['nullable', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Coerce the internal flag into a strict boolean, accepting values from
        // form submissions ("on", "true", "1") without trusting raw strings.
        $this->merge([
            'is_internal' => filter_var($this->input('is_internal', false), FILTER_VALIDATE_BOOLEAN),
        ]);
    }
}
