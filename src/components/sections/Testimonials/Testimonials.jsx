import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import styles from './Testimonials.module.css';

const TESTIMONIALS = [
    { id: 1, name: 'Alex T.', role: 'Studio Owner', text: '"I stopped answering DMs at 11 PM. TODA handles my entire schedule now."', rotation: -4, offsetY: 10 },
    { id: 2, name: 'Jamie K.', role: 'Tattoo Artist', text: '"The deposits feature alone saved me hundreds of dollars in no-shows this month."', rotation: 2, offsetY: -5 },
    { id: 3, name: 'Morgan S.', role: 'Independent Artist', text: '"Premium from end to end. My clients love the booking experience."', rotation: -2, offsetY: 15 },
];

export default function Testimonials() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <section className={`section-container ${styles.testiSection}`}>
            <div className={styles.container}>

                <div className={styles.header}>
                    <h2 className="h2-large text-main">Trusted by the best</h2>
                    <p className="h3-medium text-muted">Join the movement.</p>
                </div>

                <div className={styles.deckContainer}>
                    <div className={styles.deckScroll}>
                        {TESTIMONIALS.map((testi, i) => (
                            <motion.div
                                key={testi.id}
                                className={styles.polaroidWrapper}
                                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-10%' }}
                                transition={{ delay: i * 0.15, duration: 0.6 }}
                            >
                                <div
                                    className={styles.polaroid}
                                    style={shouldReduceMotion ? {} : {
                                        '--desk-rot': `${testi.rotation}deg`,
                                        '--desk-y': `${testi.offsetY}px`
                                    }}
                                >
                                    <div className={styles.polaroidPhoto}>
                                        {/* Placeholder image */}
                                        <div className={styles.mockImg} />
                                    </div>
                                    <div className={styles.polaroidText}>
                                        <p className={styles.quote}>{testi.text}</p>
                                        <p className={styles.author}>{testi.name}<br /><span className="text-muted">{testi.role}</span></p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Soft feather to next section */}
            <div className="feather-y" style={{ '--bg-up': 'var(--bg-0)', '--bg-down': 'var(--bg-1)' }} />
        </section>
    );
}
