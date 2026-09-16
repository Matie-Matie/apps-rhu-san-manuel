import { AnimatePresence, motion } from 'framer-motion';
import { usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface ToastItem {
    id: number;
    type: 'success' | 'error';
    message: string;
}

const DURATION = 4000;

const checkIcon = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const xIcon = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const closeIcon = (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export default function Toaster() {
    const flash = usePage().props.flash as { success?: string; error?: string } | undefined;
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const counter = useRef(0);

    useEffect(() => {
        if (!flash) return;

        const push = (type: 'success' | 'error', message: string) => {
            const id = ++counter.current;
            setToasts((t) => [...t, { id, type, message }]);
            window.setTimeout(() => {
                setToasts((t) => t.filter((toast) => toast.id !== id));
            }, DURATION);
        };

        if (flash.success) push('success', flash.success);
        if (flash.error) push('error', flash.error);
    }, [flash]);

    const dismiss = (id: number) => {
        setToasts((t) => t.filter((toast) => toast.id !== id));
    };

    return (
        <div
            className="pointer-events-none fixed right-4 top-20 z-50 flex w-full max-w-sm flex-col gap-2.5 sm:right-6"
            aria-live="polite"
        >
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, y: -14, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        style={{ willChange: 'transform, opacity' }}
                        className={`pointer-events-auto flex items-start gap-3 rounded-card border bg-surface p-3.5 shadow-lg ${
                            toast.type === 'success' ? 'border-success/30' : 'border-error/30'
                        }`}
                    >
                        <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ${
                                toast.type === 'success' ? 'bg-success-light text-success' : 'bg-error-light text-error'
                            }`}
                        >
                            {toast.type === 'success' ? checkIcon : xIcon}
                        </div>
                        <p className="flex-1 pt-1 text-sm font-medium leading-snug text-soil-900">{toast.message}</p>
                        <button
                            type="button"
                            onClick={() => dismiss(toast.id)}
                            aria-label="Dismiss notification"
                            className="rounded-[8px] p-1.5 text-soil-400 transition-colors duration-150 hover:bg-soil-100 hover:text-soil-700"
                        >
                            {closeIcon}
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
