// Landing page — Phase 5 (in progress).
// Nine sections: Hero → Case Study → Origin → Features → Manifest → Testimonials → FAQ → Team → CTA.
// Surface rhythm: base → alt → raised → alt → raised → base → alt → raised → base.
// Copy from messages/{locale}.json "home" namespace.
import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/hero";
import { CaseStudySection } from "@/components/case-study-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { FaqSection } from "@/components/faq-section";
import { TeamSection } from "@/components/team-section";
import { SnapSection } from "@/components/snap-section";
import { Animate } from "@/components/animate";
import { Stagger } from "@/components/stagger";
import { Card } from "@/components/card";
import { VideoLoop } from "@/components/video-loop";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/button";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <>
      {/* ── 1. Hero — surface-base ── */}
      <SnapSection variant="base" id="hero" triggerOnMount align="center">
        <Hero
          headline={t("hero.headline")}
          accentText={t("hero.accentText")}
          subHeadline={t("hero.subHeadline")}
          ctaPrimary={{ label: t("hero.ctaPrimary"), href: "#contact" }}
          ctaSecondary={{ label: t("hero.ctaSecondary"), href: "#features" }}
        />
      </SnapSection>

      {/* ── 2. Case Study — surface-alt ── */}
      <SnapSection variant="alt" id="case-study">
        <CaseStudySection
          label={t("caseStudy.label")}
          statement={t("caseStudy.statement")}
          quote1={t("caseStudy.quote1")}
          quote2={t("caseStudy.quote2")}
          attribution={t("caseStudy.attribution")}
        />
      </SnapSection>

      {/* ── 3. Origin — surface-raised ── */}
      <SnapSection variant="raised" id="about">
        {/* Four children cascade: label → headline → body1 → body2 */}
        <Stagger gap={150} type="fade-up" className="max-w-2xl">
          <p className="type-eyebrow text-text-tertiary mb-6">
            {t("origin.label")}
          </p>
          <h2 className="type-display text-text-primary mb-8">
            {t("origin.headline")}
          </h2>
          <p className="type-lede mb-4">
            {t("origin.body1")}
          </p>
          <p className="type-lede">
            {t("origin.body2")}
          </p>
        </Stagger>
      </SnapSection>

      {/* ── 4. Features — surface-alt ── */}
      <SnapSection variant="alt" id="features">
        {/* Header block animates as one unit */}
        <Animate type="fade-up" className="mb-12">
          <p className="type-eyebrow text-text-tertiary mb-6">
            {t("features.label")}
          </p>
          <h2 className="type-display text-text-primary">
            {t("features.headline")}
          </h2>
        </Animate>
        {/* Cards stagger in after the header settles */}
        <Stagger gap={150} type="fade-up" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </Stagger>
      </SnapSection>

      {/* ── 5. Manifest — surface-raised ── */}
      <SnapSection variant="raised" id="manifest">
        {/* Four children cascade: label → Playfair accent → headline → body */}
        <Stagger gap={150} type="fade-up" className="max-w-2xl">
          <p className="type-eyebrow text-text-tertiary mb-6">
            {t("manifest.label")}
          </p>
          {/* Playfair accent — second and final usage on page; max 2–4 words, gold-500 only.
              One-off editorial flourish — does NOT use a .type-* class on purpose. */}
          <p className="font-playfair italic font-normal text-[24px] leading-[1.2] text-gold-500 mb-4">
            {t("manifest.accentText")}
          </p>
          <h2 className="type-display text-text-primary mb-8">
            {t("manifest.headline")}
          </h2>
          <p className="type-lede">
            {t("manifest.body")}
          </p>
        </Stagger>
        {/* VideoLoop — arrives after copy stagger settles (~1000ms) + 200ms breath = 1200ms delay.
            Replace src="" with real studio footage when available. */}
        <Animate type="fade-up" delay={1200} className="mt-16">
          <div className="aspect-[21/9] overflow-hidden rounded-sm">
            <VideoLoop src="" className="w-full h-full" />
          </div>
        </Animate>
      </SnapSection>

      {/* ── 6. Testimonials — surface-base ── */}
      <SnapSection variant="base" id="testimonials">
        <TestimonialsSection
          label={t("testimonials.label")}
          headline={t("testimonials.headline")}
          hint={t("testimonials.hint")}
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
      </SnapSection>

      {/* ── 7. FAQ — surface-alt ── */}
      <SnapSection variant="alt" id="faq">
        <FaqSection
          label={t("faq.label")}
          headline={t("faq.headline")}
          q1={t("faq.q1")} a1={t("faq.a1")}
          q2={t("faq.q2")} a2={t("faq.a2")}
          q3={t("faq.q3")} a3={t("faq.a3")}
          q4={t("faq.q4")} a4={t("faq.a4")}
          q5={t("faq.q5")} a5={t("faq.a5")}
        />
      </SnapSection>

      {/* ── 8. Team Teaser — surface-raised ── */}
      <SnapSection variant="raised" id="team">
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
      </SnapSection>

      {/* ── 9. CTA — surface-base ── */}
      <SnapSection variant="base" id="contact">
        {/* Four children cascade: headline → price row → note → button */}
        <Stagger gap={150} type="fade-up" className="max-w-xl">
          <h2 className="type-display text-text-primary mb-8">
            {t("cta.headline")}
          </h2>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="type-display text-text-primary">
              {t("cta.price")}
            </span>
            <span className="type-lede">
              {t("cta.pricePeriod")}
            </span>
          </div>
          <p className="text-[14px] font-normal leading-[1.43] tracking-[-0.1px] text-text-secondary mb-8">
            {t("cta.priceNote")}
          </p>
          <Link href="#contact" className={buttonVariants({ variant: "primary", size: "lg" })}>
            {t("cta.ctaPrimary")}
          </Link>
        </Stagger>
      </SnapSection>
    </>
  );
}
