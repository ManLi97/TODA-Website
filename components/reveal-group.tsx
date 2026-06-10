"use client";

// Per-element entrance for a group of N direct children. Each child fires its own GSAP
// fromTo the moment IT crosses into view (its own element-scoped IntersectionObserver entry),
// once, no replay, no inter-element delay. Children sharing a screen reveal together; a child
// lower in a tall group (or further along a carousel) reveals as you scroll/swipe to it.
// Use <Animate> for a single element — this is the same trigger model for many children.
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { usePageSection } from "@/components/page-section";
import { ANIM_FROM, ANIM_TO, ANIM_DURATION, type AnimationType } from "@/components/animate";

interface RevealGroupProps {
  type: AnimationType;
  className?: string;
  children: React.ReactNode;
}

export function RevealGroup({ type, className, children }: RevealGroupProps) {
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

    // Hold every child in "from" (hidden) state until it individually enters.
    items.forEach((el) => gsap.set(el, from));

    const fire = (el: HTMLElement) => {
      gsap.fromTo(el, from, { ...to, duration: durS, ease: "entry" });
    };

    if (!ctx) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[RevealGroup] No <PageSection> context found. Firing on mount.");
      }
      items.forEach(fire);
      return;
    }

    if (ctx.triggerOnMount) {
      items.forEach(fire);
      return;
    }

    // One observer; each child fires on its own entry then is unobserved (fire-once, no replay).
    // rootMargin bottom -12% reveals just after a child's top crosses into view.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            fire(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0 }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [type, ctx]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
