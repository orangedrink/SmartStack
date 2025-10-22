<?php

namespace App\Http\Requests\Tickets;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:4000'],
            'is_internal' => ['nullable', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_internal' => filter_var($this->input('is_internal', false), FILTER_VALIDATE_BOOLEAN),
        ]);
    }
}
