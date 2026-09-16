import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination, { PaginationLink } from '@/Components/Pagination';
import FadeIn from '@/Components/FadeIn';
import ConfirmModal from '@/Components/ConfirmModal';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    gender: string | null;
    contact_number: string | null;
    prescriptions_count: number;
}

interface PatientsPaginator {
    data: Patient[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

function initials(first: string, last: string) {
    return `${(first[0] || '').toUpperCase()}${(last[0] || '').toUpperCase()}`;
}

function formatDate(value: string | null) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function PatientsIndex({ patients }: { patients: PatientsPaginator }) {
    const { auth } = usePage().props as any;
    const role = auth?.user?.role;
    const isPharmacist = role === 'pharmacist';

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const confirmDelete = () => {
        if (deleteId === null) return;
        setDeleting(true);
        router.delete(route('patients.destroy', deleteId), {
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <AuthenticatedLayout header="Patients">
            <Head title="Patients" />
            <div className="page-content">
                {/* Patients card */}
                <FadeIn y={18} duration={0.45}>
                    <div className="card overflow-hidden">
                        <div className="card-header">
                            <h2 className="text-base font-bold tracking-tight text-soil-900">Patients List</h2>
                            {!isPharmacist && (
                                <Link href={route('patients.create')} className="btn btn-primary btn-sm">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    Add Patient
                                </Link>
                            )}
                        </div>

                        <div className="table-container rounded-none border-0 shadow-none">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Gender</th>
                                        <th>Contact</th>
                                        <th>Prescriptions</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.data.map((patient, i) => (
                                        <motion.tr
                                            key={patient.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.04 * i, duration: 0.3 }}
                                        >
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-100 text-[13px] font-semibold text-accent-600">
                                                    {initials(patient.first_name, patient.last_name)}
                                                </div>
                                                <div className="leading-tight">
                                                    <div className="text-[15px] font-medium text-soil-900">
                                                        {patient.first_name} {patient.last_name}
                                                    </div>
                                                    <div className="mt-0.5 text-xs text-soil-400">
                                                        {formatDate(patient.date_of_birth)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-soil-700">
                                            {patient.gender
                                                ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)
                                                : '-'}
                                        </td>
                                        <td className="text-soil-700 tabular-nums">
                                            {patient.contact_number || '-'}
                                        </td>
                                        <td>
                                            <span className="inline-flex h-6 min-w-[28px] items-center justify-center rounded-full bg-soil-100 px-2 text-xs font-medium text-soil-700 tabular-nums">
                                                {patient.prescriptions_count}
                                            </span>
                                        </td>
                                        <td>
                                            {isPharmacist ? (
                                                <span className="text-sm text-soil-400">View only</span>
                                            ) : (
                                                <div className="flex items-center justify-start gap-1.5">
                                                    <Link
                                                        href={route('patients.edit', patient.id)}
                                                        className="rounded-[8px] p-2 text-soil-400 transition-colors duration-150 hover:bg-accent-50 hover:text-accent-500"
                                                        aria-label={`Edit ${patient.first_name} ${patient.last_name}`}
                                                        title="Edit"
                                                    >
                                                        <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteId(patient.id)}
                                                        className="rounded-[8px] p-2 text-soil-400 transition-colors duration-150 hover:bg-error-light hover:text-error"
                                                        aria-label={`Delete ${patient.first_name} ${patient.last_name}`}
                                                        title="Delete"
                                                    >
                                                        <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                                {patients.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-10 text-center text-sm text-soil-500">
                                            No patients found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <Pagination
                        links={patients.links}
                        currentPage={patients.current_page}
                        lastPage={patients.last_page}
                        from={patients.from}
                        to={patients.to}
                        total={patients.total}
                        itemLabel="patients"
                    />
                    </div>
                </FadeIn>
            </div>

            {/* Delete confirmation */}
            <ConfirmModal
                open={deleteId !== null}
                tone="danger"
                title="Delete Patient?"
                message="This will permanently remove the patient record and its history. This cannot be undone."
                confirmLabel="Delete Patient"
                busy={deleting}
                onConfirm={confirmDelete}
                onClose={() => !deleting && setDeleteId(null)}
            />
        </AuthenticatedLayout>
    );
}
