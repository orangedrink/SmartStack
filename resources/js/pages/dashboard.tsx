import { Icon } from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    CalendarDays,
    DollarSign,
    Gauge,
    MessageSquareText,
    ShoppingBag,
    Sparkles,
    Users,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

type Metric = {
    id: string;
    title: string;
    value: string;
    change: string;
    changeDescription: string;
    trending: 'up' | 'down';
    icon: typeof Gauge;
    accent: string;
};

type RevenuePoint = {
    label: string;
    value: number;
};

type ChannelPerformance = {
    id: string;
    name: string;
    value: number;
    change: string;
    trending: 'up' | 'down';
    color: string;
};

type Order = {
    id: string;
    customer: string;
    date: string;
    total: string;
    status: 'Processing' | 'Shipped' | 'Delivered';
    statusTone: 'info' | 'success' | 'warning';
};

type TeamUpdate = {
    id: string;
    owner: string;
    focus: string;
    progress: number;
};

type ActivityItem = {
    id: string;
    title: string;
    time: string;
    summary: string;
};

const metrics: Metric[] = [
    {
        id: 'revenue',
        title: 'Monthly Revenue',
        value: '$128,920',
        change: '+12.4%',
        changeDescription: 'vs. previous month',
        trending: 'up',
        icon: DollarSign,
        accent: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
    },
    {
        id: 'customers',
        title: 'Active Customers',
        value: '8,942',
        change: '+3.1%',
        changeDescription: 'new sign-ups this week',
        trending: 'up',
        icon: Users,
        accent: 'bg-blue-500/10 text-blue-500 dark:text-blue-400',
    },
    {
        id: 'orders',
        title: 'Orders Fulfilled',
        value: '1,204',
        change: '-1.8%',
        changeDescription: 'orders delayed yesterday',
        trending: 'down',
        icon: ShoppingBag,
        accent: 'bg-amber-500/10 text-amber-500 dark:text-amber-300',
    },
    {
        id: 'conversion',
        title: 'Conversion Rate',
        value: '4.87%',
        change: '+0.6%',
        changeDescription: 'improvement this quarter',
        trending: 'up',
        icon: Gauge,
        accent: 'bg-purple-500/10 text-purple-500 dark:text-purple-300',
    },
];

const revenueTrend: RevenuePoint[] = [
    { label: 'Mar', value: 68_200 },
    { label: 'Apr', value: 72_100 },
    { label: 'May', value: 74_680 },
    { label: 'Jun', value: 79_450 },
    { label: 'Jul', value: 86_390 },
    { label: 'Aug', value: 90_120 },
    { label: 'Sep', value: 93_870 },
    { label: 'Oct', value: 97_430 },
    { label: 'Nov', value: 102_510 },
    { label: 'Dec', value: 109_880 },
    { label: 'Jan', value: 118_200 },
    { label: 'Feb', value: 128_920 },
];

const channelPerformance: ChannelPerformance[] = [
    {
        id: 'email',
        name: 'Lifecycle Email',
        value: 42,
        change: '+5.4%',
        trending: 'up',
        color: 'bg-emerald-500',
    },
    {
        id: 'ads',
        name: 'Paid Advertising',
        value: 33,
        change: '+2.1%',
        trending: 'up',
        color: 'bg-blue-500',
    },
    {
        id: 'affiliates',
        name: 'Affiliate Partners',
        value: 16,
        change: '-0.8%',
        trending: 'down',
        color: 'bg-amber-500',
    },
    {
        id: 'organic',
        name: 'Organic Social',
        value: 9,
        change: '+1.6%',
        trending: 'up',
        color: 'bg-purple-500',
    },
];

const recentOrders: Order[] = [
    {
        id: 'PO-009381',
        customer: 'Evergreen Outfitters',
        date: 'Mar 3, 2025',
        total: '$4,890.00',
        status: 'Processing',
        statusTone: 'info',
    },
    {
        id: 'PO-009379',
        customer: 'Brightside Studio',
        date: 'Mar 2, 2025',
        total: '$1,240.00',
        status: 'Shipped',
        statusTone: 'success',
    },
    {
        id: 'PO-009376',
        customer: 'Northwind Supply',
        date: 'Mar 1, 2025',
        total: '$9,320.00',
        status: 'Delivered',
        statusTone: 'success',
    },
    {
        id: 'PO-009365',
        customer: 'Lighthouse Goods',
        date: 'Feb 27, 2025',
        total: '$2,180.00',
        status: 'Processing',
        statusTone: 'info',
    },
];

const teamFocus: TeamUpdate[] = [
    {
        id: 'cx',
        owner: 'Customer Experience',
        focus: 'Reduce response times to < 4h',
        progress: 72,
    },
    {
        id: 'growth',
        owner: 'Growth Team',
        focus: 'Launch retention cohort playbook',
        progress: 54,
    },
    {
        id: 'ops',
        owner: 'Operations',
        focus: 'Automate supplier reconciliation',
        progress: 38,
    },
];

const activityFeed: ActivityItem[] = [
    {
        id: 'activity-1',
        title: 'Wholesale order approved',
        time: '32 minutes ago',
        summary: 'Finance cleared PO-009381 for fulfillment and triggered supplier notifications.',
    },
    {
        id: 'activity-2',
        title: 'Returns workflow updated',
        time: '2 hours ago',
        summary: 'Operations rolled out the new 3-step return policy with automated restock notices.',
    },
    {
        id: 'activity-3',
        title: 'Lifecycle campaign launched',
        time: 'Yesterday 4:12 PM',
        summary: 'Growth activated the “March warm leads” sequence targeting 3.2k customers.',
    },
];

const revenueMax = Math.max(...revenueTrend.map((entry) => entry.value));
const chartWidth = 100;
const chartHeight = 60;
const chartTopPadding = 6;
const chartBottomPadding = 8;
const chartUsableHeight = chartHeight - chartTopPadding - chartBottomPadding;

const revenuePolyline = revenueTrend
    .map((point, index) => {
        const x = (index / (revenueTrend.length - 1)) * chartWidth;
        const y =
            chartHeight -
            chartBottomPadding -
            (point.value / revenueMax) * chartUsableHeight;
        return `${x},${y}`;
    })
    .join(' ');

const revenueArea = `0,${chartHeight - chartBottomPadding} ${revenuePolyline} ${chartWidth},${chartHeight - chartBottomPadding}`;

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {metrics.map((metric) => {
                        const TrendIcon = metric.trending === 'up' ? ArrowUpRight : ArrowDownRight;

                        return (
                            <Card key={metric.id} className="border-sidebar-border/70 dark:border-sidebar-border">
                                <CardHeader className="flex flex-row items-start justify-between">
                                    <div>
                                        <CardTitle className="text-base text-muted-foreground">
                                            {metric.title}
                                        </CardTitle>
                                        <p className="mt-2 text-2xl font-semibold text-foreground">{metric.value}</p>
                                    </div>
                                    <span
                                        className={`inline-flex size-10 items-center justify-center rounded-full ${metric.accent}`}
                                    >
                                        <Icon iconNode={metric.icon} className="h-5 w-5" />
                                    </span>
                                </CardHeader>
                                <CardFooter className="flex items-center justify-between px-6 pb-6 pt-0">
                                    <span
                                        className={`inline-flex items-center gap-1 text-sm font-medium ${
                                            metric.trending === 'up'
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-rose-500 dark:text-rose-400'
                                        }`}
                                    >
                                        <Icon iconNode={TrendIcon} className="h-4 w-4" />
                                        {metric.change}
                                    </span>
                                    <span className="text-sm text-muted-foreground">{metric.changeDescription}</span>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </section>

                <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle>Revenue trajectory</CardTitle>
                                <CardDescription>
                                    Tracking the trailing 12 month revenue run rate including wholesale commitments.
                                </CardDescription>
                            </div>
                            <Badge className="bg-primary/10 text-primary shadow-none dark:bg-primary/20">Forecast: +9.8%</Badge>
                        </CardHeader>
                        <CardContent className="mt-2 space-y-6">
                            <div className="relative h-56 overflow-hidden rounded-xl border border-border/60 bg-muted/40 p-4 dark:border-sidebar-border dark:bg-muted/10">
                                <svg
                                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                    className="h-full w-full text-primary"
                                    preserveAspectRatio="none"
                                    role="img"
                                    aria-label="Revenue trend line chart"
                                >
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <polyline
                                        points={revenuePolyline}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                    />
                                    <polygon points={revenueArea} fill="url(#revenueGradient)" />
                                    {revenueTrend.map((point, index) => {
                                        const x = (index / (revenueTrend.length - 1)) * chartWidth;
                                        const y =
                                            chartHeight -
                                            chartBottomPadding -
                                            (point.value / revenueMax) * chartUsableHeight;

                                        return (
                                            <circle
                                                key={point.label}
                                                cx={x}
                                                cy={y}
                                                r={1.6}
                                                className="fill-background stroke-current"
                                                strokeWidth={0.8}
                                            />
                                        );
                                    })}
                                </svg>
                                <div className="absolute inset-x-4 bottom-4 flex justify-between text-xs text-muted-foreground">
                                    {revenueTrend.map((point, index) => (
                                        <span key={point.label} className={index % 2 === 0 ? 'opacity-100' : 'opacity-40'}>
                                            {point.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Committed wholesale pipeline</p>
                                    <p className="mt-1 text-lg font-semibold">$312,400</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Average order value</p>
                                    <p className="mt-1 text-lg font-semibold">$412.18</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Net revenue retention</p>
                                    <p className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400">118%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Channel performance</CardTitle>
                            <CardDescription>Share of total revenue attributed to each growth channel.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {channelPerformance.map((channel) => {
                                const TrendIcon = channel.trending === 'up' ? ArrowUpRight : ArrowDownRight;
                                const percentage = `${channel.value}%`;

                                return (
                                    <div key={channel.id} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm font-medium">
                                            <span>{channel.name}</span>
                                            <span className="text-muted-foreground">{percentage}</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted">
                                            <div
                                                className={`h-full rounded-full ${channel.color}`}
                                                style={{ width: percentage }}
                                            />
                                        </div>
                                        <div
                                            className={`flex items-center gap-1 text-xs font-medium ${
                                                channel.trending === 'up'
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-rose-500 dark:text-rose-400'
                                            }`}
                                        >
                                            <Icon iconNode={TrendIcon} className="h-3.5 w-3.5" />
                                            {channel.change}
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                        <CardFooter className="flex items-center gap-2 px-6 pb-6 pt-0 text-xs text-muted-foreground">
                            <Icon iconNode={Activity} className="h-3.5 w-3.5" />
                            Last update synced 14 minutes ago
                        </CardFooter>
                    </Card>
                </section>

                <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Recent wholesale orders</CardTitle>
                                <CardDescription>Key accounts that closed in the last 7 days.</CardDescription>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                Export CSV
                            </Badge>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border/70 text-muted-foreground dark:border-sidebar-border">
                                        <th className="py-3 pr-6 font-medium">Order</th>
                                        <th className="py-3 pr-6 font-medium">Customer</th>
                                        <th className="py-3 pr-6 font-medium">Date</th>
                                        <th className="py-3 pr-6 font-medium text-right">Total</th>
                                        <th className="py-3 font-medium text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b border-border/60 last:border-0 dark:border-sidebar-border/60">
                                            <td className="py-3 pr-6 font-medium text-foreground">{order.id}</td>
                                            <td className="py-3 pr-6 text-muted-foreground">{order.customer}</td>
                                            <td className="py-3 pr-6 text-muted-foreground">{order.date}</td>
                                            <td className="py-3 pr-6 text-right font-medium">{order.total}</td>
                                            <td className="py-3 text-right">
                                                <Badge
                                                    variant={order.statusTone === 'warning' ? 'outline' : 'secondary'}
                                                    className={
                                                        order.statusTone === 'success'
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                            : order.statusTone === 'info'
                                                            ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                                                            : 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300'
                                                    }
                                                >
                                                    {order.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Team focus this sprint</CardTitle>
                            <CardDescription>In-flight initiatives surfaced during Monday's standup.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {teamFocus.map((item) => (
                                <div key={item.id} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm font-medium">
                                        <span>{item.owner}</span>
                                        <span className="text-muted-foreground">{item.progress}%</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{item.focus}</p>
                                    <div className="h-2 rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className="flex items-center gap-2 px-6 pb-6 pt-0 text-xs text-muted-foreground">
                            <Icon iconNode={CalendarDays} className="h-3.5 w-3.5" />
                            Sprint demo scheduled for March 14
                        </CardFooter>
                    </Card>
                </section>

                <section>
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle>Latest signals</CardTitle>
                                <CardDescription>Cross-team alerts that landed in the shared SmartStack channel.</CardDescription>
                            </div>
                            <Badge variant="secondary" className="gap-1 text-xs">
                                <Icon iconNode={MessageSquareText} className="h-3.5 w-3.5" />
                                8 unread threads
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {activityFeed.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`flex flex-col gap-2 border-l pl-4 text-sm ${
                                        index === activityFeed.length - 1 ? 'border-transparent' : 'border-border/60 dark:border-sidebar-border/60'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-foreground">{item.title}</p>
                                        <span className="text-xs text-muted-foreground">{item.time}</span>
                                    </div>
                                    <p className="text-muted-foreground">{item.summary}</p>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className="flex items-center justify-between px-6 pb-6 pt-0 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                                <Icon iconNode={Sparkles} className="h-3.5 w-3.5" />
                                Smart automation muted 3 non-actionable alerts
                            </span>
                            <span>Updated just now</span>
                        </CardFooter>
                    </Card>
                </section>
            </div>
        </AppLayout>
    );
}

