// Bold Claim — section #2, surface-alt.
// Structural placeholder: eyebrow → headline → phone-format video slot → 3 bullets.
// Portrait video asset and final copy land in Phase 6.
import { Stagger } from "@/components/stagger";
import { VideoLoop } from "@/components/video-loop";

interface BoldClaimSectionProps {
  label: string;
  headline: string;
  bullet1: string;
  bullet2: string;
  bullet3: string;
}

export function BoldClaimSection({
  label,
  headline,
  bullet1,
  bullet2,
  bullet3,
}: BoldClaimSectionProps) {
  return (
    <Stagger gap={150} type="fade-up" className="max-w-2xl">
      <p className="type-eyebrow text-text-tertiary mb-6">{label}</p>
      <h2 className="type-display text-text-primary mb-8">{headline}</h2>
      {/* Phone-format video slot — 9:16 portrait, snap-fits within 100dvh. */}
      <div className="max-w-sm mx-auto aspect-[9/16] glass--gradient overflow-hidden rounded-sm">
        <VideoLoop src="/bold-claim-section-video.mp4" playOnce className="w-full h-full" />
      </div>
      <p className="type-lede">{bullet1}</p>
      <p className="type-lede">{bullet2}</p>
      <p className="type-lede">{bullet3}</p>
    </Stagger>
  );
}
