# CSS tokens

> **Source of truth: `app/[locale]/globals.css`.** This repo uses Tailwind v4's
> CSS-first `@theme` — there is no `tailwind.config.js`. Every `--color-*` token in
> `@theme` automatically generates the matching utilities (`--color-surface-alt` →
> `bg-surface-alt`, `text-surface-alt`, `border-surface-alt`, …). The block below mirrors
> `globals.css`; if they ever disagree, the CSS wins.

## `@theme` — colors

```css
@theme {
  /* Foundation — true black + anthracite. Section rhythm alternates base ↔ alt;
     raised/hover are lighter fills for cards, glass tints, and hover states.
     surface-base IS the true-black canvas — the brand stage is #000, not near-black. */
  --color-bg: #000000;
  --color-surface-base: #000000;
  --color-surface-alt: #1e1e1e;
  --color-surface-raised: #292929;
  --color-surface-hover: #333333;
  --color-surface-elevated: #333333; /* legacy alias of surface-hover */
  --color-border: #383838;
  --color-border-subtle: #383838; /* legacy alias of border */

  /* Text tiers */
  --color-text-primary: #ffffff;
  --color-text-secondary: #a3a3a3;
  --color-text-tertiary: #6b6b6b;

  /* Gold (primary accent) — gold-400 is the everyday UI gold */
  --color-gold-200: #fce49b;
  --color-gold-400: #e8b73d;
  --color-gold-500: #c8941a;
  --color-gold-600: #9c7314;
  --color-gold-800: #5c420a;
  --color-on-gold: #2b1e08;

  /* Purple (secondary accent) */
  --color-purple-200: #d9cbef;
  --color-purple-400: #cbb5ef;
  --color-purple-500: #bba6e8;
  --color-purple-600: #9d88c9;
  --color-on-purple: #231a33;

  /* Categorical label tints */
  --color-label-blue: #6b8cbe;
  --color-label-green: #5fb082;
  --color-label-red: #b85450;
  --color-label-terra: #b57236;

  /* Polaroid testimonial cards — the one deliberately light surface */
  --color-polaroid: #fafafa;
  --color-polaroid-text: #1a1a1a;
  --color-polaroid-text-secondary: #555555;
}
```

## `@theme` — composed recipes

```css
@theme {
  /* Glass fill + border. --glass-tint here is a DEFAULT; PageSection overrides it
     per section (see "per-section cascade" below) so the tint inverts against the bg. */
  --glass-tint: color-mix(in oklch, var(--color-surface-raised) 65%, transparent);
  --glass-border-gold: 1px solid color-mix(in oklch, var(--color-gold-500) 15%, transparent);

  /* Brand gradient — gold-dominant, traveling into purple */
  --grad-brand: linear-gradient(
    135deg,
    var(--color-gold-500) 0%,
    var(--color-gold-400) 35%,
    var(--color-purple-500) 100%
  );
  --grad-ambient: radial-gradient(
    ellipse at 15% 10%,
    color-mix(in oklch, var(--color-gold-500) 12%, transparent) 0%,
    transparent 55%
  );
  /* Purple counter-bloom — "new act" wash, dimmer than gold. Applied via
     <PageSection ambient="purple"> (gold bloom: ambient="gold"). */
  --grad-ambient-purple: radial-gradient(
    ellipse at 85% 12%,
    color-mix(in oklch, var(--color-purple-500) 9%, transparent) 0%,
    transparent 55%
  );

  /* Shape — the two-radius vocabulary: cards 18px (`rounded-card`), pills 999px. */
  --radius-card: 18px;

  /* Surface-aware card/box elevation. A drop shadow is invisible on true black, so
     depth is split by surface: light = top highlight rim (for black sections),
     dark = real drop shadow (for anthracite). PageSection picks one per variant. */
  --shadow-card-light:
    inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 1px 1px rgba(0, 0, 0, 0.5),
    0 12px 28px -10px rgba(0, 0, 0, 0.7);
  --shadow-card-dark:
    inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 4px rgba(0, 0, 0, 0.3),
    0 14px 30px -8px rgba(0, 0, 0, 0.55);
}
```

## Per-section cascade — the key mechanism

`<PageSection variant>` sets three CSS variables inline on each `<section>`, so any
descendant automatically gets values tuned for _that_ section's background. This is why
glass and depth "just work" without per-element guessing:

| Variable                | `base` (true black)        | `alt` (anthracite)        | Purpose                                        |
| ----------------------- | -------------------------- | ------------------------- | ---------------------------------------------- |
| `--glass-tint`          | `rgba(30,30,30,0.9)`       | `rgba(0,0,0,0.9)`         | `.glass` fill — inverts to contrast with bg    |
| `--glass-gradient-fill` | `#1e1e1e`                  | `#000000`                 | `.glass--gradient` inner fill (padding-box)    |
| `--shadow-card`         | `var(--shadow-card-light)` | `var(--shadow-card-dark)` | elevation recipe for `.elevated` / plain glass |

`<PageSection>` also accepts `ambient="gold" | "purple"` — an absolute, pointer-inert
bloom layer using `--grad-ambient(-purple)`. In use: hero (gold), Origin (purple).
Keep blooms rare; they are atmosphere, not decoration.

(There is also a `raised` variant, defined but unused by the live page; it mirrors `alt`.)

## Component classes (in `@layer components`)

```css
.glass {
  padding: 1.75rem 2rem;
  background: var(--glass-tint);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border-radius: var(--radius-card);
  border: var(--glass-border-gold);
  max-width: 38rem;
}

/* Gradient-bordered glass: brand gradient painted on border-box, solid fill on
   padding-box. This is the apex highlight — its border IS its depth. */
.glass--gradient {
  border: 1px solid transparent;
  background:
    linear-gradient(
        var(--glass-gradient-fill, var(--color-surface-base)),
        var(--glass-gradient-fill, var(--color-surface-base))
      )
      padding-box,
    var(--grad-brand) border-box;
  backdrop-filter: none;
}

/* Opt-in depth for non-glass cards/boxes; reads the cascaded --shadow-card. Plain
   .glass gets it too; gradient-glass is excluded (no shadow on the apex highlight). */
.elevated,
.glass:not(.glass--gradient) {
  box-shadow: var(--shadow-card, none);
}
```

**Usage rule:** glass and `.elevated` are both applied _selectively_ — focal elements
and cards, never as wallpaper. See `philosophy.md` (Materials, Depth).
