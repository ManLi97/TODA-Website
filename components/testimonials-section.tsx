"use client";

// Testimonials — polaroid-style cards with scroll-entry and hover animations.
// Motion (motion/react) handles entry reveal, card tilt, and hover lift.
// Mobile: horizontal scroll + snap-center. Desktop: overlapping row via negative margin.

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// Visual layout constants — not translatable content
const CARD_CONFIGS: Array<{ tilt: number; yOffset: number }> = [
  { tilt: -4, yOffset: 20 },
  { tilt:  2, yOffset: -10 },
  { tilt: -2, yOffset: 30 },
];

// Three-layer shadow simulates a physical photograph print.
// Documented exception to the no-box-shadow rule: this is skeuomorphic, not a UI
// elevation token. Without it a white card on near-black reads as a broken UI element.
const POLAROID_SHADOW =
  "0 24px 48px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(0,0,0,0.05)";

// toda-enter easing from MOTION.md — cubic-bezier(0, 0, 0.2, 1)
const EASE_ENTER: [number, number, number, number] = [0, 0, 0.2, 1];
const EASE_STANDARD: [number, number, number, number] = [0.4, 0, 0.2, 1];

interface TestimonialsSectionProps {
  label: string;
  headline: string;
  quote1: string; author1: string; studio1: string;
  quote2: string; author2: string; studio2: string;
  quote3: string; author3: string; studio3: string;
}

export function TestimonialsSection({
  label, headline,
  quote1, author1, studio1,
  quote2, author2, studio2,
  quote3, author3, studio3,
}: TestimonialsSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleScroll = () => {
    if (!trackRef.current) return;
    // card width (280) + gap (24) = 304px stride between snap points
    const index = Math.round(trackRef.current.scrollLeft / 304);
    setActiveIndex(Math.min(Math.max(index, 0), CARD_CONFIGS.length - 1));
  };

  const cards = [
    { quote: quote1, author: author1, studio: studio1 },
    { quote: quote2, author: author2, studio: studio2 },
    { quote: quote3, author: author3, studio: studio3 },
  ];

  return (
    <div>
      {/* Section header */}
      <motion.div
        className="mb-16"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.6, ease: EASE_ENTER }
        }
      >
        <p className="text-[12px] font-normal leading-none tracking-[0.1px] uppercase text-text-tertiary mb-6">
          {label}
        </p>
        <h2 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.3px] text-text-primary">
          {headline}
        </h2>
      </motion.div>

      {/* Scroll track — overflow+snap on mobile, plain flex on desktop.
          -mx-6 breaks out of SectionWrapper's px-6 so cards reach the viewport edge;
          pl-6 restores left alignment with the headline, pr-4 leaves ~47px of card 2 peeking. */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="overflow-x-auto snap-x snap-mandatory no-scrollbar touch-pan-x -mx-6 md:mx-0 md:overflow-x-hidden"
      >
        <div className="flex flex-row pl-6 pr-4 py-4 gap-6 md:gap-0 md:px-0 md:py-8 md:justify-center">
          {cards.map((card, i) => {
            const config = CARD_CONFIGS[i] ?? { tilt: 0, yOffset: 0 };
            const activeTilt = isMobile ? config.tilt * 0.4 : config.tilt;
            const activeYOffset = isMobile ? config.yOffset * 0.4 : config.yOffset;

            return (
              <motion.div
                key={i}
                className={[
                  "polaroid-tape flex-none w-[280px] md:w-[300px] snap-center bg-polaroid rounded-[2px]",
                  i > 0 ? "md:-ml-[100px]" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  padding: "16px 16px 56px 16px",
                  boxShadow: POLAROID_SHADOW,
                  zIndex: i + 1,
                }}
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, y: activeYOffset + 48, rotate: activeTilt }
                }
                whileInView={{ opacity: 1, y: activeYOffset, rotate: activeTilt }}
                viewport={{ once: true, amount: 0.3 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.6, delay: i * 0.12, ease: EASE_ENTER }
                }
                whileHover={
                  !shouldReduceMotion && !isMobile
                    ? { y: activeYOffset - 8, rotate: 0, scale: 1.03, zIndex: 10 }
                    : undefined
                }
                // whileHover uses a faster ease for the lift/straighten feel
                {...(!shouldReduceMotion && !isMobile
                  ? { whileTap: { scale: 0.99 } }
                  : {})}
              >
                {/* Photo placeholder — real portrait replaces this */}
                <div className="aspect-square w-full bg-surface-elevated mb-4 overflow-hidden" />

                {/* Quote */}
                <p className="text-[14px] font-normal leading-[1.6] tracking-[-0.1px] text-polaroid-text mb-4">
                  {card.quote}
                </p>

                {/* Attribution */}
                <p className="text-[12px] font-normal text-polaroid-text leading-none">
                  {card.author}
                </p>
                <p className="text-[11px] font-normal text-polaroid-text-secondary mt-1 leading-none">
                  {card.studio}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Dot indicators — mobile only, show active card position */}
      <div className="flex justify-center gap-2 mt-6 md:hidden">
        {CARD_CONFIGS.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
              i === activeIndex ? "bg-gold-500" : "bg-border-subtle"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
