import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * ScribbleUnderline
 * 2-3 pass underline effect beneath text.
 */
export default function ScribbleUnderline({
    children,
    passes = 3,
    delay = 0,
    durationPerPass = 0.5,
    color = 'var(--accent-yellow)',
}) {
    const shouldReduceMotion = useReducedMotion();
    const id = useId();

    // Basic organic line paths for the scribble look (x goes 0 to 100 on an SVG viewBox of "0 0 100 20", y is roughly 10)
    // We'll vary them slightly.
    const pathD = [
        "M0,12 Q20,10 50,14 T100,10",     // Pass 1
        "M2,14 Q30,16 60,11 T98,13",      // Pass 2
        "M1,11 Q25,8 55,13 T99,14"        // Pass 3
    ];

    return (
        <span style={{ position: 'relative', display: 'inline-block', paddingBottom: '0.2em' }}>
            <span style={{ position: 'relative', zIndex: 2 }}>{children}</span>

            <svg
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '20px',
                    zIndex: 1,
                    pointerEvents: 'none',
                }}
            >
                {shouldReduceMotion ? (
                    <path
                        d="M0,12 Q20,10 50,14 T100,10"
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        opacity={1}
                    />
                ) : (
                    Array.from({ length: passes }).map((_, index) => {
                        const d = pathD[index % pathD.length];
                        // Intensity buildup
                        const strokeOpacity = 0.4 + (index * 0.2);

                        return (
                            <motion.path
                                key={`${id}-${index}`}
                                d={d}
                                fill="none"
                                stroke={color}
                                strokeWidth={2 + (index * 0.5)} // Slight thickness variance
                                strokeLinecap="round"
                                initial={{ pathLength: 0, opacity: strokeOpacity }}
                                whileInView={{ pathLength: 1 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{
                                    duration: durationPerPass,
                                    delay: delay + (index * durationPerPass * 0.7),
                                    ease: 'easeInOut'
                                }}
                            />
                        );
                    })
                )}
            </svg>
        </span>
    );
}
