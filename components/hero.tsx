// Hero content — rendered inside <PageSection variant="base" id="hero" triggerOnMount align="center">.
// accentText renders inline inside the h1 in Playfair Display Italic gold,
// matching the BRAND.md pattern: "Mehr Kunst. [accentText: Weniger Chaos.]"
// Layout (min-h-svh, centering, padding, max-w container) is owned by the parent <PageSection>;
// the scroll cue positions absolutely against the section (PageSection is `relative`).
// <Animate> children fire on mount via triggerOnMount — timing per motion.md §4.
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
  return (
    <div className="mx-auto max-w-3xl text-center lg:max-w-4xl">
      {/* Headline — delay 0, slightly longer duration for the display element. */}
      <Animate type="fade-up" duration={650}>
        <h1 className="type-display-hero text-text-primary">
          {headline}
          {accentText && (
            <>
              <br />
              {/* Playfair italic accent — font-normal prevents inheriting the h1's semibold
                  (we only load Playfair at weight 400) */}
              <span className="font-playfair text-gold-400 font-normal italic">{accentText}</span>
            </>
          )}
        </h1>
      </Animate>

      {/* Sub-headline — overlaps headline (same logical group), delay 350ms. */}
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
        <Animate type="fade-in" delay={1100} className="absolute inset-x-0 bottom-6 flex justify-center">
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
