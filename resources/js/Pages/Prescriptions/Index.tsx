import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination, { PaginationLink } from '@/Components/Pagination';
import FadeIn from '@/Components/FadeIn';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface Prescription {
    id: number;
    prescription_number: string;
    status: string;
    patient: { first_name: string; last_name: string };
    doctor: { name: string };
    created_at: string;
}

interface PrescriptionsPaginator {
    data: Prescription[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

const STATUS_FILTERS = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'dispensed', label: 'Dispensed' },
];

function initials(first: string, last: string) {
    return `${(first[0] || '').toUpperCase()}${(last[0] || '').toUpperCase()}`;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function PrescriptionsIndex({ prescriptions, filters }: { prescriptions: PrescriptionsPaginator; filters: { status: string | null } }) {
    const { auth } = usePage().props as any;
    const role = auth?.user?.role;
    const activeStatus = filters?.status ?? '';

    const setStatus = (value: string) => {
        router.get(route('prescriptions.index'), value ? { status: value } : {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout header="Prescriptions">
            <Head title="Prescriptions" />
            <div className="page-content">
                <FadeIn y={18} duration={0.45}>
                    <div className="card overflow-hidden">
                        <div className="card-header">
                            <h2 className="text-base font-bold tracking-tight text-soil-900">Prescriptions List</h2>
                            <div className="flex items-center gap-3">
                                <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold tabular-nums text-accent-700">
                                    {prescriptions.total} {prescriptions.total === 1 ? 'prescription' : 'prescriptions'}
                                </span>
                                {role !== 'pharmacist' && (
                                    <Link href={route('prescriptions.create')} className="btn btn-primary btn-sm">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        New Prescription
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Status filter pills */}
                        <div className="flex flex-wrap items-center gap-2 border-b border-soil-200 px-5 py-3">
                            {STATUS_FILTERS.map((f) => (
                                <button
                                    key={f.value}
                                    onClick={() => setStatus(f.value)}
                                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                                        activeStatus === f.value
                                            ? 'bg-accent-500 text-white shadow-sm'
                                            : 'border border-soil-200 text-soil-600 hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <div className="table-container rounded-none border-0 shadow-none">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Prescription #</th>
                                        <th>Patient</th>
                                        <th>Doctor</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptions.data.map((rx, i) => (
                                        <motion.tr
                                            key={rx.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.03 * i, duration: 0.3 }}
                                        >
                                            <td>
                                                <Link
                                                    href={route('prescriptions.show', rx.id)}
                                                    className="font-medium tabular-nums text-accent-700 transition-colors duration-150 hover:text-accent-800"
                                                >
                                                    {rx.prescription_number}
                                                </Link>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-100 text-xs font-semibold text-accent-600">
                                                        {initials(rx.patient.first_name, rx.patient.last_name)}
                                                    </div>
                                                    <span className="text-sm font-medium text-soil-900">
                                                        {rx.patient.first_name} {rx.patient.last_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-soil-700">{rx.doctor.name}</td>
                                            <td>
                                                <span className={`badge badge-${rx.status}`}>{rx.status}</span>
                                            </td>
                                            <td className="text-soil-500 tabular-nums">{formatDate(rx.created_at)}</td>
                                            <td>
                                                <div className="flex items-center justify-start gap-1.5">
                                                    <Link
                                                        href={route('prescriptions.show', rx.id)}
                                                        title="View prescription"
                                                        className="rounded-[8px] p-2 text-soil-400 transition-colors duration-150 hover:bg-accent-50 hover:text-accent-500"
                                                    >
                                                        <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    </Link>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    {prescriptions.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-5 py-10 text-center text-sm text-soil-500">
                                                No prescriptions found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            links={prescriptions.links}
                            currentPage={prescriptions.current_page}
                            lastPage={prescriptions.last_page}
                            from={prescriptions.from}
                            to={prescriptions.to}
                            total={prescriptions.total}
                            itemLabel="prescriptions"
                        />
                    </div>
                </FadeIn>
            </div>
        </AuthenticatedLayout>
    );
}
