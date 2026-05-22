# TODA Website — Design System

This directory is the single source of truth for the visual and motion language of the
TODA marketing website. Each file is a focused reference doc — adapted from the master
design system in `toda-tech-skills/design-system/` and tailored to this repo's stack
(Next.js 15, Tailwind v4, GSAP, React).

**These are reference docs, not implementation files.** Code lives in `globals.css`,
`components/`, and the `<Animate>` component. When something here conflicts with the
code, the code wins — and this doc should be updated to match.

---

## Files

| File | What it covers |
|---|---|
| `philosophy.md` | The overall feeling, materials, color rules, typography principles, motion principles, and design guardrails. Read this first — it explains the *why* behind every other decision. |
| `hex-tables.md` | Raw color hex values for every token: surfaces, text tiers, gold, purple, labels. The authoritative color reference. |
| `css-tokens.md` | CSS custom properties for color, glass recipes, and composed gradients. Includes a surface naming note — read before touching `globals.css`. |
| `typography.md` | Type scale (8 tokens), fluid sizes, weight rules, spacing, and CSS class definitions. Includes Phase 2 watch-outs for font loading and class naming. |
| `motion.md` | Easing curves, duration tokens, distance tokens, animation primitives, sequencing math, and the GSAP implementation strategy. Includes the `hero-in` hybrid approach. |

## Reading order

**For orientation:** `philosophy.md` → `hex-tables.md`

**Before touching `globals.css`:** `css-tokens.md` → `typography.md` → `motion.md` (tokens section)

**Before building the `<Animate>` component:** `motion.md` in full

**Before designing any section:** `philosophy.md` → `motion.md` (sequencing principles)
