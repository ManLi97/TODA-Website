// Design system test page — internal verification only, not a real page.
// Shows all color tokens, typography scale, and the primary button.

const anthrazitTokens = [
  { name: "surface-base", hex: "#000000" },
  { name: "surface-raised", hex: "#0A0A0A" },
  { name: "surface-alt", hex: "#141414" },
  { name: "surface-elevated", hex: "#1D1D1D" },
  { name: "border-subtle", hex: "#262626" },
  { name: "text-primary", hex: "#FFFFFF" },
  { name: "text-secondary", hex: "#A3A3A3" },
  { name: "text-tertiary", hex: "#6B6B6B" },
];

const goldTokens = [
  { name: "gold-50", hex: "#FFF8E5" },
  { name: "gold-200", hex: "#FCE49B" },
  { name: "gold-400", hex: "#E8B73D" },
  { name: "gold-500", hex: "#C8941A" },
  { name: "gold-600", hex: "#9C7314" },
  { name: "gold-800", hex: "#5C420A" },
];

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-surface-base text-text-primary font-inter px-16 py-20">
      <div className="max-w-4xl mx-auto space-y-20">
        {/* Header */}
        <div>
          <p className="text-text-tertiary text-sm uppercase tracking-widest mb-3">Internal</p>
          <h1 className="text-[40px] font-semibold tracking-tight">Design System — Phase 2</h1>
          <p className="text-text-secondary mt-2">Color tokens · Typography scale · Primary button</p>
        </div>

        {/* Color tokens */}
        <section>
          <h2 className="text-[21px] font-semibold mb-8">Color Tokens</h2>

          <div className="mb-10">
            <p className="text-text-tertiary text-xs uppercase tracking-widest mb-5">Anthrazit</p>
            <div className="flex flex-wrap gap-4">
              {anthrazitTokens.map((token) => (
                <div key={token.name} className="flex flex-col gap-2 w-24">
                  <div
                    className="h-16 w-full rounded-sm border border-border-subtle"
                    style={{ backgroundColor: token.hex }}
                  />
                  <span className="text-[11px] text-text-secondary font-mono leading-tight">{token.name}</span>
                  <span className="text-[11px] text-text-tertiary font-mono">{token.hex}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-text-tertiary text-xs uppercase tracking-widest mb-5">Gold</p>
            <div className="flex flex-wrap gap-4">
              {goldTokens.map((token) => (
                <div key={token.name} className="flex flex-col gap-2 w-24">
                  <div
                    className="h-16 w-full rounded-sm border border-border-subtle"
                    style={{ backgroundColor: token.hex }}
                  />
                  <span className="text-[11px] text-text-secondary font-mono leading-tight">{token.name}</span>
                  <span className="text-[11px] text-text-tertiary font-mono">{token.hex}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Typography scale */}
        <section>
          <h2 className="text-[21px] font-semibold mb-8">Typography Scale</h2>
          <div className="space-y-10">
            <div className="border-b border-border-subtle pb-8">
              <p className="text-text-tertiary text-xs uppercase tracking-widest mb-3">
                Hero — Inter 56px / 600 / lh 1.07 / ls -0.5px
              </p>
              <p className="text-[56px] font-semibold leading-[1.07] tracking-[-0.5px]">
                Mehr Kunst. Weniger Chaos.
              </p>
            </div>

            <div className="border-b border-border-subtle pb-8">
              <p className="text-text-tertiary text-xs uppercase tracking-widest mb-3">
                Section — Inter 40px / 600 / lh 1.1 / ls -0.3px
              </p>
              <p className="text-[40px] font-semibold leading-[1.1] tracking-[-0.3px]">
                TODA Solutions
              </p>
            </div>

            <div className="border-b border-border-subtle pb-8">
              <p className="text-text-tertiary text-xs uppercase tracking-widest mb-3">
                Sub-headline — Inter 28px / 400 / lh 1.25
              </p>
              <p className="text-[28px] font-normal leading-[1.25] text-text-secondary">
                Dein Studio. Perfekt organisiert.
              </p>
            </div>

            <div className="border-b border-border-subtle pb-8">
              <p className="text-text-tertiary text-xs uppercase tracking-widest mb-3">
                Body — Inter 17px / 400 / lh 1.47 / ls -0.2px
              </p>
              <p className="text-[17px] font-normal leading-[1.47] tracking-[-0.2px] text-text-secondary max-w-xl">
                Die Komplettlösung für Tattoo-Studios. Von der Terminplanung über die Kundenverwaltung bis zur
                Buchhaltung — alles in einem System, das so aussieht wie deine Arbeit klingt.
              </p>
            </div>

            <div className="border-b border-border-subtle pb-8">
              <p className="text-text-tertiary text-xs uppercase tracking-widest mb-3">
                Caption — Inter 14px / 400 / lh 1.43 / ls -0.1px
              </p>
              <p className="text-[14px] font-normal leading-[1.43] tracking-[-0.1px] text-text-tertiary">
                Mehr als 500 Studios vertrauen TODA Solutions
              </p>
            </div>

            <div>
              <p className="text-text-tertiary text-xs uppercase tracking-widest mb-3">
                Playfair Italic Accent — 24px / 400 italic / gold-500 / max 2–4 Wörter
              </p>
              <p className="text-[24px] font-normal italic leading-[1.2] text-gold-500 font-playfair">
                Weniger Chaos.
              </p>
            </div>
          </div>
        </section>

        {/* Primary button */}
        <section>
          <h2 className="text-[21px] font-semibold mb-8">Primary Button</h2>
          <div className="flex items-center gap-6">
            <button className="bg-gold-500 text-surface-base font-semibold text-[16px] px-7 py-3 rounded-[980px] transition-colors duration-150 hover:bg-gold-400 active:scale-[0.97] active:bg-gold-600">
              Jetzt starten
            </button>
            <span className="text-text-tertiary text-sm">gold-500 · border-radius 980px · Inter 16px/600</span>
          </div>
        </section>
      </div>
    </main>
  );
}
