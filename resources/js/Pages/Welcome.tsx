import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const features = [
    'Digital prescriptions for the clinic',
    'Real-time medicine inventory',
    'Complete dispensing records',
];

export default function Welcome({ auth, appVersion }: PageProps & { appVersion: string }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="relative flex min-h-screen flex-col overflow-hidden bg-accent-900">
                {/* Background photo */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage: 'url(/assets/bg.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'right center',
                    }}
                />

                {/* Green tint to blend the photo into the brand */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent-900/75 via-accent-900/80 to-accent-900" />

                {/* Subtle grain */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                        backgroundSize: '128px 128px',
                    }}
                />

                <div className="relative flex flex-1 flex-col">
                    {/* Header */}
                    <header className="flex items-center justify-between px-6 py-6 sm:px-10">
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: EASE }}
                            className="flex items-center"
                        >
                            <img
                                src="/assets/logo.jpg"
                                alt="APPS logo"
                                className="h-16 w-16 rounded-2xl object-cover shadow-md sm:h-20 sm:w-20"
                            />
                        </motion.div>

                        <motion.nav
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
                            className="flex items-center gap-3"
                        >
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="btn btn-primary btn-sm"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="btn btn-primary btn-sm"
                                >
                                    Log in
                                </Link>
                            )}
                        </motion.nav>
                    </header>

                    {/* Hero */}
                    <main className="flex flex-1 items-center px-6 py-12 sm:px-10">
                        <div className="max-w-2xl">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
                                className="text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl"
                            >
                                RURAL HEALTH
                                <br />
                                CLINIC
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
                                className="mt-5 max-w-lg text-[15px] leading-relaxed text-accent-100/85"
                            >
                                Digital prescriptions, medicine inventory, and
                                dispensing records for the Rural Health Unit, San Manuel, Isabela.
                            </motion.p>

                            <motion.ul
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
                                className="mt-8 space-y-3"
                            >
                                {features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-center gap-3 text-sm text-accent-100/90"
                                    >
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                                            <svg
                                                className="h-3 w-3 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="2.5"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M4.5 12.75l6 6 9-13.5"
                                                />
                                            </svg>
                                        </span>
                                        {feature}
                                    </li>
                                ))}
                            </motion.ul>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.25, ease: EASE }}
                                className="mt-10 flex flex-wrap items-center gap-3"
                            >
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="btn btn-primary">
                                        Open Dashboard
                                    </Link>
                                ) : (
                                    <Link href={route('login')} className="btn btn-primary">
                                        Log in to the system
                                    </Link>
                                )}
                            </motion.div>
                        </div>
                    </main>

                    {/* Footer */}
                    <motion.footer
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="px-6 py-6 text-center text-xs text-accent-200/70 sm:px-10"
                    >
                        Rural Health Unit Clinic, San Manuel, Isabela · {appVersion}
                    </motion.footer>
                </div>
            </div>
        </>
    );
}
