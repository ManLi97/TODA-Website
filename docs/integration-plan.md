# TODA Website — Design System Integration Plan

Phases run sequentially. Each phase ends with a review gate before the next begins.
Source of truth for the design system: `docs/design-system/` in this repo.

---

## Phase 1 — Reconstruct Design System Reference ✓ COMPLETE

Derived from `toda-tech-skills/design-system/`, adapted per-file to this stack. Each file
was reviewed, adjusted where needed, and annotated with implementation watch-outs.

**Output:** `docs/design-system/` — five focused files + README:
- `philosophy.md` — adapted (scroll-model section reflects snap-slide architecture)
- `hex-tables.md` — adopted as-is
- `css-tokens.md` — adopted as-is, surface naming note added
- `typography.md` — adapted (3 copy fixes, Playfair note, 3 Phase 2 watch-outs added)
- `motion.md` — adapted (entrance trigger is IntersectionObserver scoped to `<SnapSection>`)

**Key decisions locked:**
- Surface names: `surface-base` (#141414), `surface-alt` (#121212), `surface-raised` (#292929)
- Playfair Display: "Weniger Chaos" hero span only — one occurrence, nowhere else
- Framer Motion (`motion` package) is removed at the end of Phase 3, only after each
  section's `motion` logic is ported to GSAP / native React
- `hero-in` shimmer: hybrid approach — GSAP entrance, CSS perpetual loop via `onComplete`

---

## Phase 2 — CSS Tokens ✓ COMPLETE

All design tokens migrated into `globals.css` via the Tailwind v4 `@theme` block:
colours (surfaces, text tiers, gold, purple, label tints), composed recipes (glass,
gradients), fonts (Inter via `next/font`, Playfair italic 400), type classes
(`.type-*`), motion tokens (easings, durations, distances). The `polaroid-*` and
`team-avatar-*` recipes are project-specific extensions also wired in this phase.

---

## Phase 3 — Scroll Architecture + Animation Layer ✓ COMPLETE

**The pivot.** The site moves from a sticky-stacking scroll model with Lenis smooth
scroll, to a snap-slide model with native CSS scroll-snap. Each section is exactly
one viewport tall. Entrance animations fire only after a section has settled into
view, reset when it leaves so they replay on return. Framer Motion is removed by
the end of the phase.

Split into four PR-sized phases. Each is shippable independently.

### Phase 3a — Scroll engine swap ✓ COMPLETE

**Goal:** replace Lenis + `StickySection` with native scroll-snap + a thin
`<SnapSection>` primitive. Page renders identically section-by-section, no animations
yet.

**Create:**
- `components/snap-section.tsx` — `<SnapSection variant="base|alt|raised" id triggerOnMount?>`
  is the new layout primitive. `min-h-dvh`, `scroll-snap-align: start`,
  `scroll-snap-stop: always`, surface background per variant. No GSAP, no JS scroll
  hooks — pure layout. Provides a React context exposing its DOM node so descendants
  (`<Animate>`, `<Stagger>`) can scope their IntersectionObserver to it.

**Delete:**
- `components/sticky-section.tsx`
- `components/lenis-provider.tsx`

**Update:**
- `app/[locale]/layout.tsx` — remove `<LenisProvider>` wrapper.
- `app/[locale]/page.tsx` — replace every `<StickySection>` with `<SnapSection>`. Drop
  the `zIndex` ladder (no longer needed without sticky stacking). Hero becomes
  `<SnapSection variant="base" id="hero" triggerOnMount>` wrapping the existing markup.
- `app/[locale]/globals.css` — `html { scroll-snap-type: y mandatory; scroll-behavior: smooth; }`.
- `components/header.tsx` — replace the scroll-delta hide/reveal logic with a simpler
  model (header stays visible during snap traversal). Revisit if it feels heavy at the
  end of the phase.

**Watch-outs:**
- iOS Safari + Chrome Android verification before merge — URL-bar collapse with
  `100dvh`, snap behaviour on fast wheel/swipe, no horizontal scroll bleed.
- `prefers-reduced-motion`: scroll-snap stays on (it's layout, not animation), but the
  rest of the page must still respect the media query.

**Done when:** all 9 sections render at exactly viewport height, swipe/wheel snaps
cleanly between them, no Lenis or sticky behaviour remains.

### Phase 3b — Animation primitives ✓ COMPLETE

**Goal:** replace `<ScrollReveal>` with `<Animate>` + `<Stagger>`. Hero gets its
entrance animations wired.

**Create:**
- `components/animate.tsx` — `<Animate type delay duration>`. `type` matches DS
  vocabulary: `fade-up`, `fade-in`, `scale-in`, `slide-left`, `slide-right`, `draw-w`,
  `hero-in`. Internally: GSAP `fromTo` + CustomEase `"entry"`, triggered by an
  `IntersectionObserver(threshold: 0.95)` scoped via React context to its nearest
  `<SnapSection>` ancestor. Resets to `from` state on leave so replays work on
  re-entry. Respects `prefers-reduced-motion` (skips tween, sets final state
  immediately).
- `components/stagger.tsx` — `<Stagger gap type>`. Wraps N children, applies the same
  per-element entrance with `gap` ms between them. Same observer, same reset.

**Delete:**
- `components/scroll-reveal.tsx`

**Update:**
- `app/[locale]/page.tsx` — replace `<ScrollReveal>` usage in Origin, Features (card
  grid uses `<Stagger>`), Manifest, FAQ header, Team header, CTA.
- `components/hero.tsx` — wrap the eyebrow, headline, lede, and CTA group in
  `<Animate>` components with the timing math from `motion.md` §4. The parent
  `<SnapSection triggerOnMount>` is what fires them.

**Watch-outs:**
- `<Animate>` finds its nearest `<SnapSection>` ancestor via context — do not
  hard-code a ref-passing API.
- Timing math (`next.delay = previous.delay + previous.duration + breath`) is in
  `motion.md` §4 — use the breath values from that table when sequencing.
- Hero is not a special case — it's a `<SnapSection triggerOnMount>` so the same
  `<Animate>` instances fire on mount instead of waiting for an IO intersection.

**Done when:** every section animates in on settle, animations replay on re-entry,
`ScrollReveal` is gone, hero animates on load.

### Phase 3c — Section ports (off Framer Motion) ✓ COMPLETE

Three independent PRs, can ship in any order. Each removes one of the three remaining
`motion` consumers.

**3c.1 — FAQ (`components/faq-section.tsx`)**
- `+` → `×` icon rotation becomes a CSS class toggle (`.is-open { transform: rotate(45deg); }`)
  with a `transition` — no JS animation.
- Answer panel stays mounted at all times. Wrap the answer in a `grid` container with
  `grid-template-rows: 0fr` (closed) ↔ `1fr` (open); GSAP tweens the row between the
  two values. No `AnimatePresence`, no measurement, content reflows naturally.
- Answer copy is constrained so it always fits the viewport — no internal scroll.
- `useReducedMotion` replaced with a check against the same media query in a tiny
  helper.

**3c.2 — Team (`components/team-section.tsx`)**
- Desktop 5-column grid wraps the items in `<Stagger gap={150} type="scale-in">`.
- Mobile Embla carousel: same `<Stagger gap={150} type="scale-in">` wraps the slides.
  Stagger's rendered wrapper `<div>` becomes Embla's auto-detected container (it's
  the first child of the viewport element). Stagger only animates `opacity` and
  `scale`, which don't affect `offsetWidth`, so Embla's slide measurements stay
  accurate. One primitive, two layouts — cleaner than per-slide GSAP boilerplate.
- Both variants use a 750ms delay (header `<Animate>` settles at 550ms + 200ms breath).

**3c.3 — Testimonials (`components/testimonials-section.tsx`)** — full redesign
- Polaroid cards stacked in the same position (absolute), varying scale + rotation +
  z-index. Active card front, scale 1.0, ~0° rotation. Back stack: lower z, smaller
  scale, more tilt.
- Pulsing hint label below the deck appears on snap-settle, fades after first tap.
- Tap on active card → GSAP timeline: front card translates up + rotates + fades out,
  back stack tweens forward one slot. Loops — last card cycles back to first.
- Behaviour is identical on mobile and desktop. No `whileHover`, no `whileTap`, no
  `whileInView`. The old desktop hover-lift is removed.
- Hint copy lives in `messages/{locale}.json` — placeholder string for all 3 locales,
  refined in Phase 4.

**Done when:** none of the three sections import from `motion` / `motion/react`.

### Phase 3d — Cleanup ✓ COMPLETE

- `package.json` — remove `lenis` and `motion` dependencies.
- `pnpm-lock.yaml` — refresh via `pnpm install`.
- Audit for stale comments referencing Lenis, sticky-stacking, `StickySection`,
  `ScrollReveal`, or Framer Motion. Update or remove.
- Verify build, lint, type-check are green.

**Done when:** no orphan code, no stale references, dependencies match what the site
actually uses.

---

## Phase 4 — Visual Shell + Content-Fit Fixes

Apply DS visuals to layout primitives, and resolve the sections whose content does not
fit one mobile viewport.

**Visual shell:**
- `components/header.tsx`, `components/footer.tsx` — surfaces, type classes, accent
  colours via DS tokens.
- `components/button.tsx`, `components/card.tsx` — finalize against DS recipes.
- Glass classes (`.glass`, `.glass--gradient`) applied to designated focal elements
  only: case-study pull quote, manifest video frame border, CTA price block. Not as
  wallpaper.
- Ambient radial gradient (`--grad-ambient`) applied at the page level for atmosphere.

**Content-fit fixes:**
- Features section on mobile — convert the 3-card stack into a horizontal swipeable
  Embla carousel (one card per slide, dot indicators). Desktop keeps the 3-up grid.
- Manifest section on mobile — leaner layout, video remains the focal element.
  Specific layout determined during Phase 4 based on the latest copy.
- Testimonials hint copy — refine generic placeholders into final copy across
  `de` / `es` / `en`.

**Watch-outs:**
- Glass is not wallpaper — only on focal elements.
- Gold does not fill — max one gold word per headline; hairlines and numerals only.
- No hover micro-animations on content cards (DS guardrail — buttons only, ≤ 200ms).

---

## Phase 5 — Sections Polish + Real Content

Build out final copy, real assets, and remaining sections not yet at shipping quality.

**Watch-outs:**
- Copy lives in `messages/{locale}.json` — all three locales (`de`, `es`, `en`) must
  stay in sync.
- `VideoLoop src=""` is a placeholder — real footage needed before Manifest is
  shippable.
- Sequencing within each section follows DS timing math:
  `next.delay = previous.delay + previous.duration + breath` (see `motion.md` §4).
