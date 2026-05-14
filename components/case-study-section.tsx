// Case Study — Sandra's story. First section after Hero, lands the emotional hook.
// Two-column on desktop (copy left / video right, top-aligned), single-column on mobile.
// ScrollReveal staggers the two grid columns: copy at 0ms, video at 60ms.

import { VideoLoop } from "@/components/video-loop";
import { ScrollReveal } from "@/components/scroll-reveal";

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
    <ScrollReveal className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 lg:items-start">
      {/* Copy column — label → statement → pull-quotes → attribution */}
      <div>
        <p className="text-[12px] font-normal leading-none tracking-[0.1px] uppercase text-text-tertiary mb-6">
          {label}
        </p>
        <p className="text-[24px] lg:text-[32px] font-semibold leading-[1.15] tracking-[-0.3px] text-text-primary mb-10">
          {statement}
        </p>
        <div className="space-y-6 mb-8">
          <blockquote className="border-l-2 border-gold-500 pl-4 py-1">
            <p className="text-[18px] lg:text-[20px] italic font-normal leading-[1.5] text-text-primary">
              {quote1}
            </p>
          </blockquote>
          <blockquote className="border-l-2 border-gold-500 pl-4 py-1">
            <p className="text-[18px] lg:text-[20px] italic font-normal leading-[1.5] text-text-primary">
              {quote2}
            </p>
          </blockquote>
        </div>
        <p className="text-[13px] font-normal text-text-tertiary">{attribution}</p>
      </div>

      {/* Video column — 16:9 placeholder; real podcast clip drops in via src prop */}
      <div className="aspect-video overflow-hidden rounded-sm">
        <VideoLoop src="" className="w-full h-full" />
      </div>
    </ScrollReveal>
  );
}
