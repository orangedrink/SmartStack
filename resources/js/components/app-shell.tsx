import { SidebarProvider } from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const isOpen = usePage<SharedData>().props.sidebarOpen;

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    return (
        <SidebarProvider defaultOpen={isOpen}>
            <div className="app-shell-theme relative flex min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -left-24 top-[-10%] h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
                    <div className="absolute right-[-10%] top-20 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl" />
                    <div className="absolute bottom-[-20%] left-[35%] h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
                </div>
                <div className="relative flex min-h-screen w-full flex-1">{children}</div>
            </div>
        </SidebarProvider>
    );
}
