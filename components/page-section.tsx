"use client";

// Layout primitive for the page's sections. Each section is at least one viewport tall
// (min-h-svh) with a surface-variant background. Provides a small React context so entrance
// wrappers (<Animate>/<RevealGroup>/<StrikethroughList>) know whether to fire on mount
// (above-the-fold hero) or on scroll-into-view (everything below the fold).
// Plain smooth scroll — no scroll-snap (see globals.css).
import { createContext, useContext, useMemo } from "react";

type SectionVariant = "base" | "alt" | "raised";

const BG: Record<SectionVariant, string> = {
  base: "bg-surface-base",
  alt: "bg-surface-alt",
  raised: "bg-surface-raised",
};

// Per-variant glass tint — cascades via CSS custom property so any .glass
// descendant automatically gets the right fill for its section background.
// base = true black (#0a0a0a): anthracite glass for contrast.
// alt  = anthracite (#1e1e1e): black glass for contrast.
const GLASS_TINT: Record<SectionVariant, string> = {
  base:   "rgba(30, 30, 30, 0.9)",
  alt:    "rgba(10, 10, 10, 0.9)",
  raised: "rgba(41, 41, 41, 0.65)",
};

// Per-variant fill for .glass--gradient (gradient-bordered boxes and video frames).
// Same inversion logic as GLASS_TINT — box fill contrasts with section background.
const GLASS_GRADIENT_FILL: Record<SectionVariant, string> = {
  base:   "#1e1e1e",
  alt:    "#0a0a0a",
  raised: "#0a0a0a",
};

// Per-variant card/box elevation. On black surfaces a dark drop is invisible, so we
// use the "light from above" recipe (top highlight rim); on anthracite a real dark
// drop shadow reads. Cascades to .elevated / plain .glass descendants via --shadow-card.
const SHADOW_CARD: Record<SectionVariant, string> = {
  base:   "var(--shadow-card-light)",
  alt:    "var(--shadow-card-dark)",
  raised: "var(--shadow-card-dark)",
};

export interface PageSectionContextValue {
  // When true, entrance wrappers fire on mount instead of waiting for scroll-into-view.
  // Used by the above-the-fold hero so its content animates immediately on load.
  triggerOnMount: boolean;
}

export const PageSectionContext = createContext<PageSectionContextValue | null>(null);

export function usePageSection() {
  return useContext(PageSectionContext);
}

interface PageSectionProps {
  variant?: SectionVariant;
  id?: string;
  triggerOnMount?: boolean;
  // "center" adds flex flex-col justify-center so content is vertically centred.
  // "start" (default) leaves content top-weighted with py-20 lg:py-32 padding.
  align?: "start" | "center";
  // Optional full-bleed backdrop layer (e.g. canvas particle effect).
  // Rendered absolute inset-0 behind content; content wrapper gets relative z-10.
  backdrop?: React.ReactNode;
  children: React.ReactNode;
}

export function PageSection({
  variant = "base",
  id,
  triggerOnMount = false,
  align = "start",
  backdrop,
  children,
}: PageSectionProps) {
  // Memoised so consumers don't re-render on every PageSection render.
  const ctx = useMemo<PageSectionContextValue>(
    () => ({ triggerOnMount }),
    [triggerOnMount],
  );

  const sectionClass = [
    BG[variant],
    // min-h-svh keeps each section at least one (stable, URL-bar-proof) viewport tall
    // for the "spotlight" rhythm, but lets it grow with content. No scroll-snap — see globals.css.
    // overflow-x-clip (not -hidden): `overflow-x: hidden` forces the y-axis from `visible`
    // to `auto`, silently making every section a vertical scroll container — that surfaced as
    // a phantom "scroll inside the section" whenever a not-yet-revealed fade-up element sat
    // in its translateY offset below the edge. `clip` contains x-overflow without that side effect.
    "min-h-svh overflow-x-clip",
    align === "center" ? "flex flex-col justify-center" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <PageSectionContext.Provider value={ctx}>
      <section
        id={id}
        className={`${sectionClass} relative`}
        style={{
          "--glass-tint": GLASS_TINT[variant],
          "--glass-gradient-fill": GLASS_GRADIENT_FILL[variant],
          "--shadow-card": SHADOW_CARD[variant],
        } as React.CSSProperties}
      >
        {backdrop}
        {/* Symmetric vertical breathing room — fluid section rhythm (compresses on mobile).
            Space before ${} is required: Tailwind's scanner drops a class glued directly
            to a template interpolation, so `py-section${...}` would silently emit no padding. */}
        <div className={`py-section ${backdrop ? "relative z-10" : ""}`}>
          <div className="max-w-[1280px] mx-auto px-6">{children}</div>
        </div>
      </section>
    </PageSectionContext.Provider>
  );
}
