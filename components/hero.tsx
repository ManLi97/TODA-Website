// Hero content — rendered inside <PageSection variant="base" id="hero" triggerOnMount align="center">.
// accentText renders inline inside the h1 in Playfair Display Italic gold-500,
// matching the BRAND.md pattern: "Mehr Kunst. [accentText: Weniger Chaos.]"
// Layout (min-h-svh, centering, padding, max-w container) is owned by the parent <PageSection>.
// <Animate> children fire on mount via triggerOnMount — timing per motion.md §4.
import { Animate } from "@/components/animate";

interface HeroProps {
  headline: string;
  accentText?: string;
  subHeadline?: string;
}

export function Hero({ headline, accentText, subHeadline }: HeroProps) {
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
    </div>
  );
}
