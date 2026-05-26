// Landing page — Phase 4a complete.
// Ten sections: Hero → Bold Claim → Case Study → Origin → Features → Social Proof → Testimonials → Team → Pricing → FAQ.
// Surface rhythm: base → alt → raised → base → alt → raised → base → alt → raised → base.
// Copy from messages/{locale}.json "home" namespace.
import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/hero";
import { BoldClaimSection } from "@/components/bold-claim-section";
import { CaseStudySection } from "@/components/case-study-section";
import { SocialProofSection } from "@/components/social-proof-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { TeamSection } from "@/components/team-section";
import { PricingSection } from "@/components/pricing-section";
import { FaqSection } from "@/components/faq-section";
import { FeaturesSection } from "@/components/features-section";
import { SnapSection } from "@/components/snap-section";
import { Stagger } from "@/components/stagger";
import { HeroParticles } from "@/components/hero-particles";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <>
      {/* ── 1. Hero — surface-base ── */}
      <SnapSection variant="base" id="hero" triggerOnMount align="center" backdrop={<HeroParticles />}>
        <Hero
          headline={t("hero.headline")}
          accentText={t("hero.accentText")}
          subHeadline={t("hero.subHeadline")}
        />
      </SnapSection>

      {/* ── 2. Bold Claim — surface-alt ── */}
      <SnapSection variant="alt" id="bold-claim">
        <BoldClaimSection
          label={t("boldClaim.label")}
          headline={t("boldClaim.headline")}
          bullet1={t("boldClaim.bullet1")}
          bullet2={t("boldClaim.bullet2")}
          bullet3={t("boldClaim.bullet3")}
        />
      </SnapSection>

      {/* ── 3. Case Study — surface-raised ── */}
      <SnapSection variant="raised" id="case-study">
        <CaseStudySection
          label={t("caseStudy.label")}
          statement={t("caseStudy.statement")}
          quote1={t("caseStudy.quote1")}
          quote2={t("caseStudy.quote2")}
          attribution={t("caseStudy.attribution")}
        />
      </SnapSection>

      {/* ── 4. Origin — surface-base ── */}
      <SnapSection variant="base" id="about">
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

      {/* ── 5. Features — surface-alt ── */}
      <SnapSection variant="alt" id="features">
        <FeaturesSection
          label={t("features.label")}
          headline={t("features.headline")}
          feature1Title={t("features.feature1Title")}
          feature1Excerpt={t("features.feature1Excerpt")}
          feature2Title={t("features.feature2Title")}
          feature2Excerpt={t("features.feature2Excerpt")}
          feature3Title={t("features.feature3Title")}
          feature3Excerpt={t("features.feature3Excerpt")}
        />
      </SnapSection>

      {/* ── 6. Social Proof — surface-raised ── */}
      <SnapSection variant="raised" id="social-proof">
        <SocialProofSection
          label={t("socialProof.label")}
          headline={t("socialProof.headline")}
          body={t("socialProof.body")}
        />
      </SnapSection>

      {/* ── 7. Testimonials — surface-base ── */}
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

      {/* ── 8. Team — surface-alt ── */}
      <SnapSection variant="alt" id="team">
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

      {/* ── 9. Pricing — surface-raised ── */}
      <SnapSection variant="raised" id="pricing">
        <PricingSection
          headline={t("pricing.headline")}
          price={t("pricing.price")}
          pricePeriod={t("pricing.pricePeriod")}
          priceNote={t("pricing.priceNote")}
          ctaLabel={t("pricing.ctaLabel")}
        />
      </SnapSection>

      {/* ── 10. FAQ — surface-base ── */}
      <SnapSection variant="base" id="faq">
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
    </>
  );
}
