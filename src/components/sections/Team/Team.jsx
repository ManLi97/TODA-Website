import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import styles from './Team.module.css';

const TEAM = [
    { id: 1, name: "Manuel Lindner", role: "Geschäftsführer", thumb: null },
    { id: 2, name: "Tom Symantzyk", role: "Lead Developer", thumb: null },
    { id: 3, name: "Dana Plietker", role: "Marketing", thumb: null },
    { id: 4, name: "Sandra Draht", role: "Design and Corporate Identity", thumb: null },
    { id: 5, name: "Lucas Draht", role: "Social Media", thumb: null },
];

export default function Team() {
    const shouldReduceMotion = useReducedMotion();

    const containerVar = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVar = {
        hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.8 },
        show: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
    };

    return (
        <section className={`section-container ${styles.teamSection}`}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className="h2-large text-main">Das Team</h2>
                    <p className="text-muted">Aus dem Studio. Für das Studio.</p>
                </div>

                <motion.div
                    className={styles.grid}
                    variants={containerVar}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-10%' }}
                >
                    {TEAM.map(member => (
                        <motion.div key={member.id} variants={itemVar} className={styles.member}>
                            <div className={styles.bubble}>
                                {member.thumb ? (
                                    <img src={member.thumb} alt={member.name} className={styles.image} />
                                ) : (
                                    <div className={styles.placeholderImg}>
                                        <span className={styles.initials}>{member.name.charAt(0)}</span>
                                    </div>
                                )}
                            </div>
                            <div className={styles.info}>
                                <h3 className={styles.name}>{member.name}</h3>
                                <p className={`text-muted ${styles.role}`}>{member.role}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Feather end to footer background, staying at bg-0 */}
        </section>
    );
}
