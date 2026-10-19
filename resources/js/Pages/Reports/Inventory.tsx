import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FadeIn from '@/Components/FadeIn';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export interface InventoryReportRow {
    id: number;
    generic_name: string;
    brand_name: string | null;
    dosage_form: string | null;
    strength: string | null;
    stock: number;
    batches: number;
    nearest_expiry: string | null;
    dispensed_30d: number;
    status: 'ok' | 'low' | 'out' | 'expiring' | 'expired';
}

export interface InventoryReport {
    summary: {
        medicines: number;
        units: number;
        low: number;
        out: number;
        expiring: number;
        expired: number;
        archived_batches: number;
    };
    rows: InventoryReportRow[];
    as_of: string;
}

export const STATUS_LABEL: Record<InventoryReportRow['status'], string> = {
    ok: 'In stock',
    low: 'Low stock',
    out: 'Out of stock',
    expiring: 'Expiring soon',
    expired: 'Has expired stock',
};

const STATUS_BADGE: Record<InventoryReportRow['status'], string> = {
    ok: 'badge badge-in-stock',
    low: 'badge badge-low-stock',
    out: 'badge badge-out-of-stock',
    expiring: 'badge badge-low-stock',
    expired: 'badge badge-out-of-stock',
};

export function formatDate(iso: string | null) {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

const FILTERS: { key: 'all' | InventoryReportRow['status']; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'low', label: 'Low stock' },
    { key: 'out', label: 'Out of stock' },
    { key: 'expiring', label: 'Expiring soon' },
    { key: 'expired', label: 'Expired' },
];

export default function InventoryReportPage({ report }: { report: InventoryReport }) {
    const { summary, rows } = report;
    const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');
    const shown = filter === 'all' ? rows : rows.filter((r) => r.status === filter);

    const cards = [
        { label: 'Medicines', value: summary.medicines },
        { label: 'Units in stock', value: summary.units },
        { label: 'Low-stock batches', value: summary.low },
        { label: 'Medicines out of stock', value: summary.out },
        { label: 'Expiring in 30 days', value: summary.expiring },
        { label: 'Expired (still on hand)', value: summary.expired },
    ];

    return (
        <AuthenticatedLayout header="Medicine Inventory Report">
            <Head title="Medicine Inventory Report" />
            <div className="page-content">
                <FadeIn>
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-soil-600">
                            Stock position as of <span className="font-semibold text-soil-900">{formatDate(report.as_of)}</span>. Archived batches ({summary.archived_batches}) are not counted.
                        </p>
                        <button onClick={() => window.open(route('reports.print'), '_blank')} className="btn btn-secondary btn-sm">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                            </svg>
                            Print report
                        </button>
                    </div>
                </FadeIn>

                <FadeIn y={12} duration={0.4}>
                    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                        {cards.map((c) => (
                            <div key={c.label} className="card">
                                <div className="card-body">
                                    <div className="text-2xl font-bold tabular-nums text-soil-900">{c.value}</div>
                                    <div className="mt-1 text-xs font-medium text-soil-500">{c.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </FadeIn>

                <FadeIn y={18} duration={0.45}>
                    <div className="card overflow-hidden">
                        <div className="card-header">
                            <h2 className="text-base font-bold tracking-tight text-soil-900">Stock by Medicine</h2>
                            <div className="flex flex-wrap gap-1.5">
                                {FILTERS.map((f) => (
                                    <button
                                        key={f.key}
                                        onClick={() => setFilter(f.key)}
                                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150 ${
                                            filter === f.key
                                                ? 'border-accent-500 bg-accent-500 text-white'
                                                : 'border-soil-200 text-soil-600 hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="table-container rounded-none border-0 shadow-none">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Medicine</th>
                                        <th>Strength / Form</th>
                                        <th className="text-right">Stock</th>
                                        <th className="text-right">Batches</th>
                                        <th>Nearest expiry</th>
                                        <th className="text-right">Dispensed (30 days)</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shown.map((r) => (
                                        <tr key={r.id}>
                                            <td>
                                                <div className="text-sm font-medium text-soil-900">{r.generic_name}</div>
                                                {r.brand_name && <div className="mt-0.5 text-xs text-soil-400">{r.brand_name}</div>}
                                            </td>
                                            <td className="text-soil-700">{[r.strength, r.dosage_form].filter(Boolean).join(' · ') || 'N/A'}</td>
                                            <td className="text-right font-semibold tabular-nums text-soil-900">{r.stock}</td>
                                            <td className="text-right tabular-nums text-soil-700">{r.batches}</td>
                                            <td className="tabular-nums text-soil-700">{formatDate(r.nearest_expiry)}</td>
                                            <td className="text-right tabular-nums text-soil-700">{r.dispensed_30d}</td>
                                            <td>
                                                <span className={STATUS_BADGE[r.status]}>{STATUS_LABEL[r.status]}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {shown.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-5 py-10 text-center text-sm text-soil-500">
                                                No medicines match this filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </AuthenticatedLayout>
    );
}
