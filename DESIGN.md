---
version: 1.0
name: TODA Solutions
description: A dark editorial interface that turns a SaaS product into a premium studio experience. Deep Anthrazit surfaces stack edge-to-edge, lit by a restrained Gold accent that appears only on primary actions and emotional statements. Inter headlines carry negative letter-spacing for authority; Playfair Display Italic appears for maximum 4 words of emotional resonance in gold-500. The UI recedes — no decorative gradients, no colored icons, no stock photography — so the studio's work can speak.

colors:
  # Anthrazit scale — surfaces
  surface-base: "#000000"
  surface-raised: "#0A0A0A"
  surface-alt: "#141414"
  surface-elevated: "#1D1D1D"
  border-subtle: "#262626"
  text-primary: "#FFFFFF"
  text-secondary: "#A3A3A3"
  text-tertiary: "#6B6B6B"
  # Gold scale — accent
  gold-50: "#FFF8E5"
  gold-200: "#FCE49B"
  gold-400: "#E8B73D"
  gold-500: "#C8941A"
  gold-600: "#9C7314"
  gold-800: "#5C420A"

typography:
  hero-display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.07
    letterSpacing: -0.5px
  display-lg:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.3px
  display-md:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 28px
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: 0
  tagline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 21px
    fontWeight: 600
    lineHeight: 1.19
    letterSpacing: 0.1px
  body-strong:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.47
    letterSpacing: -0.2px
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.47
    letterSpacing: -0.2px
  caption:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: -0.1px
  caption-strong:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.29
    letterSpacing: -0.1px
  button-primary:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: 0
  fine-print:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: -0.05px
  nav-link:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: 0
  playfair-accent:
    fontFamily: "Playfair Display, Georgia, serif"
    fontStyle: italic
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0
    color: "{colors.gold-500}"
    constraint: "Emotional statements only — max 2–4 words, always in gold-500"

rounded:
  none: 0px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  pill: 980px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 80px

components:
  button-primary:
    backgroundColor: "{colors.gold-500}"
    textColor: "{colors.surface-base}"
    typography: "{typography.button-primary}"
    rounded: "{rounded.pill}"
    padding: 12px 28px
  button-primary-active:
    backgroundColor: "{colors.gold-400}"
    textColor: "{colors.surface-base}"
    rounded: "{rounded.pill}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.border-subtle}"
    typography: "{typography.button-primary}"
    rounded: "{rounded.pill}"
    padding: 12px 28px
  text-link:
    backgroundColor: transparent
    textColor: "{colors.gold-500}"
    typography: "{typography.body}"
  global-nav:
    backgroundColor: "{colors.surface-base}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.nav-link}"
    borderBottom: "1px solid {colors.border-subtle}"
    height: 56px
  surface-tile-base:
    backgroundColor: "{colors.surface-base}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.none}"
    padding: "{spacing.section}"
  surface-tile-raised:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.none}"
    padding: "{spacing.section}"
  surface-tile-alt:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.none}"
    padding: "{spacing.section}"
  card-elevated:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.border-subtle}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  footer:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.fine-print}"
    padding: 64px
---

## Overview

TODA Solutions' web presence is a **dark editorial gallery framed by near-invisible UI**. Every page is a stack of edge-to-edge Anthrazit surface tiles — alternating between `{colors.surface-base}`, `{colors.surface-raised}`, and `{colors.surface-alt}` — each centered on an Inter headline, a sub-copy line, and a single Gold pill CTA. Nothing competes with the content. The single accent is Gold (`{colors.gold-500}`) — it carries every interactive element and every emotional statement. Everything else is Anthrazit.

Density is low. Each section breathes with `{spacing.section}` (80px) of vertical padding. There are no decorative gradients, no icon packs, no card borders with colored shadows. Elevation comes from surface-level changes: `{colors.surface-base}` → `{colors.surface-elevated}` is the only depth cue. Playfair Display Italic is reserved for 2–4 words of emotional resonance, always in `{colors.gold-500}`. It appears sparingly — one or two moments per page at most.

**Key characteristics:**
- Dark-first: the base canvas is `{colors.surface-base}` (#000000), not a bright surface with optional dark mode.
- Single accent (`{colors.gold-500}` — #C8941A) carries every interactive element. No second brand color.
- Alternating Anthrazit tile sections create rhythm without borders or shadows.
- Playfair Display Italic in gold-500 for emotional micro-copy — max 2–4 words, never used for functional text.
- Inter with negative letter-spacing at display sizes for editorial authority.
- Active states: `transform: scale(0.98)` + opacity shift — never hard color changes.
- No Lucide icon packs, no three-card layouts, no stock photos.

## Colors

> **All surfaces are dark.** The system has no light-mode defaults and no "white card" patterns.

### Anthrazit Scale — Surfaces

- **Base** (`{colors.surface-base}` — #000000): The root canvas. Used for full-bleed hero sections and the global nav. True black for maximum contrast with gold.
- **Raised** (`{colors.surface-raised}` — #0A0A0A): The first elevation step. Used for alternating sections and footer. Barely distinguishable from base in bright environments — intentional. The separation reads on high-quality screens.
- **Alt** (`{colors.surface-alt}` — #141414): The second elevation step. Used for content-dense sections, sidebars, feature panels.
- **Elevated** (`{colors.surface-elevated}` — #1D1D1D): Card surfaces, input backgrounds, floating panels. Visible as raised relative to the page background.
- **Border Subtle** (`{colors.border-subtle}` — #262626): All borders, dividers, and hairlines. At this lightness, borders are structural — they define containment — not decorative.

### Anthrazit Scale — Text

- **Text Primary** (`{colors.text-primary}` — #FFFFFF): Headlines, primary body copy, active nav items.
- **Text Secondary** (`{colors.text-secondary}` — #A3A3A3): Supporting copy, sub-headlines on dark surfaces, footer body text, placeholder labels.
- **Text Tertiary** (`{colors.text-tertiary}` — #6B6B6B): Disabled states, fine print, decorative separator text.

### Gold Scale — Accent

- **Gold 50** (`{colors.gold-50}` — #FFF8E5): Background tint for highlighted rows or callout banners. Use sparingly — it interrupts the dark rhythm.
- **Gold 200** (`{colors.gold-200}` — #FCE49B): Hover state text for gold-500 links. Also used for the lightest illustrative accents.
- **Gold 400** (`{colors.gold-400}` — #E8B73D): Button hover state — the button brightens very slightly on hover, never changes hue.
- **Gold 500** (`{colors.gold-500}` — #C8941A): **Primary accent.** Every CTA button, every text link, every Playfair emotional accent. The single interactive color.
- **Gold 600** (`{colors.gold-600}` — #9C7314): Button active/pressed state. Slightly darker than gold-500 for press feedback.
- **Gold 800** (`{colors.gold-800}` — #5C420A): Deep gold for subtle tints, background washes on gold-highlighted cards.

### Brand Gradient
**No decorative gradients.** Atmospheric depth comes from photography (real studio imagery) and surface-level changes. No CSS gradient-based tokens are defined. TODA does not use purple, blue, or multi-color gradients.

## Typography

### Font Families

- **Inter** (Google Fonts variable font): Used for all UI text — headlines, body, captions, buttons, nav. Inter at `font-feature-settings: "cv05", "cv11"` approximates SF Pro's character set. At display sizes, nudge `letter-spacing: -0.3 → -0.5px` for editorial authority.
- **Playfair Display Italic** (Google Fonts, weight 400): Reserved exclusively for emotional statements — max 2–4 words, always rendered in `{colors.gold-500}`. Never used for navigation, buttons, body copy, or anything functional. This is the brand's single emotional voice.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.hero-display}` | 56px | 600 | 1.07 | -0.5px | Hero headline — the editorial first impression |
| `{typography.display-lg}` | 40px | 600 | 1.10 | -0.3px | Section tile headlines |
| `{typography.display-md}` | 28px | 400 | 1.25 | 0 | Sub-headlines, feature descriptions |
| `{typography.tagline}` | 21px | 600 | 1.19 | +0.1px | Sub-section taglines, nav category names |
| `{typography.body-strong}` | 17px | 600 | 1.47 | -0.2px | Inline strong emphasis |
| `{typography.body}` | 17px | 400 | 1.47 | -0.2px | Default paragraph |
| `{typography.caption}` | 14px | 400 | 1.43 | -0.1px | Secondary captions, helper text |
| `{typography.caption-strong}` | 14px | 600 | 1.29 | -0.1px | Emphasized captions, labels |
| `{typography.button-primary}` | 16px | 600 | 1.0 | 0 | CTA button labels |
| `{typography.fine-print}` | 12px | 400 | 1.5 | -0.05px | Legal, fine print, footer detail |
| `{typography.nav-link}` | 14px | 400 | 1.0 | 0 | Global nav menu items |
| `{typography.playfair-accent}` | 24px | 400 italic | 1.2 | 0 | Emotional micro-copy — gold-500 only |

### Principles

- **Negative letter-spacing at display sizes.** Every headline at 21px and above carries a slight tracking tighten (`-0.2 → -0.5px`). This produces editorial authority and distinguishes display from body text.
- **Body copy at 17px, not 16px.** The extra pixel gives a premium reading pace — this is not an SaaS dashboard, it is a considered product.
- **Weight ladder: 400 / 600.** No weight 500. No weight 700 except where emphasis genuinely requires it. Body is always 400; strong is 600; display is 600.
- **Playfair is earned.** It appears once, maybe twice per page. If you're using it for anything functional (nav, buttons, labels), you're using it wrong.
- **Line-height 1.47 for body.** Do not tighten body copy. The editorial leading is part of the premium feel.

## Layout

### Spacing System

- **Base unit:** 8px. Sub-base (4px) used only for inline typographic nudges.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 80px
- **Section vertical padding:** 80px inside a tile; tiles stack edge-to-edge with 0 gap.
- **Card padding:** 24px (`{spacing.lg}`) inside all elevated cards.
- **Button padding:** 12px vertical, 28px horizontal.

### Grid & Container

- **Max content width:** 1200px for text-heavy sections; 1440px for full-bleed tiles; edge-to-edge for hero surfaces.
- **Column patterns:** 3-column feature grids on desktop, 1-column on mobile; single-column centered stack for tile heroes.
- **Gutters:** 24px between cards.

### Whitespace Philosophy

Whitespace is the product's credibility signal. Every tile begins with at least 80px of air above its headline and 64px below. No section is crowded. Dense information (pricing tables, feature lists) uses `{spacing.lg}` (24px) row rhythm to stay legible without feeling rushed.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Full-bleed tiles, global nav, page background |
| Border only | 1px solid `{colors.border-subtle}` | Cards, inputs, dividers |
| Raised surface | Background shifts to `{colors.surface-elevated}` | Card backgrounds, floating panels |
| Subtle shadow | `0 1px 3px rgba(0,0,0,0.4)` | Dropdowns, popovers — minimal |

**Shadow philosophy.** TODA uses almost no box shadows. Elevation is communicated through background-color changes in the Anthrazit scale. If you reach for `box-shadow`, ask first: can a surface color change communicate this instead?

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Full-bleed section tiles (no corner rounding) |
| `{rounded.xs}` | 4px | Inline chips, tags |
| `{rounded.sm}` | 8px | Small UI elements, inputs, compact cards |
| `{rounded.md}` | 12px | Standard cards, modals |
| `{rounded.lg}` | 16px | Feature panels, large cards |
| `{rounded.pill}` | 980px | Primary CTA buttons — the TODA signature action shape |
| `{rounded.full}` | 9999px | Avatar crops, icon-only circular buttons |

## Components

### Global Navigation

**`global-nav`** — Persistent dark bar pinned to top. Background `{colors.surface-base}`, height 56px, 1px solid `{colors.border-subtle}` bottom border. Logo left. Nav links center (desktop) in `{typography.nav-link}` (14px / 400) in `{colors.text-secondary}`. Active link in `{colors.text-primary}`. Right cluster: locale switcher + `{component.button-primary}` (CTA). On mobile (< 768px): hamburger + logo + CTA.

### Buttons

**`button-primary`** — The TODA action. Background `{colors.gold-500}` (#C8941A), text `{colors.surface-base}` in `{typography.button-primary}` (Inter 16px / 600), rounded `{rounded.pill}` (pill — the brand shape), padding 12px × 28px.
- Hover: background `{colors.gold-400}` — slight brightening, never a hue change.
- Active: `transform: scale(0.98)` + background `{colors.gold-600}`.
- Focus: 2px solid `{colors.gold-400}` outline, 2px offset.

**`button-secondary`** — Ghost pill. Background transparent, text `{colors.text-primary}`, border 1px solid `{colors.border-subtle}`, rounded `{rounded.pill}`, padding 12px × 28px.
- Hover: border-color `{colors.text-tertiary}`.
- Active: `transform: scale(0.98)`.

**`text-link`** — Inline body links in `{colors.gold-500}`. No underline by default; underline on hover.

### Surface Tiles

**`surface-tile-base`** — Full-bleed dark tile. Background `{colors.surface-base}` (true black), text `{colors.text-primary}`, padding `{spacing.section}` (80px). Used for hero sections.

**`surface-tile-raised`** — Alternate tile. Background `{colors.surface-raised}` (#0A0A0A). Used for every other section to create rhythm without borders.

**`surface-tile-alt`** — Third-level tile. Background `{colors.surface-alt}` (#141414). Used for feature-dense sections or testimonial regions.

**`card-elevated`** — Floating card. Background `{colors.surface-elevated}` (#1D1D1D), border 1px solid `{colors.border-subtle}`, rounded `{rounded.lg}` (16px), padding `{spacing.lg}` (24px). Used for feature cards, pricing rows, testimonial blocks.

### Footer

**`footer`** — Background `{colors.surface-raised}`, text `{colors.text-secondary}`. Link columns in `{typography.fine-print}` (12px / 400) with relaxed leading. Column headings in `{typography.caption-strong}` (14px / 600) in `{colors.text-primary}`. Vertical padding 64px. Legal row at bottom in `{typography.fine-print}` using `{colors.text-tertiary}`.

## Do's and Don'ts

### Do
- Use `{colors.gold-500}` for every interactive element — CTAs, links, focus rings. The single accent is non-negotiable.
- Set display headlines in `{typography.hero-display}` or `{typography.display-lg}` with negative letter-spacing for editorial authority.
- Run body copy at `{typography.body}` (17px / 400 / 1.47) — not 16px.
- Alternate `{component.surface-tile-base}`, `{component.surface-tile-raised}`, `{component.surface-tile-alt}` for full-bleed section rhythm. The surface color change IS the section divider.
- Reserve `{rounded.pill}` (980px) exclusively for `{component.button-primary}` — it is the brand's action signature.
- Apply `transform: scale(0.98)` as the active/press state on every interactive element.
- Use `{typography.playfair-accent}` in `{colors.gold-500}` sparingly — once or twice per page for maximum 2–4 words of emotional copy.
- Keep `{component.global-nav}` on `{colors.surface-base}` — the nav is the only true black element on most pages.

### Don't
- Don't introduce a second accent color. Every interactive signal is `{colors.gold-500}`.
- Don't use gradients as decorative backgrounds. Depth comes from Anthrazit surface levels and photography.
- Don't set body text at weight 500 — the ladder is 400 / 600. Mid-weight intermediate reads as a mistake.
- Don't use Playfair Display Italic for anything functional: nav links, buttons, labels, body copy. It is an emotional tool, not a functional one.
- Don't round full-bleed section tiles — sections are rectangular and edge-to-edge.
- Don't tighten line-height below 1.47 for body copy — the editorial leading is part of the premium feel.
- Don't use Lucide icon packs as decorative elements in three-card SaaS patterns.
- Don't add `box-shadow` to cards or buttons — use background-color elevation instead.
- Don't use stock photography, robot illustrations, or Lottie animations with excessive movement.
- Don't use purple gradients. Not even once.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | ≤ 640px | Single-column; section padding 40px; hero type scales to 34px |
| Tablet | 641–1023px | 2-column grids; nav collapses to hamburger at 768px; hero type 40px |
| Desktop | 1024–1439px | Full layout; 3-column feature grids; hero type 56px |
| Wide | ≥ 1440px | Content locks at 1440px; margins absorb extra width |

### Touch Targets
- Minimum 44 × 44px for all interactive elements.
- `{component.button-primary}` lands at ~44px height with pill radius making hit area generous.
- Nav links are minimum 44px height on mobile; precision desktop links at 32px are replaced by hamburger below 768px.

### Collapsing Strategy
- **Nav**: full horizontal on desktop → hamburger + logo + CTA below 768px.
- **Section tiles**: section padding 80px → 48px at tablet → 40px at mobile.
- **Feature grids**: 3-col → 2-col at 768px → 1-col at 640px.
- **Hero type**: 56px → 40px at 1024px → 34px at 640px.

## Iteration Guide

1. Reference token keys directly — never inline hex. `{colors.gold-500}`, not `#C8941A`.
2. One new component at a time. Extend by adding a variant entry (e.g. `button-primary-icon`).
3. If a section feels wrong, try swapping the surface tile level before adding chrome.
4. Playfair Italic: if you're considering using it a third time on a page, you're overusing it.
5. Before adding a new color: check if an existing Anthrazit step or Gold step covers the need.
6. The Gold accent at 500 is calibrated against the physical TODA logo — future sessions should re-verify against actual brand assets.

## Known Gaps

- Final hex values for gold-500 are working defaults — to be calibrated against the actual TODA logo in a future session once brand assets are finalized.
- Logo usage rules are placeholder — see BRAND.md.
- Dark-mode contrast ratios have not been formally audited against WCAG. Text secondary (#A3A3A3 on #000000) achieves AA at 5.3:1; text tertiary (#6B6B6B) is below AA at 3.6:1 and should only be used for non-essential decorative text.
- Form validation and error states are not yet documented.
- The exact backdrop-filter blur for sticky nav bars is not yet formalized.
