Read the following files completely before doing anything else:
CLAUDE.md, DESIGN.md, MOTION.md, BRAND.md, ARBEITS-NOTIZEN.md

Confirm that you have read all five files and summarize the current
project state in 3–4 sentences before proceeding.

---

We are now starting Phase 4 — Core Components. The goal of this phase
is to build all reusable UI building blocks so that the landing page in
Phase 5 can be assembled from finished parts.

**The 9 tasks of this phase:**

1. Integrate Lenis as a smooth-scroll wrapper in the root layout
2. Header component with glass-blur (backdrop-filter), scroll-aware
   (hides on scroll down, reappears on scroll up)
3. Footer component with sitemap links, language switcher (prepared but
   not yet functional), social links, imprint/privacy links
4. Button component with pill shape (border-radius: 980px), variants:
   Primary (Gold), Secondary (Outline), Ghost — all in multiple sizes
5. Section wrapper component that alternates between surface-base and
   surface-alt backgrounds
6. Hero component with large Inter headline, optional italic accent in
   Gold (Playfair Display Italic), sub-headline, CTA button group
7. Card component for listing items (blog listing, product overview)
8. VideoLoop component: `<video autoplay loop muted playsinline>` with
   Intersection Observer-based lazy play — no real videos exist yet,
   work with structurally correct placeholders
9. One example scroll animation with GSAP + ScrollTrigger to validate
   the pattern — choose the specific use case freely, justify your choice

The phase ends with a Storybook-style test page (e.g.
`/de/test/components`) where all components are visible and verifiable.

---

**How we work in this phase:**

Do not implement all tasks in one shot. Instead, follow this structure:

**Step 1 — Analyze first:** Before touching any task, read the existing
project structure. Read the relevant files: `layout.tsx`, `globals.css`,
`page.tsx`, everything in `lib/`, `middleware.ts`. Build a complete
picture of what exists and how it is structured.

**Step 2 — Present architecture decisions:** Two tasks have open
implementation questions. Analyze both, present your options, and wait
for my confirmation before writing any code:

- **Task 1 (Lenis):** How do you integrate Lenis into the root layout —
  directly inside `layout.tsx` or as a separate Client Component wrapper?
  Show both options with a short pro/con and tell me which you recommend
  and why.
- **Task 5 (Section Wrapper):** How do you control the alternation
  between `surface-base` and `surface-alt` — via an `index` prop or a
  different pattern? Justify your decision.

Wait for my go before implementing either of these.

**Step 3 — Implement in blocks:** After my confirmation, work in three
blocks:

- Block A: Tasks 1–3 (Lenis, Header, Footer)
- Block B: Tasks 4–8 (Button, Section Wrapper, Hero, Card, VideoLoop)
- Block C: Task 9 + test page (GSAP/ScrollTrigger + `/de/test/components`)

After each block: brief report of what you built, what decisions you
made and why, and what the next block contains. Then wait for my go.

**General rules:**
- No implementation without prior analysis
- All constraints in CLAUDE.md apply without exception
- Quality check after Phase 4 is complete: `pnpm build`, `pnpm lint`,
  `npx tsc --noEmit` — all three must pass clean
- Update ARBEITS-NOTIZEN.md at the end of the phase

Start now by reading the foundation files and the project structure.