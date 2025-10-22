<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\ResetsUserPasswords;

class ResetUserPassword implements ResetsUserPasswords
{
    use PasswordValidationRules;

    /**
     * Validate and reset the user's forgotten password.
     *
     * @param  array<string, string>  $input
     */
    public function reset(User $user, array $input): void
    {
        // Ensure the new password honors the same rules enforced during
        // registration. This keeps account security consistent across flows.
        Validator::make($input, [
            'password' => $this->passwordRules(),
        ])->validate();

        // forceFill bypasses mass-assignment protection while still casting the
        // password via the model's attribute mutator.
        $user->forceFill([
            'password' => $input['password'],
        ])->save();
    }
}
