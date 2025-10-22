<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class HandleAppearance
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Share the appearance preference (light/dark/system) with every view so
        // Blade templates and Inertia layouts can render consistent themes.
        View::share('appearance', $request->cookie('appearance') ?? 'system');

        return $next($request);
    }
}
