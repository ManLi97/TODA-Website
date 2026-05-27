"use client";

// Cascade entrance wrapper — animates N direct children with a stagger delay.
// Each child fires at: delay + (index * gap) ms.
// Same trigger model as <Animate>: observes the container element entering the viewport
// (element-scoped, survives sections taller than the viewport), fires once, no replay.
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { usePageSection } from "@/components/page-section";
import { ANIM_FROM, ANIM_TO, ANIM_DURATION, type AnimationType } from "@/components/animate";

interface StaggerProps {
  gap: number;       // ms between each child's entrance
  type: AnimationType;
  delay?: number;    // ms before the first child fires, default 0
  className?: string;
  children: React.ReactNode;
}

export function Stagger({ gap, type, delay = 0, className, children }: StaggerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctx = usePageSection();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.children.length === 0) return;

    gsap.registerPlugin(CustomEase);
    CustomEase.create("entry", "0.16, 1, 0.3, 1");

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = ANIM_FROM[type];
    const to = ANIM_TO[type];
    const durS = ANIM_DURATION[type] / 1000;
    const items = Array.from(container.children) as HTMLElement[];

    if (prefersReduced) {
      items.forEach((el) => gsap.set(el, to));
      return;
    }

    // Hold all children in "from" (hidden) state before section settles
    items.forEach((el) => gsap.set(el, from));

    const fire = () => {
      items.forEach((el, i) => {
        gsap.fromTo(el, from, {
          ...to,
          duration: durS,
          delay: (delay + i * gap) / 1000,
          ease: "entry",
        });
      });
    };

    if (!ctx) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Stagger] No <PageSection> context found. Firing on mount.");
      }
      fire();
      return;
    }

    if (ctx.triggerOnMount) {
      fire();
      return;
    }

    // Observe the container entering the viewport (element-scoped, not section-ratio),
    // fire the cascade once, then disconnect — no replay on scroll-back (calmer, more premium).
    // rootMargin bottom -12% reveals just after the container's top crosses in.
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
    return () => observer.disconnect();
  }, [type, delay, gap, ctx]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
