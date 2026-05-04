# MOTION.md — TODA Motion Design System

## Principles

Motion in TODA is editorial, not decorative. Every animation has a purpose: reveal, feedback, or orientation. If removing an animation would not confuse the user or break the flow, remove it.

The aesthetic is **calm confidence** — nothing bounces, flickers, or demands attention. Motion should feel like turning the page of a high-quality magazine, not watching a product demo.

---

## Easing Curves

### Standard — UI interactions
```
cubic-bezier(0.4, 0, 0.2, 1)
```
Applies to: hover state transitions, button feedback, color changes, opacity fades, small scale transforms. This is the default for anything that should feel responsive and intentional.

### Enter (decelerate)
```
cubic-bezier(0, 0, 0.2, 1)
```
Applies to: elements entering the viewport — modals, dropdowns, toasts appearing. Starts fast, lands softly. Creates a sense of arrival, not an intrusion.

### Exit (accelerate)
```
cubic-bezier(0.4, 0, 1, 1)
```
Applies to: elements leaving — modals dismissed, dropdowns closing, toasts disappearing. Starts slow, exits decisively. The user has taken action; the element gets out of the way.

### Spring — interactive elements
```
spring(stiffness: 300, damping: 30, mass: 1)
```
Applies to: elements the user directly manipulates — drag handles, interactive toggles, primary button press states. Spring physics match the organic feel of direct manipulation. Use via Framer Motion or CSS `linear()` approximation.

Spring approximation in CSS (for contexts without a spring library):
```css
animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
```
This gentle overshoot is acceptable only on press/release feedback — never on page-level or section-level transitions.

---

## Durations

| Context | Duration | Easing |
|---|---|---|
| Hover state (color, opacity) | 150ms | standard |
| Button press / active state | 100ms | standard |
| Focus ring appear | 150ms | standard |
| Dropdown / menu open | 200ms | enter |
| Dropdown / menu close | 150ms | exit |
| Toast / notification | 250ms in, 200ms out | enter / exit |
| Modal open | 300ms | enter |
| Modal close | 200ms | exit |
| Section reveal (scroll) | 600–700ms | enter |
| Hero reveal | 700–800ms | enter (staggered) |
| Page transition (fade) | 400ms | standard |
| Parallax layers | continuous | linear |

**Rule:** UI feedback (hover, click) should feel instantaneous — 100–200ms. Content reveals should feel considered — 600–800ms. Never exceed 800ms for any individual animation. A series of staggered reveals can span up to 1200ms total, but each element animates for ≤ 800ms.

---

## Scroll Animations

### Hero reveal
The hero section reveals with a combined Y-translation and opacity fade:
```
initial: { opacity: 0, y: 24px }
animate: { opacity: 1, y: 0 }
duration: 700ms
easing: enter (cubic-bezier(0, 0, 0.2, 1))
```
If the hero has multiple elements (headline, sub-copy, CTA), stagger each by 80ms. Never stagger more than 3 elements.

### Section reveals (scroll-triggered)
Elements entering from the bottom of the viewport:
```
initial: { opacity: 0, y: 32px }
animate: { opacity: 1, y: 0 }
duration: 600ms
easing: enter
trigger: when element top reaches 85% of viewport height (IntersectionObserver threshold: 0.15)
```
For sections with multiple cards or items, stagger by 60ms per child. Max stagger delay: 240ms (4 children). After 4 children, all remaining animate simultaneously.

### Pinned sections with scrub animations
For scroll-driven narrative sections (product feature walkthrough, step-by-step explanations):
- Pin the section for a scroll distance equal to 2× viewport height.
- Map scroll progress (0→1) to animation progress via a linear scrub.
- Animate: opacity (0.2→1 for text, 0→1 for visuals) + subtle scale (0.96→1.0) or Y-offset (16px→0).
- Use the CSS `animation-timeline: scroll()` API or Lenis scroll progress.

### Parallax layers
Multiple layers at different scroll speeds create depth without gimmickry:
- **Background layer** (photography, large graphics): scroll speed 0.6× (moves slower than viewport).
- **Foreground content**: scroll speed 1× (normal).
- **Floating accent elements**: scroll speed 1.1–1.15× (moves slightly faster for depth inversion).
- Max parallax displacement: 80px for background layer at full page scroll. Never cause content overflow.
- Implemented exclusively via `transform: translateY()` — never via `top` or `background-position`.

---

## Hover States

**Rule: opacity or subtle scale only. Never hard color changes.**

| Element | Hover treatment |
|---|---|
| Primary button | background brightens to `gold-400` (150ms standard) |
| Secondary button | border-color lightens slightly (150ms standard) |
| Text links | opacity 0.7 (100ms standard) |
| Nav links | opacity 0.6 → 1.0 (100ms standard) |
| Cards | `transform: translateY(-2px)` + border-color lightens (200ms standard) |
| Images | `transform: scale(1.02)` (300ms standard) — max scale 1.02 |
| Icon buttons | opacity 0.7 (100ms standard) |

**Absolute maximum scale on hover: 1.02.** Scale 1.03 or larger feels aggressive on premium interfaces.

---

## Active / Press States

Every element with a hover state must also have an `:active` state. This is mandatory for touch devices.

| Element | Active treatment |
|---|---|
| Primary button | `transform: scale(0.97)` + `gold-600` background (100ms standard) |
| Secondary button | `transform: scale(0.97)` (100ms standard) |
| Nav links | opacity 1.0 (no change needed if already full opacity) |
| Cards | `transform: translateY(0)` (reverts hover lift, 100ms) |
| Icon buttons | `transform: scale(0.93)` (100ms standard) |

---

## Page Transitions

Page transitions use a **fade with minimal Y-offset** pattern:

```
exit: { opacity: 0, y: -8px, duration: 200ms, easing: exit }
enter: { opacity: 0, y: 8px } → { opacity: 1, y: 0, duration: 400ms, easing: enter }
```

**Rules:**
- Never slide pages horizontally — lateral slides imply navigation hierarchy that doesn't exist.
- Never use hard cuts — the fade gives the user orientation that a new context is loading.
- The Y-offset is 8px only — barely perceptible. Its purpose is to give the fade a direction, not to be noticed.
- Implemented via Next.js App Router layout transitions or Framer Motion `AnimatePresence`.

---

## GPU Rule

**Animate exclusively on `transform` and `opacity`. Never animate layout properties.**

| Allowed (GPU-composited) | Forbidden (triggers layout) |
|---|---|
| `transform: translateY()` | `top`, `bottom`, `left`, `right` |
| `transform: translateX()` | `margin`, `padding` |
| `transform: scale()` | `width`, `height` |
| `opacity` | `max-height` (common accordion mistake) |
| `transform: rotate()` | `font-size` |
| `filter: blur()` | `border-width` |

For accordions and expandable content: animate `opacity` + `transform: scaleY()` with `transform-origin: top`. Never animate `height` directly. If content height is unknown, use the `grid-template-rows: 0fr → 1fr` technique.

**`will-change` guidance:** Apply `will-change: transform, opacity` only to elements that are actively animating in a scrub context (parallax, scroll-driven). Remove it after animation ends. Do not apply globally — it wastes GPU memory.

---

## Smooth Scroll

Lenis is the scroll foundation (installed in Phase 4). Until then, use CSS:

```css
html {
  scroll-behavior: smooth;
}
```

Once Lenis is installed:
- Initialize with `lerp: 0.1` (smooth follow) and `duration: 1.2`.
- All scroll-driven animations must read from the Lenis scroll event, not native scroll.
- Lenis provides the normalized `progress` value (0→1) for scroll-scrubbed animations.
- Disable Lenis on `prefers-reduced-motion`.

---

## Reduced Motion

All animations must respect `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

For scroll-triggered reveals: when reduced-motion is active, show elements in their final state immediately (no fade/translate). Use `IntersectionObserver` to set the class, but skip the transition.

---

## Anti-patterns

- **No Lottie animations with excessive movement.** If a Lottie file has more than 3 simultaneous motion paths, replace it with an HTML5 video or CSS animation.
- **No GIFs.** Use HTML5 `<video autoplay loop muted playsinline>` instead. GIFs have poor compression, no alpha channel in most contexts, and look amateur on high-density screens.
- **No spinning loaders on primary CTAs.** If an action takes > 300ms, show a subtle pulse opacity on the button — not a spinner that makes the interface feel broken.
- **No simultaneous animations on more than 5 elements.** Stagger or simplify.
- **No animation duration above 800ms for a single element.** Anything longer feels broken.
- **No bounce easing on content reveals.** Spring physics are for direct manipulation only.
