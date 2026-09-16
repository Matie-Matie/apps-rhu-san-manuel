import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

interface Patient { id: number; first_name: string; last_name: string; }
interface Medicine { id: number; generic_name: string; total_stock: number | null; stock_status: string; }

const stockBadge: Record<string, { label: string; badgeClass: string }> = {
    in_stock: { label: 'In Stock', badgeClass: 'badge-in-stock' },
    low_stock: { label: 'Low Stock', badgeClass: 'badge-low-stock' },
    out_of_stock: { label: 'Out of Stock', badgeClass: 'badge-out-of-stock' },
};

export default function PrescriptionsCreate({ patients, medicines }: { patients: Patient[]; medicines: Medicine[] }) {
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
            instructions: string;
        }>,
    });

    const addItem = () => {
        setData('items', [...data.items, { medicine_id: '', dosage: '', frequency: '', duration: '', quantity: '', instructions: '' }]);
    };

    const removeItem = (idx: number) => {
        setData('items', data.items.filter((_, i) => i !== idx));
    };

    const updateItem = (idx: number, field: string, value: string) => {
        const items = [...data.items];
        items[idx] = { ...items[idx], [field]: value };
        setData('items', items);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('prescriptions.store'));
    };

    const getMedicineOption = (m: Medicine) => {
        const stockText = m.total_stock !== null && m.total_stock !== undefined ? ` (${m.total_stock} avail)` : '';
        return `${m.generic_name}${stockText}`;
    };

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
                                            <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                                        ))}
                                    </select>
                                    {errors.patient_id && <p className="input-error">{errors.patient_id}</p>}
                                </div>
                                <div>
                                    <label className="input-label">Diagnosis</label>
                                    <textarea value={data.diagnosis} onChange={(e) => setData('diagnosis', e.target.value)} rows={2} className="input-field mt-1.5" />
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
                                                        <div>
                                                            <label className="text-xs font-medium text-soil-600">Medicine</label>
                                                            <div className="mt-1 flex items-center gap-2">
                                                                <select value={item.medicine_id} onChange={(e) => updateItem(idx, 'medicine_id', e.target.value)} className="input-field text-sm">
                                                                    <option value="">Select</option>
                                                                    {medicines.map((m) => (
                                                                        <option key={m.id} value={m.id}>{getMedicineOption(m)}</option>
                                                                    ))}
                                                                </select>
                                                                {badge && (
                                                                    <span className={`shrink-0 ${badge.badgeClass}`}>{badge.label}</span>
                                                                )}
                                                            </div>
                                                            {selectedMedicine && selectedMedicine.stock_status === 'out_of_stock' && (
                                                                <p className="mt-1 text-xs text-error">This medicine is out of stock. Prescription will be pending until stock arrives.</p>
                                                            )}
                                                            {selectedMedicine && selectedMedicine.stock_status === 'low_stock' && (
                                                                <p className="mt-1 text-xs text-warning">Only {selectedMedicine.total_stock} available. Dispensing may be limited.</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-soil-600">Dosage</label>
                                                            <input type="text" value={item.dosage} onChange={(e) => updateItem(idx, 'dosage', e.target.value)} className="input-field mt-1 text-sm" placeholder="e.g. 1 tablet" />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-soil-600">Frequency</label>
                                                            <input type="text" value={item.frequency} onChange={(e) => updateItem(idx, 'frequency', e.target.value)} className="input-field mt-1 text-sm" placeholder="e.g. 3x a day" />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-soil-600">Duration</label>
                                                            <input type="text" value={item.duration} onChange={(e) => updateItem(idx, 'duration', e.target.value)} className="input-field mt-1 text-sm" placeholder="e.g. 7 days" />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-soil-600">Quantity</label>
                                                            <input type="number" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} className="input-field mt-1 text-sm" />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-soil-600">Instructions</label>
                                                            <input type="text" value={item.instructions} onChange={(e) => updateItem(idx, 'instructions', e.target.value)} className="input-field mt-1 text-sm" />
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
