import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import styles from './PainPoints.module.css';

const PAIN_POINTS = [
    {
        id: 'lost-deposits',
        title: 'Chasing Deposits',
        desc: 'Stop messaging clients for cash. Integrated payments do it automatically.',
        type: 'featured'
    },
    {
        id: 'dm-clutter',
        title: 'DM Chaos',
        desc: 'DMs scattered across Insta, WhatsApp, and Mail. Unify it all.',
        type: 'standard'
    },
    {
        id: 'no-shows',
        title: 'No Shows',
        desc: 'Automated reminders drop no-shows to near zero.',
        type: 'featured'
    },
    {
        id: 'rescheduling',
        title: 'Endless Back & Forth',
        desc: 'Finding a new date takes 1 tap instead of 10 messages.',
        type: 'standard'
    },
];

export default function PainPoints() {
    const shouldReduceMotion = useReducedMotion();

    // Gentle reveal animation setting
    const revealVar = {
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <section className={`section-container ${styles.painSection}`}>
            <div className={styles.container}>

                <motion.div
                    className={styles.header}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-10%' }}
                    variants={revealVar}
                >
                    <h2 className={`h2-large ${styles.headline}`}>
                        The hustle <br /> <span className="text-acc">without the headache.</span>
                    </h2>
                </motion.div>

                <div className={styles.masonryGrid}>
                    {PAIN_POINTS.map((pp, i) => (
                        <motion.div
                            key={pp.id}
                            className={`${styles.card} ${pp.type === 'featured' ? styles.cardFeatured : styles.cardStandard}`}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-5%' }}
                            variants={revealVar}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className={styles.cardGlow} />
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{pp.title}</h3>
                                <p className={`text-muted ${styles.cardDesc}`}>{pp.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
