// Social Proof — section #6, surface-raised.
// Extracted from inline Manifest block. Playfair accent dropped — Playfair stays hero-only.
// VideoLoop delay={1200} preserved as-is; timing retune is Phase 5/6.
import { Stagger } from "@/components/stagger";
import { Animate } from "@/components/animate";
import { VideoLoop } from "@/components/video-loop";

interface SocialProofSectionProps {
  label: string;
  headline: string;
  body: string;
}

export function SocialProofSection({ label, headline, body }: SocialProofSectionProps) {
  return (
    <>
      <Stagger gap={150} type="fade-up" className="max-w-2xl">
        <p className="type-eyebrow text-text-tertiary mb-6">{label}</p>
        <h2 className="type-display text-text-primary mb-8">{headline}</h2>
        <p className="type-lede">{body}</p>
      </Stagger>
      <Animate type="fade-up" delay={1200} className="mt-16">
        <div className="aspect-[21/9] overflow-hidden rounded-sm">
          <VideoLoop src="" className="w-full h-full" />
        </div>
      </Animate>
    </>
  );
}
