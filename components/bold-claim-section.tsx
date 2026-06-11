// Bold Claim — section #2, surface-alt.
// Structural placeholder: eyebrow → headline → phone-format video slot → 3 bullets.
// Portrait video asset and final copy land in Phase 6.
import { RevealGroup } from "@/components/reveal-group";
import { SectionHeader } from "@/components/section-header";
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
    <RevealGroup type="fade-up" className="max-w-2xl lg:max-w-none">
      <SectionHeader label={label} headline={headline} className="mb-block" />
      {/* Mobile: video stacked above bullets. Desktop (lg+): 2-col grid — video left (280px),
          bullets right (capped at 2xl so they don't sprawl). */}
      <div className="lg:gap-block lg:grid lg:grid-cols-[280px_1fr] lg:items-center">
        {/* Phone-format video — portrait 9:16. Shown on all viewports. */}
        <div className="glass--gradient rounded-card mx-auto aspect-[9/16] max-w-[260px] overflow-hidden lg:mx-0 lg:max-w-[280px]">
          <VideoLoop src="/bold-claim-section-video.mp4" playOnce className="h-full w-full" />
        </div>
        {/* Three glass claim boxes — static gradient number, text at lede size. */}
        <div className="gap-group mt-block flex w-full flex-col lg:mt-0 lg:max-w-2xl">
          {[bullet1, bullet2, bullet3].map((text, i) => (
            <div key={i} className="glass glass--gradient gap-group flex items-center">
              <span className="type-sub-display grad-text--flow shrink-0 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="type-lede text-text-primary m-0">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </RevealGroup>
  );
}
