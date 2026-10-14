import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface Patient { id: number; first_name: string; last_name: string; age: number | null; }
interface Medicine {
    id: number;
    generic_name: string;
    strength: string | null;
    total_stock: number | null;
    stock_status: string;
}
interface Options { dosages: string[]; frequencies: string[]; durations: string[]; quantities: number[]; units: string[]; }

interface HistoryVital {
    bp_systolic: number | null;
    bp_diastolic: number | null;
    height_cm: number | null;
    weight_kg: number | null;
    created_at: string;
}
interface HistoryRx {
    id: number;
    prescription_number: string;
    diagnosis: string | null;
    status: string;
    created_at: string;
    doctor: string | null;
    items: { medicine: string | null; strength: string | null; dosage: string; frequency: string; duration: string; quantity: number; unit: string | null }[];
}
interface History {
    patient: { age: number | null; gender: string | null };
    latest_vital: HistoryVital | null;
    prescriptions: HistoryRx[] | null;
    prescriptions_total: number | null;
}

const PER_DAY: Record<string, number> = {
    'Once a day (OD)': 1,
    'Twice a day (BID)': 2,
    '3 times a day (TID)': 3,
    '4 times a day (QID)': 4,
    'Every 4 hours': 6,
    'Every 6 hours': 4,
    'Every 8 hours': 3,
    'Every 12 hours': 2,
    'At bedtime (HS)': 1,
    'Once a week': 1 / 7,
    'Single dose (STAT)': 1,
};

// Units (tablets, capsules...) per dose. Liquids/topicals are dispensed by bottle/tube, so no suggestion.
function unitsPerDose(dosage: string): number | null {
    if (!/(tablet|capsule|sachet|ampule|vial|suppository)/i.test(dosage)) return null;
    const frac = dosage.match(/^(\d+)\/(\d+)\s/);
    if (frac) return Number(frac[1]) / Number(frac[2]);
    const whole = dosage.match(/^(\d+)\s/);
    return whole ? Number(whole[1]) : null;
}

function durationDays(duration: string): number | null {
    const d = duration.match(/^(\d+) days?$/);
    if (d) return Number(d[1]);
    const m = duration.match(/^(\d+) months?$/);
    return m ? Number(m[1]) * 30 : null;
}

function suggestQuantity(item: { dosage: string; frequency: string; duration: string }, allowed: number[]): number | null {
    const units = unitsPerDose(item.dosage);
    const perDay = PER_DAY[item.frequency];
    const days = item.frequency === 'Single dose (STAT)' ? 1 : durationDays(item.duration);
    if (units === null || perDay === undefined || days === null) return null;
    const total = Math.ceil(units * perDay * days);
    return allowed.includes(total) ? total : null;
}

const stockBadge: Record<string, { label: string; badgeClass: string }> = {
    in_stock: { label: 'In Stock', badgeClass: 'badge-in-stock' },
    low_stock: { label: 'Low Stock', badgeClass: 'badge-low-stock' },
    out_of_stock: { label: 'Out of Stock', badgeClass: 'badge-out-of-stock' },
};

function PatientHistoryPanel({ patientId }: { patientId: string }) {
    const [history, setHistory] = useState<History | null>(null);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!patientId) {
            setHistory(null);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setFailed(false);
        axios
            .get<History>(route('patients.history', patientId))
            .then((res) => !cancelled && setHistory(res.data))
            .catch(() => !cancelled && setFailed(true))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [patientId]);

    if (!patientId) return null;

    const vital = history?.latest_vital;
    const vitalBits = vital
        ? [
              vital.bp_systolic && vital.bp_diastolic ? `BP ${vital.bp_systolic}/${vital.bp_diastolic}` : null,
              vital.weight_kg ? `${vital.weight_kg} kg` : null,
              vital.height_cm ? `${vital.height_cm} cm` : null,
          ].filter(Boolean)
        : [];

    return (
        <div className="rounded-control border border-accent-200 bg-accent-50/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-soil-900">Patient history</h4>
                <Link href={route('patients.show', patientId)} className="text-xs font-medium text-accent-600 hover:underline" target="_blank">
                    Open full record
                </Link>
            </div>

            {loading && <p className="mt-2 text-sm text-soil-500">Loading history…</p>}
            {failed && <p className="mt-2 text-sm text-error">Could not load this patient's history.</p>}

            {history && !loading && (
                <>
                    <p className="mt-1 text-xs capitalize text-soil-500">
                        {[history.patient.age !== null ? `${history.patient.age} yrs` : null, history.patient.gender].filter(Boolean).join(' · ')}
                        {vitalBits.length > 0 && ` · Last vitals: ${vitalBits.join(', ')} (${new Date(vital!.created_at).toLocaleDateString()})`}
                    </p>

                    {history.prescriptions && history.prescriptions.length > 0 ? (
                        <ul className="mt-3 max-h-72 space-y-3 overflow-y-auto pr-1">
                            {history.prescriptions.map((rx) => (
                                <li key={rx.id} className="rounded-control border border-soil-200 bg-surface p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-xs font-semibold text-soil-900">
                                            {rx.prescription_number}
                                            <span className={`badge badge-${rx.status} ml-2`}>{rx.status}</span>
                                        </span>
                                        <span className="text-xs text-soil-500">{new Date(rx.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {rx.diagnosis && <p className="mt-1 text-xs text-soil-700">Dx: {rx.diagnosis}</p>}
                                    <ul className="mt-1 space-y-0.5">
                                        {rx.items.map((item, i) => (
                                            <li key={i} className="text-xs text-soil-600">
                                                <span className="font-medium text-soil-800">{item.medicine}{item.strength ? ` ${item.strength}` : ''}</span>
                                                {' — '}{item.dosage}, {item.frequency}, {item.duration} · qty {item.quantity}{item.unit ? ` (${item.unit})` : ''}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                            {history.prescriptions_total !== null && history.prescriptions_total > history.prescriptions.length && (
                                <li className="text-center text-xs text-soil-500">
                                    Showing latest {history.prescriptions.length} of {history.prescriptions_total}.
                                </li>
                            )}
                        </ul>
                    ) : (
                        <p className="mt-2 text-sm text-soil-500">No previous prescriptions for this patient.</p>
                    )}
                </>
            )}
        </div>
    );
}

export default function PrescriptionsCreate({
    patients,
    medicines,
    diagnoses,
    options,
}: {
    patients: Patient[];
    medicines: Medicine[];
    diagnoses: string[];
    options: Options;
}) {
    const { data, setData, post, processing, errors } = useForm({
        patient_id: '',
        diagnosis: '',
        notes: '',
        items: [] as Array<{
            medicine_id: string;
            dosage: string;
            frequency: string;
            duration: string;
            quantity: string;
            unit: string;
            instructions: string;
        }>,
    });

    const addItem = () => {
        setData('items', [...data.items, { medicine_id: '', dosage: '', frequency: '', duration: '', quantity: '', unit: '', instructions: '' }]);
    };

    const removeItem = (idx: number) => {
        setData('items', data.items.filter((_, i) => i !== idx));
    };

    const updateItem = (idx: number, field: string, value: string) => {
        const items = [...data.items];
        const before = items[idx];
        const next = { ...before, [field]: value };

        // Keep quantity in step with dosage x frequency x duration until the doctor picks their own number.
        if (['dosage', 'frequency', 'duration'].includes(field)) {
            const prev = suggestQuantity(before, options.quantities);
            const fresh = suggestQuantity(next, options.quantities);
            if (before.quantity === '' || before.quantity === String(prev)) {
                next.quantity = fresh !== null ? String(fresh) : before.quantity === String(prev) ? '' : before.quantity;
            }
        }

        items[idx] = next;
        setData('items', items);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('prescriptions.store'));
    };

    const getMedicineOption = (m: Medicine) => {
        const stockText = m.total_stock !== null && m.total_stock !== undefined ? ` (${m.total_stock} avail)` : '';
        return `${m.generic_name}${m.strength ? ` ${m.strength}` : ''}${stockText}`;
    };

    const itemError = (idx: number, field: string) => (errors as Record<string, string>)[`items.${idx}.${field}`];

    const selectField = (idx: number, field: 'dosage' | 'frequency' | 'duration' | 'quantity' | 'unit', label: string, values: (string | number)[]) => (
        <div>
            <label className="text-xs font-medium text-soil-600">{label}</label>
            <select
                value={data.items[idx][field]}
                onChange={(e) => updateItem(idx, field, e.target.value)}
                className="input-field mt-1 text-sm"
                required
            >
                <option value="">Select</option>
                {values.map((v) => (
                    <option key={v} value={v}>{v}</option>
                ))}
            </select>
            {itemError(idx, field) && <p className="input-error">{itemError(idx, field)}</p>}
        </div>
    );

    return (
        <AuthenticatedLayout header="New Prescription">
            <Head title="New Prescription" />
            <div className="page-content">
                <div className="page-content-narrow">
                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <label className="input-label">Patient</label>
                                    <select value={data.patient_id} onChange={(e) => setData('patient_id', e.target.value)} className="input-field mt-1.5">
                                        <option value="">Select Patient</option>
                                        {patients.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.first_name} {p.last_name}{p.age !== null ? ` (${p.age} yrs)` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.patient_id && <p className="input-error">{errors.patient_id}</p>}
                                </div>

                                <PatientHistoryPanel patientId={data.patient_id} />

                                <div>
                                    <label className="input-label">Diagnosis</label>
                                    <input
                                        type="text"
                                        list="diagnosis-options"
                                        value={data.diagnosis}
                                        onChange={(e) => setData('diagnosis', e.target.value)}
                                        placeholder="Pick a common diagnosis or type your own"
                                        maxLength={255}
                                        className="input-field mt-1.5"
                                    />
                                    <datalist id="diagnosis-options">
                                        {diagnoses.map((d) => (
                                            <option key={d} value={d} />
                                        ))}
                                    </datalist>
                                    {errors.diagnosis && <p className="input-error">{errors.diagnosis}</p>}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between">
                                        <h3 className="card-title">Medication Items</h3>
                                        <button type="button" onClick={addItem} className="btn btn-secondary btn-sm">Add Item</button>
                                    </div>
                                    {errors.items && <p className="input-error">{errors.items}</p>}

                                    {/* Stock legend */}
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-soil-500">
                                        <span className="badge badge-in-stock shrink-0">In Stock</span>
                                        <span className="badge badge-low-stock shrink-0">Low Stock</span>
                                        <span className="badge badge-out-of-stock shrink-0">Out of Stock</span>
                                    </div>

                                    <div className="mt-4 space-y-4">
                                        {data.items.map((item, idx) => {
                                            const selectedMedicine = medicines.find((m) => String(m.id) === item.medicine_id);
                                            const badge = selectedMedicine ? stockBadge[selectedMedicine.stock_status] : null;

                                            return (
                                                <div key={idx} className="rounded-control border border-soil-200 bg-surface-secondary p-4">
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <span className="text-sm font-medium text-soil-700">Item #{idx + 1}</span>
                                                        <button type="button" onClick={() => removeItem(idx)} className="text-sm font-medium text-error hover:opacity-80">Remove</button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="col-span-2">
                                                            <label className="text-xs font-medium text-soil-600">Medicine</label>
                                                            <div className="mt-1 flex items-center gap-2">
                                                                <select value={item.medicine_id} onChange={(e) => updateItem(idx, 'medicine_id', e.target.value)} className="input-field text-sm" required>
                                                                    <option value="">Select</option>
                                                                    {medicines.map((m) => (
                                                                        <option key={m.id} value={m.id}>{getMedicineOption(m)}</option>
                                                                    ))}
                                                                </select>
                                                                {badge && (
                                                                    <span className={`shrink-0 ${badge.badgeClass}`}>{badge.label}</span>
                                                                )}
                                                            </div>
                                                            {itemError(idx, 'medicine_id') && <p className="input-error">{itemError(idx, 'medicine_id')}</p>}
                                                            {selectedMedicine && selectedMedicine.stock_status === 'out_of_stock' && (
                                                                <p className="mt-1 text-xs text-error">This medicine is out of stock. You can print the prescription so the patient can buy it outside.</p>
                                                            )}
                                                            {selectedMedicine && selectedMedicine.stock_status === 'low_stock' && (
                                                                <p className="mt-1 text-xs text-warning">Only {selectedMedicine.total_stock} available. Dispensing may be limited.</p>
                                                            )}
                                                        </div>
                                                        {selectField(idx, 'dosage', 'Dosage', options.dosages)}
                                                        {selectField(idx, 'frequency', 'Frequency', options.frequencies)}
                                                        {selectField(idx, 'duration', 'Duration', options.durations)}
                                                        <div>
                                                            {selectField(idx, 'quantity', 'Quantity', options.quantities)}
                                                            {(() => {
                                                                const suggested = suggestQuantity(item, options.quantities);
                                                                if (suggested === null) return null;
                                                                return item.quantity === String(suggested) ? (
                                                                    <p className="mt-1 text-[11px] text-soil-500">Auto-set from dosage × frequency × duration.</p>
                                                                ) : (
                                                                    <p className="mt-1 text-[11px] text-soil-500">
                                                                        Suggested: {suggested}{' '}
                                                                        <button type="button" onClick={() => updateItem(idx, 'quantity', String(suggested))} className="font-medium text-accent-600 hover:underline">
                                                                            Use
                                                                        </button>
                                                                    </p>
                                                                );
                                                            })()}
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-soil-600">Unit</label>
                                                            <select
                                                                value={item.unit}
                                                                onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                                                                className="input-field mt-1 text-sm"
                                                                required
                                                            >
                                                                <option value="">Select</option>
                                                                {options.units.map((u) => (
                                                                    <option key={u} value={u}>Per {u}</option>
                                                                ))}
                                                            </select>
                                                            {itemError(idx, 'unit') && <p className="input-error">{itemError(idx, 'unit')}</p>}
                                                        </div>
                                                        <div className="col-span-2">
                                                            <label className="text-xs font-medium text-soil-600">Instructions (optional)</label>
                                                            <input type="text" value={item.instructions} onChange={(e) => updateItem(idx, 'instructions', e.target.value)} className="input-field mt-1 text-sm" placeholder="e.g. after meals" />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {data.items.length === 0 && (
                                            <div className="rounded-control border-2 border-dashed border-soil-200 bg-surface px-6 py-10 text-center">
                                                <p className="text-sm text-soil-500">No medication items added yet.</p>
                                                <button type="button" onClick={addItem} className="btn btn-ghost btn-sm mt-3">Add First Item</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="input-label">Notes</label>
                                    <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={2} className="input-field mt-1.5" />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <Link href={route('prescriptions.index')} className="btn btn-secondary">Cancel</Link>
                                    <button type="submit" className="btn btn-primary" disabled={processing}>
                                        Create Prescription
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
