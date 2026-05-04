# TODA Marketing Website — Phase 1: Foundation Setup

## Project context

You are initializing the marketing website for TODA Solutions (todasolutions.com).
This is a multi-phase project. Phase 1 goal: a running Next.js skeleton,
Supabase connected, i18n routing active for /de/. No UI, no design, no content yet.

Read this carefully before touching anything:

## Fixed tech stack (non-negotiable)

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS v4
- next-intl for i18n
- Supabase with @supabase/ssr (existing project, credentials via .env.local)
- Hosting: Vercel

## Requirements for this phase

### i18n

- Supported locales: de (launch), es and en will follow later — structure must support expansion
- Default locale: de
- Locale always in URL: /de/, never at root
- Set up next-intl correctly for Next.js 15 App Router conventions

### Supabase

- Set up browser client and server client using @supabase/ssr
- No DB queries or schema yet — connection only

### Environment

- .env.local with Supabase credentials (placeholders, not committed)
- .env.example committed with empty values

### Code quality

- Prettier configured
- ESLint configured
- Build must pass without errors or warnings

### Placeholder page

- /de/ renders a minimal placeholder — just enough to confirm routing works

## Your responsibilities

1. Make all structural and implementation decisions yourself — folder structure,
   file conventions, configuration approach. Choose what is correct for
   Next.js 15 + next-intl current best practices.

2. After completing the setup, write ARBEITS-NOTIZEN.md in the project root.
   Document: what was built, every structural decision you made and why,
   versions of key dependencies installed, anything that deviated from
   straightforward setup and why.

3. Output an investigation report with:
   - Full folder structure as a tree
   - Key decisions and rationale
   - Any issues encountered
   - What the developer needs to do manually after this prompt
     (Vercel deployment, DNS, env credentials)

Do not implement Vercel deployment. Do not touch DNS. Do not build any UI components.
