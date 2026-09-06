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

## Claude Code workspace (`.claude/`)

- **`.claude/skills/blog-article/SKILL.md`** — the **self-evolving blog
  content pipeline** (`/blog-article`). Three phases: learning step
  (diff published articles against their pre-correction snapshots, then
  update its own rules), topic mining (reads the weekly community-pulse
  battery from the DB + cluster scoring), writing + draft insert into the
  Supabase blog CMS. It **never publishes** — Tomek reviews and publishes via
  `/admin`. Its knowledge base lives in `docs/blog/` (see Project
  documentation); the skill reads from and writes back to those docs on
  every run — skill and docs are one system, keep both in sync when
  changing either.
- **`.claude/skills/podcast-article/SKILL.md`** — the
  **podcast→article pipeline** (`/podcast-article`): recycles TODA's own
  longform YouTube podcast (*Toddcast*) into data-driven German blog
  articles — never 1:1 transcripts. **Shares the blog-article knowledge
  spine** (`docs/blog/`: `toda-context.md`, `sources.md`, `voice-learnings.md`,
  the same Supabase blog CMS + `originals/` snapshots + learning loop); adds
  its own `podcast-radar.md`. Embeds the source episode via the structured
  video fields (Blog → *Podcast embed infra*), names + quotes the hosts, and —
  like `/blog-article` — **never publishes**.
- **`.claude/skills/artist-story/SKILL.md`** — the **artist-story
  pipeline** (`/artist-story`): turns an artist's input material
  (shoot transcript, research dossier, own content, voice memo —
  outreach and interviews stay human work) into a blog article written
  in the artist's own first-person voice, as if he wrote it himself.
  First deliverable is always a standalone HTML preview in the exact
  site look (template in `assets/`) that goes to the artist for
  approval; DB insert only after his go, publish stays with Tomek.
  TODA is not a character in the text. Shares the blog knowledge spine
  (`docs/blog/`, same CMS, same learning loop).
- **`.claude/skills/supabase/SKILL.md`** — the **`/supabase` skill**: how to work
  with the SHARED, production Supabase DB (`znocynswpsfckyfumema`, co-owned by
  toda-company / toda-website / toda-productivity). Two MCP instances (stdio
  read-only, plugin write); **repo-owned tables only**; migrations applied via MCP
  and **mirrored byte-identically into `toda-company`** (the schema authority) +
  its `docs/db-ownership.md` — never `db push`. Consult it for any migration,
  table, RLS, or DML change against this DB.
- **`.claude/worktrees/`** — temporary git worktrees created by Claude
  Code agents for isolated work. Disposable, gitignored — never commit
  or reference their contents.
- **`.claude/settings.local.json`** — machine-local Claude Code config,
  gitignored.

## Commands

```bash
pnpm dev          # start dev server (Next.js)
pnpm build        # production build
pnpm lint         # ESLint via next lint
pnpm format       # Prettier write
pnpm format:check # Prettier check (CI)
pnpm gsc:inspect  # GSC URL-Inspection of every sitemap URL + sitemap status (readonly evidence)
```

## Deployment

**No Git auto-deploy** — GitHub pushes do NOT trigger Vercel builds. Production deploys
run via CLI from the LOCAL tree: `vercel deploy --prod`. Precondition (global git
workflow): checkout on `main`, clean, in sync with `origin/main` — verify first.
Cron trigger for tests: Dashboard → Settings → Cron Jobs → Run (`CRON_SECRET` is a
Sensitive env var — not pullable via `vercel env pull`, so external curl triggers need
the value from Tomek's password manager, not from Vercel).

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
  sitemap.ts          # all locales × published translations, hreflang alternates + x-default
                      # (lib/seo/alternates.ts — same builder as <head>); legal pages DE-only
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
  routing.ts          # defineRouting — locales, localePrefix "always", localeDetection false
                      # (unprefixed → /de deterministically), localeCookie false, alternateLinks false
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
middleware.ts         # next-intl locale routing, every locale redirect rewritten 307 → 308
                      # (matcher excludes /admin and /api)
```

## Blog (Supabase CMS)

- **Data model:** `blog_posts` (shell: category, cover, **author**) ← `blog_post_translations`
  (per-locale slug/title/content_md/tags/status — **per-locale publish**) +
  `blog_categories` (jsonb i18n names, admin-managed) + `blog_authors`
  (admin-managed people; nullable `author_id` on the shell, one author per post
  across locales → renders the article signature footer). RLS: anon reads
  published only (author rows readable for the footer), **zero write policies** —
  all writes via service role in admin server actions.
- **Podcast embed infra:** `blog_post_translations` also carries `youtube_id` /
  `video_start_seconds` / `video_published_at` (all nullable) — the structured-field
  path for embedding a source episode in `/podcast-article` output. Rendered
  **outside `content_md`** (template + facade + `VideoObject` JSON-LD) so the
  markdown sanitizer is never opened for raw iframes. Columns are live; the render
  path is built incrementally with the skill.
- **Rendering:** ISR (`revalidate = 3600`) + on-demand `revalidateBlogPaths()` from
  every admin mutation. Public pages MUST use `lib/supabase/static.ts` — the
  cookie-based `server.ts` client forces dynamic rendering and kills ISR.
- **Markdown:** unified/remark/rehype with `rehype-sanitize` → HTML string in RSC;
  same pipeline powers the admin live preview client-side (`lib/blog/markdown.ts`).
- **hreflang discipline:** article alternates + sitemap entries are computed from
  _published_ sibling translations only — never emit a link to a draft locale. Every
  alternate set carries `x-default` = the German URL (article without a published DE
  sibling: its own URL); `<head>` and sitemap use the same builder
  (`lib/seo/alternates.ts`) so they never diverge. No hreflang `Link` header — next-intl
  `alternateLinks` is off. Legal pages (`/imprint`, `/privacy`) are German under every
  prefix: canonical = `/de/...`, no hreflang, sitemap lists the DE URL once. Full
  contract: `docs/seo/url-contract.md`.
- **Admin auth:** stateless HMAC cookie (`lib/admin/auth.ts`), password from
  `ADMIN_PASSWORD`. Every server action calls `requireAdmin()` itself — layouts
  do not protect actions. Swap to Supabase Auth later = replace `lib/admin/auth.ts`.

## Analytics & Search Console (time-series for the Company Dashboard)

First-party, cookieless, **snapshot / append-only** — never overwrite in realtime; the website is
a time-series source in the shared **toda-company** DB (`znocynswpsfckyfumema`).

- **On-site behavior** → `analytics_events` (append-only). `components/analytics-beacon.tsx` records
  one **pageview** per navigation; `components/analytics-engagement.tsx` records one **engagement**
  (max scroll depth + dwell) per page-view on the first terminal signal (tab hidden / pagehide / SPA
  nav). Both share a per-visit `sessionStorage` id (`lib/analytics/session.ts`). Ingest + validation:
  `app/api/collect/route.ts` (server is the sole validator; always 204). No cookies, no raw IP
  (daily-salted hash → per-day identity only). Bounce / session-duration / finish-rate are computed
  at query time, not stored.
- **Google Search Console** → `gsc_performance_daily` (long-format snapshot). `lib/gsc/*` calls the
  Search Analytics API with a service-account JWT; `app/api/cron/gsc-sync/route.ts` (daily Vercel cron
  in `vercel.json`) UPSERTs a 7-day trailing window (`dataState=all`, restatement-safe);
  `scripts/gsc-backfill.ts` (`pnpm gsc:backfill`, off-Vercel) does the one-time ~16-month backfill
  (`dataState=final`). The `dimension='total'` rows carry the authoritative daily totals (per-dimension
  sums are lower — GSC drops anonymized queries).
- **Community-pulse pipeline v3** (Strom A of `/blog-article` + consumed by the marketing repo's
  `/community-voices` and the clip selection — NOT the dashboard). Three layers in the shared DB:
  **Erhebung** `mining_runs` / `topic_signals` → **Verdichtung** `topic_classifications` (per-row LLM
  verdict: `audience`, `signal_type`, `language`, `cluster`, anonymised `quote`, `question`, `feature`,
  `classified_by`/`model`/`prompt_version`) → **Digest** `pulse_digests` (one jsonb + md per ISO week);
  plus `pulse_jobs` (chain lock), views `pulse_pending_signals` / `pulse_cluster_weekly` and SQL functions
  `pulse_claim_job` / `pulse_digest_input` / `pulse_quality_report`. `lib/mining/*` runs a FIXED weekly
  battery (`lib/mining/config.ts` = source of truth): DeepAPI (YouTube search + reference channels, Reddit
  search/broad/comments, IG hashtags/accounts/comments, TikTok search/comments, FB groups, web) + YouTube
  Data API v3 `commentThreads` (free; never its `search`) + competitor reviews (Apple RSS, `google-play-scraper`,
  Trustpilot via DeepAPI extract — only the 5 profiled competitors, never attributed in the digest) + SerpApi
  (google_trends DE, People-also-ask). **"Only new" (D2):** API `since` filters where they exist, otherwise
  ingest dedupe on `(platform, external_id)` across runs (yt-channels + serp/trends stay snapshot slots);
  0 new rows = `succeeded`. **Comment targets are dynamic** (top German posts of the week per platform from
  the DB). **Whitelist mappers** (no author/commenter/reviewer identities, ever; `body` 30-day TTL, the LLM
  `quote` is permanent). `engagement` is non-NULL for every platform row (formulas in `mappers.ts`; web/serp/
  reviews NULL) so `topic_cluster_scores` (unchanged) scores all sources. Chain (D9): cron `mining-sync`
  (Monday 06:00 UTC, `vercel.json`) → `pulse-worker?step=comments` → `enrich` (self-retrigger) → `digest`;
  every route answers 202 and works in `after()`, `pulse_claim_job` refuses a running step < 15 min (409).
  CLI mirror `pnpm mining:sync` (`--source <key>`, `--comments`, `--enrich`, `--digest`, `--reclassify
  <version>`, `--quality`, `--dry-cost`, `--balance`, `--request <id> --source <key>`, `--fresh`, `--week`) +
  `pnpm pulse:quality`. Idempotency keys `toda-mining:v3:{isoWeek}:{slot}`. Needs `DEEPAPI_*`,
  `YOUTUBE_API_KEY`, `SERP_API_KEY`, `ANTHROPIC_API_KEY` (missing key = visible failed row / failed job).
  Methodology: `docs/blog/topic-radar.md` ("Methode v3"); test-run rubric `.claude/plans/community-pulse-v3/`.

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
- `docs/seo/url-contract.md` — binding URL contract (canonical `/{locale}/…`, hreflang + `x-default`,
  308 redirects, legal-page canonical, breadcrumbs), the GSC finding behind it, curl verification
  recipe and dated status lines
- `docs/blog/` — knowledge base of the `/blog-article` skill (four layers):
  - `toda-context.md` — declared brand voice, product blocks, hard editorial rules
  - `voice-learnings.md` — **measured** voice: style rules distilled from Tomek's
    corrections (original vs. published diff) + evaluation log
  - `sources.md` — source library: Tier 1–2 (fact-bearing, verified) / Tier 3
    (community signal, mood only) + channel-intake protocol for new scrape sources
  - `topic-radar.md` — append-only mining protocol: every topic decision with
    scrape parameters, cluster scores, and reasoning
  - `originals/` — pre-correction snapshots of every inserted draft. **Load-bearing
    for the learning loop** (the admin editor overwrites the DB copy on edit) —
    never delete or rewrite these.

## Environment variables

Required in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (blog admin writes; server-only)
- `ADMIN_PASSWORD` — /admin login password
- `ADMIN_SESSION_SECRET` — HMAC key for the admin session cookie (32+ random bytes)
- `ANALYTICS_SALT` — daily-rotating salt for the anonymous visitor hash (server-only)
- `GSC_SITE_URL` — Search Console property (`sc-domain:todasolutions.com` or `https://www.todasolutions.com/`)
- `GSC_SA_KEY` — GSC service-account JSON key as a string (Vercel Production)
- `GSC_SA_KEY_FILE` — path to the GSC service-account JSON key file (local dev; on Tomek's machine
  `~/.toda-secrets/gsc-sa-toda-gsc-snap.json`, passed as an env prefix — `.env.local` holds no `GSC_*`)
- `CRON_SECRET` — Bearer token authenticating `/api/cron/gsc-sync`, `/api/cron/mining-sync` and
  `/api/cron/pulse-worker` (the chain sends it to itself)
- `DEEPAPI_API_BASE_URL` / `DEEPAPI_API_KEY` — DeepAPI for the community-pulse battery (server-only;
  local dev: `source ~/.deepapi/env`)
- `YOUTUBE_API_KEY` — YouTube Data API v3 for yt-comments (battery Phase 2 + on-demand skill scrapes;
  missing → yt-comments becomes a visible failed mining_runs row)
- `SERP_API_KEY` — SerpApi for the battery slots `serp/trends/*` + `serp/paa/*` (~8 searches/week) and German
  search volumes in skill runs
- `ANTHROPIC_API_KEY` — Claude Opus 5 for the enrichment + digest steps (server-only)
- `PULSE_BASE_URL` — optional chain base URL when `VERCEL_PROJECT_PRODUCTION_URL` is absent (defaults to the request origin)
