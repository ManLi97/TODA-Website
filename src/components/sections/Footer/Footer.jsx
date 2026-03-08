import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import styles from './Footer.module.css';

export default function Footer() {
    const shouldReduceMotion = useReducedMotion();
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footerSection}>
            <div className={styles.container}>

                <div className={styles.topRow}>
                    <motion.div
                        className={styles.brandCol}
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-5%' }}
                    >
                        <h3 className={styles.logo}>TODA</h3>
                        <p className="text-muted">The premium platform elevating tattoo workflows.</p>
                    </motion.div>

                    {/* Links - We use placeholder anchors to avoid actual routing unless asked */}
                    <div className={styles.linksRow}>
                        <div className={styles.linkGroup}>
                            <h4 className={styles.colTitle}>Social</h4>
                            <a href="#" className={`text-muted ${styles.link}`}>Instagram</a>
                            <a href="#" className={`text-muted ${styles.link}`}>TikTok</a>
                            <a href="#" className={`text-muted ${styles.link}`}>X</a>
                        </div>

                        <div className={styles.linkGroup}>
                            <h4 className={styles.colTitle}>Legal</h4>
                            <a href="#" className={`text-muted ${styles.link}`}>Privacy</a>
                            <a href="#" className={`text-muted ${styles.link}`}>Terms</a>
                            <a href="#" className={`text-muted ${styles.link}`}>Imprint</a>
                        </div>
                    </div>
                </div>

                <div className={styles.bottomRow}>
                    <p className={styles.copyright}>&copy; {currentYear} TODA Technologies. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
