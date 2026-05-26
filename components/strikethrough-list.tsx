"use client";

// Renders a list of statements that animate sequentially on section entry:
// each item starts white, a line draws left-to-right through it, then it fades
// to muted grey. Resets when the section leaves so the animation replays.
// Uses the same IntersectionObserver pattern as <Animate> — scoped to the
// nearest <SnapSection> ancestor via context.
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useSnapSection } from "@/components/snap-section";

// Resolved from globals.css @theme — hex values, safe for GSAP color interpolation.
const COLOR_PRIMARY   = "#ffffff";
const COLOR_TERTIARY  = "#6b6b6b";

// Seconds between each item's strike animation starting.
const ITEM_STAGGER_S  = 0.9;
// Delay after section settles before the first strike fires (lets Stagger fade-up finish).
const INITIAL_DELAY_S = 2.2;

interface StrikethroughListProps {
  items: string[];
}

export function StrikethroughList({ items }: StrikethroughListProps) {
  const textRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRef    = useRef<gsap.core.Timeline | null>(null);
  const ctx      = useSnapSection();

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

    const reset = () => {
      tlRef.current?.kill();
      setInitial();
    };

    if (!ctx || ctx.triggerOnMount) {
      fire();
      return;
    }

    const sectionEl = ctx.sectionRef.current;
    if (!sectionEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.7) fire();
          else reset();
        }
      },
      { threshold: 0.7 },
    );

    observer.observe(sectionEl);
    return () => {
      observer.disconnect();
      tlRef.current?.kill();
    };
  }, [items, ctx]);

  return (
    <div className="space-y-1">
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
