import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'doctor',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1.5 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1.5 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1.5 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1.5 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div>
                    <InputLabel value="Role" />
                    <div className="mt-2 grid grid-cols-2 gap-3">
                        <label
                            className={`flex cursor-pointer items-center justify-center rounded-[10px] border-2 p-3 transition-colors ${
                                data.role === 'doctor'
                                    ? 'border-accent-500 bg-accent-50'
                                    : 'border-soil-200 bg-white hover:bg-soil-50'
                            }`}
                        >
                            <input
                                type="radio"
                                name="role"
                                value="doctor"
                                checked={data.role === 'doctor'}
                                onChange={(e) => setData('role', e.target.value)}
                                className="sr-only"
                            />
                            <div className="text-center">
                                <div className="text-sm font-medium text-soil-900">Doctor</div>
                                <div className="text-xs text-soil-500">Create prescriptions & manage patients</div>
                            </div>
                        </label>
                        <label
                            className={`flex cursor-pointer items-center justify-center rounded-[10px] border-2 p-3 transition-colors ${
                                data.role === 'pharmacist'
                                    ? 'border-accent-500 bg-accent-50'
                                    : 'border-soil-200 bg-white hover:bg-soil-50'
                            }`}
                        >
                            <input
                                type="radio"
                                name="role"
                                value="pharmacist"
                                checked={data.role === 'pharmacist'}
                                onChange={(e) => setData('role', e.target.value)}
                                className="sr-only"
                            />
                            <div className="text-center">
                                <div className="text-sm font-medium text-soil-900">Pharmacist</div>
                                <div className="text-xs text-soil-500">Manage inventory & dispense medicines</div>
                            </div>
                        </label>
                    </div>
                    <InputError message={errors.role} className="mt-2" />
                </div>

                <PrimaryButton className="w-full" disabled={processing}>
                    Register
                </PrimaryButton>

                <p className="text-center text-sm text-soil-500">
                    Already registered?{' '}
                    <Link href={route('login')} className="font-medium text-accent-600 hover:text-accent-700">
                        Log in
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
