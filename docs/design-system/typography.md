# Typography

> **Playfair Display exception:** Playfair Display is permitted exactly once on the entire site —
> the "Weniger Chaos" span inside the hero headline. Every other use of type on the site is Inter.

## Type ladder

| Token        | Size                              | Weight       | Line height | Tracking  | Use                                                        |
|--------------|-----------------------------------|--------------|-------------|-----------|-------------------------------------------------------------|
| `hero`       | `clamp(5rem, 16vw, 14rem)` 80→224px | 200 (thin)  | 0.92        | -0.05em   | Giant numerals, percentages, single-word reveals — gradient-clipped |
| `display`    | `clamp(3rem, 8vw, 6rem)` 48→96px  | 600 (bold)   | 1.0         | -0.04em   | Section headlines                                           |
| `sub-display`| `clamp(2rem, 4vw, 3rem)` 32→48px  | 600 (bold)   | 1.1         | -0.025em  | Sub-section titles                                          |
| `lede`       | `clamp(1.125rem, 1.6vw, 1.5rem)` 18→24px | 400 | 1.35        | -0.015em  | Subtitle accompanying the hero                              |
| `body`       | 19px                              | 400          | 1.55        | -0.01em   | Long-form prose (rare on a page)                            |
| `body-strong`| 19px                              | 600          | 1.55        | -0.01em   | Inline emphasis                                             |
| `eyebrow`    | 12px                              | 600          | 1.0         | +0.14em   | Section label / category pill — always UPPERCASE            |
| `caption`    | 13px                              | 400          | 1.4         | 0         | Footnotes, fine print — uses `--text-tertiary`              |

**Italics:** only for inline body emphasis. Never on display, hero, or eyebrow.

**Max line length:** 38ch on lede, 62ch on body. Keep paragraphs narrow — wide blocks of text
break the cinematic feel.

---

## CSS tokens

> **⚠ Phase 2 watch-outs — read before implementing in `globals.css`:**
>
> - **Font loading:** The font stack below references `'Inter'` by name. In Next.js, load it via
>   `next/font/google` in `layout.tsx` — do NOT use the `rsms.me` CDN link from the source DS.
> - **`.hero` class name:** May cause semantic confusion with the `<Hero>` React component.
>   Decide in Phase 2 whether to keep `.hero` or prefix all type classes as `.type-hero`,
>   `.type-display`, etc. to disambiguate intent.
> - **`--weight-bold` is 600, not 700:** Never reach for Tailwind's `font-bold` utility (700).
>   Always use the custom `--weight-bold` token, which maps to semibold (600).

```css
:root {
  /* Font stack — SF Pro on macOS, Inter everywhere else */
  --font-sans: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont,
    system-ui, sans-serif;
  --font-features: 'cv11', 'ss03';

  --weight-thin:    200;
  --weight-regular: 400;
  --weight-bold:    600;

  /* Fluid sizes */
  --type-hero:    clamp(5rem, 16vw, 14rem);
  --type-display: clamp(3rem, 8vw, 6rem);
  --type-sub:     clamp(2rem, 4vw, 3rem);
  --type-lede:    clamp(1.125rem, 1.6vw, 1.5rem);
  --type-body:    1.1875rem;   /* 19px */
  --type-eyebrow: 0.75rem;     /* 12px */
  --type-caption: 0.8125rem;   /* 13px */

  /* Leading */
  --leading-hero:    0.92;
  --leading-display: 1.0;
  --leading-sub:     1.1;
  --leading-lede:    1.35;
  --leading-body:    1.55;

  /* Tracking */
  --track-hero:    -0.05em;
  --track-display: -0.04em;
  --track-sub:     -0.025em;
  --track-lede:    -0.015em;
  --track-body:    -0.01em;
  --track-eyebrow:  0.14em;
}

body {
  font-family: var(--font-sans);
  font-feature-settings: var(--font-features);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.hero {
  font-size: var(--type-hero);
  font-weight: var(--weight-thin);
  line-height: var(--leading-hero);
  letter-spacing: var(--track-hero);
  margin: 0;
}
.display {
  font-size: var(--type-display);
  font-weight: var(--weight-bold);
  line-height: var(--leading-display);
  letter-spacing: var(--track-display);
  margin: 0;
}
.sub-display {
  font-size: var(--type-sub);
  font-weight: var(--weight-bold);
  line-height: var(--leading-sub);
  letter-spacing: var(--track-sub);
  margin: 0;
}
.lede {
  font-size: var(--type-lede);
  font-weight: var(--weight-regular);
  line-height: var(--leading-lede);
  letter-spacing: var(--track-lede);
  color: var(--text-secondary);
  max-width: 38ch;
  margin: 0;
}
.body {
  font-size: var(--type-body);
  font-weight: var(--weight-regular);
  line-height: var(--leading-body);
  letter-spacing: var(--track-body);
  max-width: 62ch;
  color: var(--text-secondary);
  margin: 0;
}
.eyebrow {
  font-size: var(--type-eyebrow);
  font-weight: var(--weight-bold);
  line-height: 1;
  letter-spacing: var(--track-eyebrow);
  text-transform: uppercase;
}
.caption {
  font-size: var(--type-caption);
  font-weight: var(--weight-regular);
  line-height: 1.4;
  color: var(--text-tertiary);
  margin: 0;
}
```
