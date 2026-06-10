"use client";

// Single-element entrance wrapper. Fires a GSAP fromTo tween when THIS element scrolls
// into view (IntersectionObserver on the element itself, with a rootMargin reveal offset).
// Element-scoped (not section-scoped) so it works in sections taller than the viewport.
// Fires once on first entry and stays — no reset/replay on scroll-back (calmer, more premium).
// When the parent <PageSection triggerOnMount> is true, fires on mount instead.
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { usePageSection } from "@/components/page-section";

export type AnimationType =
  | "fade-up"
  | "fade-in"
  | "scale-in"
  | "slide-left"
  | "slide-right"
  | "draw-w"
  | "hero-in"; // Phase 5 — treated as scale-in for now

// GSAP fromTo states per motion.md §2
export const ANIM_FROM: Record<AnimationType, Record<string, string | number>> = {
  "fade-up": { opacity: 0, y: 24 },
  "fade-in": { opacity: 0 },
  "scale-in": { opacity: 0, scale: 0.93 },
  "slide-left": { opacity: 0, x: -32 },
  "slide-right": { opacity: 0, x: 40 },
  "draw-w": { width: 0, opacity: 0 },
  "hero-in": { opacity: 0, scale: 0.93 },
};

export const ANIM_TO: Record<AnimationType, Record<string, string | number>> = {
  "fade-up": { opacity: 1, y: 0 },
  "fade-in": { opacity: 1 },
  "scale-in": { opacity: 1, scale: 1 },
  "slide-left": { opacity: 1, x: 0 },
  "slide-right": { opacity: 1, x: 0 },
  "draw-w": { width: "3rem", opacity: 0.4 },
  "hero-in": { opacity: 1, scale: 1 },
};

// Default durations (ms) per motion.md §3
export const ANIM_DURATION: Record<AnimationType, number> = {
  "fade-up": 550,
  "fade-in": 400,
  "scale-in": 900,
  "slide-left": 550,
  "slide-right": 700,
  "draw-w": 700,
  "hero-in": 900,
};

interface AnimateProps {
  type: AnimationType;
  delay?: number; // ms, default 0
  duration?: number; // ms, overrides the type's default
  className?: string;
  children: React.ReactNode;
}

export function Animate({ type, delay = 0, duration, className, children }: AnimateProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const ctx = usePageSection();

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    // Register inside effect — guarantees browser-only execution.
    // GSAP deduplicates registerPlugin and CustomEase.create calls safely.
    gsap.registerPlugin(CustomEase);
    CustomEase.create("entry", "0.16, 1, 0.3, 1");

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = ANIM_FROM[type];
    const to = ANIM_TO[type];
    const durS = (duration ?? ANIM_DURATION[type]) / 1000;
    const delayS = delay / 1000;

    if (prefersReduced) {
      gsap.set(el, to);
      return;
    }

    // Hold element in "from" (hidden) state until section settles into view
    gsap.set(el, from);

    const fire = () => {
      gsap.fromTo(el, from, { ...to, duration: durS, delay: delayS, ease: "entry" });
    };

    if (!ctx) {
      // Outside a <PageSection> — degrade gracefully (e.g. /test/components playground)
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Animate] No <PageSection> context found. Firing on mount.");
      }
      fire();
      return;
    }

    if (ctx.triggerOnMount) {
      fire();
      return;
    }

    // Observe THIS element entering the viewport, fire once, then disconnect. Element-scoped
    // (not section-ratio) so it works regardless of section height. Fire-once (no reset/replay)
    // reads calmer and more premium than re-animating every time you scroll back past it.
    // rootMargin bottom -12% reveals just after the element's top crosses into view.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            fire();
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [type, delay, duration, ctx]);

  return (
    <div ref={elRef} className={className}>
      {children}
    </div>
  );
}
