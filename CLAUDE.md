# Project: TODA Website

Marketing landing page for TODA Tattoo Solutions — a SaaS platform for tattoo artists.
Single-page experience with 9 snap-slide sections (one viewport each), i18n (de/es/en),
and GSAP entrance animations triggered on snap-settle.
Built with Next.js 15 App Router, React 19, TypeScript, Tailwind v4.

> **Phase 3 migration in progress.** The codebase is mid-flight between a sticky-stack
> scroll model (Lenis + `StickySection`) and a snap-slide model (native
> `scroll-snap-type` + `<SnapSection>`). Some files described below as DEPRECATED
> are still on disk and will be deleted during Phase 3. See
> `docs/integration-plan.md` for current scope and phasing.

## Tech stack

| Layer           | Technology                                                          |
|-----------------|---------------------------------------------------------------------|
| Framework       | Next.js 15 (App Router)                                             |
| Language        | TypeScript                                                          |
| Styling         | Tailwind CSS v4 (CSS-first `@theme` in `globals.css`)               |
| Scroll          | Native CSS scroll-snap (`y mandatory`)                              |
| Animations      | GSAP + CustomEase, triggered via IntersectionObserver. Framer Motion (`motion` package) is removed at the end of Phase 3; until then it remains in `faq-section.tsx`, `testimonials-section.tsx`, `team-section.tsx`. |
| Carousel        | Embla Carousel                                                      |
| i18n            | next-intl (de / es / en, default: de)                               |
| Database/Auth   | Supabase (wired, not yet used in UI)                                |
| Package mgr     | pnpm                                                                |
| Deployment      | Vercel (inferred)                                                   |

## Workflow

- **Session start:** run `/git-context` to recover state
- **Before non-trivial work:** use `/ship` for Plan → Build → Review
- **Commits:** use `/commit` — Conventional Commits with NOTE blocks

## Commands

```bash
pnpm dev          # start dev server (Next.js)
pnpm build        # production build
pnpm lint         # ESLint via next lint
pnpm format       # Prettier write
pnpm format:check # Prettier check (CI)
```

## Architecture (target — Phase 3 is migrating here)

```
app/
  [locale]/
    layout.tsx        # root layout (no scroll provider — native snap handles it)
    page.tsx          # 9-section home page using <SnapSection>
    globals.css       # Tailwind base, design tokens, scroll-snap on `html`
components/
  snap-section.tsx    # layout primitive: min-h-dvh + scroll-snap-align/stop
  animate.tsx         # entrance wrapper — GSAP fromTo, IO-triggered, resets on leave
  stagger.tsx         # cascaded entrance for N children — same trigger model
  hero.tsx            # section 1 — uses <SnapSection triggerOnMount>
  case-study-section.tsx
  testimonials-section.tsx
  faq-section.tsx
  team-section.tsx
  header.tsx / footer.tsx
  button.tsx / card.tsx / video-loop.tsx
i18n/
  routing.ts          # defineRouting — locales, localePrefix "always"
  navigation.ts       # typed Link/useRouter re-exports
  request.ts          # getRequestConfig
messages/
  de.json / es.json / en.json   # all copy lives here, "home" namespace
lib/
  supabase/
    client.ts         # browser Supabase client
    server.ts         # server-side Supabase client (SSR)
middleware.ts         # next-intl locale routing
```

**Currently on disk, deleted during Phase 3:**
- `components/sticky-section.tsx` → replaced by `snap-section.tsx` (Phase 3a)
- `components/lenis-provider.tsx` → deleted, `<LenisProvider>` removed from layout (Phase 3a)
- `components/scroll-reveal.tsx` → replaced by `animate.tsx` + `stagger.tsx` (Phase 3b)

## Key patterns

- **`<SnapSection>` is the layout primitive:** every section wraps in
  `<SnapSection variant="base|alt|raised" id triggerOnMount?>`. `min-h-dvh` +
  `scroll-snap-align: start` + `scroll-snap-stop: always`. Provides a React context
  exposing its DOM node so `<Animate>` / `<Stagger>` can scope their
  IntersectionObserver to it.
- **Surface rhythm:** base → alt → raised → alt → raised → base → alt → raised → base
  (9 sections in order).
- **All copy via next-intl:** no hardcoded strings in components — everything reads
  from `messages/{locale}.json` under the `"home"` namespace.
- **`<Animate>` and `<Stagger>` for entrances:** entrance tween runs after the section
  has settled into view (`IntersectionObserver(threshold: 0.95)` scoped to the parent
  `<SnapSection>`); resets to `from` state on leave so replays work. Prop API and
  timing math live in `docs/design-system/motion.md`.
- **Hero is not a special case:** it's a `<SnapSection triggerOnMount>` so its
  `<Animate>` children fire on mount instead of on intersection. One mental model.
- **i18n-aware navigation:** always import `Link`, `useRouter`, `redirect` from
  `@/i18n/navigation` — never from `next/navigation` directly.

## Project documentation

- `docs/design-system/` — website-specific design system reference (philosophy, colors, tokens, typography, motion)
- `docs/integration-plan.md` — phased plan for integrating the design system

## Environment variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key

## Active decisions & constraints

- **Phase 3 migration mid-flight:** see `docs/integration-plan.md` for the current
  phase (3a scroll engine swap, 3b animation primitives, 3c section ports off Framer
  Motion, 3d cleanup). Do not begin work outside the named phase without explicit
  confirmation.
- **Playfair Display:** used exactly once on the entire site — the "Weniger Chaos"
  span inside the hero headline only. Do not add any other Playfair uses anywhere.
- **One viewport per section:** content must fit within `100dvh`. Sections that don't
  fit on mobile are reshaped to fit (e.g. Features → horizontal Embla carousel in
  Phase 4), not allowed to overflow.
- **Tailwind v4:** uses `@tailwindcss/postcss`, not the classic `tailwind.config.js`.
  CSS-first config in `globals.css`.

## What NOT to touch

- `messages/*.json` — all locales must stay in sync when adding/changing copy keys.
- `i18n/routing.ts` — locale list and `localePrefix` affect all URLs; coordinate with
  deploy config before changing.
- `pnpm-lock.yaml` — do not edit manually.
- Design tokens in `globals.css` (`@theme` block) — values come from
  `docs/design-system/hex-tables.md` and `motion.md`. Update those docs first if a
  token needs to change, then mirror in `globals.css`.
