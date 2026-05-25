"use client";

// Single-element entrance wrapper. Fires a GSAP fromTo tween when its nearest
// <SnapSection> ancestor settles into view (IntersectionObserver threshold 0.95).
// Resets to "from" state on leave so the animation replays on re-entry.
// When the parent <SnapSection triggerOnMount> is true, fires on mount instead.
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useSnapSection } from "@/components/snap-section";

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
  "fade-up":     { opacity: 0, y: 24 },
  "fade-in":     { opacity: 0 },
  "scale-in":    { opacity: 0, scale: 0.93 },
  "slide-left":  { opacity: 0, x: -32 },
  "slide-right": { opacity: 0, x: 40 },
  "draw-w":      { width: 0, opacity: 0 },
  "hero-in":     { opacity: 0, scale: 0.93 },
};

export const ANIM_TO: Record<AnimationType, Record<string, string | number>> = {
  "fade-up":     { opacity: 1, y: 0 },
  "fade-in":     { opacity: 1 },
  "scale-in":    { opacity: 1, scale: 1 },
  "slide-left":  { opacity: 1, x: 0 },
  "slide-right": { opacity: 1, x: 0 },
  "draw-w":      { width: "3rem", opacity: 0.4 },
  "hero-in":     { opacity: 1, scale: 1 },
};

// Default durations (ms) per motion.md §3
export const ANIM_DURATION: Record<AnimationType, number> = {
  "fade-up":     550,
  "fade-in":     400,
  "scale-in":    900,
  "slide-left":  550,
  "slide-right": 700,
  "draw-w":      700,
  "hero-in":     900,
};

interface AnimateProps {
  type: AnimationType;
  delay?: number;    // ms, default 0
  duration?: number; // ms, overrides the type's default
  className?: string;
  children: React.ReactNode;
}

export function Animate({ type, delay = 0, duration, className, children }: AnimateProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const ctx = useSnapSection();

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

    const reset = () => {
      gsap.killTweensOf(el);
      gsap.set(el, from);
    };

    if (!ctx) {
      // Outside a <SnapSection> — degrade gracefully (e.g. /test/components playground)
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Animate] No <SnapSection> context found. Firing on mount.");
      }
      fire();
      return;
    }

    if (ctx.triggerOnMount) {
      fire();
      return;
    }

    const sectionEl = ctx.sectionRef.current;
    if (!sectionEl) return;

    // Observe the section element (not this element) — the section fills the viewport
    // exactly, so a 0.95 threshold is a reliable "section has settled" signal.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.7) {
            fire();
          } else {
            reset();
          }
        }
      },
      // 0.7: accounts for fixed header (56px) + bottom-nav pill (~72px).
      // With ~128px of chrome, max achievable ratio on a 568px phone is ~77%.
      // 0.95 can never fire; 0.7 reliably fires when the section is snapped to view.
      { threshold: 0.7 },
    );

    observer.observe(sectionEl);
    return () => observer.disconnect();
  }, [type, delay, duration, ctx]);

  return (
    <div ref={elRef} className={className}>
      {children}
    </div>
  );
}
