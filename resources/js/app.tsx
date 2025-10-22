// Import global styles so Tailwind/utility classes are available before React
// renders. This also ensures critical layout CSS is in place during hydration.
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

// Fall back to "Laravel" for the document title if the Vite environment variable
// is not defined (such as in tests or local prototyping).
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    // Dynamically compose the browser tab title. Including the page title keeps
    // navigation history clear while still branding each view with the app name.
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            // Map Inertia page names to their corresponding React components. The
            // glob eagerly imports all pages for Vite's bundler to track.
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        // hydrate the SSR placeholder or mount a new tree by creating a React 18
        // root. Using StrictMode surfaces potential side-effect issues early.
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        // Customize Inertia's progress bar to match the dashboard's neutral
        // palette, providing subtle feedback during navigation requests.
        color: '#4B5563',
    },
});

// Initialize the saved appearance preference (light/dark/system) before the
// first paint to avoid flashes of incorrect theme during hydration.
initializeTheme();
