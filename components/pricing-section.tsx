// Pricing — section #9. The price is the page's hero numeral: big, thin,
// brand-gradient on black — the DS signature move ("numerals are heroes").
// Below it: period, fine print, a three-point value recap, and the primary CTA.
import { RevealGroup } from "@/components/reveal-group";
import { buttonVariants } from "@/components/button";
import { ONBOARDING_URL } from "@/lib/site";

interface PricingSectionProps {
  headline: string;
  price: string;
  pricePeriod: string;
  priceNote: string;
  recap1: string;
  recap2: string;
  recap3: string;
  ctaLabel: string;
}

export function PricingSection({
  headline,
  price,
  pricePeriod,
  priceNote,
  recap1,
  recap2,
  recap3,
  ctaLabel,
}: PricingSectionProps) {
  const recaps = [recap1, recap2, recap3];

  return (
    <RevealGroup
      type="fade-up"
      className="mx-auto flex max-w-4xl flex-col items-start lg:items-center lg:text-center"
    >
      <h2 className="type-display text-text-primary mb-block">{headline}</h2>

      {/* Hero numeral — thin weight, brand gradient, no box. Jewelry needs no vitrine. */}
      <p className="type-hero grad-text--flow">{price}</p>
      <p className="type-lede mt-element">{pricePeriod}</p>
      <p className="type-caption mt-element">{priceNote}</p>

      {/* Value recap — what the number buys, right at the decision point. */}
      <ul className="mt-block gap-element lg:gap-group flex flex-col lg:flex-row">
        {recaps.map((recap) => (
          <li key={recap} className="text-text-secondary flex items-center gap-2 text-[15px]">
            <svg
              className="text-gold-500 shrink-0"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {recap}
          </li>
        ))}
      </ul>

      <a
        href={ONBOARDING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`${buttonVariants({ variant: "primary", size: "lg" })} mt-block`}
      >
        {ctaLabel}
      </a>
    </RevealGroup>
  );
}
