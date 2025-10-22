<?php

namespace App\Actions\Fortify;

use Illuminate\Validation\Rules\Password;

trait PasswordValidationRules
{
    /**
     * Get the validation rules used to validate passwords.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function passwordRules(): array
    {
        // The default Fortify password rule applies sensible security defaults
        // (length, mixed case, symbols). The "confirmed" rule requires a
        // matching *_confirmation field from the form submission.
        return ['required', 'string', Password::default(), 'confirmed'];
    }
}
