// Social Proof — section #6, surface-raised.
// Headline → stacked strikethrough negations → payoff with gold accent → YouTube embed → caption.
// Strikethrough lines are muted (text-tertiary + line-through) to visually "cross out" what the
// artist is not, then the payoff resolves the tension with the accent word in gold.
import { Stagger } from "@/components/stagger";
import { Animate } from "@/components/animate";
import { StrikethroughList } from "@/components/strikethrough-list";

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
    <>
      <Stagger gap={120} type="fade-up" className="max-w-2xl">
        <p className="type-eyebrow text-text-tertiary mb-6">{label}</p>
        <h2 className="type-display text-text-primary mb-8">{headline}</h2>

        {/* Sequentially animated strikethrough statements */}
        <StrikethroughList items={[not1, not2, not3]} />

        {/* Payoff — resolution after the negations */}
        <p className="type-lede text-text-secondary mt-8">
          {payoff}{" "}
          <span className="text-gold-400">{payoffAccent}</span>
        </p>
      </Stagger>

      <Animate type="fade-up" delay={1200} className="mt-16">
        <div className="aspect-video glass--gradient overflow-hidden rounded-sm">
          <iframe
            src="https://www.youtube.com/embed/rRTBDva8kqE"
            title={videoCaption}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
        <p className="type-caption text-text-tertiary mt-3">{videoCaption}</p>
      </Animate>
    </>
  );
}
