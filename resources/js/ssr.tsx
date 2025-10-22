import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';

// Match the client-side fallback so document titles stay consistent regardless of
// whether a page is initially rendered on the server or the browser.
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        // ReactDOMServer APIs render the component tree to an HTML string that
        // Laravel returns to the browser for the initial request.
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) =>
            resolvePageComponent(
                // Share the same dynamic import strategy as the client bundle so
                // Vite can build deterministic chunks for SSR.
                `./pages/${name}.tsx`,
                import.meta.glob('./pages/**/*.tsx'),
            ),
        setup: ({ App, props }) => {
            // On the server we simply return the rendered component; Inertia
            // handles serializing the props for the subsequent client hydration.
            return <App {...props} />;
        },
    }),
);
