import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination, { PaginationLink } from '@/Components/Pagination';
import FadeIn from '@/Components/FadeIn';
import ConfirmModal from '@/Components/ConfirmModal';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface InventoryItem {
    id: number;
    batch_number: string | null;
    expiry_date: string | null;
    quantity: number;
    unit_price: number;
    reorder_level: number;
    medicine: { id: number; generic_name: string; brand_name: string | null };
}

interface Paginator<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

type InventoriesPaginator = Paginator<InventoryItem>;

interface ExpiringBatch {
    id: number;
    batch_number: string | null;
    expiry_date: string;
    quantity: number;
    medicine: { generic_name: string };
}

interface LowStockItem {
    id: number;
    generic_name: string;
    total_stock: number | null;
}

function initials(name: string) {
    const parts = name.trim().split(/\s+/);
    return `${(parts[0]?.[0] || '').toUpperCase()}${(parts[parts.length - 1]?.[0] || '').toUpperCase()}`;
}

function formatDate(iso: string | null) {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Expiry tone: expired / within 30 days = flagged, otherwise neutral.
 * Dark-on-light pairs (no yellow on white) so it stays easy to read.
 */
function expiryTone(iso: string | null) {
    if (!iso) return { cls: 'text-soil-500', label: null, badge: '' };
    const days = Math.floor((new Date(iso).getTime() - Date.now()) / 86_400_000);
    if (days < 0) {
        return { cls: 'font-semibold text-red-800', label: 'Expired', badge: 'bg-red-100 text-red-800 ring-red-300' };
    }
    if (days <= 30) {
        return { cls: 'font-semibold text-soil-900', label: `Expires in ${days}d`, badge: 'bg-orange-100 text-orange-900 ring-orange-300' };
    }
    return { cls: 'text-soil-500', label: null, badge: '' };
}


interface ArchivedBatch {
    id: number;
    batch_number: string | null;
    expiry_date: string | null;
    quantity: number;
    archived_at: string;
    medicine: { id: number; generic_name: string; brand_name: string | null };
}

interface ArchivedMedicine {
    id: number;
    generic_name: string;
    brand_name: string | null;
    archived_at: string | null;
    total_stock: number | null;
}

function InventoryTabs({ tab, archivedCount }: { tab: 'active' | 'archived'; archivedCount: number }) {
    const base = 'inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors';
    const on = 'border-accent-500 text-accent-700';
    const off = 'border-transparent text-soil-500 hover:text-soil-800';
    return (
        <div className="mb-6 flex gap-1 border-b border-soil-200">
            <Link href={route('inventory.index')} className={`${base} ${tab === 'active' ? on : off}`}>
                Live stock
            </Link>
            <Link href={route('inventory.index', { tab: 'archived' })} className={`${base} ${tab === 'archived' ? on : off}`}>
                Archive
                <span className="rounded-full bg-soil-100 px-2 py-0.5 text-xs font-bold tabular-nums text-soil-700">{archivedCount}</span>
            </Link>
        </div>
    );
}

function ArchiveView({ batches, medicines, archivedCount }: { batches: Paginator<ArchivedBatch>; medicines: ArchivedMedicine[]; archivedCount: number }) {
    const [restoreId, setRestoreId] = useState<number | null>(null);
    const [busy, setBusy] = useState(false);

    const confirmRestore = () => {
        if (restoreId === null) return;
        setBusy(true);
        router.post(route('inventory.restore', restoreId), {}, {
            preserveScroll: true,
            onFinish: () => { setBusy(false); setRestoreId(null); },
        });
    };

    return (
        <AuthenticatedLayout header="Medicine Inventory">
            <Head title="Inventory Archive" />
            <div className="page-content">
                <InventoryTabs tab="archived" archivedCount={archivedCount} />

                <FadeIn y={12} duration={0.4}>
                    <p className="mb-5 text-sm text-soil-600">
                        Expired and near-expiry batches are moved here so they stay out of live stock and dispensing. Anything archived is
                        permanently deleted after 6 months; restore it before then if it was archived by mistake.
                    </p>
                </FadeIn>

                <FadeIn y={18} duration={0.45}>
                    <div className="card mb-6 overflow-hidden">
                        <div className="card-header">
                            <h2 className="text-base font-bold tracking-tight text-soil-900">Archived Batches</h2>
                            <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold tabular-nums text-accent-700">
                                {batches.total} {batches.total === 1 ? 'batch' : 'batches'}
                            </span>
                        </div>
                        <div className="table-container rounded-none border-0 shadow-none">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Medicine</th>
                                        <th>Batch #</th>
                                        <th>Expiry</th>
                                        <th>Qty left</th>
                                        <th>Archived on</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {batches.data.map((b) => (
                                        <tr key={b.id}>
                                            <td>
                                                <div className="text-sm font-medium text-soil-900">{b.medicine.generic_name}</div>
                                                {b.medicine.brand_name && <div className="mt-0.5 text-xs text-soil-400">{b.medicine.brand_name}</div>}
                                            </td>
                                            <td className="tabular-nums text-soil-700">{b.batch_number || 'N/A'}</td>
                                            <td className="tabular-nums text-soil-700">{formatDate(b.expiry_date)}</td>
                                            <td className="tabular-nums text-soil-700">{b.quantity}</td>
                                            <td className="tabular-nums text-soil-500">{formatDate(b.archived_at)}</td>
                                            <td>
                                                <button type="button" onClick={() => setRestoreId(b.id)} className="btn btn-secondary btn-sm">
                                                    Restore
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {batches.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-5 py-10 text-center text-sm text-soil-500">
                                                No archived batches yet. Expired and near-expiry batches you archive appear here.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={batches.links}
                            currentPage={batches.current_page}
                            lastPage={batches.last_page}
                            from={batches.from}
                            to={batches.to}
                            total={batches.total}
                            itemLabel="batches"
                        />
                    </div>
                </FadeIn>

                {medicines.length > 0 && (
                    <FadeIn y={18} duration={0.45}>
                        <div className="card overflow-hidden">
                            <div className="card-header">
                                <h2 className="text-base font-bold tracking-tight text-soil-900">Archived Medicines</h2>
                                <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold tabular-nums text-accent-700">{medicines.length}</span>
                            </div>
                            <div className="table-container rounded-none border-0 shadow-none">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Medicine</th>
                                            <th>Total stock</th>
                                            <th>Archived on</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {medicines.map((m) => (
                                            <tr key={m.id}>
                                                <td>
                                                    <div className="text-sm font-medium text-soil-900">{m.generic_name}</div>
                                                    {m.brand_name && <div className="mt-0.5 text-xs text-soil-400">{m.brand_name}</div>}
                                                </td>
                                                <td className="tabular-nums text-soil-700">{m.total_stock ?? 0}</td>
                                                <td className="tabular-nums text-soil-500">{formatDate(m.archived_at)}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        onClick={() => router.post(route('medicines.restore', m.id), {}, { preserveScroll: true })}
                                                        className="btn btn-secondary btn-sm"
                                                    >
                                                        Restore
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </FadeIn>
                )}
            </div>

            <ConfirmModal
                open={restoreId !== null}
                title="Restore this batch?"
                message="It goes back to live stock, alerts and dispensing. If it is expired, it will show as expired again."
                confirmLabel="Restore batch"
                busy={busy}
                onConfirm={confirmRestore}
                onClose={() => !busy && setRestoreId(null)}
            />
        </AuthenticatedLayout>
    );
}

export default function InventoryIndex({ inventories, lowStock, expiring = [], filter, tab = 'active', archivedBatches = null, archivedMedicines = [], archivedCount = 0, archivableCount = 0 }: { inventories: InventoriesPaginator; lowStock: LowStockItem[]; expiring?: ExpiringBatch[]; filter: string | null; tab?: 'active' | 'archived'; archivedBatches?: Paginator<ArchivedBatch> | null; archivedMedicines?: ArchivedMedicine[]; archivedCount?: number; archivableCount?: number }) {
    const [archiveId, setArchiveId] = useState<number | null>(null);
    const [archiveAll, setArchiveAll] = useState(false);
    const [busy, setBusy] = useState(false);

    if (tab === 'archived' && archivedBatches) {
        return <ArchiveView batches={archivedBatches} medicines={archivedMedicines} archivedCount={archivedCount} />;
    }

    const runArchive = () => {
        setBusy(true);
        const opts = { preserveScroll: true, onFinish: () => { setBusy(false); setArchiveId(null); setArchiveAll(false); } };
        if (archiveAll) router.post(route('inventory.archive-expiring'), {}, opts);
        else if (archiveId !== null) router.post(route('inventory.archive', archiveId), {}, opts);
    };

    const expiredBatches = expiring.filter((b) => new Date(b.expiry_date).getTime() < Date.now());
    const expiringSoon = expiring.filter((b) => new Date(b.expiry_date).getTime() >= Date.now());
    return (
        <AuthenticatedLayout header="Medicine Inventory">
            <Head title="Inventory" />
            <div className="page-content">
                <InventoryTabs tab="active" archivedCount={archivedCount} />
                {filter && (
                    <FadeIn y={12} duration={0.4}>
                        <div className="mb-6 flex items-center justify-between gap-3 rounded-control border border-accent-200 bg-accent-50 p-4">
                            <p className="text-sm font-medium text-soil-800">
                                {filter === 'low_stock' ? 'Showing only low-stock batches.' : 'Showing only batches expiring within 30 days.'}
                            </p>
                            <Link href={route('inventory.index')} className="btn btn-secondary btn-sm shrink-0">
                                Clear filter
                            </Link>
                        </div>
                    </FadeIn>
                )}
                {lowStock.length > 0 && (
                    <FadeIn y={12} duration={0.4}>
                        <div className="mb-6 flex items-start gap-3 rounded-control border border-orange-300 bg-orange-50 p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-orange-100 text-orange-700">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-orange-900">Low Stock Alert</p>
                                <div className="mt-1.5 flex flex-wrap gap-2">
                                    {lowStock.map((m) => (
                                        <span key={m.id} className="rounded-full border border-orange-200 bg-white px-2.5 py-1 text-xs font-medium text-soil-800">
                                            {m.generic_name}
                                            <span className="ml-1 font-bold tabular-nums text-red-700">{m.total_stock ?? 0} left</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                )}
                {expiring.length > 0 && (
                    <FadeIn y={12} duration={0.4}>
                        <div className={`mb-6 flex items-start gap-3 rounded-control border p-4 ${expiredBatches.length ? 'border-red-300 bg-red-50' : 'border-orange-300 bg-orange-50'}`}>
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${expiredBatches.length ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className={`text-sm font-semibold ${expiredBatches.length ? 'text-red-900' : 'text-orange-900'}`}>
                                    {expiredBatches.length > 0 && expiringSoon.length > 0
                                        ? 'Expired and expiring-soon batches'
                                        : expiredBatches.length > 0
                                          ? 'Expired batches: do not dispense'
                                          : 'Expiring Soon (within 30 days)'}
                                </p>
                                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                    {archivableCount > 0 && (
                                        <button type="button" onClick={() => setArchiveAll(true)} className="btn btn-secondary btn-sm">
                                            Archive all ({archivableCount})
                                        </button>
                                    )}
                                    {expiring.map((b) => {
                                        const isExpired = new Date(b.expiry_date).getTime() < Date.now();
                                        return (
                                            <span key={b.id} className={`rounded-full border bg-white px-2.5 py-1 text-xs font-medium text-soil-800 ${isExpired ? 'border-red-200' : 'border-orange-200'}`}>
                                                {b.medicine.generic_name}
                                                {b.batch_number ? ` (${b.batch_number})` : ''}
                                                <span className={`ml-1 font-bold tabular-nums ${isExpired ? 'text-red-700' : 'text-orange-800'}`}>
                                                    {isExpired ? 'expired' : 'exp'} {formatDate(b.expiry_date)}
                                                </span>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                )}

                <FadeIn y={18} duration={0.45}>
                    <div className="card overflow-hidden">
                        <div className="card-header">
                            <h2 className="text-base font-bold tracking-tight text-soil-900">Inventory Batches</h2>
                            <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold tabular-nums text-accent-700">
                                {inventories.total} {inventories.total === 1 ? 'batch' : 'batches'}
                            </span>
                        </div>

                        <div className="table-container rounded-none border-0 shadow-none">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Medicine</th>
                                        <th>Batch #</th>
                                        <th>Expiry</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventories.data.map((inv, i) => {
                                        const expiry = expiryTone(inv.expiry_date);
                                        const isLow = inv.quantity <= inv.reorder_level;
                                        return (
                                            <motion.tr
                                                key={inv.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.03 * i, duration: 0.3 }}
                                            >
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-100 text-xs font-semibold text-accent-600">
                                                            {initials(inv.medicine.generic_name)}
                                                        </div>
                                                        <div className="leading-tight">
                                                            <Link
                                                                href={route('medicines.inventory', inv.medicine.id)}
                                                                className="text-sm font-medium text-soil-900 transition-colors duration-150 hover:text-accent-700"
                                                            >
                                                                {inv.medicine.generic_name}
                                                            </Link>
                                                            {inv.medicine.brand_name && (
                                                                <div className="mt-0.5 text-xs text-soil-400">{inv.medicine.brand_name}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="tabular-nums text-soil-700">{inv.batch_number || 'N/A'}</td>
                                                <td className={`tabular-nums ${expiry.cls}`}>
                                                    {formatDate(inv.expiry_date)}
                                                    {expiry.label && (
                                                        <span className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${expiry.badge}`}>
                                                            {expiry.label}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className={isLow ? 'font-bold tabular-nums text-soil-900' : 'tabular-nums text-soil-700'}>
                                                    {inv.quantity}
                                                    {isLow && (
                                                        <span className="ml-2 inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-bold text-red-800 ring-1 ring-inset ring-red-300">
                                                            {inv.quantity <= 0 ? 'Out' : 'Low'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="tabular-nums text-soil-700">
                                                    &#x20B1;{Number(inv.unit_price).toFixed(2)}
                                                </td>
                                                <td>
                                                    <div className="flex items-center justify-start gap-1.5">
                                                        <Link
                                                            href={route('inventory.edit', inv.id)}
                                                            title="Edit batch"
                                                            className="rounded-[8px] p-2 text-soil-400 transition-colors duration-150 hover:bg-accent-50 hover:text-accent-500"
                                                        >
                                                            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                            </svg>
                                                        </Link>
                                                        {expiry.label && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setArchiveId(inv.id)}
                                                                title="Move to archive"
                                                                className="rounded-[8px] p-2 text-soil-400 transition-colors duration-150 hover:bg-orange-50 hover:text-orange-700"
                                                            >
                                                                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                    {inventories.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-5 py-10 text-center text-sm text-soil-500">
                                                No inventory records.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            links={inventories.links}
                            currentPage={inventories.current_page}
                            lastPage={inventories.last_page}
                            from={inventories.from}
                            to={inventories.to}
                            total={inventories.total}
                            itemLabel="batches"
                        />
                    </div>
                </FadeIn>
            </div>

            <ConfirmModal
                open={archiveId !== null || archiveAll}
                title={archiveAll ? `Archive ${archivableCount} batch(es)?` : 'Move this batch to the archive?'}
                message={archiveAll
                    ? 'Every expired or near-expiry batch (expiring within 30 days) leaves live stock and dispensing. You can restore any of them from the Archive tab, and they are deleted for good after 6 months.'
                    : 'It leaves live stock and dispensing. You can restore it from the Archive tab, and it is deleted for good after 6 months.'}
                confirmLabel={archiveAll ? 'Archive all' : 'Move to archive'}
                busy={busy}
                onConfirm={runArchive}
                onClose={() => { if (!busy) { setArchiveId(null); setArchiveAll(false); } }}
            />
        </AuthenticatedLayout>
    );
}
