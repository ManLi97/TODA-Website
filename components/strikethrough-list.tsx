"use client";

// Renders a list of statements; each item strikes itself out as IT scrolls into view:
// a line draws left-to-right through the text, then the text fades to muted grey. Per-element
// on entry (each row has its own IntersectionObserver), fires once, no replay — no predefined
// timeline (that lives only in the narrative Origin section).
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { usePageSection } from "@/components/page-section";

// Resolved from globals.css @theme — hex values, safe for GSAP color interpolation.
const COLOR_PRIMARY  = "#ffffff";
const COLOR_TERTIARY = "#6b6b6b";

interface StrikethroughListProps {
  items: string[];
}

export function StrikethroughList({ items }: StrikethroughListProps) {
  const textRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ctx = usePageSection();

  useEffect(() => {
    const rows = items
      .map((_, i) => ({ textEl: textRefs.current[i], lineEl: lineRefs.current[i] }))
      .filter((r) => r.textEl && r.lineEl) as {
      textEl: HTMLParagraphElement;
      lineEl: HTMLSpanElement;
    }[];
    if (!rows.length) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      // Skip to final state — line present, text muted.
      rows.forEach(({ textEl, lineEl }) => {
        gsap.set(textEl, { color: COLOR_TERTIARY });
        gsap.set(lineEl, { scaleX: 1, transformOrigin: "left center" });
      });
      return;
    }

    // Initial state — white text, no line.
    rows.forEach(({ textEl, lineEl }) => {
      gsap.set(textEl, { color: COLOR_PRIMARY });
      gsap.set(lineEl, { scaleX: 0, transformOrigin: "left center" });
    });

    const fire = (textEl: HTMLParagraphElement, lineEl: HTMLSpanElement) => {
      const tl = gsap.timeline();
      // Line draws left-to-right, text colour fades to muted slightly after.
      tl.to(lineEl, { scaleX: 1, duration: 0.65, ease: "power2.inOut" }, 0);
      tl.to(textEl, { color: COLOR_TERTIARY, duration: 0.55, ease: "power1.out" }, 0.2);
    };

    if (!ctx || ctx.triggerOnMount) {
      rows.forEach(({ textEl, lineEl }) => fire(textEl, lineEl));
      return;
    }

    // Each row strikes itself out when IT enters view; fire once, then unobserve.
    const byText = new Map<Element, (typeof rows)[number]>();
    rows.forEach((r) => byText.set(r.textEl, r));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const row = byText.get(entry.target);
            if (row) fire(row.textEl, row.lineEl);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );

    rows.forEach((r) => observer.observe(r.textEl));
    return () => observer.disconnect();
  }, [items, ctx]);

  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className="relative">
          <p
            ref={(el) => {
              textRefs.current[i] = el;
            }}
            className="type-sub-display"
          >
            {item}
          </p>
          {/* Animated strike line — GSAP scales from 0→1 on the x-axis */}
          <span
            ref={(el) => {
              lineRefs.current[i] = el;
            }}
            aria-hidden="true"
            className="absolute left-0 w-full h-[2px] bg-text-tertiary pointer-events-none"
            style={{ top: "50%", marginTop: "-1px" }}
          />
        </div>
      ))}
    </div>
  );
}
