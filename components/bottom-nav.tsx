"use client";

// Global bottom nav — floating glass pill glued to the VISIBLE viewport bottom.
// Discovers sections live via querySelectorAll("section[id]") — never hardcoded.
// A viewport-center-band IntersectionObserver tracks the active section for arrow state.
// A VisualViewport listener keeps the pill pinned to the visible bottom edge (above any
// browser bottom chrome / keyboard) instead of the layout-viewport bottom, so it never sits
// too high and the OS never "snaps" it as the chrome animates. Cross-device: where the
// VisualViewport API is absent it degrades to a plain fixed bottom-0 pill.
// aria-labels are hardcoded English for v1; i18n is a Phase 6 follow-up.
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";

function ArrowUp() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5 12.5L10 7.5L15 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BottomNav() {
  const [sections, setSections] = useState<HTMLElement[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const positionerRef = useRef<HTMLDivElement>(null);

  // Glue the pill to the bottom of the VISIBLE viewport. position:fixed bottom-0 anchors to
  // the layout viewport, whose bottom hides behind the browser's bottom chrome (iOS/Firefox
  // toolbar) or the keyboard — that mismatch is what made the pill sit too high and snap as
  // the chrome animated. We lift it by the gap between the layout-viewport bottom and the
  // visible-viewport bottom, recomputed on every VisualViewport resize/scroll so it tracks
  // the chrome smoothly. Uses only documentElement.clientHeight + visualViewport metrics
  // (no unreliable innerHeight); absent VisualViewport, it stays a plain fixed pill.
  useEffect(() => {
    const vv = window.visualViewport;
    const el = positionerRef.current;
    if (!vv || !el) return;

    const update = () => {
      const layoutHeight = document.documentElement.clientHeight;
      const lift = Math.max(0, layoutHeight - (vv.offsetTop + vv.height));
      el.style.transform = lift > 0 ? `translateY(${-lift}px)` : "";
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  useEffect(() => {
    const discovered = Array.from(
      document.querySelectorAll<HTMLElement>("section[id]")
    );
    setSections(discovered);
    if (discovered.length === 0) return;

    // Active section = the one crossing a thin band at the viewport's vertical centre.
    // rootMargin -45%/-45% collapses the root to a ~10%-tall centre band, so exactly one
    // section (each is >= 100svh) is active at a time — height-independent, unlike the old
    // threshold:0.5 which could never be reached on sections taller than the viewport (B1)
    // and let several sections fight for "active" at once (B2).
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = discovered.indexOf(entry.target as HTMLElement);
            if (idx !== -1) setActiveIndex(idx);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    discovered.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback(
    (idx: number) => {
      const target = sections[idx];
      if (!target) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    },
    [sections]
  );

  const atStart = activeIndex === 0;
  const atEnd = sections.length === 0 || activeIndex === sections.length - 1;

  const arrowClass = (disabled: boolean) =>
    `flex items-center justify-center w-10 h-10 text-text-secondary transition-opacity duration-200 ${
      disabled ? "opacity-30 cursor-default" : "hover:text-text-primary"
    }`;

  return (
    // Full-width positioner is pointer-events-none so the invisible band never
    // blocks clicks beside the pill. The <nav> itself restores pointer events.
    <div
      ref={positionerRef}
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none"
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom) + 0.25rem)",
        willChange: "transform",
      }}
    >
      <nav
        aria-label="Section navigation"
        className="pointer-events-auto flex items-center justify-center gap-6 h-14 px-4 rounded-full"
        style={{
          background: "var(--glass-tint)",
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
          border: "var(--glass-border-gold)",
          boxShadow: "var(--shadow-float)",
        }}
      >
        {/* Up arrow — previous section */}
        <button
          aria-label="Previous section"
          aria-disabled={atStart}
          onClick={() => {
            if (!atStart) scrollTo(activeIndex - 1);
          }}
          className={arrowClass(atStart)}
        >
          <ArrowUp />
        </button>

        {/* Center — FAB: app icon floats above the pill via translateY */}
        <a
          href="https://app.toda.ink/onboarding"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open TODA app"
          className="flex items-center justify-center transition-opacity duration-100 hover:opacity-70 active:opacity-100"
          style={{ transform: "translateY(-20px)" }}
        >
          <span
            className="relative flex items-center justify-center w-[60px] h-[60px] rounded-full"
            style={{
              background: "#000",
              boxShadow: "0 12px 40px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.4)",
            }}
          >
            {/* Border ring — same style as nav pill, clipped to the arc above the nav border only */}
            <span
              className="absolute rounded-full pointer-events-none"
              style={{
                inset: "-1px",
                border: "var(--glass-border-gold)",
                clipPath: "inset(0 0 65% 0)",
              }}
            />
            <Image src="/toda-app-icon.svg" alt="TODA" width={40} height={40} />
          </span>
        </a>

        {/* Down arrow — next section */}
        <button
          aria-label="Next section"
          aria-disabled={atEnd}
          onClick={() => {
            if (!atEnd) scrollTo(activeIndex + 1);
          }}
          className={arrowClass(atEnd)}
        >
          <ArrowDown />
        </button>
      </nav>
    </div>
  );
}
