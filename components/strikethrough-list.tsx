"use client";

// Renders a list of statements that strike themselves out as a deliberate cascade: once the
// whole list scrolls into view, each item is crossed out one after another — a line draws
// left-to-right through the text, then the text fades to muted grey. Single container-scoped
// IntersectionObserver, fires once, no replay.
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
  const containerRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ctx = usePageSection();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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

    // Cross out every row in sequence — each item starts STAGGER after the previous,
    // giving a slow, deliberate cascade rather than three simultaneous strikes.
    const STAGGER = 1.5;
    const fire = () => {
      const tl = gsap.timeline();
      rows.forEach(({ textEl, lineEl }, i) => {
        const at = i * STAGGER;
        // Line draws left-to-right, text colour fades to muted slightly after.
        tl.to(lineEl, { scaleX: 1, duration: 0.65, ease: "power2.inOut" }, at);
        tl.to(textEl, { color: COLOR_TERTIARY, duration: 0.55, ease: "power1.out" }, at + 0.2);
      });
    };

    if (!ctx || ctx.triggerOnMount) {
      fire();
      return;
    }

    // The whole list strikes out as a cascade once the container enters view; fires once.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            fire();
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [items, ctx]);

  return (
    <div ref={containerRef} className="space-y-1">
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
