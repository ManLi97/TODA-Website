# Motion & Animation

Companion to colour, typography, and glass systems. The token values and sequencing principles
transfer directly to GSAP. The vanilla JS trigger engine and `[data-anim]` CSS system do not
exist in this repo — they are replaced by the `<Animate>` React component + GSAP ScrollTrigger.

---

## 1) Token tables

### Easing

| Token | Curve | Role |
|---|---|---|
| `--ease-entry` | `cubic-bezier(0.16, 1, 0.3, 1)` | Every entrance (fade-up, scale-in, slide, draw) |
| `--ease-loop` | `ease-in-out` | Continuous loops (gradient shimmer) |
| `--ease-count` | `easeOutQuart` → GSAP `"power4.out"` | Number count-ups. JS-only — no CSS `:root` entry. |

### Duration

| Token | ms | Role |
|---|---|---|
| `--t-quick` | 400ms | Small entrance: label, caption, arrow fade |
| `--t-base` | 550ms | Default: card, feature item, step |
| `--t-medium` | 650ms | Display headlines, lede |
| `--t-slow` | 700ms | Divider draw, slide-right (cards from off-frame) |
| `--t-hero` | 900ms | Hero numeral — gets time to breathe |
| `--t-count` | 1000–1300ms | Number count-ups. Set per-element; no CSS `:root` entry. |
| `--t-fill` | 1250ms | Progress bar fill |
| `--t-flow-fast` | 5s | Inline gradient shimmer (mid-sentence emphasis word) |
| `--t-flow-slow` | 7s | Hero numeral gradient shimmer |

### Distance / scale

| Token | Value | Role |
|---|---|---|
| `--m-y-rise` | 24px | translateY for fade-up |
| `--m-x-near` | 32px | translateX for slide-left |
| `--m-x-far` | 40px | translateX for slide-right (off-frame elements) |
| `--m-scale-in` | 0.93 | scale start for scale-in and hero-in |
| `--m-grad-bg` | 300% 100% | background-size for gradient shimmer text |

---

## 2) Keyframes — reference only

> **These CSS keyframes are NOT used in this repo.** GSAP handles all animation via `fromTo()`
> tweens — no `@keyframes` are declared in `globals.css`. The definitions below are kept because
> they precisely document what each animation type does visually, and are the most reliable
> source for writing the correct GSAP `fromTo` equivalents in Phase 3.

```css
@keyframes fade-up    { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fade-in    { from { opacity: 0; } to { opacity: 1; } }
@keyframes scale-in   { from { opacity: 0; transform: scale(0.93); } to { opacity: 1; transform: scale(1); } }
@keyframes slide-left { from { opacity: 0; transform: translateX(-32px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slide-right{ from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
@keyframes draw-w     { from { width: 0; opacity: 0; } to { width: 3rem; opacity: 0.4; } }
@keyframes grad-flow  { 0%, 100% { background-position: 0% center; } 50% { background-position: 100% center; } }
```

### GSAP `fromTo` equivalents

| Animation type | GSAP `fromTo` — `from` state | GSAP `fromTo` — `to` state |
|---|---|---|
| `fade-up` | `{ opacity: 0, y: 24 }` | `{ opacity: 1, y: 0 }` |
| `fade-in` | `{ opacity: 0 }` | `{ opacity: 1 }` |
| `scale-in` | `{ opacity: 0, scale: 0.93 }` | `{ opacity: 1, scale: 1 }` |
| `slide-left` | `{ opacity: 0, x: -32 }` | `{ opacity: 1, x: 0 }` |
| `slide-right` | `{ opacity: 0, x: 40 }` | `{ opacity: 1, x: 0 }` |
| `draw-w` | `{ width: 0, opacity: 0 }` | `{ width: "3rem", opacity: 0.4 }` |

All use `ease: CustomEase.create("entry", "0.16, 1, 0.3, 1")` and read duration from the
token table. `grad-flow` is a perpetual loop — see `hero-in` below.

---

## 3) Animation primitives — `<Animate>` prop API

> In the source DS this was the `data-anim` attribute API on raw HTML elements. In this repo
> the same vocabulary is exposed as a `type` prop on the `<Animate>` React component.
> The type names are identical — only the mechanism changes.

| `type` prop | Used for | Default duration |
|---|---|---|
| `"fade-up"` | Default entrance: headlines, lede, body text, labels, cards | 550ms |
| `"fade-in"` | Pure opacity — captions, arrows where translation would feel chatty | 400ms |
| `"scale-in"` | Quiet entrance for hero numerals without gradient shimmer | 900ms |
| `"slide-left"` | Sequential left-to-right reveals | 550ms |
| `"slide-right"` | Elements arriving from off-frame | 700ms |
| `"draw-w"` | Gold divider line drawing in from width 0 | 700ms |
| `"hero-in"` | Composed: scale entrance + perpetual gradient shimmer | 900ms + ∞ |

### Authoring

```tsx
// Default entrance
<Animate type="fade-up" delay={250} duration={650}>
  <h2 className="display">Section headline</h2>
</Animate>

// Eyebrow label — quick fade, no movement
<Animate type="fade-in" delay={0} duration={400}>
  <span className="eyebrow">Label</span>
</Animate>

// Gold divider
<Animate type="draw-w" delay={1500} duration={700}>
  <div className="divider" />
</Animate>

// Hero numeral with gradient shimmer — see hero-in below
<Animate type="hero-in" delay={0} duration={900}>
  <h1 className="hero grad-text">87%</h1>
</Animate>
```

### Composed: `hero-in`

`hero-in` is the only animation type that chains two motions on one element:
1. **Entrance** — `scale-in` tween (opacity 0→1, scale 0.93→1), runs once
2. **Shimmer** — perpetual `grad-flow` loop starts immediately after entrance completes

The element must carry `background: var(--grad-brand); background-clip: text; color: transparent`
(via the `.grad-text` class) for the shimmer to be visible.

**GSAP implementation approach for Phase 3:**

```ts
// Entrance via GSAP fromTo
gsap.fromTo(el,
  { opacity: 0, scale: 0.93 },
  {
    opacity: 1, scale: 1,
    duration: 0.9,
    ease: "entry",          // CustomEase registered as "entry"
    delay: delaySeconds,
    onComplete: () => el.classList.add("shimmer-active"),
  }
)

// Shimmer — perpetual CSS animation triggered by class after entrance
// .shimmer-active { animation: grad-flow 7s ease-in-out infinite; }
// Defined in globals.css. GSAP adds the class via onComplete, keeping
// background-position out of GSAP's transform pipeline entirely.
```

> **Why a CSS class for the shimmer, not a GSAP tween?**
> Animating `backgroundPosition` with GSAP works, but creates a continuous rAF loop on
> every shimmer element — expensive. A perpetual CSS animation hands the loop to the
> compositor thread. The hybrid is the correct approach: GSAP owns the entrance, CSS owns
> the loop.

### Inline shimmer: `.grad-text--flow`

For a single emphasized word mid-sentence. Static gradient by default; a JS call adds
`.flowing` after the parent entrance has settled, so the shimmer doesn't compete visually
with the parent animating in.

```css
/* globals.css */
.grad-text--flow {
  background: var(--grad-brand);
  background-size: var(--m-grad-bg);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.grad-text--flow.flowing {
  animation: grad-flow var(--t-flow-fast) var(--ease-loop) infinite;
}
```

In the `<Animate>` component: after the parent entrance completes, `onComplete` adds
`.flowing` to any `.grad-text--flow` children — same timing logic as the source DS.

---

## 4) Sequencing principles

The single most important rule, expressed as math:

```
next.delay = previous.delay + previous.duration + breath
```

Where `breath` is:

| Relationship | Breath | Feels like |
|---|---|---|
| Same logical group (label → headline → lede; consecutive bullets) | **−150 to +150ms** (allowed to overlap) | One continuous beat |
| Distinct phase change (bullets → card; copy block → divider) | **+200 to +400ms** | A pause before the next thing |
| Discrete reveal (step → arrow → step) | **+150 to +250ms after previous settles** | A sequence being drawn |

Concrete example:

```
label    [0   → 450]
h2       [250 → 900]    ← starts during label, same group
lede     [750 → 1350]   ← starts as h2 settles, same group
feat 1   [1200 → 1700]  ← 350ms breath, new phase
feat 2   [1400 → 1900]  ← 200ms overlap, cascading group
feat 3   [1600 → 2100]  ← 200ms overlap, cascading group
                          ── 200ms breath ──
card     [2300 → 3050]  ← arrives only after bullets are done
```

Phases get clearly separated, groups feel like one beat. This is the entire rhythm.

---

## 5) CSS tokens for `globals.css`

> **⚠ Only the `:root` block transfers.** The `[data-anim]` selector system and `.anim-on`
> class toggling below it are the vanilla JS engine's CSS counterpart — they do NOT go into
> `globals.css`. GSAP sets opacity/transform directly; no CSS selector system is needed.
> Exception: the `grad-flow` keyframe and shimmer classes (`.grad-text--flow`, `.shimmer-active`)
> do live in `globals.css` — see section 3.

```css
:root {
  /* — Motion: easing — */
  --ease-entry: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-loop:  ease-in-out;

  /* — Motion: duration — */
  --t-quick:     400ms;
  --t-base:      550ms;
  --t-medium:    650ms;
  --t-slow:      700ms;
  --t-hero:      900ms;
  --t-fill:      1250ms;
  --t-flow-fast: 5s;
  --t-flow-slow: 7s;

  /* — Motion: distance — */
  --m-y-rise:    24px;
  --m-x-near:    32px;
  --m-x-far:     40px;
  --m-scale-in:  0.93;
  --m-grad-bg:   300% 100%;
}
```

---

## 6) Trigger system — GSAP ScrollTrigger

> The source DS used a ~50-line vanilla JS IntersectionObserver engine (`animateSlide` /
> `resetSlide`). This repo replaces it entirely with GSAP ScrollTrigger inside the
> `<Animate>` component.

**What the original engine did — preserved in our implementation:**
- On section enter → run all entrance animations in sequence
- On section exit → reset all animated elements to their initial state
- Result: animations replay every time the user scrolls back into a section

**How `<Animate>` + ScrollTrigger replaces it:**
- Each `<Animate>` registers a ScrollTrigger scoped to its parent `<StickySection>`
- `onEnter`: fires the GSAP `fromTo` tween
- `onLeave` / `onLeaveBack`: resets the element to `from` state so it replays on return
- `<StickySection>` and `<Animate>` each manage their own `gsap.context()` — there is no
  shared GSAP context between them. Each `<Animate>` registers its own ScrollTrigger scoped
  to its element; this is correct and expected, not a shared-state architecture

**Counter and progress bar patterns (not yet implemented):**

The source DS included `data-count` and `data-progress` attribute patterns for animated
numbers and fill bars. These are valid UX patterns for this website (CTA section price,
case study stats). React equivalents are needed — dedicated components using GSAP's
`counter` or a `useEffect` rAF loop with `easeOutQuart` (`power4.out`). Implement when
the relevant section is built in Phase 5.
