import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import styles from './Hero.module.css';
import MarkerHighlight from '../../ui/MarkerHighlight';
import ScrollIndicator from '../../ui/ScrollIndicator';

export default function Hero() {
    const containerRef = useRef(null);
    const shouldReduceMotion = useReducedMotion();

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // Tasteful Hero drift/fade out on scroll to establish "canvas slides in"
    const yDrift = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const opacityFade = useTransform(scrollYProgress, [0, 1], [1, 0.2]);

    return (
        <section ref={containerRef} className={`section-container ${styles.heroSection}`}>
            <motion.div
                className={styles.driftContainer}
                style={shouldReduceMotion ? {} : { y: yDrift, opacity: opacityFade }}
            >
                <div className={styles.content}>
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="h1-mega"
                    >
                        Crafted for <MarkerHighlight passes={3} delay={0.6}>Artists</MarkerHighlight>
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className={`h3-medium text-muted ${styles.subline}`}
                    >
                        The premium platform elevating tattoo workflows.
                        No distractions, just craft.
                    </motion.p>
                </div>
            </motion.div>

            {/* 0 CTAs. Replaced with ScrollIndicator */}
            <motion.div
                className={styles.indicatorWrapper}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
            >
                <ScrollIndicator />
            </motion.div>

            {/* Feather transition at the very bottom instead of a hard line */}
            <div className={styles.fadeBottom} />
        </section>
    );
}
