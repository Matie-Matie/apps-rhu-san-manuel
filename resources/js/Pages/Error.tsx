import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import FadeIn from '@/Components/FadeIn';

const COPY: Record<number, { title: string; body: string }> = {
    403: {
        title: 'Access denied',
        body: 'You don’t have permission to view this page.',
    },
    404: {
        title: 'Page not found',
        body: 'The page you’re looking for doesn’t exist or may have been moved.',
    },
    500: {
        title: 'Something went wrong',
        body: 'An unexpected error occurred on our end. Please try again in a moment.',
    },
    503: {
        title: 'Down for maintenance',
        body: 'APPS is temporarily unavailable. Please check back shortly.',
    },
};

export default function Error({ status, message }: { status: number; message?: string | null }) {
    const copy = COPY[status] ?? {
        title: 'Unexpected error',
        body: 'Something didn’t go as planned. Please try again.',
    };

    return (
        <GuestLayout>
            <Head title={copy.title} />

            <FadeIn y={14} duration={0.4}>
                <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-2xl font-bold text-accent-600">
                        {status}
                    </div>
                    <h2 className="mt-5 text-[22px] font-bold tracking-tight text-soil-900">{copy.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-soil-500">{message || copy.body}</p>

                    <Link href={route('dashboard')} className="btn btn-primary mt-7 w-full">
                        Back to dashboard
                    </Link>
                </div>
            </FadeIn>
        </GuestLayout>
    );
}
