"use client";

// Scroll-triggered reveal animation — validates the MOTION.md section-reveal pattern.
// Each direct child animates from { opacity: 0, y: 32px } to { opacity: 1, y: 0 }
// when the container's top edge crosses 85% of viewport height.
// Stagger: 60ms per child, capped at 240ms (children 5+ all start at 240ms).
// Easing: "toda-enter" = exact MOTION.md enter curve cubic-bezier(0, 0, 0.2, 1).
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollReveal({ children, className }: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Leave elements fully visible — no animation
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Register inside useEffect — guarantees browser-only execution
    // GSAP deduplicates repeated registerPlugin calls, so multiple ScrollReveal
    // instances on the same page are safe
    gsap.registerPlugin(ScrollTrigger, CustomEase);
    // Named ease scoped to this project — prevents collision with GSAP built-ins
    // SVG path equivalent of CSS cubic-bezier(0, 0, 0.2, 1)
    CustomEase.create("toda-enter", "M0,0 C0,0 0.2,1 1,1");

    const container = containerRef.current;
    if (!container || container.children.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(Array.from(container.children), {
        opacity: 0,
        y: 32,
        duration: 0.6,
        // 60ms per child; after 4 children all remaining fire simultaneously at 240ms
        stagger: (i: number) => Math.min(i * 0.06, 0.24),
        ease: "toda-enter",
        scrollTrigger: {
          trigger: container,
          start: "top 85%",
        },
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
