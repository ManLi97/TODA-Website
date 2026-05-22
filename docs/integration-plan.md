# TODA Website — Design System Integration Plan

Phases run sequentially. Each phase ends with a review gate before the next begins.
Source of truth for the design system: `toda-tech-skills/design-system/` (read-only reference).

---

## Phase 1 — Reconstruct Design System Reference ✓ COMPLETE

Derived from `toda-tech-skills/design-system/`, adapted per-file to this stack. Each file
was reviewed, adjusted where needed, and annotated with implementation watch-outs.

**Output:** `docs/design-system/` — five focused files + README:
- `philosophy.md` — adapted (scroll model guardrail rewritten for sticky-stack architecture)
- `hex-tables.md` — adopted as-is
- `css-tokens.md` — adopted as-is, surface naming note added
- `typography.md` — adapted (3 copy fixes, Playfair note, 3 Phase 2 watch-outs added)
- `motion.md` — adapted (vanilla JS engine replaced with GSAP/React strategy, hero-in documented)

**Key decisions locked:**
- Surface names: `surface-base` (#141414), `surface-alt` (#121212), `surface-raised` (#292929)
- Playfair Display: "Weniger Chaos" hero span only — one occurrence, nowhere else
- Framer Motion (`motion` package) is removed in Phase 3, but only after each section's `motion` logic is ported to GSAP / native React — replacing `ScrollReveal` (already pure GSAP) with `<Animate>` does **not** by itself remove the dependency
- `hero-in` shimmer: hybrid approach — GSAP entrance, CSS perpetual loop via `onComplete`

---

## Phase 2 — CSS Tokens

Migrate all design tokens into `globals.css` (`@theme` block). Replace all hardcoded values in
components with token-based classes.

**Covers:**
- Color: surfaces, text tiers, gold scale, purple scale, label tints, gradients, glass recipe
- Motion: ease curve (`cubic-bezier(0.16,1,0.3,1)`), duration tokens, distance tokens
- Typography: Inter font stack, fluid `clamp()` sizes, weight scale, leading, tracking

**Watch-outs:**
- Current code uses hardcoded px sizes (`text-[40px]`, `text-[17px]`) — full replacement, not a tweak
- Tailwind v4 `color-mix()` works natively; DS glass recipe uses it — no polyfill needed
- Don't touch `StickySection` GSAP logic — only the surface/color tokens it reads

---

## Phase 3 — Animation Layer

Unify the animation layer on GSAP and remove the `motion` package. Two distinct workstreams:

1. **Replace `ScrollReveal` with `<Animate>`.** `scroll-reveal.tsx` is already pure GSAP — no
   Framer Motion to strip out, just a thin entrance wrapper. The new `<Animate>` component
   absorbs the same role with the richer DS vocabulary below.
2. **Port the three Framer Motion consumer sections to GSAP / native React.** Until all three
   are migrated, the `motion` dependency cannot be removed.

**Framer Motion footprint to port (Phase 3 scope):**
- `components/faq-section.tsx` — imports `motion`, `AnimatePresence`, `useReducedMotion`.
  Patterns: `motion.span` rotating the `+` icon 45° to × on open; `AnimatePresence` wrapping a
  `motion.div` for the answer fade/`y` slide (`initial`/`animate`/`exit`). Small,
  self-contained interaction; port to a CSS transform on the icon + a GSAP
  open/close tween (or a small height/opacity component).
- `components/testimonials-section.tsx` — imports `motion`, `useReducedMotion`.
  Patterns: header `motion.div` with `whileInView` entrance; mobile carousel slides as
  `motion.div` with mount-time `initial`/`animate` (no `whileInView`, fixes earlier
  snap-back bug); desktop polaroid row as `motion.div` with `whileInView` entrance plus
  `whileHover` (lift + scale + zIndex) and `whileTap` (scale down). Load-bearing — hover
  interaction logic, per-card stagger via `delay: i * 0.12`, and tilt/yOffset math all need
  to survive the port. GSAP timelines + React hover state are the likely replacement.
- `components/team-section.tsx` — imports `motion`, `useReducedMotion`.
  Patterns: mobile carousel slides as `motion.div` with mount-time scale/opacity entrance;
  desktop 5-column grid using `containerVariants` + `itemVariants` for a staggered
  `whileInView` reveal (`staggerChildren: 0.15`). Medium complexity — variant-based
  stagger needs a GSAP timeline equivalent.

**Component API:**
```tsx
<Animate type="fade-up" delay={250} duration={650}>…</Animate>
```
Types match DS vocabulary: `fade-up`, `fade-in`, `scale-in`, `slide-left`, `slide-right`,
`draw-w`, `hero-in`. Powered by GSAP `fromTo` + ScrollTrigger under the hood.

**Watch-outs:**
- `motion` stays in `package.json` until all three sections above are ported — do not delete
  the dependency before then or the build will break
- `StickySection` is untouched — its ScrollTrigger setup is separate and must stay exactly as-is
- Animations should reset on section exit so they replay when the user scrolls back (DS principle)
- `ease: CustomEase.create("entry", "0.16,1,0.3,1")` for exact DS curve; GSAP `power4.out` as fallback
- Preserve `useReducedMotion` parity — the GSAP replacements must short-circuit on
  `prefers-reduced-motion` the same way the current `motion` code does
- Testimonials desktop hover (lift + scale + zIndex elevation) is real interaction value, not
  decoration — keep behaviour identical after the port

---

## Phase 4 — Visual Shell

Apply DS visuals to layout primitives: `StickySection`, `Header`, `Footer`, `Button`, `Card`.
Introduce glass components and ambient gradient.

**Covers:** surface backgrounds, type classes, glass variants, gold/purple accents, ambient radial
gradient, label pills.

**Watch-outs:**
- Glass is not wallpaper — only on focal elements (hero card, featured stat, pull quote)
- Gold does not fill — max one gold word per headline; hairlines and numerals only
- No hover micro-animations on content cards (DS guardrail — buttons only, ≤ 200ms)

---

## Phase 5 — Sections Build-out

Build all 9 sections with real content, finalized copy, and DS components.

**Sections in order:** Hero → Case Study → Origin → Features → Manifest → Testimonials → FAQ →
Team → CTA

**Watch-outs:**
- Copy lives in `messages/{locale}.json` — all three locales (de, es, en) must stay in sync
- `VideoLoop src=""` is a placeholder — real footage needed before Manifest section is shippable
- Hero sets the visual tone — build it first, treat it as the design reference for the rest
- Sequencing within each section follows DS timing math:
  `next.delay = previous.delay + previous.duration + breath`
