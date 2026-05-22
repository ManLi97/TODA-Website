// Hero content — rendered inside <SnapSection variant="base" id="hero" triggerOnMount align="center">.
// accentText renders inline inside the h1 in Playfair Display Italic gold-500,
// matching the BRAND.md pattern: "Mehr Kunst. [accentText: Weniger Chaos.]"
// Layout (min-h-dvh, centering, padding, max-w container) is owned by the parent <SnapSection>.
// <Animate> children fire on mount via triggerOnMount — timing per motion.md §4.
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/button";
import { Animate } from "@/components/animate";

interface CtaLink {
  label: string;
  href: string;
}

interface HeroProps {
  headline: string;
  accentText?: string;
  subHeadline?: string;
  ctaPrimary?: CtaLink;
  ctaSecondary?: CtaLink;
}

export function Hero({ headline, accentText, subHeadline, ctaPrimary, ctaSecondary }: HeroProps) {
  const hasCtas = ctaPrimary || ctaSecondary;

  return (
    <div className="max-w-3xl text-center md:text-left">
      {/* Headline — delay 0, slightly longer duration for the display element. */}
      <Animate type="fade-up" duration={650}>
        <h1 className="type-display text-text-primary">
          {headline}
          {accentText && (
            <>
              <br />
              {/* Playfair italic accent — font-normal prevents inheriting the h1's semibold
                  (we only load Playfair at weight 400) */}
              <span className="font-playfair italic font-normal text-gold-500">
                {accentText}
              </span>
            </>
          )}
        </h1>
      </Animate>

      {/* Sub-headline — overlaps headline (same logical group), delay 350ms. */}
      {subHeadline && (
        <Animate type="fade-up" delay={350} className="mt-6">
          <p className="type-lede">{subHeadline}</p>
        </Animate>
      )}

      {/* CTA cluster — arrives after sub-headline settles, delay 900ms. */}
      {hasCtas && (
        <Animate type="fade-up" delay={900} className="mt-8">
          <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
            {ctaPrimary && (
              <Link href={ctaPrimary.href} className={buttonVariants({ variant: "primary", size: "md" })}>
                {ctaPrimary.label}
              </Link>
            )}
            {ctaSecondary && (
              <Link href={ctaSecondary.href} className={buttonVariants({ variant: "secondary", size: "md" })}>
                {ctaSecondary.label}
              </Link>
            )}
          </div>
        </Animate>
      )}
    </div>
  );
}
