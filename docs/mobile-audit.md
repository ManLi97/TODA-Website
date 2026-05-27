# Mobile Audit — Bug Inventory & Triage

> **⚠️ Read the Decisions + Phase status sections first.** The TL;DR and section-A/B/C
> tables below describe the page **as it was** (a `scroll-snap` deck) — that's the diagnosis,
> not the current state. The snap model has since been **removed entirely** (Phases A–C done).
> Phases D (bottom-nav) and E (per-section polish + Lenis) are still open.
>
> **Priority:** Mobile is the #1 device category. We get mobile right first, then optimize desktop.
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

- **D1 — Snap model:** ✅ **Scroll-snap removed entirely — plain smooth scroll.** First
  tried `proximity` snap (foundation commit), but on-device review showed snapping itself
  was the problem, so we pivoted to no snap at all. Sections are `min-h-svh` (≥ one viewport
  for rhythm, free to grow). Spotlight feel now comes from viewport rhythm + surface-colour
  alternation + fire-once reveals, not snap.
- **D2 — Bottom nav:** ✅ **Keep arrows + FAB, fix the bugs** (B1 stuck active index,
  B2 flicker, B3 content overlap). Permanent nav — arrows are placeholders, will become
  subpage links (e.g. blog) once subpages exist. **Still open.**
- **D3 — `dvh` → `svh`:** ✅ adopted `svh` for stable, URL-bar-proof section heights.
- **D4 — Animation trigger:** ✅ reworked to **element-scoped, fire-once**, then (round 2)
  to **per-element on entry**: every scroll-triggered element/child fires its own tween when
  it crosses the reveal line — no pre-timed `delay`/`gap` cascades. The `Stagger` primitive
  (which staggered children on a fixed clock — a snap-deck leftover) was renamed/rewritten to
  `RevealGroup`. Only the narrative **Origin** section keeps a hand-authored GSAP timeline.
- **D5 — Header:** ✅ stays fixed; `scroll-padding-top` keeps anchor/nav jumps clear of it.
- **D6 — Lenis (later):** smooth-scroll layer only, **never** sticky/pinned sections (the
  pinning, not Lenis, caused the old cut-offs + animation breakage). Deferred — Phase E.

## Phase status

- **Phase A — Spike (✅ done):** removed scroll-snap, fire-once reveals. Confirmed on device.
- **Phase B — Cleanup (✅ done):** `SnapSection` → `PageSection`, dropped dead `sectionRef`
  plumbing, migrated stale `strikethrough-list` trigger.
- **Phase C — Docs (✅ done):** this file + `CLAUDE.md` + `integration-plan.md` +
  `philosophy.md` + `motion.md` realigned to the no-snap model.
- **Phase D — Chrome (open):** bottom-nav B1 (stuck active index), B2 (flicker), B3 (FAB
  overlap). B1/B2 root cause: IO `threshold: 0.5` in `bottom-nav.tsx` can't track sections
  taller than the viewport — needs a most-visible / scroll-position approach instead.
- **Phase E — Per-section polish + Lenis (open):** device-confirm sections 1→10, then optional Lenis.
  - **Round 1:** un-hid the BoldClaim video (tall sections are now legal). ✅
  - **Round 2 (2026-05-27 device feedback):**
    - BoldClaim video autoplayed on page load → removed hardcoded `autoPlay`; the existing
      IntersectionObserver now starts playback on viewport entry. ✅
    - No bottom breathing room (content crammed against the floating nav) → section bottom
      padding is now top-padding **plus** the nav clearance, so top/bottom breathe equally
      and content still clears the nav. ✅
    - Phantom "scroll inside a section" → caused by `overflow-x: hidden` forcing the y-axis to
      `auto` (a scroll container); switched to `overflow-x: clip`. ✅
    - Motion felt pre-timed (snap-deck leftover) → per-element on entry, see D4. ✅
  - **Still open / needs-device this round:** symmetric padding feel; carousel cards
    (Features/Team mobile) revealing correctly on swipe; whether Hero keeps its mount cascade.

---

*Generated during mobile-first triage. No browser automation in this repo, so [needs-device]
items in the per-section table still await a real-phone confirmation pass during Phase E.*
