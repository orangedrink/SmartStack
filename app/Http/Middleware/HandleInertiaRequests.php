<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        // Defer to Inertia's default behavior, which hashes compiled assets so
        // browsers automatically receive fresh bundles after deployments.
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Pull a random inspirational quote to personalize the dashboard. The
        // helper returns "message - author" strings, so we split them for clarity.
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            // Share the application name so the front-end can display it in the
            // layout header without additional configuration files.
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                // Expose the authenticated user to Inertia so navigation menus
                // can show avatars and names without extra API calls.
                'user' => $request->user(),
            ],
            // Persist the sidebar state via cookie to respect user preferences
            // between requests, defaulting to open when no cookie is present.
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
