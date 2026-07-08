-- HISTORY-PARITY MIGRATION. Applied to the shared toda-company DB via Supabase MCP
-- apply_migration (version 20260708162653) and already live; the remote migration
-- history records this version. This file only keeps the local supabase/migrations/
-- history in sync so `db push` sees the version as applied and runs nothing. Do NOT
-- `db pull` / `migration repair`.
--
-- First-party, cookieless web analytics for the marketing site.
-- Ingest + later reads run EXCLUSIVELY via the service-role key (same pattern as the
-- blog tables): RLS is enabled with NO policies at all, so anon can neither read nor
-- write — the service role bypasses RLS for both the /api/collect ingest and future
-- admin dashboard reads.
--
-- Privacy: no raw IP is ever stored. `visitor_hash` is a daily-rotating salted hash
-- (sha256(utc_day + ANALYTICS_SALT + ip + user_agent)); because the UTC day is mixed
-- in, yesterday's hashes don't correlate with today's → no cross-day tracking, no
-- cookies, no consent banner required.

create table public.analytics_events (
  id            uuid primary key default gen_random_uuid(),
  event_type    text not null default 'pageview',      -- 'scroll'/'click' added in Phase 2
  path          text not null,                          -- '/de/blog/<slug>' (query stripped)
  locale        text check (locale in ('de', 'es', 'en')),
  is_article    boolean not null default false,
  referrer_host text,                                   -- 'google','instagram.com',… null = direct
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  country       text,                                   -- coarse geo (x-vercel-ip-country)
  device        text check (device in ('mobile', 'tablet', 'desktop')),
  visitor_hash  text not null,                          -- daily-salted, no raw IP
  props         jsonb not null default '{}'::jsonb,     -- long tail / Phase-2 fields
  created_at    timestamptz not null default now()
);

create index analytics_events_created_idx on public.analytics_events (created_at desc);
create index analytics_events_path_idx    on public.analytics_events (path, created_at desc);
create index analytics_events_article_idx on public.analytics_events (created_at desc) where is_article;

-- RLS on, deliberately NO policies — writes + reads go through the service-role key only.
alter table public.analytics_events enable row level security;
