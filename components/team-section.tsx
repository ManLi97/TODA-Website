"use client";

// Team teaser — circular spinning-ring avatars.
// Mobile: Embla Carousel with 200px slides (~1.6 visible on 375px viewport).
// Desktop: 5-column grid with <RevealGroup type="scale-in">.
// Ring animation: CSS keyframes in globals.css. Counter-spin keeps photo upright.
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Animate } from "@/components/animate";
import { RevealGroup } from "@/components/reveal-group";
import { SectionHeader } from "@/components/section-header";
import useEmblaCarousel from "embla-carousel-react";

// Order matches the fixed team sequence: Dana → Sandra → Tomek → Manuel → Lucas.
// null = image not yet available; shows surface placeholder.
const MEMBER_IMAGES: (string | null)[] = [
  "/dana-co-founder-profile-image.jpg", // 1. Dana
  "/sandra-community-profile-image.jpg", // 2. Sandra
  "/tomek-founder-profile-image.jpg", // 3. Tomek
  "/manuel-ceo-profile-image.jpg", // 4. Manuel
  "/lucas-social-media-profile-image.jpg", // 5. Lucas
];

interface TeamSectionProps {
  label: string;
  headline: string;
  name1: string;
  role1: string;
  name2: string;
  role2: string;
  name3: string;
  role3: string;
  name4: string;
  role4: string;
  name5: string;
  role5: string;
  cta: string;
}

export function TeamSection({
  label,
  headline,
  name1,
  role1,
  name2,
  role2,
  name3,
  role3,
  name4,
  role4,
  name5,
  role5,
  cta,
}: TeamSectionProps) {
  const [emblaRef] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "keepSnaps",
    dragFree: true,
    duration: 35,
  });

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
      <Animate type="fade-up" className="mb-block">
        <SectionHeader label={label} headline={headline} />
      </Animate>

      {/* ── Mobile: Embla Carousel ──────────────────────────────────────────────
          200px slides: on a 375px viewport, ~1.6 members visible — strong peek
          signal. Same -mx-6 / pl-6 pattern as the Testimonials carousel. */}
      <div className="-mx-6 pl-6 lg:hidden" ref={emblaRef}>
        <RevealGroup type="scale-in" className="gap-group flex py-4 pr-4">
          {members.map(({ name, role }, i) => (
            <div key={name} className="w-[200px] flex-none md:w-[215px]">
              {/* Static wrapper carries the grounding shadow (.elevated); the ring inside
                  spins, so the shadow must NOT live on it or it would orbit the circle. */}
              <div className="elevated mb-element rounded-full">
                <div className="team-avatar-ring">
                  <div className="team-avatar-inner relative aspect-square">
                    {MEMBER_IMAGES[i] ? (
                      <Image
                        src={MEMBER_IMAGES[i]!}
                        alt={name}
                        fill
                        className="object-cover grayscale brightness-90"
                        sizes="200px"
                      />
                    ) : (
                      <div className="bg-surface-elevated h-full w-full" />
                    )}
                  </div>
                </div>
              </div>
              <p className="text-text-primary mb-1 text-[15px] leading-[1.3] font-semibold tracking-[-0.1px]">
                {name}
              </p>
              <p className="type-caption leading-none">{role}</p>
            </div>
          ))}
        </RevealGroup>
      </div>

      {/* ── Swipe hint — static ← SWIPE →, mobile/tablet only (the deck peek + hint carry the affordance; no pulse — motion stays a guest) ── */}
      <div className="mt-element mb-block text-gold-400 flex items-center justify-center gap-2 lg:hidden">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span className="text-xs font-semibold tracking-widest">SWIPE</span>
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>

      {/* ── Desktop: 5-column grid ─────────────────────────────────────────────
          All 5 members visible simultaneously; both variants use the same RevealGroup. */}
      <RevealGroup type="scale-in" className="gap-group mb-block hidden lg:grid lg:grid-cols-5">
        {members.map(({ name, role }, i) => (
          <div key={name}>
            <div className="elevated mb-element rounded-full">
              <div className="team-avatar-ring">
                <div className="team-avatar-inner relative aspect-square">
                  {MEMBER_IMAGES[i] ? (
                    <Image
                      src={MEMBER_IMAGES[i]!}
                      alt={name}
                      fill
                      className="object-cover grayscale brightness-90"
                      sizes="20vw"
                    />
                  ) : (
                    <div className="bg-surface-elevated h-full w-full" />
                  )}
                </div>
              </div>
            </div>
            <p className="text-text-primary mb-1 text-[15px] leading-[1.3] font-semibold tracking-[-0.1px]">
              {name}
            </p>
            <p className="text-text-tertiary text-[13px] leading-none font-normal">{role}</p>
          </div>
        ))}
      </RevealGroup>

      {/* CTA to about page — hidden until /about is live */}
    </div>
  );
}
