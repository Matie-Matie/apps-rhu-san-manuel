import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Medicine {
    id: number;
    generic_name: string;
    brand_name: string | null;
    category: string | null;
    dosage_form: string | null;
    strength: string | null;
}

export default function MedicinesEdit({ medicine }: { medicine: Medicine }) {
    const { data, setData, put, processing, errors } = useForm({
        generic_name: medicine.generic_name,
        brand_name: medicine.brand_name || '',
        category: medicine.category || '',
        dosage_form: medicine.dosage_form || '',
        strength: medicine.strength || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('medicines.update', medicine.id));
    };

    return (
        <AuthenticatedLayout header="Edit Medicine">
            <Head title="Edit Medicine" />
            <div className="page-content">
                <div className="page-content-narrow">
                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <InputLabel htmlFor="generic_name" value="Generic Name" />
                                    <TextInput id="generic_name" value={data.generic_name} onChange={(e) => setData('generic_name', e.target.value)} className="mt-1.5 block w-full" required />
                                    <InputError message={errors.generic_name} className="mt-2" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="brand_name" value="Brand Name" />
                                        <TextInput id="brand_name" value={data.brand_name} onChange={(e) => setData('brand_name', e.target.value)} className="mt-1.5 block w-full" />
                                        <InputError message={errors.brand_name} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="category" value="Category" />
                                        <TextInput id="category" value={data.category} onChange={(e) => setData('category', e.target.value)} className="mt-1.5 block w-full" />
                                        <InputError message={errors.category} className="mt-2" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="dosage_form" value="Dosage Form" />
                                        <TextInput id="dosage_form" value={data.dosage_form} onChange={(e) => setData('dosage_form', e.target.value)} className="mt-1.5 block w-full" />
                                        <InputError message={errors.dosage_form} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="strength" value="Strength" />
                                        <TextInput id="strength" value={data.strength} onChange={(e) => setData('strength', e.target.value)} className="mt-1.5 block w-full" />
                                        <InputError message={errors.strength} className="mt-2" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Link href={route('medicines.index')} className="btn btn-secondary">Cancel</Link>
                                    <PrimaryButton disabled={processing}>Update Medicine</PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
