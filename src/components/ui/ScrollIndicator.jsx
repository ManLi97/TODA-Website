import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * ScrollIndicator
 * An elegant mouse/scroll shape instead of a yellow CTA button.
 */
export default function ScrollIndicator() {
    const shouldReduceMotion = useReducedMotion();

    // Without animation, just a static pill shape
    if (shouldReduceMotion) {
        return (
            <div style={containerStyle}>
                <div style={pillStyle} />
                <span style={labelStyle}>Scroll</span>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <motion.div
                style={pillStyle}
                initial={{ y: 0, opacity: 0.5 }}
                animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
                style={labelStyle}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
                Scroll to discover
            </motion.span>
        </div>
    );
}

const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    opacity: 0.7,
};

const pillStyle = {
    width: '1px',
    height: '40px',
    background: 'var(--accent-yellow)',
};

const labelStyle = {
    textTransform: 'uppercase',
    fontSize: '0.65rem',
    letterSpacing: '0.2em',
    color: 'var(--text-muted)',
};
