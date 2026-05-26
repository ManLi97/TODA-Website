// Case Study — Sandra's story, section #3, surface-raised.
// Two-column on desktop (copy left / video right), single-column on mobile.
// Video: YouTube embed with glass--gradient frame (same treatment as BoldClaim video).
// Copy column: eyebrow → h2 (name) → glass bullet list.
// Caption renders below video at type-caption size.

import { Stagger } from "@/components/stagger";

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
    <Stagger gap={150} type="fade-up" className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 lg:items-start">
      {/* Copy column — eyebrow → name headline → glass bullet list */}
      <div>
        <p className="type-eyebrow text-text-tertiary mb-6">{label}</p>
        <p className="type-sub-display text-text-primary mb-10">{statement}</p>
        <div className="glass p-6">
          <ul className="space-y-4 mb-6">
            {bullets.slice(0, 3).map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-gold-400 shrink-0 leading-[1.55]">—</span>
                <span className="type-body text-text-primary">{item}</span>
              </li>
            ))}
          </ul>
          <p className="type-body italic text-gold-400 border-t border-gold-400/20 pt-5 text-center">"{bullet4}"</p>
        </div>
      </div>

      {/* Video column — YouTube embed in glass--gradient frame + caption below */}
      <div>
        <div className="aspect-video glass--gradient overflow-hidden rounded-sm">
          <iframe
            src="https://www.youtube.com/embed/rdOlY1-Bp5E"
            title={videoCaption}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
        <p className="type-caption text-text-tertiary mt-3">{videoCaption}</p>
      </div>
    </Stagger>
  );
}
