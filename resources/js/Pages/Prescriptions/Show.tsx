import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface Patient { first_name: string; last_name: string; }
interface Doctor { id: number; name: string; }
interface Medicine { id: number; generic_name: string; }
interface PrescriptionItem { id: number; medicine: Medicine; dosage: string; frequency: string; duration: string; quantity: number; unit: string | null; instructions: string | null; }
interface DispensedItem { id: number; quantity: number; unit_price: number; medicine_inventory: { medicine: Medicine } | null; }
interface DispensingRecord { id: number; pharmacist: Doctor; dispensed_at: string; notes: string | null; dispensed_items: DispensedItem[]; }
interface PrescriptionData {
    id: number;
    prescription_number: string;
    status: string;
    diagnosis: string | null;
    notes: string | null;
    patient: Patient;
    doctor: Doctor;
    items: PrescriptionItem[];
    dispensing_record: DispensingRecord | null;
    created_at: string;
}

export default function PrescriptionsShow({ prescription }: { prescription: PrescriptionData }) {
    const { auth } = usePage().props as any;
    const role = auth?.user?.role;

    const [confirmAction, setConfirmAction] = useState<{ status: string; busy: boolean } | null>(null);

    const updateStatus = (status: string) => {
        setConfirmAction({ status, busy: true });
        router.patch(
            route('prescriptions.update-status', prescription.id),
            { status },
            { onFinish: () => setConfirmAction(null) }
        );
    };

    return (
        <AuthenticatedLayout header={`Prescription ${prescription.prescription_number}`}>
            <Head title="Prescription Details" />
            <div className="page-content">
                <div className="mx-auto max-w-4xl space-y-6">
                    {/* Status bar */}
                    <div className="card">
                        <div className="card-body">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="card-title">{prescription.prescription_number}</h3>
                                    <p className="mt-0.5 text-sm text-soil-500">Created {new Date(prescription.created_at).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <a
                                        href={route('prescriptions.print', prescription.id)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn btn-secondary btn-sm"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                                        </svg>
                                        Print
                                    </a>
                                    <span className={`badge badge-${prescription.status}`}>{prescription.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Patient & Doctor */}
                    <div className="card">
                        <div className="card-body">
                            <h4 className="section-label mb-4">Patient & Doctor</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-soil-500">Patient</span>
                                    <p className="text-sm font-medium text-soil-900">{prescription.patient.first_name} {prescription.patient.last_name}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-soil-500">Doctor</span>
                                    <p className="text-sm font-medium text-soil-900">{prescription.doctor.name}</p>
                                </div>
                            </div>
                            {prescription.diagnosis && (
                                <div className="mt-4">
                                    <span className="text-sm text-soil-500">Diagnosis</span>
                                    <p className="text-sm text-soil-900">{prescription.diagnosis}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Medications */}
                    <div className="card overflow-hidden">
                        <div className="card-header">
                            <h4 className="card-title">Medications</h4>
                        </div>
                        <div className="p-0">
                            <div className="table-container rounded-none border-0 shadow-none">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Medicine</th>
                                            <th>Dosage</th>
                                            <th>Frequency</th>
                                            <th>Duration</th>
                                            <th>Qty</th>
                                            <th>Instructions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {prescription.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="font-medium text-soil-900">{item.medicine.generic_name}</td>
                                                <td>{item.dosage}</td>
                                                <td>{item.frequency}</td>
                                                <td>{item.duration}</td>
                                                <td className="tabular-nums">{item.quantity}{item.unit ? ` / ${item.unit}` : ''}</td>
                                                <td>{item.instructions || 'None'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {prescription.notes && (
                        <div className="card">
                            <div className="card-body">
                                <h4 className="section-label mb-2">Notes</h4>
                                <p className="text-sm text-soil-700">{prescription.notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Dispensing Record */}
                    {prescription.dispensing_record && (
                        <div className="card overflow-hidden">
                            <div className="card-header">
                                <h4 className="card-title">Dispensing Record</h4>
                            </div>
                            <div className="p-0">
                                <p className="px-5 py-3 text-sm text-soil-500">
                                    Dispensed by {prescription.dispensing_record.pharmacist.name} on {new Date(prescription.dispensing_record.dispensed_at).toLocaleString()}
                                </p>
                                <div className="table-container rounded-none border-0 shadow-none">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Medicine</th>
                                                <th>Qty</th>
                                                <th>Unit Price</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {prescription.dispensing_record.dispensed_items.map((di) => (
                                                <tr key={di.id}>
                                                    <td className="font-medium text-soil-900">
                                                        {di.medicine_inventory?.medicine?.generic_name || 'Unknown'}
                                                    </td>
                                                    <td className="tabular-nums">{di.quantity}</td>
                                                    <td className="tabular-nums">&#x20B1;{Number(di.unit_price).toFixed(2)}</td>
                                                    <td className="tabular-nums">&#x20B1;{(di.quantity * Number(di.unit_price)).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {prescription.dispensing_record.notes && (
                                    <p className="px-5 py-3 text-sm text-soil-500">Note: {prescription.dispensing_record.notes}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {prescription.status !== 'dispensed' && prescription.status !== 'cancelled' && (
                        <div className="flex justify-end gap-3">
                            {(prescription.status === 'pending' || prescription.status === 'validated') && role === 'pharmacist' && (
                                <Link href={route('dispensing.create', prescription.id)} className="btn btn-primary">Dispense</Link>
                            )}
                            <button onClick={() => setConfirmAction({ status: 'cancelled', busy: false })} className="btn btn-secondary">
                                Cancel Prescription
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation modal */}
            <ConfirmModal
                open={confirmAction !== null}
                tone="danger"
                title="Cancel Prescription?"
                message={`This will cancel ${prescription.prescription_number} and it cannot be undone.`}
                confirmLabel="Cancel Prescription"
                busy={confirmAction?.busy ?? false}
                onConfirm={() => confirmAction && updateStatus(confirmAction.status)}
                onClose={() => !confirmAction?.busy && setConfirmAction(null)}
            />
        </AuthenticatedLayout>
    );
}
