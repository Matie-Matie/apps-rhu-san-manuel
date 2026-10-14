import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ageFromDob, formatDate } from '@/lib/patient';

interface PatientInfo {
    id: number;
    first_name: string;
    last_name: string;
    age: number | null;
    gender: string | null;
    date_of_birth: string | null;
    address: string | null;
    contact_number: string | null;
}

interface Vital {
    id: number;
    bp_systolic: number | null;
    bp_diastolic: number | null;
    height_cm: number | null;
    weight_kg: number | null;
    temperature_c: number | null;
    pulse_rate: number | null;
    created_at: string;
    recorder: { name: string } | null;
}

interface RxItem {
    medicine: string | null;
    strength: string | null;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
}

interface RxHistory {
    id: number;
    prescription_number: string;
    diagnosis: string | null;
    status: string;
    created_at: string;
    dispensed_at: string | null;
    doctor: string | null;
    items: RxItem[];
}

interface Props {
    patient: PatientInfo;
    vitals: Vital[];
    latest_vital: Vital | null;
    prescriptions: RxHistory[] | null;
    prescriptions_total: number | null;
    can_record_vitals: boolean;
}

function bmi(v: Vital | null) {
    if (!v?.height_cm || !v?.weight_kg) return null;
    const m = v.height_cm / 100;
    return v.weight_kg / (m * m);
}

function bp(v: Vital) {
    return v.bp_systolic && v.bp_diastolic ? `${v.bp_systolic}/${v.bp_diastolic}` : '-';
}

function fmt(value: number | null, unit: string) {
    return value === null || value === undefined ? '-' : `${value} ${unit}`;
}

function VitalTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-control border border-soil-200 bg-surface-secondary px-3 py-2.5">
            <div className="text-[11px] font-medium uppercase tracking-wide text-soil-500">{label}</div>
            <div className="mt-0.5 text-[15px] font-semibold tabular-nums text-soil-900">{value}</div>
        </div>
    );
}

export default function PatientsShow({
    patient,
    vitals,
    latest_vital,
    prescriptions,
    prescriptions_total,
    can_record_vitals,
}: Props) {
    const { auth } = usePage().props as any;
    const role = auth?.user?.role;

    const { data, setData, post, processing, errors, reset } = useForm({
        bp_systolic: '',
        bp_diastolic: '',
        height_cm: '',
        weight_kg: '',
        temperature_c: '',
        pulse_rate: '',
    });

    const submitVitals = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('patients.vitals.store', patient.id), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const age = patient.age ?? ageFromDob(patient.date_of_birth);
    const latestBmi = bmi(latest_vital);

    const numberField = (
        key: keyof typeof data,
        label: string,
        props: { min: number; max: number; step?: string; placeholder?: string },
    ) => (
        <div>
            <label className="text-xs font-medium text-soil-600">{label}</label>
            <input
                type="number"
                inputMode="decimal"
                min={props.min}
                max={props.max}
                step={props.step ?? '1'}
                placeholder={props.placeholder}
                value={data[key]}
                onChange={(e) => setData(key, e.target.value)}
                className="input-field mt-1 text-sm"
            />
            <InputError message={errors[key]} className="mt-1" />
        </div>
    );

    return (
        <AuthenticatedLayout header={`${patient.first_name} ${patient.last_name}`}>
            <Head title={`${patient.first_name} ${patient.last_name}`} />
            <div className="page-content">
                <div className="mx-auto max-w-4xl space-y-6">
                    {/* Patient info */}
                    <div className="card">
                        <div className="card-body">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h3 className="card-title">
                                        {patient.first_name} {patient.last_name}
                                    </h3>
                                    <p className="mt-0.5 text-sm capitalize text-soil-500">
                                        {[age !== null ? `${age} yrs` : null, patient.gender].filter(Boolean).join(' · ') || 'No demographics on file'}
                                    </p>
                                </div>
                                {role !== 'pharmacist' && (
                                    <Link href={route('patients.edit', patient.id)} className="btn btn-secondary btn-sm">
                                        Edit patient
                                    </Link>
                                )}
                            </div>
                            <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                                <div>
                                    <dt className="text-soil-500">Date of birth</dt>
                                    <dd className="font-medium text-soil-900">{formatDate(patient.date_of_birth)}</dd>
                                </div>
                                <div>
                                    <dt className="text-soil-500">Contact</dt>
                                    <dd className="font-medium tabular-nums text-soil-900">{patient.contact_number || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-soil-500">Address</dt>
                                    <dd className="font-medium text-soil-900">{patient.address || '-'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Vitals */}
                    <div className="card overflow-hidden">
                        <div className="card-header">
                            <h4 className="card-title">Vital Signs</h4>
                            {latest_vital && (
                                <span className="text-xs text-soil-500">
                                    Last recorded {new Date(latest_vital.created_at).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <div className="card-body space-y-5">
                            {latest_vital ? (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                                    <VitalTile label="Blood pressure" value={bp(latest_vital) === '-' ? '-' : `${bp(latest_vital)} mmHg`} />
                                    <VitalTile label="Height" value={fmt(latest_vital.height_cm, 'cm')} />
                                    <VitalTile label="Weight" value={fmt(latest_vital.weight_kg, 'kg')} />
                                    <VitalTile label="BMI" value={latestBmi ? latestBmi.toFixed(1) : '-'} />
                                    <VitalTile label="Temperature" value={fmt(latest_vital.temperature_c, '°C')} />
                                    <VitalTile label="Pulse" value={fmt(latest_vital.pulse_rate, 'bpm')} />
                                </div>
                            ) : (
                                <p className="text-sm text-soil-500">No vital signs recorded yet.</p>
                            )}

                            {can_record_vitals && (
                                <form onSubmit={submitVitals} className="rounded-control border border-soil-200 bg-surface-secondary p-4">
                                    <div className="mb-3 text-sm font-medium text-soil-700">Record new vitals</div>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        {numberField('bp_systolic', 'BP systolic (mmHg)', { min: 50, max: 300, placeholder: '120' })}
                                        {numberField('bp_diastolic', 'BP diastolic (mmHg)', { min: 30, max: 200, placeholder: '80' })}
                                        {numberField('pulse_rate', 'Pulse (bpm)', { min: 20, max: 250, placeholder: '72' })}
                                        {numberField('height_cm', 'Height (cm)', { min: 30, max: 250, step: '0.1', placeholder: '165' })}
                                        {numberField('weight_kg', 'Weight (kg)', { min: 1, max: 500, step: '0.1', placeholder: '60' })}
                                        {numberField('temperature_c', 'Temperature (°C)', { min: 30, max: 45, step: '0.1', placeholder: '36.6' })}
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <button type="submit" className="btn btn-primary btn-sm" disabled={processing}>
                                            Save vitals
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {vitals.length > 1 && (
                            <div className="table-container rounded-none border-0 border-t border-soil-200 shadow-none">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>BP</th>
                                            <th>Height</th>
                                            <th>Weight</th>
                                            <th>Temp</th>
                                            <th>Pulse</th>
                                            <th>By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vitals.map((v) => (
                                            <tr key={v.id}>
                                                <td className="whitespace-nowrap">{new Date(v.created_at).toLocaleDateString()}</td>
                                                <td className="tabular-nums">{bp(v)}</td>
                                                <td className="tabular-nums">{fmt(v.height_cm, 'cm')}</td>
                                                <td className="tabular-nums">{fmt(v.weight_kg, 'kg')}</td>
                                                <td className="tabular-nums">{fmt(v.temperature_c, '°C')}</td>
                                                <td className="tabular-nums">{fmt(v.pulse_rate, 'bpm')}</td>
                                                <td className="text-soil-500">{v.recorder?.name ?? '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Prescription history (hidden from staff) */}
                    {prescriptions !== null && (
                        <div className="card overflow-hidden">
                            <div className="card-header">
                                <h4 className="card-title">Prescription History</h4>
                                <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold tabular-nums text-accent-700">
                                    {prescriptions_total} total
                                </span>
                            </div>
                            {prescriptions.length === 0 ? (
                                <p className="px-5 py-8 text-center text-sm text-soil-500">No prescriptions for this patient yet.</p>
                            ) : (
                                <ul className="divide-y divide-soil-100">
                                    {prescriptions.map((rx) => (
                                        <li key={rx.id} className="px-5 py-4">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={route('prescriptions.show', rx.id)}
                                                        className="text-sm font-semibold text-soil-900 hover:text-accent-600"
                                                    >
                                                        {rx.prescription_number}
                                                    </Link>
                                                    <span className={`badge badge-${rx.status}`}>{rx.status}</span>
                                                </div>
                                                <span className="text-xs text-soil-500">
                                                    {new Date(rx.created_at).toLocaleDateString()}
                                                    {rx.doctor ? ` · ${rx.doctor}` : ''}
                                                </span>
                                            </div>
                                            {rx.diagnosis && (
                                                <p className="mt-1 text-sm text-soil-700">
                                                    <span className="text-soil-500">Diagnosis:</span> {rx.diagnosis}
                                                </p>
                                            )}
                                            <ul className="mt-2 space-y-1">
                                                {rx.items.map((item, i) => (
                                                    <li key={i} className="text-sm text-soil-700">
                                                        <span className="font-medium text-soil-900">
                                                            {item.medicine}
                                                            {item.strength ? ` ${item.strength}` : ''}
                                                        </span>
                                                        {' — '}
                                                        {item.dosage}, {item.frequency}, {item.duration} · qty {item.quantity}
                                                    </li>
                                                ))}
                                            </ul>
                                            {rx.dispensed_at && (
                                                <p className="mt-2 text-xs text-success">
                                                    Received by patient {new Date(rx.dispensed_at).toLocaleString()}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
