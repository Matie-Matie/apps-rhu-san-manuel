import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    gender: string | null;
    contact_number: string | null;
    address: string | null;
}

export default function PatientsEdit({ patient }: { patient: Patient }) {
    const { data, setData, put, processing, errors } = useForm({
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_of_birth: patient.date_of_birth || '',
        gender: patient.gender || '',
        contact_number: patient.contact_number || '',
        address: patient.address || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('patients.update', patient.id));
    };

    return (
        <AuthenticatedLayout header={`Edit Patient`}>
            <Head title="Edit Patient" />
            <div className="page-content">
                <div className="page-content-narrow">
                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={submit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="first_name" value="First Name" />
                                        <TextInput id="first_name" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} className="mt-1.5 block w-full" required />
                                        <InputError message={errors.first_name} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="last_name" value="Last Name" />
                                        <TextInput id="last_name" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} className="mt-1.5 block w-full" required />
                                        <InputError message={errors.last_name} className="mt-2" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="date_of_birth" value="Date of Birth" />
                                        <TextInput id="date_of_birth" type="date" value={data.date_of_birth} onChange={(e) => setData('date_of_birth', e.target.value)} className="mt-1.5 block w-full" />
                                        <InputError message={errors.date_of_birth} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="gender" value="Gender" />
                                        <select id="gender" value={data.gender} onChange={(e) => setData('gender', e.target.value)} className="input-field mt-1.5">
                                            <option value="">Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                        <InputError message={errors.gender} className="mt-2" />
                                    </div>
                                </div>
                                <div>
                                    <InputLabel htmlFor="contact_number" value="Contact Number" />
                                    <TextInput id="contact_number" value={data.contact_number} onChange={(e) => setData('contact_number', e.target.value)} className="mt-1.5 block w-full" />
                                    <InputError message={errors.contact_number} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="address" value="Address" />
                                    <textarea id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} rows={2} className="input-field mt-1.5" />
                                    <InputError message={errors.address} className="mt-2" />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Link href={route('patients.index')} className="btn btn-secondary">Cancel</Link>
                                    <PrimaryButton disabled={processing}>Update Patient</PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
