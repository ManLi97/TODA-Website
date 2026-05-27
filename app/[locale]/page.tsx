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
import { OriginSection } from "@/components/origin-section";
import { PageSection } from "@/components/page-section";
import { HeroParticles } from "@/components/hero-particles";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <>
      {/* ── 1. Hero — surface-base ── */}
      <PageSection variant="base" id="hero" triggerOnMount align="center" backdrop={<HeroParticles />}>
        <Hero
          headline={t("hero.headline")}
          accentText={t("hero.accentText")}
          subHeadline={t("hero.subHeadline")}
        />
      </PageSection>

      {/* ── 2. Bold Claim — surface-alt ── */}
      <PageSection variant="alt" id="bold-claim">
        <BoldClaimSection
          label={t("boldClaim.label")}
          headline={t("boldClaim.headline")}
          bullet1={t("boldClaim.bullet1")}
          bullet2={t("boldClaim.bullet2")}
          bullet3={t("boldClaim.bullet3")}
        />
      </PageSection>

      {/* ── 3. Case Study — surface-raised ── */}
      <PageSection variant="base" id="case-study">
        <CaseStudySection
          label={t("caseStudy.label")}
          statement={t("caseStudy.statement")}
          bullet1={t("caseStudy.bullet1")}
          bullet2={t("caseStudy.bullet2")}
          bullet3={t("caseStudy.bullet3")}
          bullet4={t("caseStudy.bullet4")}
          videoCaption={t("caseStudy.videoCaption")}
        />
      </PageSection>

      {/* ── 4. Origin — surface-alt ── */}
      <PageSection variant="alt" id="about">
        <OriginSection
          label={t("origin.label")}
          headline={t("origin.headline")}
          line1={t("origin.line1")}
          line2={t("origin.line2")}
          line3={t("origin.line3")}
          bubble1={t("origin.bubble1")}
          bubble2={t("origin.bubble2")}
          closing={t("origin.closing")}
        />
      </PageSection>

      {/* ── 5. Features — surface-alt ── */}
      <PageSection variant="base" id="features">
        <FeaturesSection
          label={t("features.label")}
          headline={t("features.headline")}
          feature1Title={t("features.feature1Title")}
          feature1Excerpt={t("features.feature1Excerpt")}
          feature2Title={t("features.feature2Title")}
          feature2Excerpt={t("features.feature2Excerpt")}
          feature3Title={t("features.feature3Title")}
          feature3Excerpt={t("features.feature3Excerpt")}
          feature4Title={t("features.feature4Title")}
          feature4Excerpt={t("features.feature4Excerpt")}
          feature5Title={t("features.feature5Title")}
          feature5Excerpt={t("features.feature5Excerpt")}
          feature6Title={t("features.feature6Title")}
          feature6Excerpt={t("features.feature6Excerpt")}
        />
      </PageSection>

      {/* ── 6. Social Proof — surface-raised ── */}
      <PageSection variant="alt" id="social-proof">
        <SocialProofSection
          label={t("socialProof.label")}
          headline={t("socialProof.headline")}
          not1={t("socialProof.not1")}
          not2={t("socialProof.not2")}
          not3={t("socialProof.not3")}
          payoff={t("socialProof.payoff")}
          payoffAccent={t("socialProof.payoffAccent")}
          videoCaption={t("socialProof.videoCaption")}
        />
      </PageSection>

      {/* ── 7. Testimonials — surface-base ── */}
      <PageSection variant="base" id="testimonials">
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
      </PageSection>

      {/* ── 8. Team — surface-alt ── */}
      <PageSection variant="alt" id="team">
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
      </PageSection>

      {/* ── 9. Pricing — surface-raised ── */}
      <PageSection variant="base" id="pricing">
        <PricingSection
          headline={t("pricing.headline")}
          price={t("pricing.price")}
          pricePeriod={t("pricing.pricePeriod")}
          priceNote={t("pricing.priceNote")}
          ctaLabel={t("pricing.ctaLabel")}
        />
      </PageSection>

      {/* ── 10. FAQ — surface-base ── */}
      <PageSection variant="alt" id="faq">
        <FaqSection
          label={t("faq.label")}
          headline={t("faq.headline")}
          q1={t("faq.q1")} a1={t("faq.a1")}
          q2={t("faq.q2")} a2={t("faq.a2")}
          q3={t("faq.q3")} a3={t("faq.a3")}
          q4={t("faq.q4")} a4={t("faq.a4")}
          q5={t("faq.q5")} a5={t("faq.a5")}
        />
      </PageSection>
    </>
  );
}
