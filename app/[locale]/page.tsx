// Landing page — Phase 5 (in progress).
// Nine sections: Hero → Case Study → Origin → Features → Manifest → Testimonials → FAQ → Team → CTA.
// Surface rhythm: base → alt → raised → alt → raised → raised → alt → raised → base.
// Copy from messages/{locale}.json "home" namespace.
import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/hero";
import { CaseStudySection } from "@/components/case-study-section";
import { SectionWrapper } from "@/components/section-wrapper";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Card } from "@/components/card";
import { VideoLoop } from "@/components/video-loop";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/button";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <>
      {/* ── 1. Hero — surface-base ── */}
      <Hero
        headline={t("hero.headline")}
        accentText={t("hero.accentText")}
        subHeadline={t("hero.subHeadline")}
        ctaPrimary={{ label: t("hero.ctaPrimary"), href: "#contact" }}
        ctaSecondary={{ label: t("hero.ctaSecondary"), href: "#features" }}
      />

      {/* ── 2. Case Study — surface-alt ── */}
      <SectionWrapper variant="alt" id="case-study" className="sticky top-0 z-[10]">
        <CaseStudySection
          label={t("caseStudy.label")}
          statement={t("caseStudy.statement")}
          quote1={t("caseStudy.quote1")}
          quote2={t("caseStudy.quote2")}
          attribution={t("caseStudy.attribution")}
        />
      </SectionWrapper>

      {/* ── 3. Origin — surface-raised ── */}
      <SectionWrapper variant="raised" id="about" className="sticky top-0 min-h-dvh z-[20]">
        {/* Four children cascade: label → headline → body1 → body2 */}
        <ScrollReveal className="max-w-2xl">
          <p className="text-[12px] font-normal leading-none tracking-[0.1px] uppercase text-text-tertiary mb-6">
            {t("origin.label")}
          </p>
          <h2 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.3px] text-text-primary mb-8">
            {t("origin.headline")}
          </h2>
          <p className="text-[17px] font-normal leading-[1.47] tracking-[-0.2px] text-text-secondary mb-4">
            {t("origin.body1")}
          </p>
          <p className="text-[17px] font-normal leading-[1.47] tracking-[-0.2px] text-text-secondary">
            {t("origin.body2")}
          </p>
        </ScrollReveal>
      </SectionWrapper>

      {/* ── 4. Features — surface-alt ── */}
      <SectionWrapper variant="alt" id="features" className="sticky top-0 z-[30]">
        {/* Label + headline in first reveal group */}
        <ScrollReveal className="mb-12">
          <p className="text-[12px] font-normal leading-none tracking-[0.1px] uppercase text-text-tertiary mb-6">
            {t("features.label")}
          </p>
          <h2 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.3px] text-text-primary">
            {t("features.headline")}
          </h2>
        </ScrollReveal>
        {/* Cards are direct children of ScrollReveal — each staggers individually */}
        <ScrollReveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            title={t("features.feature1Title")}
            excerpt={t("features.feature1Excerpt")}
          />
          <Card
            title={t("features.feature2Title")}
            excerpt={t("features.feature2Excerpt")}
          />
          <Card
            title={t("features.feature3Title")}
            excerpt={t("features.feature3Excerpt")}
          />
        </ScrollReveal>
      </SectionWrapper>

      {/* ── 5. Manifest — surface-raised ── */}
      <SectionWrapper variant="raised" id="manifest" className="sticky top-0 z-[40]">
        {/* Four children cascade: label → Playfair accent → headline → body */}
        <ScrollReveal className="max-w-2xl">
          <p className="text-[12px] font-normal leading-none tracking-[0.1px] uppercase text-text-tertiary mb-6">
            {t("manifest.label")}
          </p>
          {/* Playfair accent — second and final usage on page; max 2–4 words, gold-500 only */}
          <p className="font-playfair italic font-normal text-[24px] leading-[1.2] text-gold-500 mb-4">
            {t("manifest.accentText")}
          </p>
          <h2 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.3px] text-text-primary mb-8">
            {t("manifest.headline")}
          </h2>
          <p className="text-[17px] font-normal leading-[1.47] tracking-[-0.2px] text-text-secondary">
            {t("manifest.body")}
          </p>
        </ScrollReveal>
        {/* VideoLoop — cinematic full-width. Replace src="" with real studio footage when available. */}
        <ScrollReveal className="mt-16">
          <div className="aspect-[21/9] overflow-hidden rounded-sm">
            <VideoLoop src="" className="w-full h-full" />
          </div>
        </ScrollReveal>
      </SectionWrapper>

      {/* ── 9. CTA — surface-base ── */}
      <SectionWrapper variant="base" id="contact" className="sticky top-0 min-h-dvh z-[80]">
        {/* Four children cascade: headline → price row → note → button */}
        <ScrollReveal className="max-w-xl">
          <h2 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.3px] text-text-primary mb-8">
            {t("cta.headline")}
          </h2>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[56px] font-semibold leading-[1.07] tracking-[-0.5px] text-text-primary">
              {t("cta.price")}
            </span>
            <span className="text-[17px] font-normal leading-[1.47] tracking-[-0.2px] text-text-secondary">
              {t("cta.pricePeriod")}
            </span>
          </div>
          <p className="text-[14px] font-normal leading-[1.43] tracking-[-0.1px] text-text-secondary mb-8">
            {t("cta.priceNote")}
          </p>
          <Link href="#contact" className={buttonVariants({ variant: "primary", size: "lg" })}>
            {t("cta.ctaPrimary")}
          </Link>
        </ScrollReveal>
      </SectionWrapper>
    </>
  );
}
