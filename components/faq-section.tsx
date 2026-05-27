"use client";

// FAQ accordion — single-open pattern.
// Icon rotates 45° to form × via CSS class toggle (.faq-icon.is-open).
// Answer panel uses grid-template-rows: 0fr ↔ 1fr — always mounted, no AnimatePresence.

import { useState } from "react";
import { Animate } from "@/components/animate";
import { SectionHeader } from "@/components/section-header";

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
      {/* Section header — animates as one unit on section settle */}
      <Animate type="fade-up" className="mb-block">
        <SectionHeader label={label} headline={headline} />
      </Animate>

      {/* Accordion list — constrained to reading width */}
      <div className="max-w-2xl">
        {items.map(({ q, a }, i) => (
          <div key={i} className="border-t border-border-subtle last:border-b">
            <button
              className="flex w-full items-center justify-between gap-6 py-5 text-left"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
            >
              {/* Question uses .type-lede with text-primary override (lede defaults to secondary). */}
              <span className="type-lede text-text-primary">
                {q}
              </span>
              <span
                className={`faq-icon flex-none text-[20px] leading-none select-none text-gold-400${openIndex === i ? " is-open" : ""}`}
                aria-hidden="true"
              >
                +
              </span>
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
              style={{ gridTemplateRows: openIndex === i ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="pb-5 type-lede">{a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
