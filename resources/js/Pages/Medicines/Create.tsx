import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function MedicinesCreate() {
    const { data, setData, post, processing, errors } = useForm({
        generic_name: '',
        brand_name: '',
        category: '',
        dosage_form: '',
        strength: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('medicines.store'));
    };

    return (
        <AuthenticatedLayout header="Add Medicine">
            <Head title="Add Medicine" />
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
                                        <TextInput id="dosage_form" value={data.dosage_form} onChange={(e) => setData('dosage_form', e.target.value)} className="mt-1.5 block w-full" placeholder="e.g. Tablet, Capsule" />
                                        <InputError message={errors.dosage_form} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="strength" value="Strength" />
                                        <TextInput id="strength" value={data.strength} onChange={(e) => setData('strength', e.target.value)} className="mt-1.5 block w-full" placeholder="e.g. 500mg" />
                                        <InputError message={errors.strength} className="mt-2" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Link href={route('medicines.index')} className="btn btn-secondary">Cancel</Link>
                                    <PrimaryButton disabled={processing}>Save Medicine</PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
