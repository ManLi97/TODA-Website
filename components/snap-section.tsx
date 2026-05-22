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
  children: React.ReactNode;
}

export function SnapSection({
  variant = "base",
  id,
  triggerOnMount = false,
  align = "start",
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
      <section ref={sectionRef} id={id} className={sectionClass}>
        <div className="py-20 lg:py-32">
          <div className="max-w-[1200px] mx-auto px-6">{children}</div>
        </div>
      </section>
    </SnapSectionContext.Provider>
  );
}
