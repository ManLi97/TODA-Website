"use client";

// Renders a list of statements that animate sequentially on entry:
// each item starts white, a line draws left-to-right through it, then it fades
// to muted grey. Fires once when the list scrolls into view — no replay on scroll-back.
// Same element-scoped IntersectionObserver pattern as <Animate>/<Stagger>.
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { usePageSection } from "@/components/page-section";

// Resolved from globals.css @theme — hex values, safe for GSAP color interpolation.
const COLOR_PRIMARY   = "#ffffff";
const COLOR_TERTIARY  = "#6b6b6b";

// Seconds between each item's strike animation starting.
const ITEM_STAGGER_S  = 0.9;
// Delay after the list enters view before the first strike fires (lets Stagger fade-up finish).
const INITIAL_DELAY_S = 2.2;

interface StrikethroughListProps {
  items: string[];
}

export function StrikethroughList({ items }: StrikethroughListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRef    = useRef<gsap.core.Timeline | null>(null);
  const ctx      = usePageSection();

  useEffect(() => {
    const textEls = items.map((_, i) => textRefs.current[i]).filter(Boolean) as HTMLParagraphElement[];
    const lineEls = items.map((_, i) => lineRefs.current[i]).filter(Boolean) as HTMLSpanElement[];
    if (!textEls.length) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setInitial = () => {
      gsap.set(textEls, { color: COLOR_PRIMARY });
      gsap.set(lineEls, { scaleX: 0, transformOrigin: "left center" });
    };

    if (prefersReduced) {
      // Skip to final state — line present, text muted.
      gsap.set(textEls, { color: COLOR_TERTIARY });
      gsap.set(lineEls, { scaleX: 1, transformOrigin: "left center" });
      return;
    }

    setInitial();

    const buildTimeline = () => {
      const tl = gsap.timeline({ delay: INITIAL_DELAY_S });
      textEls.forEach((textEl, i) => {
        const lineEl = lineEls[i];
        const offset = i * ITEM_STAGGER_S;
        // Line draws left-to-right.
        tl.to(lineEl, { scaleX: 1, duration: 0.65, ease: "power2.inOut" }, offset);
        // Text colour fades to muted slightly after the line starts.
        tl.to(textEl, { color: COLOR_TERTIARY, duration: 0.55, ease: "power1.out" }, offset + 0.2);
      });
      return tl;
    };

    const fire = () => {
      tlRef.current?.kill();
      setInitial();
      tlRef.current = buildTimeline();
    };

    if (!ctx || ctx.triggerOnMount) {
      fire();
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Observe the list entering the viewport, fire once, then disconnect (no replay).
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            fire();
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );

    observer.observe(container);
    return () => {
      observer.disconnect();
      tlRef.current?.kill();
    };
  }, [items, ctx]);

  return (
    <div ref={containerRef} className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className="relative">
          <p
            ref={(el) => { textRefs.current[i] = el; }}
            className="type-sub-display"
          >
            {item}
          </p>
          {/* Animated strike line — GSAP scales from 0→1 on the x-axis */}
          <span
            ref={(el) => { lineRefs.current[i] = el; }}
            aria-hidden="true"
            className="absolute left-0 w-full h-[2px] bg-text-tertiary pointer-events-none"
            style={{ top: "50%", marginTop: "-1px" }}
          />
        </div>
      ))}
    </div>
  );
}
