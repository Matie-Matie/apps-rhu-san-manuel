import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FadeIn from '@/Components/FadeIn';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';

// ─── Helpers ───

function toISODate(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function parseDay(day: string) {
    const [y, m, d] = day.split('-').map(Number);
    return { y, m, d };
}

function dayLabel(day: string, withMonth = false) {
    const { m, d } = parseDay(day);
    if (withMonth) {
        return `${new Date(0, m - 1).toLocaleDateString('en-US', { month: 'short' })} ${d}`;
    }
    return String(d);
}

// ─── Icons ───

const IconDocument = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const IconBag = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

const IconTrending = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
);

const IconCalendar = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
);

// ─── Page ───

const PERIODS: { key: string; label: string }[] = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'quarterly', label: 'Quarterly' },
    { key: 'annual', label: 'Annual' },
    { key: 'custom', label: 'Custom' },
];

export default function ReportsIndex({ period, range, report, dailyData, dispensedDailyData }: any) {
    const [startDate, setStartDate] = useState(range.start_date);
    const [endDate, setEndDate] = useState(range.end_date);

    const stats = report;
    const topMedicines = report.top_medicines;

    const go = (params: Record<string, string>) => router.get(route('reports.index'), params, { preserveScroll: true });

    const printParams = () =>
        period === 'custom'
            ? { period, start_date: range.start_date, end_date: range.end_date }
            : { period, date: range.anchor };

    const openPrint = () => window.open(route('reports.print', printParams()), '_blank');

    const maxDispensed = Math.max(...topMedicines.map((m: any) => Number(m.dispensed_quantity) || 0), 1);
    const maxDiagnosis = Math.max(...report.top_diagnoses.map((d: any) => Number(d.count) || 0), 1);

    // Build a continuous 30-day series (today inclusive), filling zero days.
    const byDay = new Map<string, number>(dailyData.map((d: any) => [String(d.day), Number(d.total)]));
    const byDispensedDay = new Map<string, number>((dispensedDailyData ?? []).map((d: any) => [String(d.day), Number(d.total)]));
    const days: { day: string; prescribed: number; dispensed: number }[] = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = toISODate(d);
        days.push({ day: key, prescribed: byDay.get(key) ?? 0, dispensed: byDispensedDay.get(key) ?? 0 });
    }
    const maxDaily = Math.max(...days.flatMap((d) => [d.prescribed, d.dispensed]), 1);
    const hasDailyData = days.some((d) => d.prescribed > 0 || d.dispensed > 0);

    const navBtn = 'inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-soil-200 text-soil-600 transition-colors hover:bg-soil-100 disabled:cursor-not-allowed disabled:opacity-40';

    return (
        <AuthenticatedLayout header="Reports">
            <Head title="Reports" />
            <div className="page-content">
                {/* Period controls */}
                <FadeIn>
                    <div className="mb-6 card">
                        <div className="card-body space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap gap-1.5">
                                    {PERIODS.map((p) => (
                                        <button
                                            key={p.key}
                                            onClick={() => (p.key === 'custom' ? go({ period: 'custom', start_date: range.start_date, end_date: range.end_date }) : go({ period: p.key, date: range.anchor }))}
                                            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
                                                period === p.key
                                                    ? 'border-accent-500 bg-accent-500 text-white'
                                                    : 'border-soil-200 text-soil-600 hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700'
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={openPrint} className="btn btn-secondary btn-sm">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                                    </svg>
                                    Print report
                                </button>
                            </div>

                            {period === 'custom' ? (
                                <div className="flex flex-wrap items-end gap-4">
                                    <div>
                                        <label className="input-label">From</label>
                                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field mt-1" />
                                    </div>
                                    <div>
                                        <label className="input-label">To</label>
                                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field mt-1" />
                                    </div>
                                    <button onClick={() => go({ period: 'custom', start_date: startDate, end_date: endDate })} className="btn btn-primary">
                                        <IconCalendar className="h-4 w-4" />
                                        Apply
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button className={navBtn} aria-label="Previous period" onClick={() => go({ period, date: range.prev })}>
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                                    </button>
                                    <div className="min-w-[200px] text-center text-sm font-semibold text-soil-900">{range.label}</div>
                                    <button className={navBtn} aria-label="Next period" disabled={!range.next} onClick={() => range.next && go({ period, date: range.next })}>
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                                    </button>
                                    <button onClick={() => go({ period })} className="ml-2 rounded-full border border-soil-200 px-3 py-1.5 text-xs font-medium text-soil-600 hover:bg-soil-100">
                                        Today
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </FadeIn>

                {/* Stat cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05, duration: 0.4, ease: 'easeOut' }}
                        style={{ willChange: 'transform, opacity' }}
                    >
                        <div className="stat-card h-full">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="stat-label">Total Prescriptions</div>
                                    <div className="stat-value mt-1.5">{stats.total_prescriptions}</div>
                                </div>
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-accent-100 text-accent-700">
                                    <IconDocument className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="stat-foot mt-3">Written in the selected period</div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
                        style={{ willChange: 'transform, opacity' }}
                    >
                        <div className="stat-card h-full">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="stat-label">Dispensed</div>
                                    <div className="stat-value mt-1.5">{stats.total_dispensed}</div>
                                </div>
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-success-light text-success">
                                    <IconBag className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="stat-foot mt-3">
                                {stats.total_prescriptions > 0
                                    ? `${Math.round((stats.total_dispensed / stats.total_prescriptions) * 100)}% fulfillment rate`
                                    : 'No prescriptions in the selected period'}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Top Diagnoses */}
                <FadeIn delay={0.12}>
                    <div className="card mt-6">
                        <div className="card-header">
                            <h2 className="card-title">Top Diagnoses</h2>
                            <span className="text-xs font-medium text-soil-400">{range.label}</span>
                        </div>
                        <div className="p-5">
                            {report.top_diagnoses.length > 0 ? (
                                <div className="space-y-3.5">
                                    {report.top_diagnoses.map((d: any, i: number) => (
                                        <div key={d.diagnosis} className="flex items-center gap-3">
                                            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] text-xs font-semibold ${i === 0 ? 'bg-accent-500 text-white' : i < 3 ? 'bg-accent-100 text-accent-700' : 'bg-soil-100 text-soil-500'}`}>
                                                {i + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm font-medium text-soil-900">{d.diagnosis}</div>
                                                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-soil-100">
                                                    <div className={`h-full rounded-full ${i === 0 ? 'bg-accent-500' : 'bg-accent-300'}`} style={{ width: `${Math.round((d.count / maxDiagnosis) * 100)}%` }} />
                                                </div>
                                            </div>
                                            <span className="shrink-0 text-sm font-semibold tabular-nums text-soil-900">{d.count}</span>
                                            <span className="w-12 shrink-0 text-right text-xs tabular-nums text-soil-400">{d.percent}%</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-8 text-center text-sm text-soil-500">No diagnoses recorded in this period.</div>
                            )}
                        </div>
                    </div>
                </FadeIn>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Top Medicines */}
                    <FadeIn delay={0.15} className="lg:col-span-1">
                        <div className="card h-full">
                            <div className="card-header">
                                <h2 className="card-title">Top Medicines</h2>
                                <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-accent-100 text-accent-700">
                                    <IconTrending className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="p-4">
                                {topMedicines.length > 0 ? (
                                    <div className="space-y-4">
                                        {topMedicines.map((m: any, i: number) => {
                                            const qty = Number(m.dispensed_quantity) || 0;
                                            const pct = Math.round((qty / maxDispensed) * 100);
                                            return (
                                                <motion.div
                                                    key={m.id}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.03 * i, duration: 0.3, ease: 'easeOut' }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] text-xs font-semibold ${
                                                                i === 0
                                                                    ? 'bg-accent-500 text-white'
                                                                    : i === 1
                                                                      ? 'bg-accent-100 text-accent-700'
                                                                      : i === 2
                                                                        ? 'bg-accent-50 text-accent-600'
                                                                        : 'bg-soil-100 text-soil-500'
                                                            }`}
                                                        >
                                                            {i + 1}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="truncate text-sm font-medium text-soil-900">
                                                                {m.generic_name}
                                                            </div>
                                                            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-soil-100">
                                                                <motion.div
                                                                    className={`h-full rounded-full ${i === 0 ? 'bg-accent-500' : 'bg-accent-300'}`}
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${pct}%` }}
                                                                    transition={{ delay: 0.25 + 0.05 * i, duration: 0.6, ease: 'easeOut' }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <span className="shrink-0 text-sm font-semibold tabular-nums text-soil-900">
                                                            {qty}
                                                        </span>
                                                        <span className="shrink-0 text-xs text-soil-400">dispensed</span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-soil-100 text-soil-400">
                                            <IconTrending className="h-6 w-6" />
                                        </div>
                                        <div className="text-sm font-medium text-soil-900">No dispensing data</div>
                                        <div className="text-xs text-soil-500">Medicines dispensed in this period will appear here</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </FadeIn>

                    {/* Daily Trend */}
                    <FadeIn delay={0.2} className="lg:col-span-2">
                        <div className="card h-full">
                            <div className="card-header">
                                <h2 className="card-title">Daily Trend</h2>
                                <span className="text-xs font-medium text-soil-400">Last 30 days (all periods)</span>
                            </div>
                            <div className="p-5">
                                <div className="mb-3 flex items-center justify-end gap-4">
                                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-soil-500">
                                        <span className="h-2.5 w-2.5 rounded-[3px] bg-accent-200" />
                                        Prescribed
                                    </span>
                                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-soil-500">
                                        <span className="h-2.5 w-2.5 rounded-[3px] bg-accent-500" />
                                        Dispensed
                                    </span>
                                </div>
                                {hasDailyData ? (
                                    <div className="flex h-[240px] items-end gap-1 border-b border-soil-200 pt-8 sm:gap-1.5">
                                        {days.map((d, i) => {
                                            const isToday = i === days.length - 1;
                                            const showLabel =
                                                i === 0 ||
                                                (parseDay(d.day).d % 5 === 1 && i > 0) ||
                                                isToday;
                                            const h = (Math.max(d.prescribed, d.dispensed) / maxDaily) * 190;
                                            const fillH = d.prescribed > 0 ? h * Math.min(d.dispensed / d.prescribed, 1) : 0;
                                            const hasBar = d.prescribed > 0 || d.dispensed > 0;
                                            const dispensedOnly = d.prescribed === 0 && d.dispensed > 0;
                                            return (
                                                <div key={d.day} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                                                    {hasBar && (
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${h}px` }}
                                                            transition={{ delay: 0.05 + i * 0.015, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                                            style={{ willChange: 'height' }}
                                                            className={`relative w-full max-w-[22px] overflow-hidden rounded-t-[4px] transition-colors duration-200 ${
                                                                dispensedOnly
                                                                    ? isToday
                                                                        ? 'bg-accent-600 group-hover:bg-accent-700'
                                                                        : 'bg-accent-500 group-hover:bg-accent-600'
                                                                    : isToday
                                                                      ? 'bg-accent-300 group-hover:bg-accent-400'
                                                                      : 'bg-accent-200 group-hover:bg-accent-300'
                                                            }`}
                                                        >
                                                            {!dispensedOnly && d.prescribed > 0 && (
                                                                <motion.div
                                                                    initial={{ height: 0 }}
                                                                    animate={{ height: `${fillH}px` }}
                                                                    transition={{ delay: 0.1 + i * 0.015, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                                                    style={{ willChange: 'height' }}
                                                                    className={`absolute inset-x-0 bottom-0 ${isToday ? 'bg-accent-600' : 'bg-accent-500'}`}
                                                                />
                                                            )}
                                                            <span className="pointer-events-none absolute -top-1 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-[8px] bg-soil-900 px-2 py-1 text-[11px] font-medium text-white shadow-sm group-hover:block">
                                                                <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-accent-200 align-middle" />
                                                                {d.prescribed} prescribed
                                                                <span className="mx-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent-500 align-middle" />
                                                                {d.dispensed} dispensed
                                                            </span>
                                                        </motion.div>
                                                    )}
                                                    {showLabel && (
                                                        <div className={`mt-2 text-[10px] font-medium tabular-nums ${isToday ? 'font-semibold text-accent-700' : 'text-soil-400'}`}>
                                                            {dayLabel(d.day, i === 0)}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-accent-100 text-accent-600">
                                            <IconDocument className="h-6 w-6" />
                                        </div>
                                        <div className="text-sm font-medium text-soil-900">No prescriptions in the last 30 days</div>
                                        <div className="text-xs text-soil-500">Daily volume will appear here as prescriptions are written or dispensed</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
