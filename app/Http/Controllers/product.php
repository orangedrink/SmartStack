<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class product extends Controller
{
    // Although Laravel conventions prefer StudlyCase class names, this legacy
    // controller persists with a lowercase identifier. Retaining it avoids the
    // need to update existing route bindings while still allowing us to add
    // contextual documentation about its purpose.
    public function product()
    {
        // Render the Products Inertia page. No additional data is supplied
        // because the front-end component is responsible for fetching its own
        // resources from the API once mounted.
        return Inertia::render('Products');
    }
}
