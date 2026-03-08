import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import styles from './FAQ.module.css';

const FAQS = [
    { question: "How does the waiting list work?", answer: "Clients join your list seamlessly via your profile. When you open books, they get notified instantly without manual DMs." },
    { question: "Can I manage multiple deposits?", answer: "Yes. Our automated system handles partial and full deposits securely so you never have to chase invoices again." },
    { question: "Does TODA replace my calendar app?", answer: "Absolutely. TODA syncs 2-way with Google & Apple calendars, keeping your entire schedule unified in one beautiful interface." },
    { question: "Do you take a cut of my bookings?", answer: "TODA is a flat monthly subscription. Zero hidden fees, zero commission on your hard-earned work." },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);
    const shouldReduceMotion = useReducedMotion();

    const toggle = (i) => {
        setOpenIndex(openIndex === i ? null : i);
    };

    return (
        <section className={`section-container ${styles.faqSection}`}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className="h2-large text-main">Questions?</h2>
                    <p className="h3-medium text-muted">We've got you.</p>
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
