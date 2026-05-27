// Shared section header — the eyebrow → headline (→ optional lede) block repeated
// verbatim across the uniform-header sections (Bold Claim, Features, Social Proof,
// Team, FAQ). Consolidating it gives one place to own the header's content measure
// and its internal vertical rhythm (spacing tokens), so the mobile rhythm stays
// consistent section to section.
//
// Animation-agnostic by design: it renders markup only. The caller decides how it
// reveals — wrap it in <Animate> or drop it in as the first child of a <RevealGroup>.
import type { ReactNode } from "react";

interface SectionHeaderProps {
  label: string;
  headline: ReactNode;
  // Optional supporting line under the headline (type-lede).
  lede?: ReactNode;
  // Extra classes on the wrapper — caller adds the gap to the content below
  // (e.g. `mb-block`) or overrides the default reading measure.
  className?: string;
}

export function SectionHeader({ label, headline, lede, className }: SectionHeaderProps) {
  return (
    <div className={`max-w-2xl${className ? ` ${className}` : ""}`}>
      <p className="type-eyebrow text-text-tertiary mb-group">{label}</p>
      <h2 className="type-display text-text-primary">{headline}</h2>
      {lede && <p className="type-lede mt-group">{lede}</p>}
    </div>
  );
}
