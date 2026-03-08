import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import styles from './MarkerHighlight.module.css';

/**
 * MarkerHighlight
 * A Framer Motion component that draws a 2-3 pass highlighter effect behind text.
 * Intensity builds up over each pass.
 */
export default function MarkerHighlight({
    children,
    passes = 3,
    delay = 0,
    durationPerPass = 0.4,
    color = 'var(--accent-yellow)',
}) {
    const shouldReduceMotion = useReducedMotion();

    // If reduced motion is requested, just render fully highlighted immediately
    if (shouldReduceMotion) {
        return (
            <span className={styles.wrapper}>
                <span className={styles.finalState} style={{ backgroundColor: color }} />
                <span className={styles.text}>{children}</span>
            </span>
        );
    }

    // Create an array for our passes
    const renderPasses = Array.from({ length: passes }).map((_, index) => {
        // Alternate direction or adjust parameters per pass for a 'scribble' feel
        const isEven = index % 2 === 0;

        // Each pass adds a bit of rotation/skew/position jitter
        const jitterStyle = {
            transform: `rotate(${isEven ? -1 : 1}deg) translateY(${isEven ? -1 : 1}px)`,
            backgroundColor: color,
            opacity: 0.35 + (index * 0.1), // Intensity build up visually
        };

        return (
            <motion.span
                key={index}
                className={styles.pass}
                style={jitterStyle}
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                whileInView={{ clipPath: 'inset(0 0 0 0)' }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{
                    duration: durationPerPass,
                    delay: delay + (index * durationPerPass * 0.8), // Slight overlap between passes
                    ease: 'easeInOut'
                }}
            />
        );
    });

    return (
        <span className={styles.wrapper}>
            {renderPasses}
            <span className={styles.text}>{children}</span>
        </span>
    );
}
