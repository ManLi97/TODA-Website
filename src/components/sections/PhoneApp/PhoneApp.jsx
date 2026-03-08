import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './PhoneApp.module.css';
import calendarImg from '../../../assets/phone/Kalender.PNG';
import newAppointmentImg from '../../../assets/phone/Neuer Termin.PNG';
import detailsImg from '../../../assets/phone/Terminkarte.PNG';

const PHONE_FEATURES = [
    { id: 'calendar', label: 'Kalender', title: 'Termin Manager', image: calendarImg },
    { id: 'booking', label: 'Termin', title: 'Neuer Termin', image: newAppointmentImg },
    { id: 'management', label: 'Karte', title: 'Kundendetails', image: detailsImg },
];

export default function PhoneApp() {
    const scrollRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Sync scroll position to active pill
    useEffect(() => {
        const handleScroll = () => {
            if (!scrollRef.current) return;
            const { scrollLeft, clientWidth } = scrollRef.current;
            const index = Math.round(scrollLeft / clientWidth);
            if (index !== activeIndex && index >= 0 && index < PHONE_FEATURES.length) {
                setActiveIndex(index);
            }
        };

        const container = scrollRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll, { passive: true });
        }
        return () => {
            if (container) container.removeEventListener('scroll', handleScroll);
        };
    }, [activeIndex]);

    const scrollToSlide = (index) => {
        if (!scrollRef.current) return;
        const { clientWidth } = scrollRef.current;
        scrollRef.current.scrollTo({ left: index * clientWidth, behavior: 'smooth' });
    };

    return (
        <section className={`section-container ${styles.phoneSection}`}>
            <div className={styles.container}>

                {/* Phone Mockup Canvas */}
                <div className={styles.phoneCanvas}>
                    <div className={styles.phoneHardware}>
                        <div className={styles.screenScroll} ref={scrollRef}>
                            {PHONE_FEATURES.map((feat, i) => (
                                <div key={feat.id} className={styles.screenSlide}>
                                    <div className={styles.screenWrapper}>
                                        <img
                                            src={feat.image}
                                            alt={feat.label}
                                            className={styles.screenImage}
                                            draggable="false"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Swipeable Pills (Max 1 Row) */}
                <div className={styles.navContainer}>
                    <div className={styles.pillsScroll}>
                        {PHONE_FEATURES.map((feat, i) => {
                            const isActive = i === activeIndex;
                            return (
                                <button
                                    key={feat.id}
                                    onClick={() => scrollToSlide(i)}
                                    className={`${styles.pill} ${isActive ? styles.pillActive : ''}`}
                                >
                                    {feat.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="phonePillIndicator"
                                            className={styles.pillIndicator}
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <p className={`text-muted ${styles.microCopy}`}>
                        {PHONE_FEATURES[activeIndex].title}
                    </p>
                </div>

            </div>

            {/* Soft feather to next section */}
            <div className="feather-y" style={{ '--bg-up': 'var(--bg-1)', '--bg-down': 'var(--bg-2)' }} />
        </section>
    );
}
