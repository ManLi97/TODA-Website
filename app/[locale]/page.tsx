// Landing page — Phase 5 (in progress).
// Nine sections: Hero → Case Study → Origin → Features → Manifest → Testimonials → FAQ → Team → CTA.
// Surface rhythm: base → alt → raised → alt → raised → base → alt → raised → base.
// Copy from messages/{locale}.json "home" namespace.
// StickySection replaces SectionWrapper for all sticky slots — handles overflow content pan.
import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/hero";
import { CaseStudySection } from "@/components/case-study-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { FaqSection } from "@/components/faq-section";
import { TeamSection } from "@/components/team-section";
import { StickySection } from "@/components/sticky-section";
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
      <StickySection variant="alt" id="case-study" zIndex={10}>
        <CaseStudySection
          label={t("caseStudy.label")}
          statement={t("caseStudy.statement")}
          quote1={t("caseStudy.quote1")}
          quote2={t("caseStudy.quote2")}
          attribution={t("caseStudy.attribution")}
        />
      </StickySection>

      {/* ── 3. Origin — surface-raised ── */}
      <StickySection variant="raised" id="about" zIndex={20}>
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
      </StickySection>

      {/* ── 4. Features — surface-alt ── */}
      <StickySection variant="alt" id="features" zIndex={30}>
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
        <ScrollReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </StickySection>

      {/* ── 5. Manifest — surface-raised ── */}
      <StickySection variant="raised" id="manifest" zIndex={40}>
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
      </StickySection>

      {/* ── 6. Testimonials — surface-base ── */}
      <StickySection variant="base" id="testimonials" zIndex={50}>
        <TestimonialsSection
          label={t("testimonials.label")}
          headline={t("testimonials.headline")}
          quote1={t("testimonials.quote1")}
          author1={t("testimonials.author1")}
          studio1={t("testimonials.studio1")}
          quote2={t("testimonials.quote2")}
          author2={t("testimonials.author2")}
          studio2={t("testimonials.studio2")}
          quote3={t("testimonials.quote3")}
          author3={t("testimonials.author3")}
          studio3={t("testimonials.studio3")}
        />
      </StickySection>

      {/* ── 7. FAQ — surface-alt ── */}
      <StickySection variant="alt" id="faq" zIndex={60}>
        <FaqSection
          label={t("faq.label")}
          headline={t("faq.headline")}
          q1={t("faq.q1")} a1={t("faq.a1")}
          q2={t("faq.q2")} a2={t("faq.a2")}
          q3={t("faq.q3")} a3={t("faq.a3")}
          q4={t("faq.q4")} a4={t("faq.a4")}
          q5={t("faq.q5")} a5={t("faq.a5")}
        />
      </StickySection>

      {/* ── 8. Team Teaser — surface-raised ── */}
      <StickySection variant="raised" id="team" zIndex={70}>
        <TeamSection
          label={t("team.label")}
          headline={t("team.headline")}
          name1={t("team.name1")} role1={t("team.role1")}
          name2={t("team.name2")} role2={t("team.role2")}
          name3={t("team.name3")} role3={t("team.role3")}
          name4={t("team.name4")} role4={t("team.role4")}
          name5={t("team.name5")} role5={t("team.role5")}
          cta={t("team.cta")}
        />
      </StickySection>

      {/* ── 9. CTA — surface-base ── */}
      <StickySection variant="base" id="contact" zIndex={80}>
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
      </StickySection>
    </>
  );
}
