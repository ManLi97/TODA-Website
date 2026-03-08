import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import styles from './FAQ.module.css';

const FAQS = [
    { question: "Wie funktioniert das mit der Warteliste?", answer: "Kunden tragen sich einfach über dein Profil ein. Wenn du deine Termine wieder öffnest, werden sie informiert – ganz ohne manuelle Nachrichten." },
    { question: "Wie werden Anzahlungen abgewickelt?", answer: "Wirklich einfach. Das System sichert deine Termine durch automatische Anzahlungen ab, bevor der Termin fest eingebucht wird." },
    { question: "Ersetzt TODA meine Kalender-App?", answer: "Absolut. TODA synchronisiert sich in beide Richtungen mit Google & Apple Kalendern. Du hast deinen ganzen Alltag in einer klaren Übersicht." },
    { question: "Nehmt ihr eine Provision von meinen Einnahmen?", answer: "Nein. TODA funktioniert mit einem festen monatlichen Modell. Keine versteckten Gebühren, keine Kommission auf deine Arbeit." },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);
    const shouldReduceMotion = useReducedMotion();

    const toggle = (i) => {
        setOpenIndex(openIndex === i ? null : i);
    };

    return (
        <section id="faq" className={`section-container ${styles.faqSection}`}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className="h2-large text-main">Noch Fragen?</h2>
                    <p className="h3-medium text-muted">Hier sind die Antworten.</p>
                </div>

                <div className={styles.accordionList}>
                    {FAQS.map((faq, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <div key={i} className={`${styles.accordionItem} ${isOpen ? styles.itemOpen : ''}`}>
                                <button
                                    className={styles.questionBtn}
                                    onClick={() => toggle(i)}
                                    aria-expanded={isOpen}
                                >
                                    <span className={styles.questionText}>{faq.question}</span>
                                    <div className={styles.iconIndicator}>
                                        <span className={styles.iconLine} />
                                        <span className={`${styles.iconLine} ${styles.iconLineV} ${isOpen ? styles.rotated : ''}`} />
                                    </div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            key="content"
                                            initial={shouldReduceMotion ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                                            animate={shouldReduceMotion ? { height: 'auto', opacity: 1 } : { height: 'auto', opacity: 1 }}
                                            exit={shouldReduceMotion ? { display: 'none' } : { height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className={styles.answerWrapper}
                                        >
                                            <div className={styles.answerInner}>
                                                <p className={`text-muted ${styles.answerText}`}>{faq.answer}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Subtle bottom separator line, faded at edges */}
                                <div className={styles.dividerLine} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
