"use client";

// Features section — two rows of feature cards.
// Row 1 (features 1–3): standard LTR Embla carousel on mobile, swipe left to advance.
// Row 2 (features 4–6): RTL Embla carousel on mobile, swipe right to advance.
// A single pulsing ← → hint sits between the rows instead of per-row dots.
// Desktop (lg+): two static 3-column grids.
import { Animate } from "@/components/animate";
import { RevealGroup } from "@/components/reveal-group";
import { SectionHeader } from "@/components/section-header";
import { Card } from "@/components/card";
import useEmblaCarousel from "embla-carousel-react";

interface FeaturesSectionProps {
  label: string;
  headline: string;
  feature1Title: string; feature1Excerpt: string;
  feature2Title: string; feature2Excerpt: string;
  feature3Title: string; feature3Excerpt: string;
  feature4Title: string; feature4Excerpt: string;
  feature5Title: string; feature5Excerpt: string;
  feature6Title: string; feature6Excerpt: string;
}

const EMBLA_BASE = { loop: false, align: "start" as const, containScroll: "keepSnaps" as const, dragFree: true, duration: 35 };

export function FeaturesSection({
  label, headline,
  feature1Title, feature1Excerpt,
  feature2Title, feature2Excerpt,
  feature3Title, feature3Excerpt,
  feature4Title, feature4Excerpt,
  feature5Title, feature5Excerpt,
  feature6Title, feature6Excerpt,
}: FeaturesSectionProps) {
  const [emblaRef1] = useEmblaCarousel(EMBLA_BASE);
  const [emblaRef2] = useEmblaCarousel({ ...EMBLA_BASE, direction: "rtl" });

  const row1 = [
    { title: feature1Title, excerpt: feature1Excerpt },
    { title: feature2Title, excerpt: feature2Excerpt },
    { title: feature3Title, excerpt: feature3Excerpt },
  ];
  const row2 = [
    { title: feature4Title, excerpt: feature4Excerpt },
    { title: feature5Title, excerpt: feature5Excerpt },
    { title: feature6Title, excerpt: feature6Excerpt },
  ];

  return (
    <div>
      {/* Section header */}
      <Animate type="fade-up" className="mb-block">
        <SectionHeader label={label} headline={headline} />
      </Animate>

      {/* ── Mobile/tablet: Row 1 — LTR, swipe left ── */}
      <div className="-mx-6 pl-6 lg:hidden" ref={emblaRef1}>
        <RevealGroup type="fade-up" className="flex gap-group py-4 pr-4">
          {row1.map(({ title, excerpt }) => (
            <div key={title} className="flex-none w-[280px] md:w-[320px]">
              <Card title={title} excerpt={excerpt} />
            </div>
          ))}
        </RevealGroup>
      </div>

      {/* ── Swipe hint — single pulsing ← SWIPE → between both rows, mobile/tablet only ── */}
      <div className="animate-pulse flex items-center justify-center gap-2 my-group lg:hidden text-gold-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span className="text-xs font-semibold tracking-widest">SWIPE</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>

      {/* ── Mobile/tablet: Row 2 — RTL, swipe right ── */}
      {/* dir="rtl" makes Embla lay slides right-to-left; dir="ltr" on each slide preserves text alignment */}
      <div className="-mx-6 pr-6 lg:hidden" ref={emblaRef2} dir="rtl">
        <RevealGroup type="fade-up" className="flex gap-group py-4 pl-4">
          {row2.map(({ title, excerpt }) => (
            <div key={title} className="flex-none w-[280px] md:w-[320px]" dir="ltr">
              <Card title={title} excerpt={excerpt} />
            </div>
          ))}
        </RevealGroup>
      </div>

      {/* ── Desktop: two static 3-column grids ── */}
      <div className="hidden lg:flex lg:flex-col lg:gap-group">
        <RevealGroup type="fade-up" className="grid grid-cols-3 gap-group">
          {row1.map(({ title, excerpt }) => (
            <Card key={title} title={title} excerpt={excerpt} />
          ))}
        </RevealGroup>
        <RevealGroup type="fade-up" className="grid grid-cols-3 gap-group">
          {row2.map(({ title, excerpt }) => (
            <Card key={title} title={title} excerpt={excerpt} />
          ))}
        </RevealGroup>
      </div>
    </div>
  );
}
