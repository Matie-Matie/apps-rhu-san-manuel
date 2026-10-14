import { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const features = [
    'Digital prescriptions for the clinic',
    'Real-time medicine inventory',
    'Complete dispensing records',
];

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen bg-bg">
            {/* Brand panel: visible on md+ */}
            <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-accent-900 p-10 lg:flex">
                {/* Background photo */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage: 'url(/assets/bg.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'right center',
                    }}
                />

                {/* Blue tint to blend the photo into the brand panel */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-accent-900 via-accent-900/85 to-accent-900/55" />

                {/* Subtle grain */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                        backgroundSize: '128px 128px',
                    }}
                />

                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="relative"
                >
                    <div className="flex items-center gap-2.5">
                        <img
                            src="/assets/logo.jpg"
                            alt="APPS logo"
                            className="h-9 w-9 rounded-[10px] object-cover shadow-sm"
                        />
                        <span className="text-[15px] font-semibold tracking-tight text-white">APPS</span>
                    </div>
                </motion.div>

                {/* Pitch */}
                <div className="relative">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
                        className="max-w-md text-[28px] font-bold leading-snug tracking-tight text-white"
                    >
                        Automated Prescription Processing System
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
                        className="mt-3 max-w-md text-sm leading-relaxed text-accent-200/80"
                    >
                        Digital prescriptions, medicine inventory, and dispensing records for the Rural Health Unit, San Manuel, Isabela.
                    </motion.p>

                    <motion.ul
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
                        className="mt-7 space-y-3"
                    >
                        {features.map((feature) => (
                            <li key={feature} className="flex items-center gap-3 text-sm text-accent-100/90">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </span>
                                {feature}
                            </li>
                        ))}
                    </motion.ul>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="relative text-sm text-accent-200/70"
                >
                    Rural Health Unit, San Manuel, Isabela
                </motion.div>
            </div>

            {/* Form panel */}
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
                <div className="w-full max-w-sm">
                    {/* Compact brand for mobile */}
                    <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
                        <img
                            src="/assets/logo.jpg"
                            alt="APPS logo"
                            className="h-10 w-10 rounded-[10px] object-cover shadow-sm"
                        />
                        <div className="text-left leading-tight">
                            <span className="block text-[15px] font-semibold tracking-tight text-soil-900">APPS</span>
                            <span className="block text-xs text-soil-500">Pharmacy System</span>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="rounded-card border border-soil-200 bg-surface p-7 shadow-card"
                    >
                        {children}
                    </motion.div>

                    <p className="mt-6 text-center text-xs text-soil-400">
                        Rural Health Unit, San Manuel, Isabela
                    </p>
                </div>
            </div>
        </div>
    );
}
