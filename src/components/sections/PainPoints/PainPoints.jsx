import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import styles from './PainPoints.module.css';

const PAIN_POINTS = [
    {
        id: 'lost-deposits',
        title: 'Anzahlungen sicher haben',
        desc: 'Schluss mit lästigem Nachfragen. Anzahlungen werden bei der Buchung automatisch abgewickelt.',
        type: 'featured'
    },
    {
        id: 'dm-clutter',
        title: 'DM Chaos beenden',
        desc: 'Terminanfragen über drei Kanäle verstreut? Sammle alle Anfragen sicher an einem zentralen Ort.',
        type: 'standard'
    },
    {
        id: 'no-shows',
        title: 'Keine No-Shows mehr',
        desc: 'Automatische Terminerinnerungen reduzieren Ausfälle auf ein absolutes Minimum.',
        type: 'featured'
    },
    {
        id: 'rescheduling',
        title: 'Termine verschieben',
        desc: 'Die Terminfindung dauert 1 Klick statt 10 Nachrichten. Spar dir das ewige Hin und Her.',
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
        <section id="vorteile" className={`section-container ${styles.painSection}`}>
            <div className={styles.container}>

                <motion.div
                    className={styles.header}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-10%' }}
                    variants={revealVar}
                >
                    <h2 className={`h2-large ${styles.headline}`}>
                        Das Studio <br /> <span className="text-acc">ohne das Chaos.</span>
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
