# TODA Design System

The single source of truth for the visual and motion language of TODA marketing surfaces.
This directory is **self-contained on purpose**: hand it to a coding agent along with a
description of what you want ("a campaign landing page for X", "a pricing page", "a waitlist
page"), and it has everything needed to build that page in the TODA style — exactly as the
homepage looks and feels today.

When a claim here ever disagrees with the code, **the code wins** (`globals.css` and the
`components/` primitives are authoritative) — and the doc should be corrected to match.

---

## Stack this system assumes

Next.js 15 (App Router) · React 19 · TypeScript · **Tailwind CSS v4** (CSS-first `@theme`,
no `tailwind.config.js`) · **GSAP** + CustomEase for entrances · next-intl (de/es/en) ·
Embla Carousel · pnpm. If you're building inside this repo, the primitives below already
exist in `components/`. If you're starting a fresh project, recreate them from these docs.

---

## Files (read in this order)

1. **`philosophy.md`** — the feeling and the _why_. Materials (black · glass · anthracite),
   surface-aware depth, gold/purple color discipline, typography principles, motion
   principles, the overall "dark gallery" mood. Read this first.
2. **`hex-tables.md`** — every color hex, mirroring `globals.css @theme`. The authoritative
   color reference.
3. **`css-tokens.md`** — the full `@theme` (colors, glass, gradients, elevation), the
   per-section cascade mechanism, and the component classes (`.glass`, `.glass--gradient`,
   `.elevated`).
4. **`typography.md`** — the `.type-*` ladder, fluid sizes, the three-weight rule.
5. **`motion.md`** — entrance primitives (`<Animate>` / `<RevealGroup>`), the fire-once
   trigger model, and the two deliberate timelines (Origin, StrikethroughList).

---

## The non-negotiables (what makes it TODA)

- **True black canvas.** Atmosphere is `#000`; sections are near-black `surface-base`
  (`#0a0a0a`) or anthracite `surface-alt` (`#1e1e1e`). Never a light surface (the polaroid
  testimonial card is the one deliberate exception).
- **Two-surface section rhythm.** Sections alternate `base ↔ alt` down the page, starting on
  base. `raised`/`hover` are fills for cards/glass, not section backgrounds.
- **Gold like jewelry, purple as the counter-melody.** Gold = "this is TODA" (one word, a
  number, a hairline — never a phrase). Purple = "new / forward / outcome". Both stay
  restrained; bright fills shatter the cinematic palette.
- **Three weights only — 200 / 400 / 600.** `--weight-bold` is **600, never 700**; never use
  Tailwind `font-bold`. Playfair Display appears exactly once (the hero accent span).
- **Glass selectively.** Glass is for focal elements (the gold→purple `.glass--gradient`
  border is the apex highlight). If everything is glass, nothing is.
- **Depth selectively, surface-aware.** Non-glass cards/boxes get `.elevated`: a light
  top-rim on black sections, a real dark drop shadow on anthracite. Gradient-glass never gets
  a shadow. Flat things stay flat — restraint is the point.
- **Motion: reveal-on-arrival, fire once.** Per-element entrances fire as you scroll to them
  and stay (no replay). One ease (`cubic-bezier(0.16,1,0.3,1)`), no bounce/spring. Pre-timed
  cascades only inside a deliberate timeline (Origin / StrikethroughList).
- **Spacing via fluid tokens, not raw values.** Use the `--spacing-*` tiers — `py-section`,
  `mb-block`, `gap-group`, `mt-element` — so gaps compress on mobile and breathe on desktop.
  Mobile is the priority surface; desktop follows.
- **All copy via next-intl.** No hardcoded strings in components — everything reads from
  `messages/{locale}.json`. Import `Link`/`useRouter` from `@/i18n/navigation`, never
  `next/navigation`.

> ⚠ **Tailwind v4 scanner caveat:** never glue a class directly before a `${...}` in a
> `className` template literal — the scanner silently drops it. Always put a space:
> `` `py-section ${cond ? "x" : ""}` ``, never `` `py-section${...}` ``.

---

## Building blocks (the primitives)

| Primitive                                                   | Contract                                                                                                                                                                                                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<PageSection variant id triggerOnMount? align? backdrop?>` | Layout primitive. `min-h-svh`, surface background, `py-section` padding, max-w container. Cascades `--glass-tint`, `--glass-gradient-fill`, `--shadow-card` per variant so glass + depth auto-adapt. Provides the `triggerOnMount` context. |
| `<SectionHeader label headline lede? className?>`           | The repeated eyebrow → headline (→ lede) block. Owns the `max-w-2xl` measure and internal rhythm.                                                                                                                                           |
| `<Animate type delay? duration? className?>`                | Single-element entrance. Fires once on scroll-in (or on mount under `triggerOnMount`).                                                                                                                                                      |
| `<RevealGroup type className?>`                             | Same trigger model for N children; each reveals on its own entry, no inter-child delay.                                                                                                                                                     |
| `.glass` / `.glass--gradient`                               | Focal surfaces. Gradient variant = apex highlight (gold→purple border).                                                                                                                                                                     |
| `.elevated`                                                 | Opt-in surface-aware depth for non-glass cards/boxes.                                                                                                                                                                                       |

## Recipe — a new TODA-style page

1. Compose sections as `<PageSection variant>` tiles, alternating `base`/`alt`. Above-the-fold
   hero gets `triggerOnMount align="center"`.
2. Open each section with `<SectionHeader>`. Lay copy/media inside with `--spacing-*` tokens.
3. Wrap entrances in `<Animate>` / `<RevealGroup>` (`fade-up` is the default).
4. Reach for gold/purple as accents only; glass + `.elevated` only on focal/card elements.
5. Put all copy in `messages/{locale}.json`; wire i18n nav from `@/i18n/navigation`.
6. If a section must _narrate_ (a built sequence), give it its own GSAP timeline — don't chain
   `<Animate>` delays.
