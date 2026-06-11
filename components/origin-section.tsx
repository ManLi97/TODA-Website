"use client";

// Origin — section #4, surface-alt.
// Story format: eyebrow → headline → fade-up narrative (lines 1+2, then line3 with extra delay)
// → chat bubbles (slower fade-in) → phone-shake + drawing line + TODA icon → glass closing box.
// Single GSAP ScrollTrigger timeline, fires once on section entry.
// Initial inline styles on animated elements prevent SSR flash.

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import Image from "next/image";

interface OriginSectionProps {
  label: string;
  headline: string;
  line1: string;
  line2: string;
  line3: string;
  bubble1: string;
  bubble2: string;
  closing: string;
}

// Highlights first two characters of "Tomek" and "Dana" in gold across all locales.
function HighlightedClosing({ text }: { text: string }) {
  return (
    <>
      {text.split(/(Tomek|Dana)/g).map((part, i) =>
        part === "Tomek" ? (
          <span key={i}>
            <span className="text-gold-400 font-semibold">To</span>mek
          </span>
        ) : part === "Dana" ? (
          <span key={i}>
            <span className="text-gold-400 font-semibold">Da</span>na
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function OriginSection({
  label,
  headline,
  line1,
  line2,
  line3,
  bubble1,
  bubble2,
  closing,
}: OriginSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    gsap.registerPlugin(ScrollTrigger, CustomEase);
    // Same entry curve as the site-wide entrances — the timeline sequences beats,
    // but every fade rides the one ease. The phone shake + icon pop below are the
    // page's single sanctioned personality moment and keep their own character.
    CustomEase.create("entry", "0.16, 1, 0.3, 1");

    const ctx = gsap.context(() => {
      const fadeLines = gsap.utils.toArray<HTMLElement>("[data-fade-line]", container);
      const line3El = container.querySelector<HTMLElement>("[data-line3]");
      const bubbleEls = gsap.utils.toArray<HTMLElement>("[data-bubble]", container);
      const phoneEl = container.querySelector<HTMLElement>("[data-phone]");
      const lineEl = container.querySelector<HTMLElement>("[data-line]");
      const todaEl = container.querySelector<HTMLElement>("[data-toda]");
      const closingEl = container.querySelector<HTMLElement>("[data-closing]");

      // Honour prefers-reduced-motion — skip animation, show everything.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set([...fadeLines, line3El, ...bubbleEls, phoneEl, todaEl, closingEl], {
          clearProps: "all",
        });
        gsap.set(lineEl, { scaleX: 1 });
        return;
      }

      // Re-apply initial hidden states (consistent with inline SSR styles).
      gsap.set([...fadeLines, line3El, ...bubbleEls, phoneEl, closingEl], { opacity: 0, y: 15 });
      gsap.set(todaEl, { opacity: 0, scale: 0 });
      gsap.set(lineEl, { scaleX: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "center bottom",
          once: true,
        },
      });

      // Phase 1 — Lines 1+2: standard fade-up, staggered (same as site-wide body text)
      tl.to(fadeLines, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.12,
        ease: "entry",
      })

        // Line 3 "Dann klingelte das Telefon." — same fade-up, larger delay for dramatic pause
        .to(
          line3El,
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "entry",
          },
          ">+0.45"
        )

        // Phase 2 — Chat bubbles: slower, deliberate, 0.45s stagger between them
        .to(
          bubbleEls,
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.45,
            ease: "entry",
          },
          ">+0.25"
        )

        // Phase 3 — Phone icon appears (~0.4s), then shake (6 frames × 0.1s = 0.6s)
        .to(
          phoneEl,
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "entry",
          },
          ">+0.25"
        )
        .to(phoneEl, { rotation: -8, duration: 0.1, ease: "none" })
        .to(phoneEl, { rotation: 8, duration: 0.1, ease: "none" })
        .to(phoneEl, { rotation: -6, duration: 0.1, ease: "none" })
        .to(phoneEl, { rotation: 6, duration: 0.1, ease: "none" })
        .to(phoneEl, { rotation: -3, duration: 0.1, ease: "none" })
        .to(phoneEl, { rotation: 0, duration: 0.1, ease: "power1.out" })

        // Phase 4 — Line draws right, smooth and slow (~0.9s)
        .to(
          lineEl,
          {
            scaleX: 1,
            duration: 0.9,
            ease: "entry",
          },
          ">-0.1"
        )

        // Phase 5 — TODA icon scale-bounce (~0.45s)
        .to(
          todaEl,
          {
            opacity: 1,
            scale: 1,
            duration: 0.45,
            ease: "back.out(2.5)",
          },
          ">-0.15"
        )

        // Phase 6 — Closing glass box fades in
        .to(
          closingEl,
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "entry",
          },
          ">+0.2"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="max-w-2xl lg:mx-auto">
      {/* Section header */}
      <p className="type-eyebrow text-text-tertiary mb-group">{label}</p>
      <h2 className="type-display text-text-primary mb-block">{headline}</h2>

      {/* Narrative lines — standard fade-up for lines 1+2, larger delay for line 3 */}
      <div className="mb-block space-y-1">
        <p
          data-fade-line
          style={{ opacity: 0, transform: "translateY(15px)" }}
          className="text-text-secondary text-sm leading-relaxed lg:text-[17px]"
        >
          {line1}
        </p>
        <p
          data-fade-line
          style={{ opacity: 0, transform: "translateY(15px)" }}
          className="text-text-secondary text-sm leading-relaxed lg:text-[17px]"
        >
          {line2}
        </p>
        <p
          data-line3
          style={{ opacity: 0, transform: "translateY(15px)" }}
          className="text-text-primary pt-3 text-sm font-medium lg:text-[17px]"
        >
          {line3}
        </p>
      </div>

      {/* Chat bubbles — Dana left, Tomek right */}
      <div className="mb-block space-y-2">
        <div
          data-bubble
          style={{ opacity: 0, transform: "translateY(15px)" }}
          className="flex justify-start"
        >
          <div className="bg-surface-raised text-text-primary max-w-[78%] rounded-2xl rounded-tl-sm px-4 py-2.5 text-[13px] leading-snug lg:text-[15px]">
            {bubble1}
          </div>
        </div>
        <div
          data-bubble
          style={{ opacity: 0, transform: "translateY(15px)" }}
          className="flex justify-end"
        >
          <div className="bg-gold-400/10 border-gold-400/20 text-text-primary max-w-[78%] rounded-2xl rounded-tr-sm border px-4 py-2.5 text-[13px] leading-snug lg:text-[15px]">
            {bubble2}
          </div>
        </div>
      </div>

      {/* Visual connector: phone icon → drawing line → TODA app icon */}
      <div className="mb-block flex items-center gap-3">
        <div
          data-phone
          style={{ opacity: 0, transform: "translateY(15px)" }}
          className="bg-gold-400/10 border-gold-400/20 text-gold-400 flex h-9 w-9 flex-none items-center justify-center rounded-full border"
        >
          {/* Feather phone icon — inline SVG, no icon library */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.4 19.79 19.79 0 0 1 1.61 4.84 2 2 0 0 1 3.6 2.64h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l.9-1.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.68 16.5z" />
          </svg>
        </div>

        {/* Line grows left → right via scaleX 0 → 1 */}
        <div
          data-line
          style={{ transformOrigin: "left center", transform: "scaleX(0)" }}
          className="from-gold-400/50 to-gold-400 h-px flex-1 bg-gradient-to-r"
        />

        {/* TODA app icon — scale-bounce in */}
        <div data-toda style={{ opacity: 0, transform: "scale(0)" }} className="flex-none">
          <Image
            src="/toda-app-icon.svg"
            alt="TODA"
            width={40}
            height={40}
            className="rounded-xl"
            priority={false}
          />
        </div>
      </div>

      {/* Closing — glass box, gradient border, "To" and "Da" highlighted in gold */}
      <div
        data-closing
        style={{ opacity: 0, transform: "translateY(15px)" }}
        className="glass glass--gradient max-w-full"
      >
        <p className="text-text-primary text-sm lg:text-[17px]">
          <HighlightedClosing text={closing} />
        </p>
      </div>
    </div>
  );
}
