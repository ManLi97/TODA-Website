# Project: TODA Website

Marketing landing page for TODA Tattoo Solutions — a SaaS platform for tattoo artists.
Single-page experience with 10 snap-slide sections (one viewport each), i18n (de/es/en),
and GSAP entrance animations triggered on snap-settle.
Built with Next.js 15 App Router, React 19, TypeScript, Tailwind v4.

## Tech stack

| Layer           | Technology                                                          |
|-----------------|---------------------------------------------------------------------|
| Framework       | Next.js 15 (App Router)                                             |
| Language        | TypeScript                                                          |
| Styling         | Tailwind CSS v4 (CSS-first `@theme` in `globals.css`)               |
| Scroll          | Native CSS scroll-snap (`y mandatory`)                              |
| Animations      | GSAP + CustomEase, triggered via IntersectionObserver scoped to `<SnapSection>`. |
| Carousel        | Embla Carousel                                                      |
| i18n            | next-intl (de / es / en, default: de)                               |
| Database/Auth   | Supabase (wired, not yet used in UI)                                |
| Package mgr     | pnpm                                                                |
| Deployment      | Vercel (inferred)                                                   |

## Workflow

- **Session start:** run `/git-context` to recover state
- **Architect-loop sessions (design system integration):** read `docs/integration-plan.md`
  § Current state, then propose the next PR prompt. Don't re-derive completed phases.
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

## Architecture

```
app/
  [locale]/
    layout.tsx        # root layout (no scroll provider — native snap handles it)
    page.tsx          # 10-section home page using <SnapSection>
    globals.css       # Tailwind base, design tokens, scroll-snap on `html`
components/
  snap-section.tsx    # layout primitive: min-h-dvh + scroll-snap-align/stop
  animate.tsx         # entrance wrapper — GSAP fromTo, IO-triggered, resets on leave
  stagger.tsx         # cascaded entrance for N children — same trigger model
  hero.tsx            # section 1 — uses <SnapSection triggerOnMount>
  bold-claim-section.tsx
  case-study-section.tsx
  social-proof-section.tsx
  testimonials-section.tsx
  pricing-section.tsx
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

## Key patterns

- **`<SnapSection>` is the layout primitive:** every section wraps in
  `<SnapSection variant="base|alt|raised" id triggerOnMount?>`. `min-h-dvh` +
  `scroll-snap-align: start` + `scroll-snap-stop: always`. Provides a React context
  exposing its DOM node so `<Animate>` / `<Stagger>` can scope their
  IntersectionObserver to it.
- **Surface rhythm:** base → alt → raised → base → alt → raised → base → alt → raised → base
  (10 sections in order). Canonical section list + surface map lives in
  `docs/integration-plan.md` § Section order & surface rhythm.
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

- **Design system integration is phased:** see `docs/integration-plan.md`
  § Current state. Plan is re-cut into Phase 4 (chrome & structure) →
  Phase 5 (visual atmosphere & component polish) → Phase 6 (content & assets).
  Phases 1–3 are complete. Do not begin work outside the named phase without
  explicit confirmation.
- **Playfair Display:** used exactly once on the entire site — the "Weniger Chaos"
  span inside the hero headline only. Do not add any other Playfair uses anywhere.
- **One viewport per section:** content must fit within `100dvh`. Sections that don't
  fit on mobile are reshaped to fit (e.g. Features → horizontal Embla carousel in
  Phase 5d), not allowed to overflow.
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
