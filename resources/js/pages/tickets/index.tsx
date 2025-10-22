import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard, tickets as ticketsRoute } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import type { ComponentType, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
    Activity,
    CalendarClock,
    CheckCircle2,
    Clock4,
    Filter,
    Flame,
    GitCompare,
    MessageCircle,
    MessageSquareText,
    Plus,
    RefreshCcw,
    ShieldAlert,
    Tag,
    UserRoundCheck,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Ticketing',
        href: ticketsRoute().url,
    },
];

type TicketSummary = {
    id: number;
    reference: string;
    subject: string;
    status: string;
    priority: string;
    category?: string | null;
    tags: string[];
    due_at?: string | null;
    updated_at?: string | null;
    last_activity_at?: string | null;
    comment_count: number;
    requester?: {
        id: number;
        name: string;
        email: string;
    } | null;
    assignee?: {
        id: number;
        name: string;
        email: string;
    } | null;
};

type TimelineComment = {
    id: string;
    type: 'comment';
    created_at?: string | null;
    actor: {
        id: number;
        name: string;
        email: string;
    } | null;
    is_internal: boolean;
    body: string;
};

type TimelineActivity = {
    id: string;
    type:
        | 'created'
        | 'status_changed'
        | 'priority_changed'
        | 'assignee_changed'
        | 'due_date_changed'
        | 'tags_updated'
        | 'category_updated'
        | 'comment_added'
        | 'internal_note_added';
    created_at?: string | null;
    actor: {
        id: number;
        name: string;
        email: string;
    } | null;
    details: Record<string, unknown>;
};

type TimelineItem = TimelineComment | TimelineActivity;

type TicketDetail = {
    id: number;
    reference: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    category?: string | null;
    tags: string[];
    requester: {
        id: number;
        name: string;
        email: string;
    } | null;
    assignee: {
        id: number;
        name: string;
        email: string;
    } | null;
    due_at?: string | null;
    resolved_at?: string | null;
    first_response_at?: string | null;
    first_response_minutes?: number | null;
    reopen_count: number;
    comment_count: number;
    created_at?: string | null;
    updated_at?: string | null;
    last_activity_at?: string | null;
    timeline: TimelineItem[];
    participants: Array<{
        id: number;
        name: string;
        email: string;
    }>;
};

type RecentActivityItem = {
    id: number;
    type: string;
    ticket: {
        id: number;
        reference: string;
        subject: string;
    } | null;
    performed_by: {
        id: number;
        name: string;
        email: string;
    } | null;
    details: Record<string, unknown>;
    created_at?: string | null;
};

type PaginatedTickets = {
    data: TicketSummary[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number | null;
        to?: number | null;
    };
};

type TicketsPageProps = {
    tickets: PaginatedTickets;
    filters: Partial<Record<'status' | 'priority' | 'assignee' | 'search' | 'tag' | 'page', string>>;
    statusOptions: string[];
    priorityOptions: string[];
    assignees: Array<{
        id: number;
        name: string;
        email: string;
    }>;
    tags: string[];
    stats: {
        open: number;
        inProgress: number;
        waiting: number;
        resolvedThisWeek: number;
        avgFirstResponseMinutes: number;
        slaBreachRate: number;
        dueSoon: number;
        unassigned: number;
        reopened: number;
    };
    selectedTicket: TicketDetail | null;
    recentActivity: {
        data: RecentActivityItem[];
    };
};

const statusMeta: Record<string, { label: string; badge: string; dot: string }> = {
    open: {
        label: 'Open',
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        dot: 'bg-blue-500',
    },
    in_progress: {
        label: 'In progress',
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500',
    },
    waiting_on_customer: {
        label: 'Waiting on customer',
        badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-300',
        dot: 'bg-purple-500',
    },
    resolved: {
        label: 'Resolved',
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        dot: 'bg-emerald-500',
    },
    closed: {
        label: 'Closed',
        badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
        dot: 'bg-slate-500',
    },
};

const priorityMeta: Record<string, { label: string; badge: string }> = {
    low: {
        label: 'Low',
        badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
    },
    normal: {
        label: 'Normal',
        badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
    },
    high: {
        label: 'High',
        badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-300',
    },
    urgent: {
        label: 'Urgent',
        badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
};

const timelineIcons: Record<string, ComponentType<{ className?: string }>> = {
    comment: MessageSquareText,
    comment_added: MessageCircle,
    internal_note_added: ShieldAlert,
    status_changed: GitCompare,
    priority_changed: Flame,
    assignee_changed: UserRoundCheck,
    due_date_changed: CalendarClock,
    tags_updated: Tag,
    category_updated: Activity,
    created: CheckCircle2,
};

const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const dateFormatter = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const formatRelativeTime = (value?: string | null) => {
    if (!value) {
        return '—';
    }

    const date = new Date(value);
    const diff = date.getTime() - Date.now();
    const diffInSeconds = Math.round(diff / 1000);
    const absSeconds = Math.abs(diffInSeconds);

    if (absSeconds < 60) {
        return relativeFormatter.format(diffInSeconds, 'second');
    }

    const diffInMinutes = Math.round(diffInSeconds / 60);
    if (Math.abs(diffInMinutes) < 60) {
        return relativeFormatter.format(diffInMinutes, 'minute');
    }

    const diffInHours = Math.round(diffInMinutes / 60);
    if (Math.abs(diffInHours) < 24) {
        return relativeFormatter.format(diffInHours, 'hour');
    }

    const diffInDays = Math.round(diffInHours / 24);
    if (Math.abs(diffInDays) < 7) {
        return relativeFormatter.format(diffInDays, 'day');
    }

    const diffInWeeks = Math.round(diffInDays / 7);
    if (Math.abs(diffInWeeks) < 5) {
        return relativeFormatter.format(diffInWeeks, 'week');
    }

    const diffInMonths = Math.round(diffInDays / 30);
    if (Math.abs(diffInMonths) < 12) {
        return relativeFormatter.format(diffInMonths, 'month');
    }

    const diffInYears = Math.round(diffInDays / 365);
    return relativeFormatter.format(diffInYears, 'year');
};

const formatDateTime = (value?: string | null) => {
    if (!value) {
        return '—';
    }

    return dateFormatter.format(new Date(value));
};

export default function TicketsPage({
    tickets,
    filters,
    statusOptions,
    priorityOptions,
    assignees,
    tags,
    stats,
    selectedTicket,
    recentActivity,
}: TicketsPageProps) {
    const [search, setSearch] = useState(filters.search ?? '');

    useEffect(() => {
        setSearch(filters.search ?? '');
    }, [filters.search]);

    const updateForm = useForm({
        status: selectedTicket?.status ?? statusOptions[0] ?? 'open',
        priority: selectedTicket?.priority ?? priorityOptions[1] ?? 'normal',
        assignee_id: selectedTicket?.assignee?.id ? String(selectedTicket.assignee.id) : '',
        due_at: selectedTicket?.due_at ? selectedTicket.due_at.slice(0, 10) : '',
        category: selectedTicket?.category ?? '',
        tags: selectedTicket?.tags?.join(', ') ?? '',
    });

    useEffect(() => {
        updateForm.setData({
            status: selectedTicket?.status ?? statusOptions[0] ?? 'open',
            priority: selectedTicket?.priority ?? priorityOptions[1] ?? 'normal',
            assignee_id: selectedTicket?.assignee?.id ? String(selectedTicket.assignee.id) : '',
            due_at: selectedTicket?.due_at ? selectedTicket.due_at.slice(0, 10) : '',
            category: selectedTicket?.category ?? '',
            tags: selectedTicket?.tags?.join(', ') ?? '',
        });
    }, [selectedTicket, priorityOptions, statusOptions]);

    const newTicketForm = useForm({
        subject: '',
        description: '',
        priority: priorityOptions[1] ?? 'normal',
        assignee_id: '',
        category: '',
        due_at: '',
        tags: '',
    });

    const commentForm = useForm({
        body: '',
        is_internal: false,
    });

    const activeFilters = useMemo(() => filters, [filters]);

    const applyFilters = (
        payload: Record<string, string | number | undefined | null>,
        options: { merge?: boolean; preserveTicket?: boolean } = {},
    ) => {
        const { merge = true, preserveTicket = true } = options;
        const base = merge ? activeFilters : {};
        const combined: Record<string, string | number | undefined | null> = {
            ...base,
            ...payload,
        };

        if (preserveTicket && !('ticket' in payload) && selectedTicket) {
            combined.ticket = selectedTicket.id;
        }

        const query: Record<string, string | number> = {};

        Object.entries(combined)
            .filter(([, value]) => value !== '' && value !== null && value !== undefined)
            .forEach(([key, value]) => {
                query[key] = value as string | number;
            });

        router.get(ticketsRoute().url, query, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        applyFilters({ search, page: 1 });
    };

    const handleSelectTicket = (ticketId: number) => {
        applyFilters({ ticket: ticketId });
    };

    const goToPage = (page: number) => {
        applyFilters({ page });
    };

    const submitUpdate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedTicket) return;

        updateForm
            .transform((data) => ({
                ...data,
                assignee_id: data.assignee_id ? Number(data.assignee_id) : null,
                due_at: data.due_at || null,
                category: data.category || null,
                tags: data.tags
                    ? data.tags
                          .split(',')
                          .map((tag) => tag.trim())
                          .filter(Boolean)
                    : [],
            }))
            .patch(`/tickets/${selectedTicket.id}`, {
                preserveScroll: true,
            });
    };

    const submitNewTicket = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        newTicketForm
            .transform((data) => ({
                ...data,
                assignee_id: data.assignee_id ? Number(data.assignee_id) : null,
                due_at: data.due_at || null,
                category: data.category || null,
                tags: data.tags
                    ? data.tags
                          .split(',')
                          .map((tag) => tag.trim())
                          .filter(Boolean)
                    : [],
            }))
            .post(ticketsRoute().url, {
                preserveScroll: true,
                onSuccess: () => {
                    newTicketForm.reset();
                },
            });
    };

    const submitComment = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedTicket) return;

        commentForm.post(`/tickets/${selectedTicket.id}/comments`, {
            preserveScroll: true,
            onSuccess: () => {
                commentForm.reset();
            },
        });
    };

    const paginationFrom = tickets.meta.from ?? (tickets.data.length > 0 ? 1 : 0);
    const paginationTo = tickets.meta.to ?? tickets.data.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ticketing" />
            <div className="flex flex-1 flex-col gap-6 p-4 pb-10 lg:p-6">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Card className="border border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="text-xl">Active tickets</CardTitle>
                            <CardDescription>Across all queues</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-baseline justify-between gap-4">
                            <span className="text-4xl font-semibold text-foreground">
                                {stats.open + stats.inProgress + stats.waiting}
                            </span>
                            <div className="text-right text-sm text-muted-foreground">
                                <p>{stats.open} open</p>
                                <p>{stats.inProgress} in progress</p>
                                <p>{stats.waiting} waiting</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="text-xl">SLA health</CardTitle>
                            <CardDescription>Tickets nearing breach</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div>
                                <p className="text-4xl font-semibold text-foreground">{stats.slaBreachRate}%</p>
                                <p className="text-sm text-muted-foreground">At-risk workload</p>
                            </div>
                            <div className="flex flex-col items-end text-sm text-muted-foreground">
                                <span>{stats.dueSoon} due soon</span>
                                <span>{stats.unassigned} unassigned</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="text-xl">First response</CardTitle>
                            <CardDescription>Median minutes to first reply</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-semibold text-foreground">
                                {stats.avgFirstResponseMinutes || 0}
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Target: &lt; 15 minutes across onboarding &amp; success queues
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="text-xl">Resolution velocity</CardTitle>
                            <CardDescription>Closed within the last 7 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-semibold text-foreground">
                                {stats.resolvedThisWeek}
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {stats.reopened} reopened tickets need follow-up
                            </p>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-[2fr_3fr]">
                    <div className="flex flex-col gap-6">
                        <Card className="border border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader className="flex flex-row items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Queue overview</CardTitle>
                                    <CardDescription>
                                        Filter by priority, status, or owner to keep work aligned.
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => applyFilters({}, { merge: false, preserveTicket: false })}
                                >
                                    <Filter className="h-4 w-4" />
                                    Reset filters
                                </Button>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" onSubmit={handleSearch}>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="search">Search</Label>
                                        <Input
                                            id="search"
                                            placeholder="Find by subject, requester, or reference"
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label>Status</Label>
                                        <Select
                                            value={filters.status ?? ''}
                                            onValueChange={(value) =>
                                                applyFilters({ status: value === 'all' ? undefined : value, page: 1 })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All statuses</SelectItem>
                                                {statusOptions.map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {statusMeta[status]?.label ?? status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label>Priority</Label>
                                        <Select
                                            value={filters.priority ?? ''}
                                            onValueChange={(value) =>
                                                applyFilters({ priority: value === 'all' ? undefined : value, page: 1 })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All priorities" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All priorities</SelectItem>
                                                {priorityOptions.map((priority) => (
                                                    <SelectItem key={priority} value={priority}>
                                                        {priorityMeta[priority]?.label ?? priority}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label>Assignee</Label>
                                        <Select
                                            value={filters.assignee ?? ''}
                                            onValueChange={(value) =>
                                                applyFilters({ assignee: value === 'all' ? undefined : value, page: 1 })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All assignees" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All assignees</SelectItem>
                                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                                {assignees.map((assignee) => (
                                                    <SelectItem key={assignee.id} value={String(assignee.id)}>
                                                        {assignee.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label>Tags</Label>
                                        <Select
                                            value={filters.tag ?? ''}
                                            onValueChange={(value) =>
                                                applyFilters({ tag: value === 'all' ? undefined : value, page: 1 })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All tags" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All tags</SelectItem>
                                                {tags.map((tag) => (
                                                    <SelectItem key={tag} value={tag}>
                                                        #{tag}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-end">
                                        <Button type="submit" className="w-full">
                                            Apply search
                                        </Button>
                                    </div>
                                </form>

                                <div className="space-y-2">
                                    {tickets.data.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-sidebar-border/70 p-6 text-center text-sm text-muted-foreground dark:border-sidebar-border">
                                            No tickets match the current filters.
                                        </div>
                                    ) : (
                                        <ul className="space-y-2">
                                            {tickets.data.map((ticket) => {
                                                const isActive = selectedTicket?.id === ticket.id;
                                                const status = statusMeta[ticket.status];
                                                const priority = priorityMeta[ticket.priority];

                                                return (
                                                    <li key={ticket.id}>
                                                        <button
                                                            type="button"
                                                            className={cn(
                                                                'w-full rounded-lg border p-4 text-left transition-colors',
                                                                'border-sidebar-border/70 hover:bg-muted/50 dark:border-sidebar-border',
                                                                isActive && 'border-primary/70 bg-primary/5 dark:bg-primary/10',
                                                            )}
                                                            onClick={() => handleSelectTicket(ticket.id)}
                                                        >
                                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="flex items-center gap-2">
                                                                        {status && (
                                                                            <span className={cn('flex h-2 w-2 rounded-full', status.dot)} />
                                                                        )}
                                                                        <span className="font-medium text-foreground">
                                                                            {ticket.subject}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                                        <span>{ticket.reference}</span>
                                                                        <span>&middot;</span>
                                                                        <span>
                                                                            Updated {formatRelativeTime(ticket.last_activity_at ?? ticket.updated_at)}
                                                                        </span>
                                                                        {ticket.requester && (
                                                                            <>
                                                                                <span>&middot;</span>
                                                                                <span>{ticket.requester.name}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    {priority && (
                                                                        <Badge className={priority.badge}>{priority.label}</Badge>
                                                                    )}
                                                                    {status && (
                                                                        <Badge variant="outline" className="capitalize">
                                                                            {status.label}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                                {ticket.tags.map((tag) => (
                                                                    <Badge key={tag} variant="secondary" className="bg-muted px-2 py-0 text-xs">
                                                                        #{tag}
                                                                    </Badge>
                                                                ))}
                                                                {ticket.assignee && (
                                                                    <span className="flex items-center gap-2">
                                                                        <UserRoundCheck className="h-3.5 w-3.5" />
                                                                        {ticket.assignee.name}
                                                                    </span>
                                                                )}
                                                                {ticket.due_at && (
                                                                    <span className="flex items-center gap-2">
                                                                        <CalendarClock className="h-3.5 w-3.5" />
                                                                        Due {formatDateTime(ticket.due_at)}
                                                                    </span>
                                                                )}
                                                                <span className="flex items-center gap-2">
                                                                    <MessageCircle className="h-3.5 w-3.5" />
                                                                    {ticket.comment_count} replies
                                                                </span>
                                                            </div>
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="items-center justify-between text-sm text-muted-foreground">
                                <div>
                                    Showing {paginationFrom} – {paginationTo} of {tickets.meta.total}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => goToPage(Math.max(1, tickets.meta.current_page - 1))}
                                        disabled={tickets.meta.current_page <= 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            goToPage(
                                                tickets.meta.current_page >= tickets.meta.last_page
                                                    ? tickets.meta.last_page
                                                    : tickets.meta.current_page + 1,
                                            )
                                        }
                                        disabled={tickets.meta.current_page >= tickets.meta.last_page}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>

                        <Card className="border border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Plus className="h-4 w-4" />
                                    Create ticket
                                </CardTitle>
                                <CardDescription>Capture new requests directly from the command center.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4" onSubmit={submitNewTicket}>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-subject">Subject</Label>
                                        <Input
                                            id="new-subject"
                                            value={newTicketForm.data.subject}
                                            onChange={(event) => newTicketForm.setData('subject', event.target.value)}
                                            required
                                        />
                                        {newTicketForm.errors.subject && (
                                            <p className="text-sm text-destructive">{newTicketForm.errors.subject}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-description">Description</Label>
                                        <textarea
                                            id="new-description"
                                            value={newTicketForm.data.description}
                                            onChange={(event) => newTicketForm.setData('description', event.target.value)}
                                            className="min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            required
                                        />
                                        {newTicketForm.errors.description && (
                                            <p className="text-sm text-destructive">{newTicketForm.errors.description}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Priority</Label>
                                            <Select
                                                value={newTicketForm.data.priority}
                                                onValueChange={(value) => newTicketForm.setData('priority', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {priorityOptions.map((priority) => (
                                                        <SelectItem key={priority} value={priority}>
                                                            {priorityMeta[priority]?.label ?? priority}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Assignee</Label>
                                            <Select
                                                value={newTicketForm.data.assignee_id}
                                                onValueChange={(value) => newTicketForm.setData('assignee_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Auto assign" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">Auto assign</SelectItem>
                                                    {assignees.map((assignee) => (
                                                        <SelectItem key={assignee.id} value={String(assignee.id)}>
                                                            {assignee.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="new-category">Category</Label>
                                            <Input
                                                id="new-category"
                                                value={newTicketForm.data.category}
                                                onChange={(event) => newTicketForm.setData('category', event.target.value)}
                                                placeholder="Billing, onboarding..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new-due">Due date</Label>
                                            <Input
                                                id="new-due"
                                                type="date"
                                                value={newTicketForm.data.due_at}
                                                onChange={(event) => newTicketForm.setData('due_at', event.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-tags">Tags</Label>
                                        <Input
                                            id="new-tags"
                                            value={newTicketForm.data.tags}
                                            onChange={(event) => newTicketForm.setData('tags', event.target.value)}
                                            placeholder="vip, renewal, onboarding"
                                        />
                                        <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
                                    </div>
                                    {newTicketForm.errors.priority && (
                                        <p className="text-sm text-destructive">{newTicketForm.errors.priority}</p>
                                    )}
                                    {newTicketForm.errors.assignee_id && (
                                        <p className="text-sm text-destructive">{newTicketForm.errors.assignee_id}</p>
                                    )}
                                    <Button type="submit" className="w-full" disabled={newTicketForm.processing}>
                                        <Plus className="mr-2 h-4 w-4" /> Submit ticket
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-6">
                        <Card className="border border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between text-xl">
                                    <span>Ticket details</span>
                                    {selectedTicket && (
                                        <Badge className={statusMeta[selectedTicket.status]?.badge}>
                                            {statusMeta[selectedTicket.status]?.label ?? selectedTicket.status}
                                        </Badge>
                                    )}
                                </CardTitle>
                                {selectedTicket ? (
                                    <CardDescription className="flex flex-wrap items-center gap-2 text-sm">
                                        <span>#{selectedTicket.reference}</span>
                                        <span>&middot;</span>
                                        <span>Opened {formatDateTime(selectedTicket.created_at)}</span>
                                        {selectedTicket.requester && (
                                            <>
                                                <span>&middot;</span>
                                                <span>Requester: {selectedTicket.requester.name}</span>
                                            </>
                                        )}
                                    </CardDescription>
                                ) : (
                                    <CardDescription>Select a ticket from the queue to view details.</CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {selectedTicket ? (
                                    <>
                                        <div className="space-y-3">
                                            <h2 className="text-lg font-semibold text-foreground">
                                                {selectedTicket.subject}
                                            </h2>
                                            <p className="rounded-lg border border-sidebar-border/60 bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground dark:border-sidebar-border">
                                                {selectedTicket.description}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                {selectedTicket.tags.map((tag) => (
                                                    <Badge key={tag} variant="secondary" className="bg-muted px-2 py-0 text-xs">
                                                        #{tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <form className="grid gap-4 md:grid-cols-2" onSubmit={submitUpdate}>
                                            <div className="space-y-2">
                                                <Label>Status</Label>
                                                <Select
                                                    value={updateForm.data.status}
                                                    onValueChange={(value) => updateForm.setData('status', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statusOptions.map((status) => (
                                                            <SelectItem key={status} value={status}>
                                                                {statusMeta[status]?.label ?? status}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Priority</Label>
                                                <Select
                                                    value={updateForm.data.priority}
                                                    onValueChange={(value) => updateForm.setData('priority', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {priorityOptions.map((priority) => (
                                                            <SelectItem key={priority} value={priority}>
                                                                {priorityMeta[priority]?.label ?? priority}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Assignee</Label>
                                                <Select
                                                    value={updateForm.data.assignee_id}
                                                    onValueChange={(value) => updateForm.setData('assignee_id', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Unassigned" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="">Unassigned</SelectItem>
                                                        {assignees.map((assignee) => (
                                                            <SelectItem key={assignee.id} value={String(assignee.id)}>
                                                                {assignee.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Due date</Label>
                                                <Input
                                                    type="date"
                                                    value={updateForm.data.due_at}
                                                    onChange={(event) => updateForm.setData('due_at', event.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Category</Label>
                                                <Input
                                                    value={updateForm.data.category ?? ''}
                                                    onChange={(event) => updateForm.setData('category', event.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Tags</Label>
                                                <Input
                                                    value={updateForm.data.tags}
                                                    onChange={(event) => updateForm.setData('tags', event.target.value)}
                                                    placeholder="vip, billing, escalation"
                                                />
                                            </div>
                                            <div className="md:col-span-2 flex justify-end">
                                                <Button type="submit" disabled={updateForm.processing}>
                                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                                    Save updates
                                                </Button>
                                            </div>
                                        </form>
                                        <div className="grid gap-4 rounded-lg border border-dashed border-sidebar-border/70 p-4 text-sm text-muted-foreground dark:border-sidebar-border md:grid-cols-3">
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">First response</p>
                                                <p className="text-base font-medium text-foreground">
                                                    {selectedTicket.first_response_minutes != null
                                                        ? `${selectedTicket.first_response_minutes} minutes`
                                                        : 'Not sent'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Last activity</p>
                                                <p className="text-base font-medium text-foreground">
                                                    {formatRelativeTime(selectedTicket.last_activity_at)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Reopen count</p>
                                                <p className="text-base font-medium text-foreground">{selectedTicket.reopen_count}</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center rounded-lg border border-dashed border-sidebar-border/60 p-8 text-sm text-muted-foreground dark:border-sidebar-border">
                                        Pick a ticket to manage SLAs, assignments, and history.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle className="text-lg">Conversation timeline</CardTitle>
                                <CardDescription>Track every touchpoint, note, and automation signal.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {selectedTicket ? (
                                    <>
                                        <ul className="space-y-5">
                                            {selectedTicket.timeline.length === 0 ? (
                                                <li className="rounded-lg border border-dashed border-sidebar-border/70 p-6 text-center text-sm text-muted-foreground dark:border-sidebar-border">
                                                    No activity yet. Add a reply below to kick things off.
                                                </li>
                                            ) : (
                                                selectedTicket.timeline.map((item) => {
                                                    const Icon = timelineIcons[item.type] ?? Clock4;
                                                    return (
                                                        <li key={item.id} className="flex gap-3">
                                                            <div className="mt-1">
                                                                <Icon className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                                    {'actor' in item && item.actor ? (
                                                                        <span className="font-medium text-foreground">
                                                                            {item.actor.name}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="font-medium text-foreground">System</span>
                                                                    )}
                                                                    <span>&middot;</span>
                                                                    <span>{formatRelativeTime(item.created_at)}</span>
                                                                    <span className="uppercase tracking-wide text-muted-foreground">
                                                                        {item.type.replace(/_/g, ' ')}
                                                                    </span>
                                                                </div>
                                                                {'body' in item ? (
                                                                    <div
                                                                        className={cn(
                                                                            'rounded-lg border border-sidebar-border/60 bg-background p-4 text-sm leading-relaxed dark:border-sidebar-border',
                                                                            item.is_internal && 'bg-amber-500/5 text-amber-900 dark:text-amber-200',
                                                                        )}
                                                                    >
                                                                        {item.body}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {renderActivityDetails(item)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </li>
                                                    );
                                                })
                                            )}
                                        </ul>
                                        <form className="space-y-3" onSubmit={submitComment}>
                                            <div className="space-y-2">
                                                <Label htmlFor="reply-body">Add reply</Label>
                                                <textarea
                                                    id="reply-body"
                                                    value={commentForm.data.body}
                                                    onChange={(event) => commentForm.setData('body', event.target.value)}
                                                    className="min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                    placeholder="Share an update or internal note"
                                                    required
                                                />
                                                {commentForm.errors.body && (
                                                    <p className="text-sm text-destructive">{commentForm.errors.body}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Checkbox
                                                        checked={commentForm.data.is_internal}
                                                        onCheckedChange={(checked) =>
                                                            commentForm.setData('is_internal', Boolean(checked))
                                                        }
                                                    />
                                                    Internal note
                                                </label>
                                                <Button type="submit" disabled={commentForm.processing}>
                                                    <MessageSquareText className="mr-2 h-4 w-4" />
                                                    Send update
                                                </Button>
                                            </div>
                                        </form>
                                    </>
                                ) : (
                                    <div className="rounded-lg border border-dashed border-sidebar-border/60 p-6 text-center text-sm text-muted-foreground dark:border-sidebar-border">
                                        Select a ticket to review the activity history and collaborate.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader>
                                <CardTitle className="text-lg">Operations digest</CardTitle>
                                <CardDescription>Latest automation triggers, escalations, and assignments.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {recentActivity.data.length === 0 ? (
                                        <li className="rounded-lg border border-dashed border-sidebar-border/70 p-6 text-center text-sm text-muted-foreground dark:border-sidebar-border">
                                            No recent activity to surface.
                                        </li>
                                    ) : (
                                        recentActivity.data.map((activity) => (
                                            <li key={activity.id} className="flex items-start gap-3">
                                                <div className="mt-1">
                                                    <Activity className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm font-medium text-foreground">
                                                        {activity.ticket ? activity.ticket.subject : 'Ticket update'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {summarizeActivity(activity)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatRelativeTime(activity.created_at)}
                                                    </p>
                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}

function renderActivityDetails(item: TimelineActivity) {
    switch (item.type) {
        case 'status_changed':
            return `Status updated from ${statusMeta[item.details.from as string]?.label ?? item.details.from} to ${
                statusMeta[item.details.to as string]?.label ?? item.details.to
            }.`;
        case 'priority_changed':
            return `Priority set to ${priorityMeta[item.details.to as string]?.label ?? item.details.to}.`;
        case 'assignee_changed':
            return item.details.assignee_name
                ? `Assigned to ${item.details.assignee_name}.`
                : 'Ticket unassigned.';
        case 'due_date_changed':
            return item.details.due_at
                ? `Due by ${formatDateTime(item.details.due_at as string)}.`
                : 'Due date cleared.';
        case 'tags_updated':
            return Array.isArray(item.details.tags) && item.details.tags.length > 0
                ? `Tags updated: ${(item.details.tags as string[]).map((tag) => `#${tag}`).join(', ')}.`
                : 'Tags cleared.';
        case 'category_updated':
            return item.details.category
                ? `Category set to ${item.details.category as string}.`
                : 'Category cleared.';
        case 'internal_note_added':
            return 'Internal note logged.';
        case 'comment_added':
            return 'Public reply added.';
        case 'created':
            return 'Ticket created.';
        default:
            return 'Timeline update recorded.';
    }
}

function summarizeActivity(activity: RecentActivityItem) {
    switch (activity.type) {
        case 'status_changed':
            return `Status moved to ${statusMeta[activity.details.to as string]?.label ?? activity.details.to}`;
        case 'priority_changed':
            return `Priority now ${priorityMeta[activity.details.to as string]?.label ?? activity.details.to}`;
        case 'assignee_changed':
            return activity.details.assignee_name
                ? `Ownership transferred to ${activity.details.assignee_name}`
                : 'Ticket unassigned';
        case 'due_date_changed':
            return activity.details.due_at
                ? `Due ${formatDateTime(activity.details.due_at as string)}`
                : 'Due date cleared';
        case 'tags_updated':
            return Array.isArray(activity.details.tags) && activity.details.tags.length
                ? `Tags: ${(activity.details.tags as string[]).map((tag) => `#${tag}`).join(', ')}`
                : 'Tags cleared';
        case 'comment_added':
            return 'New customer response';
        case 'internal_note_added':
            return 'Internal note captured';
        case 'created':
            return 'Ticket created';
        default:
            return 'Workflow event logged';
    }
}
