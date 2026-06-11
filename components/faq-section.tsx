"use client";

// FAQ accordion — single-open pattern.
// Icon rotates 45° to form × via CSS class toggle (.faq-icon.is-open).
// Answer panel uses grid-template-rows: 0fr ↔ 1fr — always mounted, no AnimatePresence.

import { useState } from "react";
import { Animate } from "@/components/animate";
import { SectionHeader } from "@/components/section-header";
import { buttonVariants } from "@/components/button";
import { ONBOARDING_URL } from "@/lib/site";

interface FaqSectionProps {
  label: string;
  headline: string;
  q1: string;
  a1: string;
  q2: string;
  a2: string;
  q3: string;
  a3: string;
  q4: string;
  a4: string;
  q5: string;
  a5: string;
  // Closing CTA below the accordion — the page must not end without an action.
  ctaText: string;
  ctaLabel: string;
}

export function FaqSection({
  label,
  headline,
  q1,
  a1,
  q2,
  a2,
  q3,
  a3,
  q4,
  a4,
  q5,
  a5,
  ctaText,
  ctaLabel,
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
    <div className="lg:gap-block lg:grid lg:grid-cols-[2fr_3fr] lg:items-start">
      {/* Section header — sticky on desktop so it stays in view while user scrolls answers */}
      <Animate type="fade-up" className="mb-block lg:sticky lg:top-24 lg:mb-0 lg:self-start">
        <SectionHeader label={label} headline={headline} />
      </Animate>

      {/* Accordion list — constrained to reading width */}
      <div className="max-w-2xl">
        {items.map(({ q, a }, i) => (
          <div key={i} className="border-border-subtle border-t last:border-b">
            <button
              className="flex w-full items-center justify-between gap-6 py-5 text-left"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
            >
              {/* Question uses .type-lede with text-primary override (lede defaults to secondary). */}
              <span className="type-lede text-text-primary">{q}</span>
              <span
                className={`faq-icon text-purple-400 flex-none text-[20px] leading-none select-none ${openIndex === i ? "is-open" : ""}`}
                aria-hidden="true"
              >
                +
              </span>
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-[250ms] ease-[var(--ease-entry)] motion-reduce:transition-none"
              style={{ gridTemplateRows: openIndex === i ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="type-lede pb-5">{a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Closing CTA — objection handling resolved, hand over the action. */}
      <Animate type="fade-up" className="mt-block lg:col-span-2">
        <div className="border-border-subtle gap-group pt-block flex flex-col items-start border-t lg:flex-row lg:items-center lg:justify-between">
          <p className="type-lede text-text-primary">{ctaText}</p>
          <a
            href={ONBOARDING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            {ctaLabel}
          </a>
        </div>
      </Animate>
    </div>
  );
}
