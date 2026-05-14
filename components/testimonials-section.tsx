"use client";

// Testimonials — polaroid-style cards with scroll-entry and hover animations.
// Mobile: Embla Carousel (pointer-event-based — no competing scroll context with Lenis).
// Desktop: static overlapping row via negative margin (original design, unchanged).
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import useEmblaCarousel from "embla-carousel-react";

// Visual layout constants — not translatable content
const CARD_CONFIGS: Array<{ tilt: number; yOffset: number }> = [
  { tilt: -4, yOffset: 20 },
  { tilt:  2, yOffset: -10 },
  { tilt: -2, yOffset: 30 },
];

// Three-layer shadow simulates a physical photograph print.
// Documented exception to the no-box-shadow rule: skeuomorphic, not a UI elevation token.
// Without it a white card on near-black reads as a broken UI element.
const POLAROID_SHADOW =
  "0 24px 48px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(0,0,0,0.05)";

// toda-enter easing from MOTION.md — cubic-bezier(0, 0, 0.2, 1)
const EASE_ENTER: [number, number, number, number] = [0, 0, 0.2, 1];

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
  });

  // Sync dot indicators with Embla's selected slide
  useEffect(() => {
    if (!emblaApi) return;
    const api = emblaApi;
    const onSelect = () => setActiveIndex(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => { api.off("select", onSelect); };
  }, [emblaApi]);

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
          shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: EASE_ENTER }
        }
      >
        <p className="text-[12px] font-normal leading-none tracking-[0.1px] uppercase text-text-tertiary mb-6">
          {label}
        </p>
        <h2 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.3px] text-text-primary">
          {headline}
        </h2>
      </motion.div>

      {/* ── Mobile: Embla Carousel ──────────────────────────────────────────────
          -mx-6 extends viewport to screen edge; pl-6 aligns slides with section
          header. Embla applies overflow:hidden and handles touch via PointerEvents. */}
      <div className="-mx-6 pl-6 md:hidden" ref={emblaRef}>
        <div className="flex gap-6 py-4 pr-4">
          {cards.map((card, i) => {
            const config = CARD_CONFIGS[i] ?? { tilt: 0, yOffset: 0 };
            // Reduced tilt on mobile — narrower cards benefit from subtler rotation
            const tilt = config.tilt * 0.4;
            const yOffset = config.yOffset * 0.4;

            return (
              <motion.div
                key={i}
                className="polaroid-tape flex-none w-[280px] bg-polaroid rounded-[2px]"
                style={{
                  padding: "16px 16px 56px 16px",
                  boxShadow: POLAROID_SHADOW,
                  zIndex: i + 1,
                }}
                initial={
                  shouldReduceMotion ? false : { opacity: 0, y: yOffset + 48, rotate: tilt }
                }
                animate={{ opacity: 1, y: yOffset, rotate: tilt }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.6, delay: i * 0.12, ease: EASE_ENTER }
                }
              >
                {/* Photo placeholder — real portrait replaces this */}
                <div className="aspect-square w-full bg-surface-elevated mb-4 overflow-hidden" />
                <p className="text-[14px] font-normal leading-[1.6] tracking-[-0.1px] text-polaroid-text mb-4">
                  {card.quote}
                </p>
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

      {/* Dot indicators — mobile only */}
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

      {/* ── Desktop: static overlapping row ────────────────────────────────────
          Full tilt, hover lift, negative margin overlap — unchanged from original. */}
      <div className="hidden md:flex md:flex-row md:justify-center md:py-8">
        {cards.map((card, i) => {
          const config = CARD_CONFIGS[i] ?? { tilt: 0, yOffset: 0 };

          return (
            <motion.div
              key={i}
              className={[
                "polaroid-tape flex-none w-[300px] bg-polaroid rounded-[2px]",
                i > 0 ? "-ml-[100px]" : "",
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
                  : { opacity: 0, y: config.yOffset + 48, rotate: config.tilt }
              }
              whileInView={{ opacity: 1, y: config.yOffset, rotate: config.tilt }}
              viewport={{ once: true, amount: 0.3 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.6, delay: i * 0.12, ease: EASE_ENTER }
              }
              whileHover={
                !shouldReduceMotion
                  ? { y: config.yOffset - 8, rotate: 0, scale: 1.03, zIndex: 10 }
                  : undefined
              }
              whileTap={!shouldReduceMotion ? { scale: 0.99 } : undefined}
            >
              <div className="aspect-square w-full bg-surface-elevated mb-4 overflow-hidden" />
              <p className="text-[14px] font-normal leading-[1.6] tracking-[-0.1px] text-polaroid-text mb-4">
                {card.quote}
              </p>
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
  );
}
