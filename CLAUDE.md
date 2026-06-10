# Project: TODA Website

Marketing landing page for TODA Tattoo Solutions — a SaaS platform for tattoo artists.
Single-page experience with 10 full-height sections (`min-h-svh` each), plain smooth
scroll (no scroll-snap), i18n (de/es/en), and GSAP entrance reveals that fire once when
an element scrolls into view.
Built with Next.js 15 App Router, React 19, TypeScript, Tailwind v4.

## Tech stack

| Layer         | Technology                                                                      |
| ------------- | ------------------------------------------------------------------------------- |
| Framework     | Next.js 15 (App Router)                                                         |
| Language      | TypeScript                                                                      |
| Styling       | Tailwind CSS v4 (CSS-first `@theme` in `globals.css`)                           |
| Scroll        | Plain smooth scroll (no scroll-snap)                                            |
| Animations    | GSAP + CustomEase, fire-once entrances via element-scoped IntersectionObserver. |
| Carousel      | Embla Carousel                                                                  |
| i18n          | next-intl (de / es / en, default: de)                                           |
| Database/Auth | Supabase (wired, not yet used in UI)                                            |
| Package mgr   | pnpm                                                                            |
| Deployment    | Vercel (inferred)                                                               |

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
    layout.tsx        # root layout (no scroll provider — plain smooth scroll)
    page.tsx          # 10-section home page using <PageSection>
    globals.css       # Tailwind base, design tokens, smooth scroll on `html` (no snap)
    blog/
      page.tsx                      # blog listing (ISR, revalidate 3600)
      category/[category]/page.tsx  # category-filtered listing (path-based, SSG)
      [slug]/page.tsx               # article (ISR, per-locale publish, JSON-LD)
  admin/              # SECOND ROOT LAYOUT — env-var password gate, English-only,
    layout.tsx        # outside [locale]; middleware matcher excludes /admin
    page.tsx          # login (HMAC session cookie, lib/admin/auth.ts)
    (protected)/      # requireAdmin() gate: posts dashboard, editor, categories
  sitemap.ts          # all locales × published translations, hreflang alternates
  robots.ts           # disallow /admin
components/
  blog/               # post-card, post-grid, category-pills, article-header,
                      # blog-listing, reading-progress
  page-section.tsx    # layout primitive: min-h-svh + surface variant + reveal context
  animate.tsx         # entrance wrapper — GSAP fromTo, element-scoped IO, fires once
  reveal-group.tsx    # per-element entrance for N children — each fires on its own entry
  hero.tsx            # section 1 — uses <PageSection triggerOnMount>
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
    server.ts         # server-side Supabase client (SSR, cookies — NOT for ISR pages)
    static.ts         # cookie-less anon client — the ONLY client for public blog pages
    admin.ts          # service-role client (server-only) — the ONLY write path
  blog/               # queries (React cache), markdown pipeline, slugify, types
  admin/              # auth (HMAC cookie + requireAdmin), revalidate helper
supabase/migrations/  # blog schema + storage bucket DDL (applied to toda-company)
                      # NOTE: toda-company is a SHARED DB — migrations 001-010 belong to
                      # other repos and exist here only as comment-only stubs so `db push`
                      # accepts the remote history. If another repo adds a migration, add a
                      # matching stub. Never `migration repair --status reverted` or `db pull`.
middleware.ts         # next-intl locale routing (matcher excludes /admin and /api)
```

## Blog (Supabase CMS)

- **Data model:** `blog_posts` (shell: category, cover) ← `blog_post_translations`
  (per-locale slug/title/content_md/tags/status — **per-locale publish**) +
  `blog_categories` (jsonb i18n names, admin-managed). RLS: anon reads published
  only, **zero write policies** — all writes via service role in admin server actions.
- **Rendering:** ISR (`revalidate = 3600`) + on-demand `revalidateBlogPaths()` from
  every admin mutation. Public pages MUST use `lib/supabase/static.ts` — the
  cookie-based `server.ts` client forces dynamic rendering and kills ISR.
- **Markdown:** unified/remark/rehype with `rehype-sanitize` → HTML string in RSC;
  same pipeline powers the admin live preview client-side (`lib/blog/markdown.ts`).
- **hreflang discipline:** article alternates + sitemap entries are computed from
  _published_ sibling translations only — never emit a link to a draft locale.
- **Admin auth:** stateless HMAC cookie (`lib/admin/auth.ts`), password from
  `ADMIN_PASSWORD`. Every server action calls `requireAdmin()` itself — layouts
  do not protect actions. Swap to Supabase Auth later = replace `lib/admin/auth.ts`.

## Key patterns

- **`<PageSection>` is the layout primitive:** every section wraps in
  `<PageSection variant="base|alt|raised" id triggerOnMount?>`. `min-h-svh` (at least one
  viewport tall, grows with content — no scroll-snap). Provides a small React context
  carrying `triggerOnMount` so entrance wrappers know whether to fire on mount or on scroll.
- **Surface rhythm:** base → alt → raised → base → alt → raised → base → alt → raised → base
  (10 sections in order; the canonical list is `app/[locale]/page.tsx`).
- **Spacing rhythm via tokens, not raw values:** vertical spacing uses the fluid
  `--spacing-*` scale in `globals.css` — `section` / `block` / `group` / `element` tiers,
  each `clamp()`-based so gaps compress on mobile and breathe on desktop. Reach for
  `py-section`, `mb-block`, `gap-group`, etc.; don't hand-pick raw `mb-6` / `mb-10`. The
  repeated eyebrow → headline header is the `<SectionHeader>` primitive
  (`components/section-header.tsx`), which owns the header's content measure and internal rhythm.
  Caveat: never glue a class directly before a `${...}` interpolation in a `className` template
  literal — Tailwind's scanner silently drops it (put a space before the `${`).
- **All copy via next-intl:** no hardcoded strings in components — everything reads
  from `messages/{locale}.json` under the `"home"` namespace.
- **`<Animate>` and `<RevealGroup>` for entrances:** entrance tween fires **once** when the
  element itself scrolls into view (element-scoped `IntersectionObserver`, `rootMargin`
  reveal offset); no replay on scroll-back. Works regardless of section height. `<RevealGroup>`
  applies the same per-element trigger to each of N children (no inter-element delay — each
  child fires on its own entry). No pre-timed cascades anywhere except the narrative Origin
  section, which owns a deliberate GSAP timeline. Prop API lives in `docs/design-system/motion.md`.
- **Hero is the mount-fired case:** it's a `<PageSection triggerOnMount>` so its
  `<Animate>` children fire on mount instead of on scroll-in — the above-the-fold section
  animates immediately on load.
- **i18n-aware navigation:** always import `Link`, `useRouter`, `redirect` from
  `@/i18n/navigation` — never from `next/navigation` directly.

## Project documentation

- `docs/design-system/` — website-specific design system reference (philosophy, colors, tokens, typography, motion)

## Environment variables

Required in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (blog admin writes; server-only)
- `ADMIN_PASSWORD` — /admin login password
- `ADMIN_SESSION_SECRET` — HMAC key for the admin session cookie (32+ random bytes)
