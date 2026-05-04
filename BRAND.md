# BRAND.md — TODA Solutions Brand Guidelines

## About TODA

TODA Solutions is a complete management platform for tattoo studios — from appointment scheduling to bookkeeping. The brand speaks to professional artists who run a serious business and want software that respects that seriousness. The aesthetic is premium, editorial, and calm — the opposite of generic SaaS.

---

## Color Palette

> Note: These hex values are working defaults calibrated for visual appearance. Final values must be verified against the actual TODA logo in a future session once brand assets are finalized.

### Anthrazit Scale — Surfaces

| Token | Hex | Role |
|---|---|---|
| `surface-base` | `#000000` | Root canvas. Full-bleed hero sections, global nav background. |
| `surface-raised` | `#0A0A0A` | First elevation step. Alternating sections, footer background. |
| `surface-alt` | `#141414` | Second elevation step. Feature panels, content-dense sections. |
| `surface-elevated` | `#1D1D1D` | Card backgrounds, input fields, floating panels. |
| `border-subtle` | `#262626` | All borders, dividers, hairlines. Structural, not decorative. |
| `text-primary` | `#FFFFFF` | Headlines, primary body copy, active UI states. |
| `text-secondary` | `#A3A3A3` | Supporting copy, labels, secondary nav items. |
| `text-tertiary` | `#6B6B6B` | Fine print, disabled states, decorative separators. WCAG note: use only for non-essential text (contrast 3.6:1 on surface-base). |

### Gold Scale — Accent

| Token | Hex | Role |
|---|---|---|
| `gold-50` | `#FFF8E5` | Background tint for callout banners. Use sparingly — breaks dark rhythm. |
| `gold-200` | `#FCE49B` | Hover state tint for gold text links. Illustrative accents. |
| `gold-400` | `#E8B73D` | Button hover state (primary button brightens on hover). |
| `gold-500` | `#C8941A` | **Primary accent.** Every CTA, link, and Playfair emotional text. |
| `gold-600` | `#9C7314` | Button active/pressed state. |
| `gold-800` | `#5C420A` | Deep tint for gold-accented card backgrounds. |

**Gold 500 is the only interactive color in the entire system.** There is no secondary accent. There is no blue. There is no green for success states — use `text-secondary` with a checkmark symbol instead.

---

## Typography

### Primary Font: Inter

- **Usage:** All body text, headlines, UI labels, navigation, buttons — everything that conveys information.
- **Source:** Google Fonts variable font (loaded via `next/font/google`).
- **Feature settings:** `"cv05", "cv11"` for cleaner characters at small sizes.
- **Weight ladder:** 400 (regular) and 600 (semibold). No 500. No 700 unless genuinely required.
- **Display sizes (≥ 21px):** Apply negative letter-spacing (-0.2 to -0.5px) for editorial tightness.
- **Body:** 17px / 400 / 1.47 line-height. Non-negotiable.

### Accent Font: Playfair Display Italic

- **Usage:** Emotional statements only — maximum 2–4 words — always in `gold-500`.
- **Source:** Google Fonts (loaded via `next/font/google`, `style: ['italic']`).
- **Weight:** 400 italic.
- **Constraints:**
  - Never use for navigation, buttons, labels, or body copy.
  - Never use in `text-secondary` or `text-tertiary` colors.
  - Never use for more than 4 consecutive words.
  - Never use more than twice on a single page.
  - The purpose is a single moment of warmth in an otherwise precise, analytical interface.

### Example usage
```
// Correct
<h1 className="font-inter text-[56px] font-semibold tracking-tight">
  Mehr Kunst.{" "}
  <span className="font-playfair italic text-gold-500">Weniger Chaos.</span>
</h1>

// Incorrect — Playfair used for too many words and in wrong color
<p className="font-playfair italic text-text-secondary">
  Die Komplettlösung für professionelle Tattoo-Studios.
</p>
```

---

## Tone of Voice

### Character
- **Calm.** No exclamation points. No hype. No urgency pressure ("Limited time!", "Act now!").
- **Precise.** Every sentence says exactly one thing. No vague marketing fluff.
- **Confident.** We don't ask "Would you like to try?" — we say "Starte kostenlos."
- **Respectful.** The audience is professional artists who run a real business. Treat them as peers.

### Language
- **German, Du-form.** Direct, professional, not stiff. "Du organisierst deinen Alltag" — not "Sie verwalten Ihren Betrieb".
- **Short sentences.** Max 2 clauses per sentence in marketing copy.
- **No compound buzzword stacking.** Not "AI-powered next-generation comprehensive studio management solution." Just: "Dein Studio. Perfekt organisiert."

### Headline formula
Good TODA headlines have one of these structures:
1. **Tension / resolution:** "Mehr Kunst. Weniger Chaos."
2. **Direct statement:** "Alle Termine. Ein System."
3. **Benefit-first:** "Kein Papierkram mehr."

### What we are not
- Not a generic SaaS product.
- Not an enterprise software company.
- Not a startup hustle brand.
- Not a marketplace or booking platform.

### Voice examples
| Avoid | Prefer |
|---|---|
| "Revolutionize your studio management!" | "Dein Studio. Perfekt organisiert." |
| "Our AI-powered platform..." | "Automatische Erinnerungen, weniger No-Shows." |
| "Get started for free today!" | "Kostenlos starten." |
| "Trusted by thousands of artists worldwide" | "Mehr als 500 Studios nutzen TODA." |

---

## Logo Usage

> **Placeholder section** — to be filled when brand assets are finalized.

The physical TODA logo will be the reference for calibrating `gold-500`. Current `#C8941A` is a working default — it will be adjusted once the final logo files are available.

### Rules (preliminary)
- Logo always in `text-primary` (#FFFFFF) or `gold-500` (#C8941A) — never in any other color.
- Logo never on a surface lighter than `surface-elevated` (#1D1D1D).
- Minimum clear space: equal to the height of the "T" in "TODA" on all sides.
- Never stretch, rotate, or add effects to the logo.
- Favicon: square crop of the logo mark (not full wordmark).

---

## Imagery

### What works
- **Real tattoo photography.** The actual work of real artists — editorial quality, natural lighting.
- **Studio environments.** Clean, professional workspaces — not sterile medical rooms, not messy garages.
- **Close-ups of craft.** Hands working, detail shots, finished pieces on skin.
- **Black and white or muted color palettes** that don't compete with the Gold accent.

### What doesn't work
- **Stock photography.** Immediately identifiable and immediately cheap.
- **Robot or AI illustrations.** We are a tool for artists — robot imagery is a category mistake.
- **People in suits.** TODA serves independent artists, not enterprise accounts.
- **Bright, over-saturated images** that fight the dark Anthrazit palette.

### Photography treatment
- Images sit directly on section tiles without borders or rounded corners at full-bleed.
- Card-level images use `rounded-sm` (8px) for internal image crops.
- No CSS filter overlays on hero photography. The photo speaks for itself.
- HTML5 `<video>` for motion content — never GIFs.

---

## Anti-patterns

These are banned. If you see any of these in a PR, block it.

| Anti-pattern | Why |
|---|---|
| Generic hero with three cards and Lucide icons in circles | It's the #1 SaaS cliché. We are not a generic SaaS. |
| Purple gradients | No. |
| Multi-color gradients of any kind | Decorative gradients undermine the editorial restraint. |
| Centered body text | Centered text is for poetry and menus. Body copy is always left-aligned. |
| Stock photos | See imagery rules above. |
| Robot or "AI" illustrations | Category mismatch. |
| Lottie animations with excessive movement | Distracts from content. Use HTML5 video or CSS. |
| GIF files | Use `<video autoplay loop muted playsinline>`. |
| Second accent color | There is one accent: gold-500. Introducing blue, green, or red for states creates chaos. |
| Inline color values (bypassing tokens) | Always use CSS tokens from BRAND.md / globals.css. |
| Border-radius on full-bleed section tiles | Sections touch the viewport edge. No rounding. |
| `box-shadow` on cards | Elevation via surface color, not shadows. |
