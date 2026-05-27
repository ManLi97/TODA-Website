// Full-bleed section tile — the primary layout primitive for page rhythm.
// Variant controls which Anthrazit surface level is used; alternating them creates
// section-level separation without borders or shadows. (Card/box depth is a separate
// concern — see the .elevated recipe in globals.css.)

type SectionVariant = "base" | "raised" | "alt";

const BG: Record<SectionVariant, string> = {
  base: "bg-surface-base",
  raised: "bg-surface-raised",
  alt: "bg-surface-alt",
};

interface SectionWrapperProps {
  variant?: SectionVariant;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SectionWrapper({
  variant = "base",
  children,
  className,
  id,
}: SectionWrapperProps) {
  // overflow-x-hidden clips any horizontal visual overflow from child elements
  // (rotated cards, transforms, compositing layers) without affecting body/html scroll.
  const sectionClasses = [BG[variant], "py-20", "overflow-x-hidden", className].filter(Boolean).join(" ");

  return (
    <section id={id} className={sectionClasses}>
      <div className="max-w-[1200px] mx-auto px-6">{children}</div>
    </section>
  );
}
