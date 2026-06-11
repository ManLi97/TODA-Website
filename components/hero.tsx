"use client";

// Hero content — rendered inside <PageSection variant="base" id="hero" triggerOnMount align="center">.
// The headline is the page's signature entrance: a two-line mask reveal (each line
// rises out of an overflow-hidden wrapper on the entry ease, 120ms apart). accentText
// renders as the second line in Playfair Display italic gold. Sub-headline, CTA row
// and scroll cue are ordinary <Animate> fade-ups that follow the headline beat.
// Layout (min-h-svh, centering, padding) is owned by the parent <PageSection>;
// the scroll cue positions absolutely against the section (PageSection is `relative`).
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Animate } from "@/components/animate";
import { buttonVariants } from "@/components/button";
import { ONBOARDING_URL } from "@/lib/site";

interface HeroProps {
  headline: string;
  accentText?: string;
  subHeadline?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  scrollCue?: string;
}

export function Hero({
  headline,
  accentText,
  subHeadline,
  ctaPrimary,
  ctaSecondary,
  scrollCue,
}: HeroProps) {
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const h1 = headlineRef.current;
    if (!h1) return;

    gsap.registerPlugin(CustomEase);
    CustomEase.create("entry", "0.16, 1, 0.3, 1");

    // Static headline for reduced motion — it is never hidden server-side.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const wrappers = Array.from(h1.querySelectorAll<HTMLElement>("[data-mask-line]"));
    const lines = wrappers.map((w) => w.firstElementChild as HTMLElement);

    gsap.set(lines, { yPercent: 110 });
    gsap.to(lines, {
      yPercent: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: "entry",
      delay: 0.05,
      // Unclip at rest so the Playfair italic descenders ("g", swashes) render
      // fully — the mask only exists for the reveal itself.
      onComplete: () => wrappers.forEach((w) => (w.style.overflow = "visible")),
    });
  }, []);

  return (
    <div className="mx-auto max-w-3xl text-center lg:max-w-4xl">
      {/* Headline — two-line mask reveal (see effect above). */}
      <h1 ref={headlineRef} className="type-display-hero text-text-primary">
        <span data-mask-line className="block overflow-hidden">
          <span className="block">{headline}</span>
        </span>
        {accentText && (
          <span data-mask-line className="block overflow-hidden">
            {/* Playfair italic accent — font-normal prevents inheriting the h1's semibold
                (we only load Playfair at weight 400) */}
            <span className="font-playfair text-gold-400 block font-normal italic">
              {accentText}
            </span>
          </span>
        )}
      </h1>

      {/* Sub-headline — overlaps the headline landing (same logical group). */}
      {subHeadline && (
        <Animate type="fade-up" delay={350} className="mt-group">
          {/* mx-auto centers the 38ch-capped lede block under the centered headline.
              .type-lede has margin: 0 baked in, so the utility must explicitly take over. */}
          <p className="type-lede mx-auto">{subHeadline}</p>
        </Animate>
      )}

      {/* CTA row — the page's primary action above the fold, delay 550ms. */}
      {(ctaPrimary || ctaSecondary) && (
        <Animate type="fade-up" delay={550} className="mt-block">
          <div className="gap-element sm:gap-group flex flex-col items-center justify-center sm:flex-row">
            {ctaPrimary && (
              <a
                href={ONBOARDING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "primary", size: "lg" })}
              >
                {ctaPrimary}
              </a>
            )}
            {ctaSecondary && (
              <a href="#features" className={buttonVariants({ variant: "ghost", size: "lg" })}>
                {ctaSecondary}
              </a>
            )}
          </div>
        </Animate>
      )}

      {/* Scroll cue — anchored to the section bottom, gentle float, fades in last. */}
      {scrollCue && (
        <Animate
          type="fade-in"
          delay={1100}
          className="absolute inset-x-0 bottom-6 flex justify-center"
        >
          <a
            href="#bold-claim"
            aria-label={scrollCue}
            className="scroll-cue text-text-tertiary hover:text-purple-400 p-3 transition-colors duration-150 ease-[var(--ease-entry)]"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </a>
        </Animate>
      )}
    </div>
  );
}
