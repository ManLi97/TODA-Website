"use client";

// Team teaser — circular spinning-ring avatars.
// Mobile: Embla Carousel with 200px slides (~1.6 visible on 375px viewport).
// Desktop: 5-column grid with <Stagger type="scale-in">.
// Mobile: Embla Carousel with <Stagger> wrapping slides — Stagger's wrapper
// div becomes Embla's auto-detected container.
// Ring animation: CSS keyframes in globals.css. Counter-spin keeps photo upright.
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Animate } from "@/components/animate";
import { Stagger } from "@/components/stagger";
import useEmblaCarousel from "embla-carousel-react";

interface TeamSectionProps {
  label: string;
  headline: string;
  name1: string; role1: string;
  name2: string; role2: string;
  name3: string; role3: string;
  name4: string; role4: string;
  name5: string; role5: string;
  cta: string;
}

export function TeamSection({
  label, headline,
  name1, role1,
  name2, role2,
  name3, role3,
  name4, role4,
  name5, role5,
  cta,
}: TeamSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  // snapCount drives dot rendering — sourced from Embla so it reflects actual
  // scrollable positions, not hardcoded card count. Hides dots when ≤1 snap
  // (all cards already visible, e.g. iPad landscape).
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

  const members = [
    { name: name1, role: role1 },
    { name: name2, role: role2 },
    { name: name3, role: role3 },
    { name: name4, role: role4 },
    { name: name5, role: role5 },
  ];

  return (
    <div>
      {/* Section header — animates as one unit on section settle */}
      <Animate type="fade-up" className="mb-12">
        <p className="type-eyebrow text-text-tertiary mb-6">
          {label}
        </p>
        <h2 className="type-display text-text-primary">
          {headline}
        </h2>
      </Animate>

      {/* ── Mobile: Embla Carousel ──────────────────────────────────────────────
          200px slides: on a 375px viewport, ~1.6 members visible — strong peek
          signal. Same -mx-6 / pl-6 pattern as the Testimonials carousel. */}
      <div className="-mx-6 pl-6 lg:hidden" ref={emblaRef}>
        <Stagger gap={150} type="scale-in" delay={750} className="flex gap-6 py-4 pr-4">
          {members.map(({ name, role }) => (
            <div key={name} className="flex-none w-[200px] md:w-[215px]">
              {/* Spinning ring — outer spins, inner counter-spins to keep photo upright */}
              <div className="team-avatar-ring mb-4">
                <div className="team-avatar-inner aspect-square">
                  {/* Photo placeholder — replace with next/image when portrait is available */}
                  <div className="w-full h-full bg-surface-elevated" />
                </div>
              </div>
              <p className="text-[15px] font-semibold leading-[1.3] tracking-[-0.1px] text-text-primary mb-1">
                {name}
              </p>
              <p className="type-caption leading-none">{role}</p>
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

      {/* ── Desktop: 5-column grid with stagger ────────────────────────────────
          All 5 members visible simultaneously; both variants use the same Stagger. */}
      <Stagger
        gap={150}
        type="scale-in"
        delay={750}
        className="hidden lg:grid lg:grid-cols-5 gap-6 mb-10"
      >
        {members.map(({ name, role }) => (
          <div key={name}>
            <div className="team-avatar-ring mb-4">
              <div className="team-avatar-inner aspect-square">
                <div className="w-full h-full bg-surface-elevated" />
              </div>
            </div>
            <p className="text-[15px] font-semibold leading-[1.3] tracking-[-0.1px] text-text-primary mb-1">
              {name}
            </p>
            <p className="text-[13px] font-normal leading-none text-text-tertiary">{role}</p>
          </div>
        ))}
      </Stagger>

      {/* Link to full about page */}
      <Link
        href="/about"
        className="text-[14px] font-normal text-text-secondary underline underline-offset-4 decoration-border-subtle hover:text-text-primary hover:decoration-text-secondary transition-colors duration-150"
      >
        {cta}
      </Link>
    </div>
  );
}
