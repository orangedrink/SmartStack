import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

const messages = [
    {
        author: 'Alex Johnson',
        role: 'Product Lead',
        content:
            'SmartStack keeps our entire team aligned. The clean dashboard makes it effortless to track progress.',
    },
    {
        author: 'Priya Desai',
        role: 'Support Manager',
        content:
            'We cut response times in half after switching. Automations and shared inboxes just work.',
    },
    {
        author: 'Jordan Smith',
        role: 'Founder',
        content:
            'Launching new features is finally fun again. SmartStack removes the friction from collaboration.',
    },
];

type HomeProps = {
    canRegister?: boolean;
};

export default function Home({ canRegister = true }: HomeProps) {
    const {
        auth: { user },
    } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
            <Head title="Home" />
            <header className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_60%)]" />
                <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-24 pt-20 text-center sm:px-10 lg:gap-10 lg:pt-24">
                    <Link
                        href="https://smartstack.app"
                        className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                    >
                        Introducing SmartStack 2.0
                    </Link>
                    <h1 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                        The calm, connected workspace for growing teams
                    </h1>
                    <p className="mx-auto max-w-3xl text-lg text-slate-300 sm:text-xl">
                        Streamline collaboration, keep every conversation within reach, and deliver customer delight with a beautifully simple toolkit designed for clarity.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
                            >
                                Go to dashboard
                            </Link>
                        ) : (
                            <>
                                {canRegister && (
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-sky-500/40 transition hover:bg-sky-400"
                                    >
                                        Start free trial
                                    </Link>
                                )}
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/5"
                                >
                                    View live demo
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="relative isolate">
                <div className="absolute inset-x-0 top-0 flex justify-center overflow-hidden">
                    <div className="h-40 w-[120%] bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.15),_transparent_70%)] blur-3xl" />
                </div>

                <section className="relative mx-auto max-w-5xl px-6 pb-20 sm:px-10">
                    <div className="grid gap-6 rounded-3xl border border-white/10 bg-white/[0.02] p-8 shadow-[0_30px_70px_rgba(15,23,42,0.45)] backdrop-blur-lg sm:grid-cols-2">
                        <div className="flex flex-col justify-between gap-6">
                            <div className="space-y-3">
                                <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Why teams switch</p>
                                <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                                    Everything you need, nothing that distracts
                                </h2>
                                <p className="text-base leading-relaxed text-slate-300">
                                    Plan projects, manage support, and share knowledge in a single, elegant view. SmartStack stays out of the way so your ideas can shine.
                                </p>
                            </div>
                            <ul className="space-y-4 text-sm text-slate-200">
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-400" />
                                    Focused workspaces for product, support, and leadership teams
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400" />
                                    Real-time updates and shared timelines everyone can trust
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-purple-400" />
                                    Fast, delightful responses thanks to AI-suggested replies
                                </li>
                            </ul>
                        </div>
                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
                            <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-sky-500/20 blur-2xl" />
                            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl" />
                            <div className="relative space-y-4">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sample messages</p>
                                <div className="space-y-4">
                                    {messages.map((message) => (
                                        <article
                                            key={message.author}
                                            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left shadow-[0_20px_45px_rgba(15,23,42,0.35)]"
                                        >
                                            <p className="text-base leading-relaxed text-slate-100">{message.content}</p>
                                            <footer className="mt-4 text-sm text-slate-400">
                                                <span className="font-medium text-slate-200">{message.author}</span> · {message.role}
                                            </footer>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-white/10 bg-black/20">
                <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-10 text-center text-sm text-slate-400 sm:flex-row sm:justify-between">
                    <p>&copy; {new Date().getFullYear()} SmartStack. Crafted for teams who care.</p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="transition hover:text-slate-200">
                            Privacy
                        </Link>
                        <Link href="/terms" className="transition hover:text-slate-200">
                            Terms
                        </Link>
                        <Link href="mailto:hello@smartstack.app" className="transition hover:text-slate-200">
                            Contact
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
