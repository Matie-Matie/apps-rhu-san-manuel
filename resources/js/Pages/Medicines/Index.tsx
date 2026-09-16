import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination, { PaginationLink } from '@/Components/Pagination';
import FadeIn from '@/Components/FadeIn';
import ConfirmModal from '@/Components/ConfirmModal';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Medicine {
    id: number;
    generic_name: string;
    brand_name: string | null;
    category: string | null;
    dosage_form: string | null;
    strength: string | null;
    total_stock: number | null;
}

interface MedicinesPaginator {
    data: Medicine[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

function StockBadge({ stock }: { stock: number | null }) {
    const qty = stock ?? 0;
    if (qty <= 0) return <span className="badge badge-out-of-stock">Out of Stock</span>;
    if (qty <= 10) return <span className="badge badge-low-stock tabular-nums">{qty} left</span>;
    return <span className="badge badge-in-stock tabular-nums">{qty} in stock</span>;
}

export default function MedicinesIndex({ medicines }: { medicines: MedicinesPaginator }) {
    const { auth } = usePage().props as any;
    const role = auth?.user?.role;
    const isDoctor = role === 'doctor';

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const confirmDelete = () => {
        if (deleteId === null) return;
        setDeleting(true);
        router.delete(route('medicines.destroy', deleteId), {
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <AuthenticatedLayout header="Medicine Catalog">
            <Head title="Medicines" />
            <div className="page-content">
                <FadeIn y={18} duration={0.45}>
                    <div className="card overflow-hidden">
                        <div className="card-header">
                            <h2 className="text-base font-bold tracking-tight text-soil-900">Medicine Catalog</h2>
                            <div className="flex items-center gap-3">
                                <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold tabular-nums text-accent-700">
                                    {medicines.total} {medicines.total === 1 ? 'medicine' : 'medicines'}
                                </span>
                                {!isDoctor && (
                                    <Link href={route('medicines.create')} className="btn btn-primary btn-sm">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        Add Medicine
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="table-container rounded-none border-0 shadow-none">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Medicine</th>
                                        <th>Category</th>
                                        <th>Strength</th>
                                        <th>Availability</th>
                                        {!isDoctor && (
                                            <th>Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {medicines.data.map((m, i) => (
                                        <motion.tr
                                            key={m.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.03 * i, duration: 0.3 }}
                                        >
                                            <td>
                                                <div className="leading-tight">
                                                    <div className="text-[15px] font-medium text-soil-900">{m.generic_name}</div>
                                                    {m.brand_name && (
                                                        <div className="mt-0.5 text-xs text-soil-400">
                                                            {m.brand_name}
                                                            {m.dosage_form ? ` · ${m.dosage_form}` : ''}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                {m.category ? (
                                                    <span className="rounded-full bg-soil-100 px-2.5 py-1 text-[11px] font-medium text-soil-600">
                                                        {m.category}
                                                    </span>
                                                ) : (
                                                    <span className="text-soil-400">-</span>
                                                )}
                                            </td>
                                            <td className="text-soil-700">{m.strength || '-'}</td>
                                            <td><StockBadge stock={m.total_stock} /></td>
                                            {!isDoctor && (
                                                <td>
                                                    <div className="flex items-center justify-start gap-1.5">
                                                        <Link
                                                            href={route('medicines.inventory', m.id)}
                                                            title="Stock history"
                                                            className="rounded-[8px] p-2 text-soil-400 transition-colors duration-150 hover:bg-accent-50 hover:text-accent-500"
                                                        >
                                                            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                                            </svg>
                                                        </Link>
                                                        <Link
                                                            href={route('medicines.edit', m.id)}
                                                            title="Edit medicine"
                                                            className="rounded-[8px] p-2 text-soil-400 transition-colors duration-150 hover:bg-accent-50 hover:text-accent-500"
                                                        >
                                                            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                            </svg>
                                                        </Link>
                                                        <button
                                                            onClick={() => setDeleteId(m.id)}
                                                            title="Delete medicine"
                                                            className="rounded-[8px] p-2 text-soil-400 transition-colors duration-150 hover:bg-error-light hover:text-error"
                                                        >
                                                            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </motion.tr>
                                    ))}
                                    {medicines.data.length === 0 && (
                                        <tr>
                                            <td colSpan={isDoctor ? 4 : 5} className="px-5 py-10 text-center text-sm text-soil-500">
                                                No medicines found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            links={medicines.links}
                            currentPage={medicines.current_page}
                            lastPage={medicines.last_page}
                            from={medicines.from}
                            to={medicines.to}
                            total={medicines.total}
                            itemLabel="medicines"
                        />
                    </div>
                </FadeIn>
            </div>

            {/* Delete confirmation */}
            <ConfirmModal
                open={deleteId !== null}
                tone="danger"
                title="Delete Medicine?"
                message="This will permanently remove the medicine from the catalog. This cannot be undone."
                confirmLabel="Delete Medicine"
                busy={deleting}
                onConfirm={confirmDelete}
                onClose={() => !deleting && setDeleteId(null)}
            />
        </AuthenticatedLayout>
    );
}
