# Project: TODA Website

Marketing landing page for TODA Tattoo Solutions — a SaaS platform for tattoo artists.
Single-page experience with 9 stacked sticky sections, i18n (de/es/en), and GSAP scroll animations.
Built with Next.js 15 App Router, React 19, TypeScript, Tailwind v4.

## Tech stack

| Layer           | Technology                                     |
|-----------------|------------------------------------------------|
| Framework       | Next.js 15 (App Router)                        |
| Language        | TypeScript                                     |
| Styling         | Tailwind CSS v4                                |
| Animations      | GSAP + ScrollTrigger, Lenis; Framer Motion (`motion` package) still in use in `faq-section.tsx`, `testimonials-section.tsx`, `team-section.tsx` — slated for removal once Phase 3 ports them to GSAP/native React |
| Carousel        | Embla Carousel                                 |
| i18n            | next-intl (de / es / en, default: de)          |
| Database/Auth   | Supabase (wired, not yet used in UI)           |
| Package mgr     | pnpm                                           |
| Deployment      | Vercel (inferred)                              |

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

## Architecture

```
app/
  [locale]/
    layout.tsx        # root layout, LenisProvider wraps page
    page.tsx          # 9-section home page (Phase 5 in progress)
    globals.css       # Tailwind base, design tokens
components/
  sticky-section.tsx  # sticky stack tile + overflow pan (GSAP)
  scroll-reveal.tsx   # entrance animation wrapper
  hero.tsx            # section 1
  case-study-section.tsx
  testimonials-section.tsx
  faq-section.tsx
  team-section.tsx
  footer.tsx / header.tsx
  button.tsx / card.tsx / video-loop.tsx
  lenis-provider.tsx  # Lenis smooth scroll context
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

- **StickySection is the layout primitive:** every section wraps in `<StickySection variant="base|alt|raised" zIndex={N}>`. Handles sticky stacking and overflow content pan via GSAP ScrollTrigger (`sticky-section.tsx`).
- **Surface rhythm:** base → alt → raised → alt → raised → base → alt → raised → base (9 sections in order).
- **All copy via next-intl:** no hardcoded strings in components — everything reads from `messages/{locale}.json` under the `"home"` namespace.
- **ScrollReveal for entrances:** `scroll-reveal.tsx` is already pure GSAP (no Framer Motion). Slated for replacement by a unified `<Animate>` component (GSAP) in Phase 3 — do not extend ScrollReveal further.
- **Framer Motion (`motion` package) still active in three sections:** `faq-section.tsx` (accordion +→× rotate and answer fade via `motion`/`AnimatePresence`/`useReducedMotion`), `testimonials-section.tsx` (mobile carousel card mount animations, desktop `whileInView` entrance, `whileHover`/`whileTap` polaroid lift), and `team-section.tsx` (mobile carousel mount, desktop `containerVariants`/`itemVariants` stagger via `whileInView`). Phase 3 ports these to GSAP / native React before `motion` can be dropped.
- **i18n-aware navigation:** always import `Link`, `useRouter`, `redirect` from `@/i18n/navigation` — never from `next/navigation` directly.

## Project documentation

- `docs/design-system/` — website-specific design system reference (philosophy, colors, tokens, typography, motion)
- `docs/integration-plan.md` — phased plan for integrating the design system

## Environment variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key

## Active decisions & constraints

- **Phase 5 in progress:** 9-section structure is laid out; `VideoLoop src=""` is a placeholder pending real studio footage.
- **Playfair Display:** used exactly once on the entire site — the "Weniger Chaos" span inside the hero headline only. Do not add any other Playfair uses anywhere.
- **zIndex ladder:** each StickySection gets a fixed zIndex (10, 20, … 80) — maintain the sequence when adding sections.
- **Tailwind v4:** uses `@tailwindcss/postcss`, not the classic `tailwind.config.js`. CSS-first config in `globals.css`.

## What NOT to touch

- `components/sticky-section.tsx` — the sticky-stack scroll effect (card-over-card) and overflow pan live here. Structure, CSS classes (`sticky top-0 min-h-dvh`), and GSAP context must not change. This is the core UX mechanic of the site.
- `messages/*.json` — all locales must stay in sync when adding/changing copy keys.
- `i18n/routing.ts` — locale list and `localePrefix` affect all URLs; coordinate with deploy config before changing.
- `pnpm-lock.yaml` — do not edit manually.
