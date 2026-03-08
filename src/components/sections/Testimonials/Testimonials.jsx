import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import styles from './Testimonials.module.css';

const TESTIMONIALS = [
    { id: 1, name: 'Alex T.', role: 'Studio Owner', text: '"Ich beantworte abends keine DMs mehr. TODA übernimmt meinen kompletten Terminkalender."', rotation: -6, offsetY: 15 },
    { id: 2, name: 'Jamie K.', role: 'Tattoo Artist', text: '"Allein die automatischen Anzahlungen haben mir diesen Monat extrem viel Zeit und Nerven gespart."', rotation: 5, offsetY: -10 },
    { id: 3, name: 'Morgan S.', role: 'Independent Artist', text: '"Professionell von Anfang bis Ende. Meine Kunden sind vom Buchungsablauf begeistert."', rotation: -4, offsetY: 20 },
];

export default function Testimonials() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <section className={`section-container ${styles.testiSection}`}>
            <div className={styles.container}>

                <div className={styles.header}>
                    <h2 className="h2-large text-main">Aus dem echten Studioalltag</h2>
                    <p className="h3-medium text-muted">Entwickelt, um zu entlasten.</p>
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
                                        '--desk-y': `${testi.offsetY}px`,
                                        '--mob-rot': `${testi.rotation * 0.4}deg`
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
