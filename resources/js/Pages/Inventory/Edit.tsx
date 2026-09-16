import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface InventoryItem {
    id: number;
    batch_number: string | null;
    expiry_date: string | null;
    quantity: number;
    unit_price: number;
    reorder_level: number;
    medicine: { id: number; generic_name: string; brand_name: string | null };
}

export default function InventoryEdit({ inventory }: { inventory: InventoryItem }) {
    const { data, setData, put, processing, errors } = useForm({
        batch_number: inventory.batch_number || '',
        quantity: String(inventory.quantity),
        unit_price: String(inventory.unit_price),
        expiry_date: inventory.expiry_date || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('inventory.update', inventory.id));
    };

    return (
        <AuthenticatedLayout header={`Edit Stock - ${inventory.medicine.generic_name}`}>
            <Head title="Edit Inventory" />
            <div className="page-content">
                <div className="page-content-narrow">
                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <InputLabel value="Medicine" />
                                    <p className="mt-1.5 text-sm font-medium text-soil-900">{inventory.medicine.generic_name}</p>
                                </div>
                                <div>
                                    <InputLabel htmlFor="batch_number" value="Batch Number" />
                                    <input id="batch_number" type="text" value={data.batch_number} onChange={(e) => setData('batch_number', e.target.value)} className="input-field mt-1.5" />
                                    <InputError message={errors.batch_number} className="mt-2" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="quantity" value="Quantity" />
                                        <input id="quantity" type="number" value={data.quantity} onChange={(e) => setData('quantity', e.target.value)} className="input-field mt-1.5" required />
                                        <InputError message={errors.quantity} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="unit_price" value="Unit Price" />
                                        <input id="unit_price" type="number" step="0.01" value={data.unit_price} onChange={(e) => setData('unit_price', e.target.value)} className="input-field mt-1.5" required />
                                        <InputError message={errors.unit_price} className="mt-2" />
                                    </div>
                                </div>
                                <div>
                                    <InputLabel htmlFor="expiry_date" value="Expiry Date" />
                                    <input id="expiry_date" type="date" value={data.expiry_date} onChange={(e) => setData('expiry_date', e.target.value)} className="input-field mt-1.5" />
                                    <InputError message={errors.expiry_date} className="mt-2" />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Link href={route('inventory.index')} className="btn btn-secondary">Cancel</Link>
                                    <PrimaryButton disabled={processing}>Update Stock</PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
