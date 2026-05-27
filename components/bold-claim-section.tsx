// Bold Claim — section #2, surface-alt.
// Structural placeholder: eyebrow → headline → phone-format video slot → 3 bullets.
// Portrait video asset and final copy land in Phase 6.
import { RevealGroup } from "@/components/reveal-group";
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
    <RevealGroup type="fade-up" className="max-w-2xl">
      <p className="type-eyebrow text-text-tertiary mb-6">{label}</p>
      <h2 className="type-display text-text-primary mb-8">{headline}</h2>
      {/* Phone-format video — portrait 9:16. Shown on all viewports: sections are now
          min-h-svh (grow with content) and reveals fire per-element on entry, so the old
          dvh-overflow / IO-ratio reasons for hiding it on mobile no longer apply. */}
      <div className="max-w-[260px] mx-auto aspect-[9/16] glass--gradient overflow-hidden rounded-sm">
        <VideoLoop src="/bold-claim-section-video.mp4" playOnce className="w-full h-full" />
      </div>
      {/* Three glass claim boxes — shimmer on number only, text at lede size. */}
      <div className="flex flex-col gap-6 w-full mt-12">
        {[bullet1, bullet2, bullet3].map((text, i) => (
          <div key={i} className="glass glass--gradient flex items-center gap-6">
            <span className="type-sub-display grad-text--flow flowing tabular-nums shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="type-lede text-text-primary m-0">{text}</p>
          </div>
        ))}
      </div>
    </RevealGroup>
  );
}
