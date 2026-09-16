import { useRef, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

interface RevealProps {
    children: ReactNode;
    y?: number;
    delay?: number;
    duration?: number;
    className?: string;
    once?: boolean;
}

/**
 * Matiee scroll-triggered reveal.
 * Fades + slides content in when it enters the viewport.
 */
export default function Reveal({
    children,
    y = 60,
    delay = 0,
    duration = 1.0,
    className,
    once = true,
}: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once, margin: '-80px' });

    return (
        <div ref={ref} className={className}>
            <motion.div
                initial={{ opacity: 0, y }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
                transition={{
                    duration,
                    delay,
                    ease: [0.16, 1, 0.3, 1],
                }}
                style={{ willChange: 'transform, opacity' }}
            >
                {children}
            </motion.div>
        </div>
    );
}
