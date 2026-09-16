import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FadeInProps {
    children: ReactNode;
    y?: number;
    delay?: number;
    duration?: number;
    className?: string;
}

/**
 * Matiee mount animation. Fades + slides content in when the component mounts.
 * Use staggered delays for cascading entrances (header, sections, rows).
 */
export default function FadeIn({
    children,
    y = 16,
    delay = 0,
    duration = 0.4,
    className,
}: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration,
                delay,
                ease: [0.16, 1, 0.3, 1],
            }}
            style={{ willChange: 'transform, opacity' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
