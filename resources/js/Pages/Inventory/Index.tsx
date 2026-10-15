import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination, { PaginationLink } from '@/Components/Pagination';
import FadeIn from '@/Components/FadeIn';
import { Head, Link } from '@inertiajs/react';
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

interface InventoriesPaginator {
    data: InventoryItem[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

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

export default function InventoryIndex({ inventories, lowStock, expiring = [], filter }: { inventories: InventoriesPaginator; lowStock: LowStockItem[]; expiring?: ExpiringBatch[]; filter: string | null }) {
    const expiredBatches = expiring.filter((b) => new Date(b.expiry_date).getTime() < Date.now());
    const expiringSoon = expiring.filter((b) => new Date(b.expiry_date).getTime() >= Date.now());
    return (
        <AuthenticatedLayout header="Medicine Inventory">
            <Head title="Inventory" />
            <div className="page-content">
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
                                <div className="mt-1.5 flex flex-wrap gap-2">
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
        </AuthenticatedLayout>
    );
}
