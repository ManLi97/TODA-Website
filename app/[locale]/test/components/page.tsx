// Internal component test page — Phase 4 visual verification.
// Not linked from any public nav. No i18n strings — static German labels.
// Visit: /de/test/components
import { SectionWrapper } from "@/components/section-wrapper";
import { Button } from "@/components/button";
import { Hero } from "@/components/hero";
import { Card } from "@/components/card";
import { VideoLoop } from "@/components/video-loop";
import { Animate } from "@/components/animate";
import { Stagger } from "@/components/stagger";

// Section label — internal typographic marker used throughout this page
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-text-tertiary text-[12px] uppercase tracking-widest mb-8">
      {children}
    </p>
  );
}

export default function ComponentTestPage() {
  return (
    <>
      {/* Page header — pt-14 absorbs fixed nav */}
      <div className="pt-14 bg-surface-base border-b border-border-subtle">
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <p className="text-text-tertiary text-[12px] uppercase tracking-widest mb-2">
            Intern · Phase 4
          </p>
          <h1 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.3px]">
            Komponenten
          </h1>
          <p className="text-text-secondary mt-2 text-[17px] leading-[1.47] tracking-[-0.2px]">
            Visuelle Verifikation aller Phase-4-Komponenten
          </p>
        </div>
      </div>

      {/* ─── 1. Button ─── */}
      <SectionWrapper variant="raised" id="buttons">
        <SectionLabel>Button — 3 Varianten × 3 Größen</SectionLabel>
        <div className="space-y-6">
          {(["sm", "md", "lg"] as const).map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-4">
              <span className="text-[11px] font-mono text-text-tertiary w-5 shrink-0">
                {size}
              </span>
              <Button variant="primary" size={size}>
                Kostenlos starten
              </Button>
              <Button variant="secondary" size={size}>
                Mehr erfahren
              </Button>
              <Button variant="ghost" size={size}>
                Überspringen
              </Button>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ─── 2. SectionWrapper ─── */}
      <SectionWrapper variant="alt" id="section-wrapper">
        <SectionLabel>SectionWrapper — Anthrazit Surface Variants</SectionLabel>
        <p className="text-text-secondary text-[17px] leading-[1.47] tracking-[-0.2px] mb-8 max-w-xl">
          Alterniert zwischen{" "}
          <code className="text-gold-500 text-[14px]">base</code>,{" "}
          <code className="text-gold-500 text-[14px]">raised</code> und{" "}
          <code className="text-gold-500 text-[14px]">alt</code>. Das Farbdelta ist das
          einzige Trennzeichen — kein Border, kein Shadow. Dieser Abschnitt selbst ist{" "}
          <code className="text-gold-500 text-[14px]">alt</code>.
        </p>
        <div className="flex gap-4">
          {[
            { variant: "base", cls: "bg-surface-base", hex: "#000000" },
            { variant: "raised", cls: "bg-surface-raised", hex: "#0A0A0A" },
            { variant: "alt", cls: "bg-surface-alt", hex: "#141414" },
          ].map(({ variant, cls, hex }) => (
            <div key={variant} className="flex-1">
              {/* bg-* classes use design tokens, not inline styles */}
              <div
                className={`h-20 rounded-sm border border-border-subtle ${cls}`}
              />
              <p className="mt-2 text-[12px] text-text-secondary font-mono">{variant}</p>
              <p className="text-[11px] text-text-tertiary font-mono">{hex}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ─── 3. Hero ─── */}
      {/* NOTE: Hero has pt-32/pt-40 baked in for first-on-page use.
          The excess top padding is expected and acceptable on this internal test page. */}
      <Hero
        headline="Mehr Kunst."
        accentText="Weniger Chaos."
        subHeadline="Die Komplettlösung für professionelle Tattoo-Studios. Von der Terminplanung bis zur Buchhaltung."
      />

      {/* ─── 4. Card ─── */}
      <SectionWrapper variant="raised" id="cards">
        <SectionLabel>Card — Text-only (kein imageSrc)</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            href="#"
            title="Automatische Erinnerungen"
            excerpt="Weniger No-Shows. TODA sendet automatisch Erinnerungen an deine Kunden — per SMS oder E-Mail."
            label="Funktion"
          />
          <Card
            href="#"
            title="Studio-Organisation neu gedacht"
            excerpt="Alle Termine. Ein System. Kein Chaos mehr zwischen WhatsApp, Instagram und Papierkalender."
            label="12. Mai 2026"
          />
          {/* Card with title only — no excerpt, no label */}
          <Card href="#" title="Buchhaltung ohne Vorkenntnisse" />
        </div>
      </SectionWrapper>

      {/* ─── 5. VideoLoop ─── */}
      <SectionWrapper variant="alt" id="video-loop">
        <SectionLabel>VideoLoop — Placeholder (kein src)</SectionLabel>
        <p className="text-text-secondary text-[17px] leading-[1.47] tracking-[-0.2px] mb-8">
          Kein <code className="text-gold-500 text-[14px]">src</code> → Placeholder-Div.
          IntersectionObserver (Threshold 25%) steuert play/pause.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-video overflow-hidden rounded-sm">
            <VideoLoop src="" className="w-full h-full" />
          </div>
          <div className="aspect-video overflow-hidden rounded-sm">
            <VideoLoop src="" className="w-full h-full" />
          </div>
        </div>
      </SectionWrapper>

      {/* ─── 6. Animate + Stagger ─── */}
      <SectionWrapper variant="base" id="animate">
        <SectionLabel>GSAP · Animate + Stagger — IO-triggered entrances</SectionLabel>
        <p className="text-text-secondary text-[17px] leading-[1.47] tracking-[-0.2px] mb-12 max-w-xl">
          Diese Section ist nicht in eine SnapSection eingebettet — Animate/Stagger loggen
          eine Warnung und feuern stattdessen on-mount (Fallback-Modus).
        </p>

        {/* Single element — Animate wraps as one unit */}
        <Animate type="fade-up" className="mb-12">
          <h2 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.3px] mb-4">
            Features, die überzeugen.
          </h2>
          <p className="text-[17px] font-normal leading-[1.47] tracking-[-0.2px] text-text-secondary max-w-xl">
            Alles, was ein professionelles Studio braucht — in einem System, das aus der
            Praxis gebaut wurde.
          </p>
        </Animate>

        {/* Multi-element cascade — Stagger animates container.children with gap=150ms */}
        <Stagger gap={150} type="fade-up" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            href="#"
            title="Terminplanung"
            excerpt="Online-Buchungen, Kalender-Sync und automatische Bestätigungen."
            label="Funktion"
          />
          <Card
            href="#"
            title="Kundenverwaltung"
            excerpt="Alle Kunden-Infos, Fotos und Notizen an einem Ort."
            label="Funktion"
          />
          <Card
            href="#"
            title="Buchhaltung"
            excerpt="Rechnungen, Ausgaben und Steuer-Export auf Knopfdruck."
            label="Funktion"
          />
        </Stagger>
      </SectionWrapper>
    </>
  );
}
