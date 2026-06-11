# Motion & Animation

How motion works on this site, as built. Entrances are GSAP `fromTo` tweens fired by an
element-scoped `IntersectionObserver`; perpetual loops are CSS `@keyframes`. The primitives
are the `<Animate>` and `<RevealGroup>` React components; two sections own bespoke timelines.

> **Source of truth:** `components/animate.tsx`, `components/reveal-group.tsx`,
> `components/strikethrough-list.tsx`, `components/origin-section.tsx`, and the motion tokens +
> keyframes in `app/[locale]/globals.css`.

---

## 1) Token tables (`@theme`)

### Easing

| Token          | Curve                           | Role                                                                            |
| -------------- | ------------------------------- | ------------------------------------------------------------------------------- |
| `--ease-entry` | `cubic-bezier(0.16, 1, 0.3, 1)` | Every entrance AND interaction transition. GSAP CustomEase name: `"entry"`.     |
| `--ease-loop`  | `ease-in-out`                   | Continuous CSS loops (gradient shimmer, scroll cue)                             |

One curve, everywhere: GSAP tweens use `"entry"`, CSS transitions use
`var(--ease-entry)` (buttons, cards, accordion, link colors). The only exceptions are
the Origin personality beat (phone shake frames + `back.out` icon pop) and `ease-in-out`
loops.

### Duration

| Token           | ms     | Role                                                           |
| --------------- | ------ | -------------------------------------------------------------- |
| `--t-quick`     | 400ms  | Small entrance: label, caption, arrow fade (`fade-in` default) |
| `--t-base`      | 550ms  | Default: card, feature item (`fade-up` / `slide-left` default) |
| `--t-medium`    | 650ms  | Display headlines, lede                                        |
| `--t-slow`      | 700ms  | Divider draw, slide-right from off-frame                       |
| `--t-hero`      | 900ms  | Hero / scale-in                                                |
| `--t-fill`      | 1250ms | Progress bar fill                                              |
| `--t-flow-fast` | 5s     | Inline gradient shimmer loop                                   |
| `--t-flow-slow` | 7s     | Hero-numeral gradient shimmer loop                             |

### Distance / scale

| Token          | Value     | Role                                      |
| -------------- | --------- | ----------------------------------------- |
| `--m-y-rise`   | 24px      | translateY for `fade-up`                  |
| `--m-x-near`   | 32px      | translateX for `slide-left`               |
| `--m-x-far`    | 40px      | translateX for `slide-right` (off-frame)  |
| `--m-scale-in` | 0.93      | scale start for `scale-in` / `hero-in`    |
| `--m-grad-bg`  | 300% 100% | background-size for gradient shimmer text |

---

## 2) Two animation mechanisms

**Entrances → GSAP `fromTo`.** No `@keyframes` are involved; GSAP sets opacity/transform
directly. The `from`/`to`/duration tables live in `animate.tsx` (`ANIM_FROM`, `ANIM_TO`,
`ANIM_DURATION`) and are the authoritative definitions:

| `type`        | `from`                        | `to`                              | Default |
| ------------- | ----------------------------- | --------------------------------- | ------- |
| `fade-up`     | `{ opacity: 0, y: 24 }`       | `{ opacity: 1, y: 0 }`            | 550ms   |
| `fade-in`     | `{ opacity: 0 }`              | `{ opacity: 1 }`                  | 400ms   |
| `scale-in`    | `{ opacity: 0, scale: 0.93 }` | `{ opacity: 1, scale: 1 }`        | 900ms   |
| `slide-left`  | `{ opacity: 0, x: -32 }`      | `{ opacity: 1, x: 0 }`            | 550ms   |
| `slide-right` | `{ opacity: 0, x: 40 }`       | `{ opacity: 1, x: 0 }`            | 700ms   |
| `draw-w`      | `{ width: 0, opacity: 0 }`    | `{ width: "3rem", opacity: 0.4 }` | 700ms   |
| `hero-in`     | `{ opacity: 0, scale: 0.93 }` | `{ opacity: 1, scale: 1 }`        | 900ms   |

All use `ease: "entry"`.

**Perpetual loops → CSS `@keyframes`.** These DO exist in `globals.css` (compositor-cheap,
unlike a GSAP rAF loop): `grad-flow` (gradient-text shimmer), `team-ring-spin` (avatar ring),
`hint-pulse` (testimonials "tap to flip" label), `scroll-cue-float` (hero chevron drift).
Each has a `prefers-reduced-motion` off-switch.

---

## 3) Primitives — `<Animate>` and `<RevealGroup>`

```tsx
// Single element. delay (ms) and duration (ms) are optional; duration overrides the type default.
<Animate type="fade-up" duration={650}>
  <h2 className="type-display text-text-primary">Section headline</h2>
</Animate>

// N children, same trigger model — each child fires on ITS OWN entry, no inter-child delay.
<RevealGroup type="fade-up" className="grid grid-cols-3 gap-group">
  {cards}
</RevealGroup>
```

`<Animate>` props: `type`, `delay?` (ms, default 0), `duration?` (ms), `className?`.
`<RevealGroup>` props: `type`, `className?` — it has no delay/duration; children reveal
independently as they cross in. Both honor `prefers-reduced-motion` (jump straight to `to`).

### Gradient text & the shimmer loop

`.grad-text--flow` paints text with the brand gradient (used statically today, e.g. the
Bold Claim `01/02/03` numerals). The perpetual shimmer is a separate, opt-in loop:
`.grad-text--flow.flowing` and `.shimmer-active` are defined in `globals.css` but are **not
auto-triggered by any component right now** — the gradient sits static by design, to keep
the page calm. To animate it, a component would add `.flowing` / `.shimmer-active` after its
entrance settles (e.g. via a GSAP `onComplete`); nothing does so currently.

### `hero-in`

`hero-in` exists as a type but currently resolves to the same tween as `scale-in` (scale
0.93→1, opacity 0→1). It is **not** wired to the shimmer loop. The live hero uses a plain
`fade-up` headline (`type-display-hero`) with a Playfair accent span — no gradient numeral.

---

## 4) Trigger model — element-scoped IntersectionObserver, fire-once

The default across the whole site: each `<Animate>` element (and each `<RevealGroup>` child)
observes **itself** with `IntersectionObserver` (`rootMargin: "0px 0px -12% 0px"`, threshold
0), fires its tween **once** on first entry, then disconnects — no reset, no replay on
scroll-back. Element-scoping (not section-ratio) means it works regardless of section height.

Why this, not ScrollTrigger / `scrollend` / section-ratio: observing the element itself is
height-agnostic (fires whether a section is one viewport or three); `scrollend` has uneven
browser support; and re-animating on every pass reads cheaper than a single calm reveal.
GSAP ScrollTrigger is in the bundle but reserved for scrubbed-against-scroll tweens (the
Origin timeline uses it; nothing else needs it).

**Hero is the one mount-fired case.** `<PageSection triggerOnMount>` makes its child
`<Animate>` instances fire on mount instead of waiting for an intersection, so the
above-the-fold hero animates immediately on load.

---

## 5) Deliberate sequencing — the two storytelling exceptions

Everywhere else is per-element-on-entry with **no** inter-element delay. Two sections
deliberately break that because they tell a story on a clock:

### Origin section — hand-authored GSAP timeline

`origin-section.tsx` owns a single `gsap.timeline()` on a `ScrollTrigger` (`start: "center
bottom"`, `once: true`). It runs six phases in sequence — narrative lines fade up (line 3
gets a dramatic pause), chat bubbles fade in slowly, a phone icon appears and shakes, a
connector line draws left→right, the TODA icon scale-bounces in, then the closing glass box
fades up. The reason it's a timeline and not per-element reveals: it's a _story being told_,
so it must build step by step at an authored pace, not react to the scroll position of each
fragment. Initial hidden states are also set inline on the elements to prevent an SSR flash.

Every fade/draw in the timeline rides the site-wide `"entry"` ease. The **phone shake +
TODA-icon `back.out` pop** are the page's one sanctioned personality beat (philosophy:
the cheeky brand peeking through) — keep them, and don't add a second one elsewhere.

### StrikethroughList — container-triggered cascade

`strikethrough-list.tsx` ("You're an artist — not a secretary, not customer service, not a
salesperson"). One `IntersectionObserver` on the **container**: when the whole list enters
view, the rows strike out one after another. Per row, a line draws across (`scaleX 0→1`,
0.65s `"entry"`) and the text fades white→tertiary (0.55s `"entry"`, starting +0.2s into the
draw). Rows are staggered by `STAGGER = 1.5s` so each line can be _read_ before it's crossed
out — the cascade tracks the reader's eye down the list. Fires once; reduced-motion jumps to
the final struck-through state.

**The rule:** do not reintroduce pre-timed `delay`/`gap` cascades into ordinary
scroll-triggered sections. If a new section needs a narrative build, give it its own timeline
(like Origin) rather than chaining delays across `<Animate>` instances.

### Cascade math (for timelines only)

When you _are_ authoring a timeline, the rhythm is:

```
next.start = previous.start + previous.duration + breath
```

| Relationship                                                    | Breath                                    | Feels like                    |
| --------------------------------------------------------------- | ----------------------------------------- | ----------------------------- |
| Same logical group (label → headline → lede; consecutive items) | −150 to +150ms (may overlap)              | One continuous beat           |
| Distinct phase change (copy → media; bullets → card)            | +200 to +400ms                            | A pause before the next thing |
| Discrete reveal (step → arrow → step)                           | +150 to +250ms after the previous settles | A sequence being drawn        |

Phases get clearly separated; groups feel like one beat.
