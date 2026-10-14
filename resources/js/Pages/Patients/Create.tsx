import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AddressSelect from '@/Components/AddressSelect';
import { ageFromDob, MIN_DOB, todayISO } from '@/lib/patient';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function PatientsCreate() {
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        contact_number: '',
        address: '',
        bp_systolic: '',
        bp_diastolic: '',
        pulse_rate: '',
        height_cm: '',
        weight_kg: '',
        temperature_c: '',
    });

    const vitalField = (
        key: 'bp_systolic' | 'bp_diastolic' | 'pulse_rate' | 'height_cm' | 'weight_kg' | 'temperature_c',
        label: string,
        props: { min: number; max: number; step?: string; placeholder?: string },
    ) => (
        <div>
            <InputLabel htmlFor={key} value={label} />
            <input
                id={key}
                type="number"
                inputMode="decimal"
                min={props.min}
                max={props.max}
                step={props.step ?? '1'}
                placeholder={props.placeholder}
                value={data[key]}
                onChange={(e) => setData(key, e.target.value)}
                className="input-field mt-1.5"
            />
            <InputError message={errors[key]} className="mt-2" />
        </div>
    );

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (data.date_of_birth && data.date_of_birth > todayISO()) {
            setError('date_of_birth', 'Date of birth cannot be in the future.');
            return;
        }
        post(route('patients.store'));
    };

    return (
        <AuthenticatedLayout header="Add Patient">
            <Head title="Add Patient" />
            <div className="page-content">
                <div className="page-content-narrow">
                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <h4 className="text-sm font-semibold text-soil-800">Personal Information</h4>
                                    <p className="mt-0.5 text-xs text-soil-500">Who the patient is. Fill this in first.</p>
                                </div>
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
                                        <TextInput
                                            id="date_of_birth"
                                            type="date"
                                            min={MIN_DOB}
                                            max={todayISO()}
                                            value={data.date_of_birth}
                                            onChange={(e) => {
                                                clearErrors('date_of_birth');
                                                setData('date_of_birth', e.target.value);
                                            }}
                                            className="mt-1.5 block w-full"
                                        />
                                        {ageFromDob(data.date_of_birth) !== null && (
                                            <p className="mt-1 text-xs text-soil-500">Age: {ageFromDob(data.date_of_birth)}</p>
                                        )}
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
                                <AddressSelect value={data.address} onChange={(v) => setData('address', v)} error={errors.address} />
                                <div className="border-t border-soil-200 pt-5">
                                    <h4 className="text-sm font-semibold text-soil-800">Medical Information</h4>
                                    <p className="mt-0.5 text-xs text-soil-500">Vital signs. Optional. Leave blank to add them later.</p>
                                    <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        {vitalField('bp_systolic', 'BP systolic (mmHg)', { min: 50, max: 300, placeholder: '120' })}
                                        {vitalField('bp_diastolic', 'BP diastolic (mmHg)', { min: 30, max: 200, placeholder: '80' })}
                                        {vitalField('pulse_rate', 'Pulse (bpm)', { min: 20, max: 250, placeholder: '72' })}
                                        {vitalField('height_cm', 'Height (cm)', { min: 30, max: 250, step: '0.1', placeholder: '165' })}
                                        {vitalField('weight_kg', 'Weight (kg)', { min: 1, max: 500, step: '0.1', placeholder: '60' })}
                                        {vitalField('temperature_c', 'Temperature (°C)', { min: 30, max: 45, step: '0.1', placeholder: '36.6' })}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Link href={route('patients.index')} className="btn btn-secondary">Cancel</Link>
                                    <PrimaryButton disabled={processing}>Save Patient</PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
