<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Place container bindings or package registrations here when the
        // application grows. Leaving the method defined keeps the structure
        // consistent with Laravel's default provider template.
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Bootstrapping hooks such as model observers or Blade directives can
        // be added when needed. The empty method signals intentional omission
        // rather than an accidental deletion.
    }
}
