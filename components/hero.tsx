// Hero content — rendered inside <SnapSection variant="base" id="hero" triggerOnMount>.
// accentText renders inline inside the h1 in Playfair Display Italic gold-500,
// matching the BRAND.md pattern: "Mehr Kunst. [accentText: Weniger Chaos.]"
// Layout (min-h-dvh, padding, max-w container) is owned by the parent <SnapSection>.
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/button";

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
      {/* Headline — fluid display size via .type-display (clamp 48→96px). */}
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

      {/* Sub-headline — DS lede class brings size/leading/tracking and a
          max-width: 38ch for narrow reading width. */}
      {subHeadline && (
        <p className="mt-6 type-lede">
          {subHeadline}
        </p>
      )}

      {/* CTA group */}
      {hasCtas && (
        <div className="mt-8 flex flex-wrap items-center gap-3 justify-center md:justify-start">
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
      )}
    </div>
  );
}
