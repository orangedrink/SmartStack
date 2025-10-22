<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Profile updates must maintain valid user metadata. Keeping these rules
        // here centralizes validation for both web and API contexts.
        return [
            'name' => ['required', 'string', 'max:255'],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                // Ignore the currently authenticated user so they can keep their
                // existing email address while still preventing duplicates.
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
        ];
    }
}
