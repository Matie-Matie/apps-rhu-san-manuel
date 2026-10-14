import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination, { PaginationLink } from '@/Components/Pagination';
import FadeIn from '@/Components/FadeIn';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface ActivityLog {
    id: number;
    user: { name: string } | null;
    action: string;
    description: string | null;
    created_at: string;
    received: {
        prescription_id: number;
        prescription_number: string;
        patient: string | null;
        dispensed_at: string;
        pharmacist: string | null;
        items: { medicine: string; strength: string | null; quantity: number }[];
    } | null;
}

interface LogsPaginator {
    data: ActivityLog[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

// ─── Action metadata: category chip + timeline dot color per action ───

const ACTION_META: Record<string, { label: string; dot: string; chip: string }> = {
    create_prescription: { label: 'Create', dot: 'bg-accent-500', chip: 'bg-accent-100 text-accent-700' },
    validated_prescription: { label: 'Validate', dot: 'bg-success', chip: 'bg-success-light text-success' },
    cancelled_prescription: { label: 'Cancel', dot: 'bg-amber-500', chip: 'bg-amber-100 text-amber-700' },
    dispense_prescription: { label: 'Dispense', dot: 'bg-success', chip: 'bg-success-light text-success' },
    create_patient: { label: 'Create', dot: 'bg-accent-500', chip: 'bg-accent-100 text-accent-700' },
    update_patient: { label: 'Update', dot: 'bg-soil-400', chip: 'bg-soil-100 text-soil-600' },
    delete_patient: { label: 'Delete', dot: 'bg-red-500', chip: 'bg-red-100 text-red-700' },
    create_medicine: { label: 'Create', dot: 'bg-accent-500', chip: 'bg-accent-100 text-accent-700' },
    update_medicine: { label: 'Update', dot: 'bg-soil-400', chip: 'bg-soil-100 text-soil-600' },
    delete_medicine: { label: 'Delete', dot: 'bg-red-500', chip: 'bg-red-100 text-red-700' },
    add_stock: { label: 'Stock', dot: 'bg-sky-500', chip: 'bg-sky-100 text-sky-700' },
    update_inventory: { label: 'Inventory', dot: 'bg-sky-500', chip: 'bg-sky-100 text-sky-700' },
    adjust_stock: { label: 'Stock', dot: 'bg-sky-500', chip: 'bg-sky-100 text-sky-700' },
    record_vitals: { label: 'Vitals', dot: 'bg-accent-500', chip: 'bg-accent-100 text-accent-700' },
};

const FALLBACK_META = { label: 'Activity', dot: 'bg-soil-400', chip: 'bg-soil-100 text-soil-600' };

// ─── Helpers ───

function initials(name: string) {
    const parts = name.trim().split(/\s+/);
    return `${(parts[0]?.[0] || '').toUpperCase()}${(parts[parts.length - 1]?.[0] || '').toUpperCase()}`;
}

function dayKey(iso: string) {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayLabel(key: string) {
    if (key === dayKey(new Date().toString())) return 'Today';
    if (key === dayKey(new Date(Date.now() - 86_400_000).toString())) return 'Yesterday';
    return new Date(`${key}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}

function timeAgo(iso: string) {
    const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Page ───

export default function ActivityLogsIndex({ logs, type }: { logs: LogsPaginator; type: 'all' | 'dispensed' }) {
    const setType = (t: 'all' | 'dispensed') =>
        router.get(route('activity-logs.index'), t === 'all' ? {} : { type: t }, { preserveScroll: true });

    // Group entries by local day, preserving latest-first order.
    const groups: { key: string; entries: ActivityLog[] }[] = [];
    logs.data.forEach((log) => {
        const key = dayKey(log.created_at);
        const last = groups[groups.length - 1];
        if (last && last.key === key) {
            last.entries.push(log);
        } else {
            groups.push({ key, entries: [log] });
        }
    });

    return (
        <AuthenticatedLayout header="Activity Logs">
            <Head title="Activity Logs" />
            <div className="page-content">
                <FadeIn y={18} duration={0.45}>
                    <div className="card overflow-hidden">
                        <div className="card-header">
                            <h2 className="text-base font-bold tracking-tight text-soil-900">Activity Feed</h2>
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1 rounded-full bg-soil-100 p-1">
                                    {([['all', 'All activity'], ['dispensed', 'Patient pick-ups']] as const).map(([key, label]) => (
                                        <button
                                            key={key}
                                            onClick={() => setType(key)}
                                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                                type === key ? 'bg-surface text-soil-900 shadow-sm' : 'text-soil-500 hover:text-soil-800'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold tabular-nums text-accent-700">
                                    {logs.total} {logs.total === 1 ? 'entry' : 'entries'}
                                </span>
                            </div>
                        </div>

                        {groups.length > 0 ? (
                            <div className="px-5 py-4">
                                {groups.map((group) => (
                                    <div key={group.key} className="mb-6 last:mb-0">
                                        <div className="mb-2 flex items-center gap-3">
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-soil-400">
                                                {dayLabel(group.key)}
                                            </span>
                                            <div className="h-px flex-1 bg-soil-100" />
                                        </div>

                                        <ul className="relative">
                                            {/* Timeline rail */}
                                            <div
                                                className="absolute bottom-4 left-[7px] top-4 w-px bg-soil-100"
                                                aria-hidden="true"
                                            />
                                            {group.entries.map((log, i) => {
                                                const meta = ACTION_META[log.action] ?? FALLBACK_META;
                                                const who = log.user?.name ?? 'System';
                                                return (
                                                    <motion.li
                                                        key={log.id}
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.04 * i, duration: 0.3, ease: 'easeOut' }}
                                                        className="relative flex gap-3 py-3 pl-0.5"
                                                    >
                                                        <span className="relative z-10 mt-1.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                                                            <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                                                        </span>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                                <span className="text-sm font-medium leading-snug text-soil-900">
                                                                    {log.description || meta.label}
                                                                </span>
                                                                <span
                                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.chip}`}
                                                                >
                                                                    {meta.label}
                                                                </span>
                                                            </div>
                                                            <div className="mt-1.5 flex items-center gap-2 text-xs text-soil-500">
                                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-soil-100 text-[9px] font-semibold text-soil-600">
                                                                    {initials(who)}
                                                                </span>
                                                                <span className="font-medium text-soil-600">{who}</span>
                                                                <span className="text-soil-300">·</span>
                                                                <time
                                                                    dateTime={log.created_at}
                                                                    title={new Date(log.created_at).toLocaleString()}
                                                                    className="tabular-nums"
                                                                >
                                                                    {timeAgo(log.created_at)}
                                                                </time>
                                                            </div>

                                                            {log.received && (
                                                                <div className="mt-2.5 rounded-control border border-success/30 bg-success-light/40 px-3 py-2.5">
                                                                    <p className="text-sm text-soil-900">
                                                                        <span className="font-semibold">{log.received.patient ?? 'Patient'}</span> received the medicine
                                                                        <span className="text-soil-500"> · {new Date(log.received.dispensed_at).toLocaleString()}</span>
                                                                    </p>
                                                                    <ul className="mt-1.5 space-y-0.5">
                                                                        {log.received.items.map((item, idx) => (
                                                                            <li key={idx} className="text-xs text-soil-700">
                                                                                <span className="font-medium text-soil-900">
                                                                                    {item.medicine}{item.strength ? ` ${item.strength}` : ''}
                                                                                </span>
                                                                                {' '}&times; {item.quantity}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 text-xs text-soil-500">
                                                                        {log.received.pharmacist && <span>Dispensed by {log.received.pharmacist}</span>}
                                                                        <Link href={route('prescriptions.show', log.received.prescription_id)} className="font-medium text-accent-600 hover:underline">
                                                                            {log.received.prescription_number}
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-soil-100 text-soil-400">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div className="text-sm font-medium text-soil-900">{type === 'dispensed' ? 'No pick-ups yet' : 'No activity yet'}</div>
                                <div className="text-xs text-soil-500">{type === 'dispensed' ? 'Medicines received by patients will appear here' : 'Actions across the system will appear here'}</div>
                            </div>
                        )}

                        <Pagination
                            links={logs.links}
                            currentPage={logs.current_page}
                            lastPage={logs.last_page}
                            from={logs.from}
                            to={logs.to}
                            total={logs.total}
                            itemLabel="entries"
                        />
                    </div>
                </FadeIn>
            </div>
        </AuthenticatedLayout>
    );
}
