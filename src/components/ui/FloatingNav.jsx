import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import styles from './FloatingNav.module.css';

const NAV_ITEMS = [
    { label: 'App', href: '#app' },
    { label: 'Vorteile', href: '#vorteile' },
    { label: 'Demo', href: '#demo' },
    { label: 'FAQ', href: '#faq' },
];

export default function FloatingNav() {
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(true);
    const shouldReduceMotion = useReducedMotion();

    useMotionValueEvent(scrollY, "change", (latest) => {
        // Show navigation after scrolling down a bit (past most of the hero)
        if (latest > 300) {
            setHidden(false);
        } else {
            setHidden(true);
        }
    });

    // Provide a safe fallback if reduced motion is enabled (just always show it, or keep it hidden)
    // We'll just rely on CSS opacity via Framer Motion
    const variants = {
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 }
    };

    return (
        <motion.nav
            className={styles.navWrapper}
            variants={variants}
            initial="hidden"
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
        >
            <div className={styles.pillBackdrop}>
                {NAV_ITEMS.map((item) => (
                    <a
                        key={item.href}
                        href={item.href}
                        className={styles.navLink}
                    >
                        {item.label}
                    </a>
                ))}
            </div>
        </motion.nav>
    );
}
