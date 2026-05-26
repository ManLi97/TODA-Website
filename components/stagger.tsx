"use client";

// Cascade entrance wrapper — animates N direct children with a stagger delay.
// Each child fires at: delay + (index * gap) ms.
// Same IO trigger model as <Animate>: watches the nearest <SnapSection> ancestor,
// fires when section reaches 0.95 intersection ratio, resets on leave.
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useSnapSection } from "@/components/snap-section";
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
  const ctx = useSnapSection();

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

    const reset = () => {
      items.forEach((el) => {
        gsap.killTweensOf(el);
        gsap.set(el, from);
      });
    };

    if (!ctx) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Stagger] No <SnapSection> context found. Firing on mount.");
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

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.4) {
            fire();
          } else {
            reset();
          }
        }
      },
      // 0.4: sections that overflow 100dvh (e.g. portrait video on iPhone 11) have a max
      // achievable ratio of ~0.68. 0.7 was too high; 0.4 fires reliably once snapped in view
      // while still being above the ~0 ratio when the section is fully off-screen.
      { threshold: 0.4 },
    );

    observer.observe(sectionEl);
    return () => observer.disconnect();
  }, [type, delay, gap, ctx]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
