# TODA Website — Design System Integration Plan

Phases run sequentially. Each phase ends with a review gate before the next begins.
Source of truth for the design system: `docs/design-system/` in this repo.

> **⚠️ Superseded scroll model (2026-05-27):** This plan was written when the page used
> `scroll-snap-type: mandatory` one-viewport "snap-slide" sections. That model was removed
> in favour of plain smooth scroll with `min-h-svh` sections and fire-once reveals — it
> trapped overflowing content and felt un-premium on mobile. References below to scroll-snap,
> "snap-fits," or snap-stop are historical; the section primitive was renamed `SnapSection` → `PageSection`.
> Current scroll/animation reality of record: `CLAUDE.md` + the project source.

## Current state

Phases 1-3 complete: design system reference reconstructed (`docs/design-system/`),
CSS tokens migrated to Tailwind v4 `@theme`, animation primitives + section ports off
Framer Motion landed. Scroll model pivoted from snap-slides to plain smooth scroll.
Run `git log --oneline` for the full history.

**Next:** mobile-first polish (per-section device pass).

---

## Phase 4 — Chrome & Structure

**The shape pass.** Reshapes the page's structural skeleton — section order and chrome
demolition. No content or asset dependencies; no visual atmosphere work. Lands a stable
form before Phase 5 polishes against it.

### Section order & surface rhythm (canonical reference)

The new 10-section order. Surface rhythm walks `base → alt → raised` three times
before closing on `base`:

| #  | Section                                   | Surface |
|----|-------------------------------------------|---------|
| 1  | Hero                                      | base    |
| 2  | Bold Claim *(new)*                        | alt     |
| 3  | Case Study                                | raised  |
| 4  | Origin                                    | base    |
| 5  | Features                                  | alt     |
| 6  | Additional Social Proof *(was Manifest)*  | raised  |
| 7  | Testimonials                              | base    |
| 8  | Team                                      | alt     |
| 9  | Pricing *(was CTA)*                       | raised  |
| 10 | FAQ                                       | base    |

Bookend rule: Hero opens on `base`, FAQ closes on `base`. Every `raised` is a
"moment" — a focal video, podcast, or pricing block.

### Phase 4a — Page restructure

**Goal:** the page renders in the new 10-section order with the new surface rhythm.
Bold Claim exists as a structural placeholder. Pricing CTA links externally. No
chrome changes yet.

**Create:**
- `components/bold-claim-section.tsx` — new section. Headline + empty video slot
  (same pattern as Manifest's current `<VideoLoop src="">`) + 3 bullet placeholders.
  Server Component preferred; Client only if needed.
- `components/social-proof-section.tsx` — extract from inline Manifest in
  `page.tsx`. Same content for now; the rename makes Phase 5b's glass-on-video-frame
  and Phase 5e's mobile reshape easier. **Drop the Playfair accent** (`font-playfair`
  block) during extraction — it does not carry over. Playfair stays hero-only per
  CLAUDE.md; remove `home.socialProof.accentText` accordingly.
- `components/pricing-section.tsx` — extract from inline CTA in `page.tsx`. Carries
  the new external href + new copy label.

**Update:**
- `app/[locale]/page.tsx` — reorder all sections per table above, insert
  `<BoldClaimSection>` at #2, move FAQ to #10, swap inline Manifest → `<SocialProofSection>`,
  swap inline CTA → `<PricingSection>`, apply new surface variants to every
  `<PageSection variant=...>`.
- Pricing CTA href: `#contact` → `https://app.toda.ink/onboarding`. **New tab,
  confirmed:** plain `<a target="_blank" rel="noopener noreferrer">`, not `<Link>`.
- Pricing section id: `contact` → `pricing`. Hero's `ctaPrimary href="#contact"`
  dangles after this until Phase 5c removes the Hero CTAs — acceptable, flagged.
- Pricing CTA label: "Kostenlos Starten" → "Jetzt Starten" (across all 3 locale
  files). Other Pricing copy stays as placeholder.
- `messages/{de,en,es}.json`:
  - Add `home.boldClaim` namespace: `label`, `headline`, `bullet1`, `bullet2`,
    `bullet3` (placeholders OK)
  - Rename `home.manifest` → `home.socialProof` (preserve existing copy as
    placeholder)
  - Rename `home.cta` → `home.pricing`; update CTA label to "Jetzt Starten" in each
    locale

**Watch-outs:**
- All three locale files must rename `manifest` and `cta` keys in lock-step or
  next-intl will throw on missing key at runtime.
- External link to app.toda.ink: resolved — new tab (`target="_blank"`).
- Bold Claim placeholder must not leave a visibly broken viewport — empty video slot
  needs a sensible aspect-ratio box so the section still snap-fits cleanly.

**Done when:** page renders in the new order with the new surface rhythm, Pricing CTA
opens app.toda.ink/onboarding, Bold Claim section is present (placeholder), no
console errors, snap behavior smooth across all 10 sections.

### Phase 4b — Header strip + Footer strip

**Goal:** chrome shrinks to spec. Header = logo + language switcher in glass.
Footer = legal + social + copyright.

**Update:**
- `components/header.tsx`:
  - Remove: `NAV_LINKS`, desktop nav block, mobile menu state + hamburger button +
    drawer, both CTA buttons (desktop + mobile)
  - Keep: fixed positioning, logo (left), language switcher (right)
  - Replace `bg-surface-base/80 backdrop-blur-md border-b border-border-subtle` with
    DS glass tokens directly (`background: var(--glass-tint)` +
    `backdrop-filter: blur(20px) saturate(140%)` + bottom border via
    `--glass-border-gold`). `.glass` class itself is unsuitable here — it adds
    padding + border-radius meant for cards.
  - File should shrink from ~188 lines to ~60-80 lines
- `components/footer.tsx`:
  - Remove: brand block (logo + tagline), Product col, Company col, Language col,
    full 5-col grid layout
  - Keep + restructure: Legal col (imprint, privacy, **add terms & conditions**),
    Social block (replace Instagram + LinkedIn with **Instagram + YouTube +
    Facebook**), Copyright bar
  - Layout: minimal vertical footprint, single-row on desktop where possible,
    stacked on mobile
- `messages/{de,en,es}.json`:
  - `nav.*`: remove `features`, `pricing`, `blog`, `about`, `cta`, `openMenu`,
    `closeMenu` — remove the namespace entirely if empty
  - `footer.*`: remove `tagline`, `product.*`, `company.*`, `language.*`; add
    `legal.terms`, `social.youtube`, `social.facebook`; remove `social.linkedin`;
    keep `legal.imprint`, `legal.privacy`, `copyright`

**Watch-outs:**
- Header glass legibility: verify against all 3 surfaces it scrolls over (base, alt,
  raised). `--glass-tint` is 65% surface-raised — should hold contrast.
- Removing `nav` namespace must coincide with removing all `useTranslations("nav")`
  call sites.
- Footer routes `/imprint`, `/privacy`, `/terms` don't exist yet — pages come in
  Phase 6. Routes will 404 until then; acceptable as long as flagged.

**Done when:** header shows only logo + language switcher with glass surface; footer
shows only legal + social + copyright; all old nav/footer copy removed from message
files; no broken translations; no console errors.

## Phase 5 — Visual Atmosphere & Component Polish

**The feel pass.** Tokens already exist (Phase 2 was thorough); this phase applies
them and cleans the few remaining primitive gaps. No content or asset dependencies.

### Phase 5a — Ambient gradient (page-level, Option B)

**Update:**
- `app/[locale]/layout.tsx` — add fixed `<div>` behind `<main>` with
  `background: var(--grad-ambient)`, `position: fixed`, `inset: 0`, `z-index: -1`,
  `pointer-events: none`.

**Watch-outs:**
- `z-index: -1` must not interfere with scroll-snap (snap is on `html`, unaffected
  by descendant z-index).
- Confirm gradient doesn't muddy the chrome blur (test sample dark content over).

**Done when:** ambient gold gradient subtly visible top-left across the whole page,
doesn't fight scroll-snap, doesn't muddy chrome.

### Phase 5b — Glass on focal elements

**Update:**
- `components/case-study-section.tsx` — wrap pull quote in `.glass`
- `components/social-proof-section.tsx` — wrap video frame border in
  `.glass--gradient`
- `components/pricing-section.tsx` — wrap price + period block in `.glass--gradient`

**Watch-outs:**
- DS rule: glass is NOT wallpaper. Three applications total, no more.
- Glass behind glass (e.g. bottom nav over a card glass) — verify legibility.

**Done when:** three glass applications visible, no extras, focal elements feel
weighted.

### Phase 5c — Hero rework

**Update:**
- `components/hero.tsx`:
  - Remove primary + secondary CTA buttons (bottom nav now carries the primary path).
    Also removes the now-unused `Link` + `buttonVariants` imports, the `ctaPrimary`/
    `ctaSecondary` props, and the `hasCtas` branch.
  - **Headline scale: keep `type-display`** (decided). `--type-hero` is rejected — it
    is a thin-weight, numeral-semantic token (`--weight-thin`, "giant numerals,
    gradient-clipped") and would flip the bold two-line headline to thin + overflow
    across locales. `type-display` is the correct headline token. If display still
    feels small after review, a dedicated mid-scale headline token is a separate DS PR.
  - Tighten vertical rhythm — make hero feel bigger / more impactful via the freed
    space from CTA removal, not via a larger type token.
  - Verify breathing with new fixed chrome (header above, bottom nav below).
- `app/[locale]/page.tsx` — drop the `ctaPrimary`/`ctaSecondary` props on `<Hero>`.
  This finally clears the dangling `#contact` reference flagged since Phase 4a.
- `messages/{de,en,es}.json` — remove `hero.ctaPrimary` and `hero.ctaSecondary` in
  lock-step across all three locales.

**Watch-outs:**
- Removing CTA changes the section's `<Animate>` cascade. Hero currently has three
  Animates (headline @ delay 0, sub @ 350, CTA cluster @ 900). Drop the CTA Animate;
  headline + sub-headline cascade remains.

**Done when:** Hero visually commands the viewport on mount via tightened rhythm, no
CTA buttons, headline stays `type-display` and readable across all locales on mobile,
no dangling `#contact` reference remains.

### Phase 5d — Features mobile → Embla carousel

**Create:**
- `components/features-section.tsx` — extract from inline `<Stagger><Card/></Stagger>`
  in `page.tsx`. Add mobile Embla carousel (same pattern as
  `components/team-section.tsx`). Desktop keeps 3-up grid.

**Update:**
- `app/[locale]/page.tsx` — swap inline Features block for `<FeaturesSection />`.

**Watch-outs:**
- Stagger's rendered wrapper `<div>` becomes Embla's container (proven in Team
  Phase 3c.2).
- Dot indicators on mobile only.

**Done when:** Features cards swipe horizontally on mobile, 3-up grid on desktop,
same entrance behavior as Team.

### Phase 5e — Component polish

**Update:**
- `components/card.tsx` — remove `hover:-translate-y-0.5` from `linkClasses`
  (DS guardrail violation: no hover micro-animations on content cards)
- `components/button.tsx` — audited, no-op. Its hover/active states are correct for
  an interactive element; the no-hover guardrail targets content cards, not buttons.

**Done when:** Card link cards no longer lift on hover; Button unchanged.

> Social Proof mobile reshape moved to Phase 6 — it is asset-gated (the podcast clip
> defines the layout), so it ships beside that asset rather than being designed
> speculatively against an empty video slot.

---

## Phase 6 — Content & Assets

**The real pass.** Gated on you providing copy and assets. Ships piecewise as each
piece arrives — not a single PR.

**Copy refinements (no asset gating):**
- Hero — final copy
- Bold Claim — final headline + 3 selling points
- Case Study — tighten to 2 short strong statements
- Origin — shorten to one paragraph (2-3 sentences)
- Features — replace placeholder copy with real text
- Social Proof — final short statement
- Testimonials — lock hint copy: DE "Tippen zum Wechseln" / EN "Tap to flip" /
  ES "Toca para girar"
- Pricing — finalize price, period, note copy
- FAQ — final 5 Q&A pairs
- Footer — real legal links

**Asset slots (each lands when asset is ready):**
- Bold Claim — After Effects particle-assemble smartphone video (format decision:
  MP4 alpha vs WebM VP9 alpha vs Lottie)
- Case Study — real video (decision: YouTube embed vs self-hosted)
- Origin — SVG graphic (you design, we wire + animate per DS)
- Social Proof — 30s podcast clip loop, click → YouTube external. Includes the mobile
  reshape (lean layout, video frame as focal element) deferred from Phase 5e — the
  asset defines the layout, so it ships here.
- Team — real portraits replacing gray placeholders
- TODA app icon — final asset for bottom nav center slot

**Static pages (footer routes):**
- `/imprint` — legal text
- `/privacy` — privacy policy
- `/terms` — terms & conditions

**Watch-outs:**
- Copy lives in `messages/{locale}.json` — all three locales must stay in sync per
  change.
- Sequencing within each section follows DS timing math:
  `next.delay = previous.delay + previous.duration + breath` (see `motion.md` §4).
