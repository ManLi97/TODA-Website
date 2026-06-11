// Case Study — Sandra's story, section #3, surface-raised.
// Two-column on desktop (copy left / video right), single-column on mobile.
// Video: YouTube embed with glass--gradient frame (same treatment as BoldClaim video).
// Copy column: eyebrow → h2 (name) → glass bullet list.
// Caption renders below video at type-caption size.

import { RevealGroup } from "@/components/reveal-group";
import { YouTubeFacade } from "@/components/youtube-facade";

interface CaseStudySectionProps {
  label: string;
  statement: string;
  bullet1: string;
  bullet2: string;
  bullet3: string;
  bullet4: string;
  videoCaption: string;
}

export function CaseStudySection({
  label,
  statement,
  bullet1,
  bullet2,
  bullet3,
  bullet4,
  videoCaption,
}: CaseStudySectionProps) {
  const bullets = [bullet1, bullet2, bullet3];

  return (
    <RevealGroup
      type="fade-up"
      className="gap-block grid grid-cols-1 lg:grid-cols-2 lg:items-center"
    >
      {/* Copy column — eyebrow → name headline → glass bullet list */}
      <div>
        <p className="type-eyebrow text-text-tertiary mb-group">{label}</p>
        <p className="type-sub-display text-text-primary mb-block">{statement}</p>
        <div className="glass p-6">
          <ul className="space-y-group mb-group">
            {bullets.slice(0, 3).map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-gold-400 shrink-0 leading-[1.55]">—</span>
                <span className="type-body text-text-primary">{item}</span>
              </li>
            ))}
          </ul>
          <p className="type-body text-gold-400 border-gold-400/20 pt-group border-t text-center italic">
            &ldquo;{bullet4}&rdquo;
          </p>
        </div>
      </div>

      {/* Video column — click-to-play facade in glass--gradient frame + caption below */}
      <div>
        <div className="glass--gradient rounded-card aspect-video overflow-hidden">
          <YouTubeFacade videoId="rdOlY1-Bp5E" title={videoCaption} />
        </div>
        <p className="type-caption text-text-tertiary mt-element">{videoCaption}</p>
      </div>
    </RevealGroup>
  );
}
