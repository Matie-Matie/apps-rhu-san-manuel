import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface Medicine { id: number; generic_name: string; }
interface PrescriptionItem { id: number; medicine: Medicine; dosage: string; frequency: string; duration: string; quantity: number; instructions: string | null; }
interface InventoryOption { id: number; batch_number: string | null; quantity: number; unit_price: number; expiry_date: string | null; medicine: Medicine; }

interface PrescriptionData {
    id: number;
    prescription_number: string;
    patient: { first_name: string; last_name: string };
    doctor: { name: string };
    items: PrescriptionItem[];
}

export default function DispensingCreate({ prescription, inventory }: { prescription: PrescriptionData; inventory: InventoryOption[] }) {
    const { data, setData, post, processing, errors } = useForm({
        notes: '',
        items: prescription.items.map((item) => ({
            prescription_item_id: item.id,
            medicine_inventory_id: '',
            quantity: String(item.quantity),
        })),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dispensing.store', prescription.id));
    };

    const updateItem = (idx: number, field: string, value: string) => {
        const items = [...data.items];
        items[idx] = { ...items[idx], [field]: value };
        setData('items', items);
    };

    const getAvailableInventory = (item: PrescriptionItem) => {
        return inventory.filter((inv) => inv.medicine.id === item.medicine.id && inv.quantity > 0);
    };

    return (
        <AuthenticatedLayout header={`Dispense - ${prescription.prescription_number}`}>
            <Head title="Dispense Prescription" />
            <div className="page-content">
                <div className="mx-auto max-w-4xl space-y-6">
                    {/* Prescription Info */}
                    <div className="card">
                        <div className="card-body">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <span className="text-sm text-soil-500">Patient</span>
                                    <p className="text-sm font-medium text-soil-900">{prescription.patient.first_name} {prescription.patient.last_name}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-soil-500">Doctor</span>
                                    <p className="text-sm font-medium text-soil-900">{prescription.doctor.name}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-soil-500">Prescription</span>
                                    <p className="text-sm font-medium text-soil-900">{prescription.prescription_number}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dispensing Form */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Select Inventory Batches</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={submit} className="space-y-6">
                                {prescription.items.map((item, idx) => {
                                    const available = getAvailableInventory(item);
                                    return (
                                        <div key={item.id} className="rounded-control border border-soil-200 bg-surface-secondary p-4">
                                            <div className="mb-3">
                                                <span className="text-sm font-medium text-soil-900">{item.medicine.generic_name}</span>
                                                <span className="ml-2 text-sm text-soil-500">
                                                    ({item.dosage}, {item.frequency}, {item.duration}, prescribed {item.quantity})
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="input-label">Inventory Batch</label>
                                                    <select
                                                        value={data.items[idx].medicine_inventory_id}
                                                        onChange={(e) => updateItem(idx, 'medicine_inventory_id', e.target.value)}
                                                        className="input-field mt-1.5"
                                                    >
                                                        <option value="">Select batch</option>
                                                        {available.map((inv) => (
                                                            <option key={inv.id} value={inv.id}>
                                                                {inv.batch_number || 'No batch'}, {inv.quantity} avail, &#x20B1;{Number(inv.unit_price).toFixed(2)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {available.length === 0 && (
                                                        <p className="mt-1.5 text-xs text-error">No stock available for this medicine.</p>
                                                    )}
                                                    {errors[`items.${idx}.medicine_inventory_id`] && (
                                                        <p className="input-error">{errors[`items.${idx}.medicine_inventory_id`]}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="input-label">Quantity to Dispense</label>
                                                    <input
                                                        type="number"
                                                        value={data.items[idx].quantity}
                                                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                                                        min="1"
                                                        className="input-field mt-1.5"
                                                    />
                                                    {errors[`items.${idx}.quantity`] && (
                                                        <p className="input-error">{errors[`items.${idx}.quantity`]}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div>
                                    <label className="input-label">Notes</label>
                                    <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={2} className="input-field mt-1.5" />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <Link href={route('prescriptions.show', prescription.id)} className="btn btn-secondary">Cancel</Link>
                                    <button type="submit" disabled={processing} className="btn btn-primary">
                                        Complete Dispensing
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
