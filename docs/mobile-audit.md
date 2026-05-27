# Mobile Audit — Bug Inventory & Triage

> **Priority:** Mobile is the #1 device category. We get mobile right first, then optimize desktop.
> **Status:** Inventory phase — listing bugs and root causes before committing to a fix model.
> **How to read this:** Findings marked **[code-certain]** are provable from the source.
> Findings marked **[needs-device]** are strong inferences I could not visually confirm
> (no browser automation installed) — Tomek to confirm "feel" on a real phone.

---

## TL;DR — the one root cause behind most of the "buggy" feeling

The page is a `scroll-snap-type: y mandatory` slide deck where every section is forced to
be exactly one viewport. But a large share of sections have more content than fits on a
phone. `mandatory` snapping **forbids the scroll from resting anywhere except a section's
top edge**, so the overflowing content below the fold becomes unreachable and the page
springs back when you try to scroll to it. Three separate subsystems (animations, bottom-nav
active state, snap) all assume one-viewport sections and all break the same way when a section
is taller than the screen.

**The core decision (D1 below) is: stop forcing `mandatory` one-viewport snapping on mobile.**
Everything else is downstream of that.

---

## A. Architecture / scroll model

| # | Bug | Evidence | Severity |
|---|-----|----------|----------|
| A1 | **`mandatory` snap makes overflowing content unreachable / spring back** | `globals.css:144` `scroll-snap-type: y mandatory`; `snap-section.tsx:81` `min-h-dvh ... snap-always`. Sections taller than the viewport have a snap point only at the top. | **Critical** |
| A2 | **`dvh` + mobile URL-bar = jumpy snap points** | `snap-section.tsx:81` `min-h-dvh`. `dvh` recomputes as the URL bar shows/hides while scrolling, shifting every snap point mid-gesture. `svh` is stable. | High |
| A3 | **Animation trigger assumes one-viewport sections** | `animate.tsx` / `stagger.tsx` fire on whole-section `intersectionRatio`. Threshold already walked 0.7→0.4 to chase this; a tall section can never hit a high ratio. The model itself is wrong for tall sections — should trigger per-element on enter. | High |
| A4 | **`snap-always` (`scroll-snap-stop: always`)** forces a hard stop at every boundary, compounding the fight on mobile flick-scrolls. | `snap-section.tsx:81` | Medium |

## B. Chrome (header + bottom nav)

| # | Bug | Evidence | Severity |
|---|-----|----------|----------|
| B1 | **Bottom-nav active index sticks on tall sections** → up/down arrows jump to the wrong section | `bottom-nav.tsx:58` IO `threshold: 0.5`; a section >viewport never reaches 0.5. | High |
| B2 | **Bottom-nav active index can flicker** — callback takes the last `isIntersecting` entry, not the *most* visible one | `bottom-nav.tsx:50-54` | Medium |
| B3 | **FAB + pill eat ~110px off every section's bottom** and can cover CTAs (Pricing, Team) | `bottom-nav.tsx:88` `calc(safe-area + 1rem)` + `h-14` pill + `:120` FAB `translateY(-20px)`. No content padding compensates. | High |
| B4 | **Fixed 56px header has no content offset** — section content slides under it | `header.tsx:22` `fixed top-0`; sections start at `top:0` with their own centering/padding. | Medium |
| B5 | **Does the arrow/FAB nav even earn its place on mobile?** Once scroll is natural (D1), prev/next arrows are redundant; the FAB is the only real CTA. Open question, not a defect. | — | Decision |

## C. Per-section mobile overflow inventory

Content density inferred from `page.tsx` props + section source. "Fits?" is my estimate of
whether it can stay one-viewport on a phone (~`375×750` usable after chrome).

| # | Section | Content load | Fits one mobile viewport? | Status |
|---|---------|--------------|---------------------------|--------|
| 1 | Hero | headline + sub, centered | Likely yes | [needs-device] |
| 2 | Bold Claim | headline + portrait video + 3 glass bullets | **No** (the case that started this) | [code-certain] |
| 3 | Case Study | label + statement + 4 bullets + video + caption | **No** | [needs-device] |
| 4 | Origin | GSAP story, 3 lines + 2 chat bubbles + closing | Tight / likely no | [needs-device] |
| 5 | Features | headline + **6** feature cards | **No** (CLAUDE.md already plans an Embla carousel here) | [code-certain] |
| 6 | Social Proof | headline + 3 "not" items + payoff + video | Likely no | [needs-device] |
| 7 | Testimonials | headline + hint + **3** quotes w/ authors | Likely no | [needs-device] |
| 8 | Team | headline + **5** people + CTA | **No** | [needs-device] |
| 9 | Pricing | headline + price + note + CTA | Likely yes | [needs-device] |
| 10 | FAQ | headline + **5** Q&A | **No** (unless accordion-collapsed) | [needs-device] |

**Read:** at least 5–6 of 10 sections cannot honestly fit one mobile viewport. That is too
many to keep reshaping individually — it argues strongly for changing the model (D1), not the
sections.

---

## Decisions (locked 2026-05-27)

- **D1 — Snap model:** ✅ **(b) `proximity` snap, tall sections allowed.** Soft-snap to
  section tops near a boundary; rest freely mid-section. `snap-stop: always` → `normal`.
- **D2 — Bottom nav:** ✅ **Keep arrows + FAB, fix the bugs** (B1 stuck active index,
  B2 flicker, B3 content overlap).
- **D3 — `dvh` → `svh`:** ✅ adopt `svh` for stable mobile snap points (my call).
- **D4 — Animation trigger:** ✅ rework to **per-element-on-enter** (observe the animated
  element itself with a `rootMargin` reveal offset), so it survives tall sections. Must ship
  **with** D1 or tall sections render blank. (my call)
- **D5 — Header:** ✅ stays fixed; add `scroll-padding-top` so snapped sections clear it. (my call)

## Phase status

- **Phase 1 — Foundation (in progress):** D1 + D3 + D4 + D5. Files: `globals.css`,
  `snap-section.tsx`, `animate.tsx`, `stagger.tsx`. Shippable substrate; nothing should render blank.
- **Phase 2 — Chrome:** bottom-nav B1/B2/B3 fixes.
- **Phase 3 — Per-section polish:** device-confirm sections 1→10, reshape only what's needed.

> **Governance note:** D1 overrides the "One viewport per section" rule in `CLAUDE.md` and the
> one-viewport assumption in `docs/integration-plan.md`. Update both once Phase 1 is confirmed on device.

## Proposed sequencing (once D1 is decided)

1. **Foundation:** D1 snap model + D3 `svh` + B4 header offset — establishes a stable scroll substrate.
2. **Chrome:** fix bottom-nav active tracking (B1/B2) and FAB overlap (B3) / simplify per D2.
3. **Animation model:** D4 per-element triggers; retire the threshold hack.
4. **Per-section polish:** walk sections 1→10, confirm on device, reshape only what still needs it.
5. Deploy → Tomek feel-check → iterate.

---

*Generated during mobile-first triage. I could not auto-measure viewports (no Playwright/Puppeteer
in this repo), so [needs-device] items await a real-phone confirmation pass.*
