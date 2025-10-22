import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface AppContentProps extends React.ComponentProps<'main'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({
    variant = 'header',
    children,
    className,
    ...props
}: AppContentProps) {
    if (variant === 'sidebar') {
        return (
            <SidebarInset
                {...props}
                className={cn(
                    'relative flex min-h-screen flex-1 flex-col overflow-x-hidden bg-transparent px-6 py-12 text-slate-100 sm:px-10 lg:px-12',
                    className,
                )}
            >
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute left-1/2 top-0 h-56 w-[120%] -translate-x-1/2 bg-[radial-gradient(circle,_rgba(56,189,248,0.2),_transparent_65%)] blur-3xl" />
                    <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl" />
                    <div className="absolute -bottom-24 left-[25%] h-80 w-80 rounded-full bg-emerald-500/15 blur-[120px]" />
                </div>
                <div className="relative z-10 flex w-full flex-1 flex-col gap-10">
                    {children}
                </div>
            </SidebarInset>
        );
    }

    return (
        <main
            className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl"
            {...props}
        >
            {children}
        </main>
    );
}
