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
import AppLayout from '@/layouts/app-layout';
import { dashboard, products as productsRoute } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    BarChart3,
    CheckCircle2,
    LifeBuoy,
    Package2,
    Rocket,
    ShieldCheck,
    Sparkles,
    Truck,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Products',
        href: productsRoute().url,
    },
];

const featuredProducts = [
    {
        name: 'SmartStack Analytics',
        description: 'Monitor usage trends and customer adoption across every module in one place.',
        price: '$99/mo',
        badge: 'Best seller',
        features: [
            'Unified customer journey dashboards',
            'Proactive anomaly detection alerts',
            'Role-based insights for every team',
        ],
    },
    {
        name: 'SmartStack Automation',
        description: 'Turn repeatable workflows into reliable automations with built-in approvals.',
        price: '$149/mo',
        badge: 'Automation suite',
        features: [
            'Drag-and-drop scenario builder',
            'Human-in-the-loop review queues',
            'Instant audit trails and reporting',
        ],
    },
    {
        name: 'SmartStack Launchpad',
        description: 'Accelerate go-to-market with templated product packages and guided onboarding.',
        price: '$79/mo',
        badge: 'New',
        features: [
            'Interactive customer onboarding checklists',
            'Pre-built integration and API templates',
            'Lifecycle messaging with milestone tracking',
        ],
    },
];

const highlights = [
    {
        title: 'Lifecycle-ready packaging',
        description:
            'Bundle features, entitlements, and pricing tiers into reusable product templates.',
        icon: Package2,
    },
    {
        title: 'Intelligent forecasting',
        description:
            'Predict adoption, expansion, and churn with machine learning tuned to your data.',
        icon: BarChart3,
    },
    {
        title: 'Continuous delivery support',
        description:
            'Coordinate launches with automated stakeholder updates and change management tools.',
        icon: Truck,
    },
];

const assurances = [
    {
        title: 'Enterprise-grade security',
        description: 'SOC 2 Type II, field-level encryption, and granular access controls.',
        icon: ShieldCheck,
    },
    {
        title: 'Launch concierge team',
        description: 'A dedicated product specialist partners with your team from kickoff to rollout.',
        icon: Rocket,
    },
    {
        title: '24/7 expert assistance',
        description: 'Global response team with <30 minute critical SLA and proactive monitoring.',
        icon: LifeBuoy,
    },
];

export default function Products() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="flex flex-1 flex-col gap-6 p-4 pb-10 lg:p-6">
                <section className="rounded-xl border border-sidebar-border/70 bg-background p-8 text-center shadow-sm dark:border-sidebar-border">
                    <div className="mx-auto flex max-w-3xl flex-col gap-4">
                        <div className="flex items-center justify-center gap-2">
                            <Badge variant="secondary" className="uppercase tracking-wide">
                                Platform suite
                            </Badge>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Sparkles className="h-4 w-4" />
                                Built for product-led teams
                            </div>
                        </div>
                        <h1 className="text-balance text-3xl font-semibold text-foreground sm:text-4xl">
                            Everything you need to launch and scale modern products
                        </h1>
                        <p className="text-pretty text-base text-muted-foreground">
                            Choose from curated SmartStack modules or tailor the entire suite to match your operating model.
                            Each product is designed to connect customer insights, activation, and retention out of the box.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Button size="lg">Start a guided trial</Button>
                            <Button size="lg" variant="outline">
                                Talk to sales
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                    <Card className="h-full border border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="items-start">
                            <Badge className="uppercase" variant="secondary">
                                Launch roadmap
                            </Badge>
                            <CardTitle className="text-2xl">Plan once, launch everywhere</CardTitle>
                            <CardDescription>
                                Layer automations, notifications, and rollout campaigns across every SmartStack module with a
                                single shared roadmap.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
                            <div className="rounded-lg border border-dashed border-sidebar-border/60 p-4 dark:border-sidebar-border">
                                <p className="font-medium text-foreground">Unified release milestones</p>
                                <p>
                                    Orchestrate engineering handoffs, enablement tasks, and customer announcements in one
                                    collaborative timeline.
                                </p>
                            </div>
                            <div className="rounded-lg border border-dashed border-sidebar-border/60 p-4 dark:border-sidebar-border">
                                <p className="font-medium text-foreground">Real-time adoption telemetry</p>
                                <p>
                                    Watch activation cohorts, seat utilization, and usage health update live as customers move
                                    through onboarding.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button variant="ghost" className="gap-2">
                                Explore roadmap templates
                                <Sparkles className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="h-full border border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="text-xl">Trusted delivery</CardTitle>
                            <CardDescription>
                                98% of SmartStack customers ship new value to their users within the first 60 days.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
                            {assurances.map((item) => (
                                <div key={item.title} className="flex items-start gap-3 rounded-lg bg-muted/60 p-4">
                                    <item.icon className="mt-1 h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-medium text-foreground">{item.title}</p>
                                        <p>{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {featuredProducts.map((product) => (
                        <Card
                            key={product.name}
                            className="h-full border border-sidebar-border/70 transition-shadow hover:shadow-md dark:border-sidebar-border"
                        >
                            <CardHeader className="gap-3">
                                <Badge variant="outline" className="w-fit uppercase tracking-wide">
                                    {product.badge}
                                </Badge>
                                <CardTitle className="text-lg">{product.name}</CardTitle>
                                <CardDescription>{product.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col gap-4">
                                <p className="text-2xl font-semibold text-foreground">{product.price}</p>
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    {product.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full">View product details</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </section>

                <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {highlights.map((highlight) => (
                        <Card
                            key={highlight.title}
                            className="border border-sidebar-border/70 bg-muted/40 dark:border-sidebar-border"
                        >
                            <CardHeader className="flex-row items-center gap-4">
                                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <highlight.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">{highlight.title}</CardTitle>
                                    <CardDescription>{highlight.description}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </section>
            </div>
        </AppLayout>
    );
}
