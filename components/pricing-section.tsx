// Pricing — section #9, surface-raised.
// Extracted from inline CTA block. External link to app.toda.ink — plain <a>, new tab.
import { RevealGroup } from "@/components/reveal-group";
import { buttonVariants } from "@/components/button";

interface PricingSectionProps {
  headline: string;
  price: string;
  pricePeriod: string;
  priceNote: string;
  ctaLabel: string;
}

export function PricingSection({
  headline,
  price,
  pricePeriod,
  priceNote,
  ctaLabel,
}: PricingSectionProps) {
  return (
    <RevealGroup type="fade-up" className="max-w-xl lg:mx-auto lg:text-center">
      <h2 className="type-display text-text-primary mb-block">{headline}</h2>
      <div className="glass glass--gradient mb-element flex items-baseline gap-2 lg:justify-center">
        <span className="type-display text-text-primary">{price}</span>
        <span className="type-lede">{pricePeriod}</span>
      </div>
      <p className="text-text-secondary mb-block text-[14px] leading-[1.43] font-normal tracking-[-0.1px]">
        {priceNote}
      </p>
      <a
        href="https://app.toda.ink/onboarding"
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ variant: "primary", size: "lg" })}
      >
        {ctaLabel}
      </a>
    </RevealGroup>
  );
}
