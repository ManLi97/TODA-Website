-- Community-Pulse-Pipeline v2 (Strom A of /blog-article + /community-voices):
-- Reddit/Apify single-source → weekly multi-source DeepAPI battery + YouTube Data API.
-- Additive only — no renames, no dropped columns: existing consumer SQL keeps running.
--   • mining_runs grows provider ('apify'|'deepapi'|'youtube_data_api') + source_key
--     (battery slot, e.g. 'yt-channels'); dataset_id (UNIQUE) generalises from Apify
--     dataset to provider ref: Apify dataset id (historic) | DeepAPI requestId |
--     'ytapi:{isoWeek}:comments:{videoId}'.
--   • topic_signals grows platform, metrics (whitelisted raw platform numbers, jsonb)
--     and engagement (numeric). engagement is non-NULL ONLY where scoring is proven:
--     reddit broad (up_votes + 2*comments_count) and YouTube channel reference rows
--     (views). Everything else (searches, hashtags, comments, web) = context rows with
--     engagement NULL — excluded from the score view but present in the one table.
--   • pass gains 'context' (broad = quantitative spine, seeded = recall,
--     context = qualitative battery).
--   • time_window becomes free text (battery windows like '6months'); check dropped.
--   • topic_cluster_scores v2: identical output columns; classified now reads the
--     engagement COLUMN instead of computing the Reddit formula, and filters on
--     engagement IS NOT NULL. Backfill below makes v2 ≡ v1 on all existing rows.
-- Privacy contract unchanged: commenter/author identities are NEVER ingested on any
-- platform. Channel handle of a published video = publisher attribution (allowed,
-- analogous to a subreddit). body keeps the 30-day retention sweep.

-- 1) mining_runs: provider + source_key ---------------------------------------
alter table public.mining_runs
  add column provider text not null default 'apify',
  add column source_key text;
alter table public.mining_runs add constraint mining_runs_provider_check
  check (provider in ('apify', 'deepapi', 'youtube_data_api'));
alter table public.mining_runs alter column provider drop default;
update public.mining_runs set source_key = 'reddit-' || pass where source_key is null;
alter table public.mining_runs drop constraint mining_runs_pass_check;
alter table public.mining_runs add constraint mining_runs_pass_check
  check (pass in ('broad', 'seeded', 'context'));
alter table public.mining_runs drop constraint mining_runs_time_window_check;
create index mining_runs_source_key_idx on public.mining_runs (source_key, ran_at desc);

-- 2) topic_signals: platform / metrics / engagement ---------------------------
alter table public.topic_signals
  add column platform text not null default 'reddit',
  add column metrics jsonb,
  add column engagement numeric;
alter table public.topic_signals add constraint topic_signals_platform_check
  check (platform in ('reddit', 'youtube', 'instagram', 'tiktok', 'web', 'facebook'));
alter table public.topic_signals alter column platform drop default;

-- 3) Backfill: identical formula the v1 view computed inline, so view v2 (reading
--    the column) returns byte-identical scores for every historic row.
update public.topic_signals set engagement = up_votes + 2 * comments_count
  where up_votes is not null and comments_count is not null;

-- 4) topic_cluster_scores v2 — output columns unchanged; only the classified CTE
--    changes (engagement column + IS NOT NULL filter). security_invoker stays.
create or replace view public.topic_cluster_scores
with (security_invoker = true) as
with classified as (
  select s.run_id, s.source, c.cluster, s.engagement
  from public.topic_signals s
  join public.topic_classifications c
    on c.run_id = s.run_id and c.external_id = s.external_id
  where s.is_seeded = false
    and c.is_discussion
    and s.engagement is not null
),
baselines as (
  select run_id, source,
         (percentile_cont(0.5) within group (order by engagement))::numeric
           as median_engagement
  from classified
  group by run_id, source
),
outliers as (
  select p.run_id, p.cluster, p.source,
         -- greatest(median,1): a degraded scrape with median 0 keeps the ratio
         -- finite; identical to the documented formula once median >= 1.
         p.engagement / greatest(b.median_engagement, 1) as outlier
  from classified p
  join baselines b on b.run_id = p.run_id and b.source = p.source
  where p.cluster is not null
)
select run_id, cluster,
       count(*)::int                              as n_posts,
       round(sum(outlier), 4)                     as score,
       array_agg(distinct source order by source) as sources,
       count(distinct source)::int                as n_sources,
       count(*) >= 3                              as trend_gate
from outliers
group by run_id, cluster;

-- 5) Comments -----------------------------------------------------------------
comment on table public.mining_runs is
  'One row per mining request (Strom A community pulse). Snapshot/append-only. provider = apify (historic) | deepapi | youtube_data_api; source_key = battery slot (e.g. yt-channels). dataset_id UNIQUE = idempotency anchor, generalised to a provider ref: Apify dataset id | DeepAPI requestId | ytapi:{isoWeek}:comments:{videoId} — re-ingesting the same ref heals this row. status running->succeeded|failed; stranded running = crashed ingest, not trustworthy.';
comment on column public.mining_runs.source_key is
  'Battery slot that produced the run (lib/mining/config.ts is the source of truth). Historic Apify rows carry reddit-broad / reddit-seeded.';
comment on column public.mining_runs.time_window is
  'Free text since v2 (e.g. week, month, 6months, n/a) — the battery encodes per-source windows.';
comment on table public.topic_signals is
  'Community-post snapshots keyed (run_id, external_id) — same post in two runs = two rows (run-scoped medians). Commenter/author identities are NEVER ingested on any platform; a channel handle of a published video is publisher attribution (allowed, like a subreddit). body is transient: the retention sweep nulls it after 30 days (body_cleared_at audits when). title/metrics stay for audit and scoring.';
comment on column public.topic_signals.platform is
  'Origin platform. source stays the median peer group: subreddit | @channel | search query | hashtag | yt:{videoId} / tiktok:{videoId} for comments | web query.';
comment on column public.topic_signals.metrics is
  'Whitelisted raw platform numbers (views, likes, comments, ...) — enables later A/B calibration to promote a source to scorable without a re-scrape. Never carries identities.';
comment on column public.topic_signals.engagement is
  'Scorable engagement — non-NULL ONLY where scoring is proven: reddit broad = up_votes + 2*comments_count; YouTube channel reference rows = views. NULL = context row, excluded from topic_cluster_scores.';
comment on view public.topic_cluster_scores is
  'Deterministic outlier scoring (A/B-validated — docs/blog/topic-radar.md): baseline = median engagement per (run_id, source) over classified discussion rows; score = sum(engagement/greatest(median,1)) per (run_id, cluster). v2 reads the engagement column (reddit broad formula / yt channel views). Channel rows: consumers MUST classify ALL channel reference rows of a run (is_discussion=true, cluster NULL unless topical) or the channel median shifts. security_invoker=true so base-table RLS applies. Seeded + context rows never enter.';
