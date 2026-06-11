// Social Proof — section #6, surface-raised.
// Headline → stacked strikethrough negations → payoff with gold accent → YouTube embed → caption.
// Strikethrough lines are muted (text-tertiary + line-through) to visually "cross out" what the
// artist is not, then the payoff resolves the tension with the accent word in gold.
import { RevealGroup } from "@/components/reveal-group";
import { SectionHeader } from "@/components/section-header";
import { Animate } from "@/components/animate";
import { StrikethroughList } from "@/components/strikethrough-list";
import { YouTubeFacade } from "@/components/youtube-facade";

interface SocialProofSectionProps {
  label: string;
  headline: string;
  not1: string;
  not2: string;
  not3: string;
  payoff: string;
  payoffAccent: string;
  videoCaption: string;
}

export function SocialProofSection({
  label,
  headline,
  not1,
  not2,
  not3,
  payoff,
  payoffAccent,
  videoCaption,
}: SocialProofSectionProps) {
  return (
    <div className="lg:gap-block lg:grid lg:grid-cols-2 lg:items-center">
      <RevealGroup type="fade-up" className="max-w-2xl">
        <SectionHeader label={label} headline={headline} className="mb-block" />

        {/* Strikethrough statements — each strikes itself out as it enters view */}
        <StrikethroughList items={[not1, not2, not3]} />

        {/* Payoff — resolution after the negations */}
        <p className="type-lede text-text-secondary mt-block">
          {payoff} <span className="text-gold-400">{payoffAccent}</span>
        </p>
      </RevealGroup>

      <Animate type="fade-up" className="mt-block lg:mt-0">
        <div className="glass--gradient rounded-card aspect-video overflow-hidden">
          <YouTubeFacade videoId="rRTBDva8kqE" title={videoCaption} />
        </div>
        <p className="type-caption text-text-tertiary mt-element">{videoCaption}</p>
      </Animate>
    </div>
  );
}
