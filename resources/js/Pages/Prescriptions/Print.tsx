import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { ageFromDob } from '@/lib/patient';

interface Item {
    id: number;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    unit: string | null;
    instructions: string | null;
    medicine: { generic_name: string; brand_name: string | null; strength: string | null; dosage_form: string | null };
}

interface Rx {
    id: number;
    prescription_number: string;
    diagnosis: string | null;
    notes: string | null;
    created_at: string;
    patient: { first_name: string; last_name: string; date_of_birth: string | null; gender: string | null; address: string | null };
    doctor: { name: string };
    items: Item[];
}

export default function PrescriptionPrint({ prescription: rx }: { prescription: Rx }) {
    useEffect(() => {
        const t = setTimeout(() => window.print(), 400);
        return () => clearTimeout(t);
    }, []);

    const age = ageFromDob(rx.patient.date_of_birth);

    // window.close() only works on tabs opened by script. When the preview was
    // reached by a normal redirect the call is ignored, so fall back to the
    // prescription page.
    const closePreview = () => {
        window.close();
        setTimeout(() => {
            window.location.href = route('prescriptions.show', rx.id);
        }, 150);
    };

    return (
        <>
            <Head title={`Prescription ${rx.prescription_number}`} />
            <div className="min-h-screen bg-white text-black">
                <div className="print:hidden flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-3">
                    <span className="text-sm text-gray-600">Print preview</span>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="rounded-md bg-black px-4 py-1.5 text-sm font-medium text-white">
                            Print
                        </button>
                        <button onClick={closePreview} className="rounded-md border border-gray-300 px-4 py-1.5 text-sm">
                            Close
                        </button>
                    </div>
                </div>

                <div className="mx-auto max-w-[720px] px-8 py-8">
                    <div className="border-b-2 border-black pb-3 text-center">
                        <img src="/assets/logo.jpg" alt="" className="mx-auto mb-2 h-14 w-14 rounded-lg object-cover" />
                        <h1 className="text-xl font-bold">Rural Health Unit Clinic</h1>
                        <p className="text-sm">San Manuel, Isabela</p>
                    </div>

                    <div className="mt-4 flex justify-between text-sm">
                        <span>Rx No.: <strong>{rx.prescription_number}</strong></span>
                        <span>Date: <strong>{new Date(rx.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
                    </div>

                    <div className="mt-3 rounded-md border border-gray-400 p-3 text-sm">
                        <div>
                            Patient: <strong>{rx.patient.first_name} {rx.patient.last_name}</strong>
                            {age !== null && <> &nbsp;·&nbsp; Age: <strong>{age}</strong></>}
                            {rx.patient.gender && <> &nbsp;·&nbsp; Sex: <strong className="capitalize">{rx.patient.gender}</strong></>}
                        </div>
                        {rx.patient.address && <div className="mt-1">Address: {rx.patient.address}</div>}
                        {rx.diagnosis && <div className="mt-1">Diagnosis: {rx.diagnosis}</div>}
                    </div>

                    <div className="mt-5 text-3xl font-serif leading-none">&#8478;</div>

                    <table className="mt-2 w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-black text-left">
                                <th className="py-1.5 pr-2">Medicine</th>
                                <th className="py-1.5 pr-2">Dosage</th>
                                <th className="py-1.5 pr-2">Frequency</th>
                                <th className="py-1.5 pr-2">Duration</th>
                                <th className="py-1.5 text-right">Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rx.items.map((item) => (
                                <tr key={item.id} className="border-b border-gray-300 align-top">
                                    <td className="py-2 pr-2">
                                        <div className="font-semibold">
                                            {item.medicine.generic_name}{item.medicine.strength ? ` ${item.medicine.strength}` : ''}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {[item.medicine.brand_name, item.medicine.dosage_form].filter(Boolean).join(' · ')}
                                        </div>
                                        {item.instructions && <div className="mt-0.5 text-xs italic">Sig: {item.instructions}</div>}
                                    </td>
                                    <td className="py-2 pr-2">{item.dosage}</td>
                                    <td className="py-2 pr-2">{item.frequency}</td>
                                    <td className="py-2 pr-2">{item.duration}</td>
                                    <td className="py-2 text-right tabular-nums">{item.quantity}{item.unit ? ` / ${item.unit}` : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {rx.notes && <p className="mt-4 text-sm"><strong>Notes:</strong> {rx.notes}</p>}

                    <div className="mt-16 flex justify-end">
                        <div className="w-60 border-t border-black pt-1 text-center text-sm">
                            <div className="font-semibold">{rx.doctor.name}</div>
                            <div className="text-xs text-gray-600">Attending physician</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
