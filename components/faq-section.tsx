"use client";

// FAQ accordion — single-open pattern.
// The + icon rotates 45° to form × on open (opacity+rotate only, no height animation).
// Answer content fades in from y:-6 (opacity+transform only, per MOTION.md GPU rule).
// Height of each item changes instantly on toggle — no layout animation needed.

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ScrollReveal } from "@/components/scroll-reveal";

const EASE_STANDARD: [number, number, number, number] = [0.4, 0, 0.2, 1];

interface FaqSectionProps {
  label: string;
  headline: string;
  q1: string; a1: string;
  q2: string; a2: string;
  q3: string; a3: string;
  q4: string; a4: string;
  q5: string; a5: string;
}

export function FaqSection({
  label, headline,
  q1, a1, q2, a2, q3, a3, q4, a4, q5, a5,
}: FaqSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = [
    { q: q1, a: a1 },
    { q: q2, a: a2 },
    { q: q3, a: a3 },
    { q: q4, a: a4 },
    { q: q5, a: a5 },
  ];

  return (
    <div>
      {/* Section header */}
      <ScrollReveal className="mb-12">
        <p className="text-[12px] font-normal leading-none tracking-[0.1px] uppercase text-text-tertiary mb-6">
          {label}
        </p>
        <h2 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.3px] text-text-primary">
          {headline}
        </h2>
      </ScrollReveal>

      {/* Accordion list — constrained to reading width */}
      <div className="max-w-2xl">
        {items.map(({ q, a }, i) => (
          <div key={i} className="border-t border-border-subtle last:border-b">
            <button
              className="flex w-full items-center justify-between gap-6 py-5 text-left"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
            >
              <span className="text-[17px] font-normal leading-[1.47] tracking-[-0.2px] text-text-primary">
                {q}
              </span>
              <motion.span
                className="flex-none text-[20px] leading-none select-none text-gold-500"
                animate={
                  shouldReduceMotion
                    ? undefined
                    : { rotate: openIndex === i ? 45 : 0 }
                }
                transition={{ duration: 0.2, ease: EASE_STANDARD }}
                aria-hidden="true"
              >
                +
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {openIndex === i && (
                <motion.div
                  key="answer"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: EASE_STANDARD }}
                >
                  <p className="pb-5 text-[17px] font-normal leading-[1.47] tracking-[-0.2px] text-text-secondary">
                    {a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
