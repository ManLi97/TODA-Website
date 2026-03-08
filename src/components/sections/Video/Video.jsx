import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import styles from './Video.module.css';

export default function VideoSection() {
    const [isPlaying, setIsPlaying] = useState(false);
    const shouldReduceMotion = useReducedMotion();

    const handlePlayClick = () => {
        setIsPlaying(true);
    };

    return (
        <section id="demo" className={`section-container ${styles.videoSection}`}>
            <div className={styles.container}>

                {/* The Todd Peeking Layer */}
                <motion.div
                    className={styles.toddOverlay}
                    initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 30 }}
                    whileInView={{ opacity: 0.15, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.5 }}
                >
                    {/* Mock Todd Silhouette */}
                    <div className={styles.toddMock}>Todd</div>
                </motion.div>

                <div className={styles.header}>
                    <h2 className="h2-large text-main">Abläufe, die Sinn machen</h2>
                </div>

                <div className={styles.videoFrame}>
                    {isPlaying ? (
                        <div className={styles.playerPlaceholder}>
                            {/* Replace with actual MP4 player component later */}
                            <span className="text-muted">Video Playing...</span>
                        </div>
                    ) : (
                        <div className={styles.posterContainer} onClick={handlePlayClick}>
                            <div className={styles.posterImage} />

                            <motion.button
                                className={styles.playButton}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="Play video"
                            >
                                <div className={styles.playIcon} />
                            </motion.button>
                        </div>
                    )}
                </div>

            </div>

            {/* Soft feather to next section */}
            <div className="feather-y" style={{ '--bg-up': 'var(--bg-2)', '--bg-down': 'var(--bg-0)' }} />
        </section>
    );
}
