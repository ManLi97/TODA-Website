// Hero section — the editorial first impression of every page.
// accentText renders inline inside the h1 in Playfair Display Italic gold-500,
// matching the BRAND.md pattern: "Mehr Kunst. [accentText: Weniger Chaos.]"
// pt-32/pt-40 absorbs the 56px fixed header plus intentional breathing room.
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
    <section className="bg-surface-base pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-3xl">
          {/* Headline — Inter semibold at display size with responsive scaling */}
          <h1 className="text-[34px] sm:text-[40px] lg:text-[56px] font-semibold leading-[1.1] lg:leading-[1.07] tracking-[-0.5px] text-text-primary">
            {headline}
            {accentText && (
              <>
                {" "}
                {/* Playfair italic accent — font-normal prevents inheriting the h1's semibold
                    (we only load Playfair at weight 400) */}
                <span className="font-playfair italic font-normal text-gold-500">
                  {accentText}
                </span>
              </>
            )}
          </h1>

          {/* Sub-headline — body copy size, secondary color, left-aligned */}
          {subHeadline && (
            <p className="mt-6 text-[17px] font-normal leading-[1.47] tracking-[-0.2px] text-text-secondary max-w-xl">
              {subHeadline}
            </p>
          )}

          {/* CTA group */}
          {hasCtas && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
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
      </div>
    </section>
  );
}
