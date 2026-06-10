# Typography

> **Source of truth: `app/[locale]/globals.css`.** Type lives in `@layer components` as
> `.type-*` classes (the `type-` prefix avoids colliding with the `<Hero>` component name).
> Inter is loaded via `next/font/google` in `layout.tsx` and exposed as `--font-inter-var`.

> **Playfair Display exception:** Playfair Display is permitted exactly once on the entire site —
> the "Weniger Chaos" accent span inside the hero headline (`font-playfair italic font-normal`,
> loaded at weight 400 only). Every other use of type on the site is Inter.

## Type ladder

Each row is a `.type-*` class. Sizes are fluid `clamp(min, vw, max)`.

| Class                | Size                                   | Weight     | Leading | Tracking | Use                                                                  |
| -------------------- | -------------------------------------- | ---------- | ------- | -------- | -------------------------------------------------------------------- |
| `.type-hero`         | `clamp(5rem, 16vw, 14rem)` 80→224      | 200 (thin) | 0.92    | -0.05em  | Giant numerals / single-word reveals — gradient-clipped              |
| `.type-display-hero` | `clamp(3rem, 9vw, 7rem)` 48→112        | 600 (bold) | 1.0     | -0.04em  | Hero headline only (bigger than display)                             |
| `.type-display`      | `clamp(3rem, 8vw, 6rem)` 48→96         | 600 (bold) | 1.0     | -0.04em  | Section headlines (`<SectionHeader>`)                                |
| `.type-sub-display`  | `clamp(2rem, 4vw, 3rem)` 32→48         | 600 (bold) | 1.1     | -0.025em | Sub-section titles, strikethrough negations                          |
| `.type-lede`         | `clamp(1.125rem, 1.6vw, 1.5rem)` 18→24 | 400        | 1.35    | -0.015em | Section subtitles (ships `color: text-secondary`, `max-width: 38ch`) |
| `.type-body`         | 19px                                   | 400        | 1.55    | -0.01em  | Long-form prose (ships `text-secondary`, `max-width: 62ch`)          |
| `.type-body-strong`  | 19px                                   | 600        | 1.55    | -0.01em  | Inline emphasis                                                      |
| `.type-eyebrow`      | 12px                                   | 600        | 1.0     | +0.14em  | Section label — always UPPERCASE                                     |
| `.type-caption`      | 13px                                   | 400        | 1.4     | —        | Footnotes, fine print (ships `text-tertiary`)                        |

**`.type-hero` vs `.type-display-hero`:** `type-hero` is the thin-weight giant-numeral
slot (available, used for KPI moments). The hero _headline_ uses `type-display-hero` —
same weight/leading/tracking as `display`, just a larger fluid ceiling.

**Color baked in:** `.type-lede`, `.type-body`, `.type-caption` ship with a default text
color. Type classes live in `@layer components`, so a Tailwind `text-*` utility layered on
top overrides it when needed.

**Italics:** only for inline body emphasis (and the Playfair accent). Never on display,
hero, or eyebrow.

**Max line length:** 38ch on lede, 62ch on body (baked into the classes). Keep paragraphs
narrow — wide blocks of text break the cinematic feel.

---

## Rules that don't bend

- **Three weights only.** `--weight-thin: 200`, `--weight-regular: 400`,
  `--weight-bold: 600`. **`--weight-bold` is 600 (semibold), never 700.** Do not use
  Tailwind's `font-bold` (700) anywhere — reach for a `.type-*` class or `font-semibold`.
- **`font-feature-settings: "cv11", "ss03"`** is set on `body` — keep it for Inter's
  alternate glyphs.

## CSS tokens (`@theme`)

```css
@theme {
  /* Font stack — Inter (via next/font) → SF Pro → system */
  --font-sans:
    var(--font-inter-var), "SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui,
    sans-serif;
  --font-features: "cv11", "ss03";
  --font-playfair: var(--font-playfair-var); /* hero accent only */

  --weight-thin: 200;
  --weight-regular: 400;
  --weight-bold: 600;

  /* Fluid sizes */
  --type-hero: clamp(5rem, 16vw, 14rem); /* 80 → 224 */
  --type-display-hero: clamp(3rem, 9vw, 7rem); /* 48 → 112 — hero headline */
  --type-display: clamp(3rem, 8vw, 6rem); /* 48 → 96  */
  --type-sub: clamp(2rem, 4vw, 3rem); /* 32 → 48  */
  --type-lede: clamp(1.125rem, 1.6vw, 1.5rem); /* 18 → 24 */
  --type-body: 1.1875rem; /* 19px */
  --type-eyebrow: 0.75rem; /* 12px */
  --type-caption: 0.8125rem; /* 13px */

  /* Leading */
  --leading-hero: 0.92;
  --leading-display: 1;
  --leading-sub: 1.1;
  --leading-lede: 1.35;
  --leading-body: 1.55;

  /* Tracking */
  --track-hero: -0.05em;
  --track-display: -0.04em;
  --track-sub: -0.025em;
  --track-lede: -0.015em;
  --track-body: -0.01em;
  --track-eyebrow: 0.14em;
}
```

## Type classes (`@layer components`)

Defined in `@layer components` so Tailwind utilities (e.g. `text-text-primary`) can
override the baked-in color. `type-display-hero` mirrors `type-display` at a larger
ceiling; `type-hero` is the thin giant-numeral slot.

```css
.type-hero {
  font-size: var(--type-hero);
  font-weight: var(--weight-thin);
  line-height: var(--leading-hero);
  letter-spacing: var(--track-hero);
  margin: 0;
}
.type-display-hero {
  font-size: var(--type-display-hero);
  font-weight: var(--weight-bold);
  line-height: var(--leading-display);
  letter-spacing: var(--track-display);
  margin: 0;
}
.type-display {
  font-size: var(--type-display);
  font-weight: var(--weight-bold);
  line-height: var(--leading-display);
  letter-spacing: var(--track-display);
  margin: 0;
}
.type-sub-display {
  font-size: var(--type-sub);
  font-weight: var(--weight-bold);
  line-height: var(--leading-sub);
  letter-spacing: var(--track-sub);
  margin: 0;
}
.type-lede {
  font-size: var(--type-lede);
  font-weight: var(--weight-regular);
  line-height: var(--leading-lede);
  letter-spacing: var(--track-lede);
  color: var(--color-text-secondary);
  max-width: 38ch;
  margin: 0;
}
.type-body {
  font-size: var(--type-body);
  font-weight: var(--weight-regular);
  line-height: var(--leading-body);
  letter-spacing: var(--track-body);
  color: var(--color-text-secondary);
  max-width: 62ch;
  margin: 0;
}
.type-body-strong {
  font-size: var(--type-body);
  font-weight: var(--weight-bold);
  line-height: var(--leading-body);
  letter-spacing: var(--track-body);
  margin: 0;
}
.type-eyebrow {
  font-size: var(--type-eyebrow);
  font-weight: var(--weight-bold);
  line-height: 1;
  letter-spacing: var(--track-eyebrow);
  text-transform: uppercase;
}
.type-caption {
  font-size: var(--type-caption);
  font-weight: var(--weight-regular);
  line-height: 1.4;
  color: var(--color-text-tertiary);
  margin: 0;
}
```
