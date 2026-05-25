"use client";

// Features section — static feature cards with Embla carousel on mobile/tablet.
// Mobile/tablet (< lg): Embla carousel, 280px/320px slides with peek signal.
// Desktop (lg+): static 3-column grid.
// Mirrors team-section.tsx pattern exactly: same Embla config, dot logic, entrance timing.
import { useEffect, useState } from "react";
import { Animate } from "@/components/animate";
import { Stagger } from "@/components/stagger";
import { Card } from "@/components/card";
import useEmblaCarousel from "embla-carousel-react";

interface FeaturesSectionProps {
  label: string;
  headline: string;
  feature1Title: string;
  feature1Excerpt: string;
  feature2Title: string;
  feature2Excerpt: string;
  feature3Title: string;
  feature3Excerpt: string;
}

export function FeaturesSection({
  label,
  headline,
  feature1Title,
  feature1Excerpt,
  feature2Title,
  feature2Excerpt,
  feature3Title,
  feature3Excerpt,
}: FeaturesSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  // snapCount drives dot rendering — sourced from Embla so it reflects actual
  // scrollable positions, not hardcoded card count. Hides dots when ≤1 snap.
  const [snapCount, setSnapCount] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "keepSnaps",
    dragFree: true,
    duration: 35,
  });

  // Sync dot indicators and snap count with Embla state
  useEffect(() => {
    if (!emblaApi) return;
    const api = emblaApi;
    setSnapCount(api.scrollSnapList().length);
    const onSelect = () => setActiveIndex(api.selectedScrollSnap());
    const onReInit = () => setSnapCount(api.scrollSnapList().length);
    api.on("select", onSelect);
    api.on("reInit", onReInit);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onReInit);
    };
  }, [emblaApi]);

  const features = [
    { title: feature1Title, excerpt: feature1Excerpt },
    { title: feature2Title, excerpt: feature2Excerpt },
    { title: feature3Title, excerpt: feature3Excerpt },
  ];

  return (
    <div>
      {/* Section header — animates as one unit on section settle */}
      <Animate type="fade-up" className="mb-12">
        <p className="type-eyebrow text-text-tertiary mb-6">{label}</p>
        <h2 className="type-display text-text-primary">{headline}</h2>
      </Animate>

      {/* ── Mobile/tablet: Embla Carousel ──────────────────────────────────────
          280px slides: on a 375px viewport ~1.3 cards visible — strong peek signal. */}
      <div className="-mx-6 pl-6 lg:hidden" ref={emblaRef}>
        <Stagger gap={150} type="fade-up" delay={750} className="flex gap-6 py-4 pr-4">
          {features.map(({ title, excerpt }) => (
            <div key={title} className="flex-none w-[280px] md:w-[320px]">
              <Card title={title} excerpt={excerpt} />
            </div>
          ))}
        </Stagger>
      </div>

      {/* Dot indicators — phone only, always hidden on tablet+ */}
      {snapCount > 1 && (
        <div className="flex justify-center gap-2 mt-4 mb-10 md:hidden">
          {Array.from({ length: snapCount }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                i === activeIndex ? "bg-gold-500" : "bg-border-subtle"
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Desktop: 3-column grid with stagger ────────────────────────────────
          All 3 features visible simultaneously. */}
      <Stagger gap={150} type="fade-up" delay={750} className="hidden lg:grid lg:grid-cols-3 gap-6">
        {features.map(({ title, excerpt }) => (
          <Card key={title} title={title} excerpt={excerpt} />
        ))}
      </Stagger>
    </div>
  );
}
