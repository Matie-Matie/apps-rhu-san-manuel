import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FadeIn from '@/Components/FadeIn';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

// ─── Icons ───

type IconProps = { className?: string };

const IconDocument = ({ className }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const IconUsers = ({ className }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
);

const IconCheckCircle = ({ className }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconBag = ({ className }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

const IconAlert = ({ className }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

const IconClock = ({ className }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconXCircle = ({ className }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconChevron = ({ className }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

const IconShieldCheck = ({ className }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
);

// ─── Helpers ───

function initialsOf(...parts: (string | undefined)[]) {
    return parts
        .filter(Boolean)
        .map((p) => p![0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
}

function Greeting({ subtitle }: { subtitle: string }) {
    const name = String((usePage().props.auth as any)?.user?.name ?? '')
        .replace(/^Dr\.\s*/i, '')
        .split(/\s+/)[0];

    const today = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <FadeIn className="mb-6">
            <div className="section-label">{today}</div>
            <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-soil-900">
                {greeting()}, {name || 'there'}
            </h2>
            <p className="mt-1 text-sm text-soil-500">{subtitle}</p>
        </FadeIn>
    );
}

// ─── Stat Card ───

const cardTints = {
    accent: 'bg-accent-100 text-accent-700',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
    error: 'bg-error-light text-error',
    info: 'bg-info-light text-info',
};

function StatCard({
    label,
    value,
    href,
    icon,
    tint = 'accent',
    foot,
    delay,
}: {
    label: string;
    value: React.ReactNode;
    href?: string | null;
    icon: (props: IconProps) => React.ReactNode;
    tint?: keyof typeof cardTints;
    foot?: React.ReactNode;
    delay: number;
}) {
    const Icon = icon;

    const inner = (
        <>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="stat-label">{label}</div>
                    <div className="stat-value mt-1.5">{value}</div>
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${cardTints[tint]}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            {foot}
        </>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4, ease: 'easeOut' }}
            style={{ willChange: 'transform, opacity' }}
            className="h-full"
        >
            {href ? (
                <Link href={href} className="stat-card block h-full">
                    {inner}
                </Link>
            ) : (
                <div className="stat-card h-full">{inner}</div>
            )}
        </motion.div>
    );
}

function MiniBar({ pct, delay = 0.5, tone = 'bg-accent-500' }: { pct: number; delay?: number; tone?: string }) {
    return (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-soil-100">
            <motion.div
                className={`h-full rounded-full ${tone}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                transition={{ delay, duration: 0.7, ease: 'easeOut' }}
            />
        </div>
    );
}

// ─── Doctor Dashboard ───

function DoctorDashboard({ stats }: any) {
    const dispensedPct = stats.my_prescriptions_total
        ? Math.round((stats.my_dispensed / stats.my_prescriptions_total) * 100)
        : 0;

    const cards = [
        {
            label: 'My Prescriptions',
            value: stats.my_prescriptions_total,
            href: route('prescriptions.index'),
            icon: IconDocument,
            tint: 'accent' as const,
            foot: (
                <>
                    <MiniBar pct={dispensedPct} />
                    <div className="stat-foot">{stats.my_dispensed} dispensed ({dispensedPct}%)</div>
                </>
            ),
        },
        {
            label: 'Pending',
            value: stats.my_pending,
            href: route('prescriptions.index', { status: 'pending' }),
            icon: IconClock,
            tint: 'warning' as const,
            foot: <div className="stat-foot mt-3">Awaiting fulfillment</div>,
        },
        {
            label: 'Dispensed',
            value: stats.my_dispensed,
            href: route('prescriptions.index', { status: 'dispensed' }),
            icon: IconBag,
            tint: 'success' as const,
            foot: <div className="stat-foot mt-3">Successfully fulfilled</div>,
        },
        {
            label: 'Total Patients',
            value: stats.total_patients,
            href: route('patients.index'),
            icon: IconUsers,
            tint: 'info' as const,
            foot: <div className="stat-foot mt-3">Patients on record</div>,
        },
    ];

    return (
        <div className="page-content">
            <Greeting subtitle="Here is what is happening with your practice today." />

            {/* Stats grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card, i) => (
                    <StatCard key={card.label} {...card} delay={0.05 * i} />
                ))}
            </div>

            {/* Recent + Quick actions */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <FadeIn delay={0.2} className="lg:col-span-2">
                    <div className="card overflow-hidden">
                        <div className="card-header">
                            <h2 className="card-title">Recent Prescriptions</h2>
                        </div>
                        <div className="p-0">
                            <div className="table-container rounded-none border-0 shadow-none">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Patient</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.my_recent.map((rx: any, i: number) => (
                                            <motion.tr
                                                key={rx.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.03 * i, duration: 0.3 }}
                                            >
                                                <td>
                                                    <Link href={route('prescriptions.show', rx.id)} className="table-link">
                                                        {rx.prescription_number}
                                                    </Link>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-accent-100 text-[11px] font-semibold text-accent-700">
                                                            {initialsOf(rx.patient.first_name, rx.patient.last_name)}
                                                        </div>
                                                        <span className="font-medium text-soil-900">
                                                            {rx.patient.first_name} {rx.patient.last_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge badge-${rx.status}`}>{rx.status}</span>
                                                </td>
                                                <td className="text-soil-500">
                                                    {new Date(rx.created_at).toLocaleDateString()}
                                                </td>
                                            </motion.tr>
                                        ))}
                                        {stats.my_recent.length === 0 && (
                                            <tr>
                                                <td colSpan={4}>
                                                    <div className="flex flex-col items-center gap-3 px-5 py-12">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-accent-100 text-accent-600">
                                                            <IconDocument className="h-6 w-6" />
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-sm font-medium text-soil-900">No prescriptions yet</div>
                                                            <div className="mt-1 text-xs text-soil-500">Write your first prescription to get started</div>
                                                        </div>
                                                        <Link href={route('prescriptions.create')} className="btn btn-primary btn-sm">
                                                            New Prescription
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                <FadeIn delay={0.25}>
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Quick Actions</h2>
                        </div>
                        <div className="p-3">
                            <Link
                                href={route('prescriptions.create')}
                                className="group flex items-center gap-3 rounded-control px-2.5 py-2.5 transition-colors duration-150 hover:bg-accent-50"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-control bg-accent-100 text-accent-700">
                                    <IconDocument className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-soil-900">New Prescription</div>
                                    <div className="text-xs text-soil-500">Write a prescription</div>
                                </div>
                                <IconChevron className="h-4 w-4 text-soil-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent-500" />
                            </Link>
                            <Link
                                href={route('patients.index')}
                                className="group flex items-center gap-3 rounded-control px-2.5 py-2.5 transition-colors duration-150 hover:bg-accent-50"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-control bg-accent-100 text-accent-700">
                                    <IconUsers className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-soil-900">Find Patient</div>
                                    <div className="text-xs text-soil-500">Search records</div>
                                </div>
                                <IconChevron className="h-4 w-4 text-soil-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent-500" />
                            </Link>
                            <Link
                                href={route('prescriptions.index')}
                                className="group flex items-center gap-3 rounded-control px-2.5 py-2.5 transition-colors duration-150 hover:bg-accent-50"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-control bg-accent-100 text-accent-700">
                                    <IconClock className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-soil-900">Prescription History</div>
                                    <div className="text-xs text-soil-500">View past prescriptions</div>
                                </div>
                                <IconChevron className="h-4 w-4 text-soil-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent-500" />
                            </Link>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}

// ─── Pharmacist Dashboard ───

function PharmacistDashboard({ stats }: any) {
    const cards = [
        {
            label: 'Pending Rx',
            value: stats.pending_prescriptions,
            href: route('prescriptions.index', { status: 'pending' }),
            icon: IconDocument,
            tint: 'warning' as const,
            foot: <div className="stat-foot mt-3">Waiting to be dispensed</div>,
        },
        {
            label: 'Dispensed Today',
            value: stats.dispensed_today,
            href: null,
            icon: IconBag,
            tint: 'success' as const,
            foot: <div className="stat-foot mt-3">Items handed out</div>,
        },
        {
            label: 'Low Stock',
            value: stats.low_stock_count,
            href: route('inventory.index', { filter: 'low_stock' }),
            icon: IconAlert,
            tint: 'error' as const,
            foot: (
                <div className="stat-foot mt-3">
                    {stats.out_of_stock_count > 0 ? `${stats.out_of_stock_count} completely out of stock` : 'Below reorder levels'}
                </div>
            ),
        },
        {
            label: 'Expiring Soon',
            value: stats.expiring_count,
            href: route('inventory.index', { filter: 'expiring_soon' }),
            icon: IconClock,
            tint: 'info' as const,
            foot: <div className="stat-foot mt-3">Within the next 30 days</div>,
        },
    ];

    return (
        <div className="page-content">
            <Greeting subtitle="Here is what needs your attention at the pharmacy today." />

            {/* Stats grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card, i) => (
                    <StatCard key={card.label} {...card} delay={0.05 * i} />
                ))}
            </div>

            {/* Pending + alerts */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <FadeIn delay={0.2}>
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Pending Prescriptions</h2>
                            <Link
                                href={route('prescriptions.index', { status: 'pending' })}
                                className="text-sm font-medium text-accent-600 transition-colors duration-150 hover:text-accent-700"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="p-3">
                            {stats.pending_list.map((rx: any, i: number) => (
                                <motion.div
                                    key={rx.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.03 * i, duration: 0.3, ease: 'easeOut' }}
                                >
                                    <Link
                                        href={route('prescriptions.show', rx.id)}
                                        className="flex items-center gap-3 rounded-control px-2.5 py-2.5 transition-colors duration-150 hover:bg-accent-50"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-warning-light text-[11px] font-semibold text-warning">
                                            {initialsOf(rx.patient.first_name, rx.patient.last_name)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-medium text-soil-900">{rx.prescription_number}</div>
                                            <div className="truncate text-xs text-soil-500">
                                                {rx.patient.first_name} {rx.patient.last_name} &middot; Dr. {rx.doctor.name}
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <div className="text-xs tabular-nums text-soil-500">
                                                {new Date(rx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <span className="badge badge-pending mt-1">Pending</span>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                            {stats.pending_list.length === 0 && (
                                <div className="flex flex-col items-center gap-3 px-4 py-10">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-success-light text-success">
                                        <IconCheckCircle className="h-6 w-6" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-medium text-soil-900">All caught up</div>
                                        <div className="mt-1 text-xs text-soil-500">No pending prescriptions right now</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </FadeIn>

                <FadeIn delay={0.25}>
                    <div className="space-y-6">
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">Low Stock Items</h2>
                                <Link
                                    href={route('inventory.index', { filter: 'low_stock' })}
                                    className="text-sm font-medium text-accent-600 transition-colors duration-150 hover:text-accent-700"
                                >
                                    Manage
                                </Link>
                            </div>
                            <div className="p-3">
                                {stats.low_stock_list.map((item: any) => {
                                    const pct = item.reorder_level
                                        ? Math.round((item.quantity / item.reorder_level) * 100)
                                        : 100;
                                    return (
                                        <div key={item.id} className="rounded-control px-2.5 py-2.5">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-medium text-soil-900">
                                                        {item.medicine?.generic_name}
                                                    </div>
                                                    <div className="mt-0.5 text-xs text-soil-400">
                                                        Reorder at {item.reorder_level}
                                                    </div>
                                                </div>
                                                <span className={`badge shrink-0 ${pct <= 25 ? 'badge-low-stock' : 'badge-pending'}`}>
                                                    {item.quantity} left
                                                </span>
                                            </div>
                                            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-soil-100">
                                                <motion.div
                                                    className={`h-full rounded-full ${pct <= 25 ? 'bg-error' : 'bg-warning'}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                {stats.low_stock_list.length === 0 && (
                                    <div className="flex flex-col items-center gap-3 px-4 py-10">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-success-light text-success">
                                            <IconShieldCheck className="h-6 w-6" />
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-medium text-soil-900">Stock is healthy</div>
                                            <div className="mt-1 text-xs text-soil-500">All items are above reorder levels</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {stats.expiring_list.length > 0 && (
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title">Expiring Within 30 Days</h2>
                                    <Link
                                        href={route('inventory.index', { filter: 'expiring_soon' })}
                                        className="text-sm font-medium text-accent-600 transition-colors duration-150 hover:text-accent-700"
                                    >
                                        Manage
                                    </Link>
                                </div>
                                <div className="p-3">
                                    {stats.expiring_list.map((item: any) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 rounded-control px-2.5 py-2.5"
                                        >
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-info-light text-info">
                                                <IconClock className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1 truncate text-sm font-medium text-soil-900">
                                                {item.medicine?.generic_name}
                                            </div>
                                            <span className="badge badge-pending shrink-0">
                                                Exp {new Date(item.expiry_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {stats.out_of_stock_list.length > 0 && (
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title">Out of Stock</h2>
                                </div>
                                <div className="p-3">
                                    {stats.out_of_stock_list.map((item: any) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 rounded-control px-2.5 py-2.5"
                                        >
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-error-light text-error">
                                                <IconXCircle className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1 truncate text-sm font-medium text-soil-900">
                                                {item.medicine?.generic_name}
                                            </div>
                                            <span className="badge badge-out-of-stock shrink-0">Out of stock</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}

// ─── Main Dashboard ───

export default function Dashboard({ stats, role }: { stats: any; role: string }) {
    return (
        <AuthenticatedLayout
            header={
                role === 'pharmacist' ? 'Pharmacy Dashboard' : 'Doctor Dashboard'
            }
        >
            <Head title="Dashboard" />

            {role === 'pharmacist' ? (
                <PharmacistDashboard stats={stats} />
            ) : (
                <DoctorDashboard stats={stats} />
            )}
        </AuthenticatedLayout>
    );
}
