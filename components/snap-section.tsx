"use client";

// Layout primitive for the snap-slide scroll model.
// Each section snaps to exactly one viewport height. Provides a React context
// so Phase 3b's <Animate> and <Stagger> can scope their IntersectionObserver
// to this section's DOM node.
import { createContext, useContext, useRef, useMemo } from "react";

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

export interface SnapSectionContextValue {
  // The section's DOM node — Phase 3b attaches IntersectionObserver here.
  sectionRef: React.RefObject<HTMLElement | null>;
  // When true, <Animate> fires on mount instead of waiting for intersection.
  triggerOnMount: boolean;
}

export const SnapSectionContext = createContext<SnapSectionContextValue | null>(null);

export function useSnapSection() {
  return useContext(SnapSectionContext);
}

interface SnapSectionProps {
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

export function SnapSection({
  variant = "base",
  id,
  triggerOnMount = false,
  align = "start",
  backdrop,
  children,
}: SnapSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  // Object is memoised so consumers don't re-render on every SnapSection render.
  // sectionRef is stable (useRef), so the dep only meaningfully changes when
  // triggerOnMount changes (which never happens in practice — listed for lint).
  const ctx = useMemo<SnapSectionContextValue>(
    () => ({ sectionRef, triggerOnMount }),
    [sectionRef, triggerOnMount],
  );

  const sectionClass = [
    BG[variant],
    "min-h-dvh overflow-x-hidden snap-start snap-always",
    align === "center" ? "flex flex-col justify-center" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <SnapSectionContext.Provider value={ctx}>
      <section
        ref={sectionRef}
        id={id}
        className={`${sectionClass} relative`}
        style={{
          "--glass-tint": GLASS_TINT[variant],
          "--glass-gradient-fill": GLASS_GRADIENT_FILL[variant],
        } as React.CSSProperties}
      >
        {backdrop}
        <div className={`py-20 lg:py-32${backdrop ? " relative z-10" : ""}`}>
          <div className="max-w-[1200px] mx-auto px-6">{children}</div>
        </div>
      </section>
    </SnapSectionContext.Provider>
  );
}
