"use client";

// Testimonials — polaroid deck of cards.
// Three absolute-positioned polaroid cards stacked at the center.
// Tapping the front card runs a GSAP fly-up timeline, cycling to the next card.
// Identical on mobile and desktop — no carousel, no hover states, no Framer Motion.
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Animate } from "@/components/animate";

// Three-layer shadow simulates a physical photograph print.
// Documented exception to the no-box-shadow rule: skeuomorphic, not a UI elevation token.
// Without it a white card on near-black reads as a broken UI element.
const POLAROID_SHADOW =
  "0 24px 48px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(0,0,0,0.05)";

// Stack transform per position. pos 0 = active front card.
const STACK_POSITIONS = [
  { scale: 1.00, rotate: 0,  x: 0,   y: 0,  zIndex: 30 },
  { scale: 0.94, rotate: -4, x: -36, y: 18, zIndex: 20 },
  { scale: 0.90, rotate: 5,  x: 40,  y: 32, zIndex: 10 },
];

interface TestimonialsSectionProps {
  label: string;
  headline: string;
  hint: string;
  quote1: string; author1: string; studio1: string;
  quote2: string; author2: string; studio2: string;
  quote3: string; author3: string; studio3: string;
}

export function TestimonialsSection({
  label, headline, hint,
  quote1, author1, studio1,
  quote2, author2, studio2,
  quote3, author3, studio3,
}: TestimonialsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hintFaded, setHintFaded] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isAnimatingRef = useRef(false);

  // Register CustomEase once on mount (GSAP deduplicates safely)
  useEffect(() => {
    gsap.registerPlugin(CustomEase);
    CustomEase.create("entry", "0.16, 1, 0.3, 1");
  }, []);

  // Snap all cards to their correct stack positions after activeIndex changes
  useEffect(() => {
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const pos = (i - activeIndex + 3) % 3;
      gsap.set(el, STACK_POSITIONS[pos]);
    });
  }, [activeIndex]);

  const handleTap = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    if (!hintFaded) setHintFaded(true);

    const activeEl = cardRefs.current[activeIndex];
    const posOneEl = cardRefs.current[(activeIndex + 1) % 3];
    const posTwoEl = cardRefs.current[(activeIndex + 2) % 3];
    if (!activeEl || !posOneEl || !posTwoEl) {
      isAnimatingRef.current = false;
      return;
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setActiveIndex((prev) => (prev + 1) % 3);
      isAnimatingRef.current = false;
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: "entry" },
      onComplete: () => {
        setActiveIndex((prev) => (prev + 1) % 3);
        isAnimatingRef.current = false;
      },
    });
    // Active card lifts off screen
    tl.to(activeEl,  { y: -180, rotate: 8,  scale: 1.05, opacity: 0, duration: 0.55 }, 0);
    // Back cards advance in parallel
    tl.to(posOneEl, { scale: 1.00, rotate: 0,  x: 0,   y: 0,  duration: 0.5 }, 0.05);
    tl.to(posTwoEl, { scale: 0.94, rotate: -4, x: -36, y: 18, duration: 0.5 }, 0.05);
    // Reset departed card to rearmost slot instantly (invisible behind the new stack)
    tl.set(activeEl,  { y: 32, rotate: 5, scale: 0.90, x: 40, opacity: 1, zIndex: 10 });
    tl.set(posOneEl,  { zIndex: 30 });
    tl.set(posTwoEl,  { zIndex: 20 });
  };

  const cards = [
    { quote: quote1, author: author1, studio: studio1 },
    { quote: quote2, author: author2, studio: studio2 },
    { quote: quote3, author: author3, studio: studio3 },
  ];

  return (
    <div className="flex flex-col items-center w-full">
      {/* Section header */}
      <Animate type="fade-up" className="mb-6 lg:mb-10 self-start w-full">
        <p className="type-eyebrow text-text-tertiary mb-4">{label}</p>
        <h2 className="type-display text-text-primary">{headline}</h2>
      </Animate>

      {/* Deck — fades up as one unit after the header settles */}
      <Animate type="fade-up" delay={750} className="my-4 lg:my-8">
        <div className="relative w-[220px] h-[260px] lg:w-[300px] lg:h-[400px]">
          {cards.map((card, i) => (
            <div
              key={i}
              ref={(el) => { cardRefs.current[i] = el; }}
              onClick={i === activeIndex ? handleTap : undefined}
              onKeyDown={
                i === activeIndex
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleTap();
                      }
                    }
                  : undefined
              }
              role={i === activeIndex ? "button" : undefined}
              aria-label={i === activeIndex ? hint : undefined}
              tabIndex={i === activeIndex ? 0 : -1}
              className={`polaroid-tape absolute inset-0 bg-polaroid rounded-[2px] overflow-hidden ${
                i === activeIndex ? "cursor-pointer" : "pointer-events-none"
              }`}
              style={{
                padding: "16px 16px 56px 16px",
                boxShadow: POLAROID_SHADOW,
              }}
            >
              {/* Photo placeholder — real portrait in Phase 5 */}
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
            </div>
          ))}
        </div>
      </Animate>

      {/* Hint label — pulses until first tap, then fades out */}
      <Animate type="fade-in" delay={1350}>
        <p
          aria-hidden="true"
          className={`type-caption text-text-tertiary hint-pulse${hintFaded ? " hint-faded" : ""}`}
        >
          {hint}
        </p>
      </Animate>
    </div>
  );
}
