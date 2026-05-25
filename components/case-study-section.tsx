// Case Study — Sandra's story. First section after Hero, lands the emotional hook.
// Two-column on desktop (copy left / video right, top-aligned), single-column on mobile.
// Stagger staggers the two grid columns: copy at 0ms, video at 150ms.

import { VideoLoop } from "@/components/video-loop";
import { Stagger } from "@/components/stagger";

interface CaseStudySectionProps {
  label: string;
  statement: string;
  quote1: string;
  quote2: string;
  attribution: string;
}

export function CaseStudySection({
  label,
  statement,
  quote1,
  quote2,
  attribution,
}: CaseStudySectionProps) {
  return (
    <Stagger gap={150} type="fade-up" className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 lg:items-start">
      {/* Copy column — label → statement → pull-quotes → attribution */}
      <div>
        <p className="type-eyebrow text-text-tertiary mb-6">
          {label}
        </p>
        <p className="type-sub-display text-text-primary mb-10">
          {statement}
        </p>
        <div className="glass space-y-6 mb-8">
          <blockquote>
            {/* Pull-quote uses .type-body (19px / 1.55 / -0.01em) with italic + text-primary
                overrides — DS class brings size/leading; quote-specific colour wins via util. */}
            <p className="type-body italic text-text-primary">
              {quote1}
            </p>
          </blockquote>
          <blockquote>
            <p className="type-body italic text-text-primary">
              {quote2}
            </p>
          </blockquote>
        </div>
        <p className="type-caption">{attribution}</p>
      </div>

      {/* Video column — 16:9 placeholder; real podcast clip drops in via src prop */}
      <div className="aspect-video overflow-hidden rounded-sm">
        <VideoLoop src="" className="w-full h-full" />
      </div>
    </Stagger>
  );
}
