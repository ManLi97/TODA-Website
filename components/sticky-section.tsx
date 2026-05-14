"use client";

// Sticky section tile with overflow content pan.
// When a section's content exceeds the viewport height, the inner content is
// translated upward (scrubbed via ScrollTrigger) so the user scrolls through
// the full content before the next section slides in. Sections that fit within
// the viewport get no translateY — the ScrollTrigger is simply not created.
// ResizeObserver recalculates on every resize (orientation change, window resize).
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type SectionVariant = "base" | "raised" | "alt";

const BG: Record<SectionVariant, string> = {
  base: "bg-surface-base",
  raised: "bg-surface-raised",
  alt: "bg-surface-alt",
};

interface StickySectionProps {
  variant?: SectionVariant;
  id?: string;
  zIndex: number;
  children: React.ReactNode;
}

export function StickySection({
  variant = "base",
  id,
  zIndex,
  children,
}: StickySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const inner = innerRef.current;
    if (!section || !inner) return;

    // Reduced-motion: skip pan entirely — content is still accessible via normal
    // sticky scroll, the bottom portion is just not panned into view.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    let ctx = gsap.context(() => {}); // empty context — safe to revert immediately
    let resizeTimer: ReturnType<typeof setTimeout>;

    function setupPin() {
      ctx.revert();
      // Re-check inside the closure — TypeScript can't carry narrowing from the outer
      // guard into a separately-callable function. Guards against unmount edge cases too.
      if (!section || !inner) return;
      inner.style.transform = "";

      const overflow = Math.max(0, section.scrollHeight - window.innerHeight);
      if (overflow === 0) return;

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          // "bottom top" = section's natural bottom edge reaches viewport top,
          // which is exactly when CSS sticky releases. Progress 0→1 over that range.
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            inner.style.transform = `translateY(${-overflow * self.progress}px)`;
          },
        });
      });
    }

    setupPin();

    // Debounced resize handler prevents rapid ScrollTrigger recreation during
    // continuous resize (e.g. desktop window drag or soft-keyboard appear/disappear)
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setupPin, 100);
    });
    ro.observe(section);

    return () => {
      clearTimeout(resizeTimer);
      ctx.revert();
      inner.style.transform = "";
      ro.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`${BG[variant]} sticky top-0 min-h-dvh overflow-x-hidden`}
      style={{ zIndex }}
    >
      {/* translateY target — shifts upward as user scrolls through overflow content */}
      <div ref={innerRef} className="py-20 lg:py-32">
        <div className="max-w-[1200px] mx-auto px-6">{children}</div>
      </div>
    </section>
  );
}
