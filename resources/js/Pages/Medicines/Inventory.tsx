import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { Head, useForm } from '@inertiajs/react';

interface Medicine {
    id: number;
    generic_name: string;
    brand_name: string | null;
}

interface StockEntry {
    id: number;
    batch_number: string | null;
    expiry_date: string | null;
    quantity: number;
    unit_price: number;
}

export default function MedicinesInventory({ medicine, stockEntries }: { medicine: Medicine; stockEntries: StockEntry[] }) {
    const { data, setData, post, processing, errors } = useForm({
        batch_number: '',
        quantity: '',
        unit_price: '',
        expiry_date: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('medicines.stock-in', medicine.id));
    };

    return (
        <AuthenticatedLayout header={`Stock - ${medicine.generic_name}`}>
            <Head title="Stock Management" />
            <div className="page-content">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Stock In Form */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Add Stock</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <InputLabel value="Batch Number" />
                                    <input type="text" value={data.batch_number} onChange={(e) => setData('batch_number', e.target.value)} className="input-field mt-1.5" />
                                    <InputError message={errors.batch_number} className="mt-2" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel value="Quantity" />
                                        <input type="number" value={data.quantity} onChange={(e) => setData('quantity', e.target.value)} className="input-field mt-1.5" required />
                                        <InputError message={errors.quantity} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Unit Price" />
                                        <input type="number" step="0.01" value={data.unit_price} onChange={(e) => setData('unit_price', e.target.value)} className="input-field mt-1.5" required />
                                        <InputError message={errors.unit_price} className="mt-2" />
                                    </div>
                                </div>
                                <div>
                                    <InputLabel value="Expiry Date" />
                                    <input type="date" value={data.expiry_date} onChange={(e) => setData('expiry_date', e.target.value)} className="input-field mt-1.5" />
                                    <InputError message={errors.expiry_date} className="mt-2" />
                                </div>
                                <button type="submit" className="btn btn-primary w-full" disabled={processing}>
                                    Add Stock
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Stock Entries */}
                    <div className="card overflow-hidden lg:col-span-2">
                        <div className="card-header">
                            <h3 className="card-title">Stock History</h3>
                        </div>
                        <div className="p-0">
                            <div className="table-container rounded-none border-0 shadow-none">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Batch</th>
                                            <th>Quantity</th>
                                            <th>Unit Price</th>
                                            <th>Expiry</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stockEntries.map((entry) => (
                                            <tr key={entry.id}>
                                                <td className="font-medium text-soil-900">{entry.batch_number || 'N/A'}</td>
                                                <td className="tabular-nums">{entry.quantity}</td>
                                                <td className="tabular-nums">&#x20B1;{Number(entry.unit_price).toFixed(2)}</td>
                                                <td className="tabular-nums">{entry.expiry_date ? new Date(entry.expiry_date).toLocaleDateString() : 'N/A'}</td>
                                            </tr>
                                        ))}
                                        {stockEntries.length === 0 && (
                                            <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-soil-500">No stock entries yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
