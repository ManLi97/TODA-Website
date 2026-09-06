-- Community-Pulse-Pipeline v3: weekly delta + LLM enrichment + weekly digest.
-- Three layers in one shared DB (docs/blog/topic-radar.md, "Methode v3"):
--   Erhebung   mining_runs / topic_signals  — "only new" semantics (ingest dedupes on
--              (platform, external_id) across runs; yt-channels snapshots excepted) and
--              engagement for EVERY row except web/serp/reviews (D4 formulas in
--              lib/mining/mappers.ts) so topic_cluster_scores scores all sources.
--   Verdichtung topic_classifications       — grows the per-row LLM verdict (audience,
--              signal_type, language, anonymised quote, normalised question, review
--              feature, cluster_proposal, confidence, classified_by/model/prompt_version).
--   Digest     pulse_digests               — one row per ISO week (jsonb + markdown).
-- Plus pulse_jobs (lock + observability of the self-triggered cron chain, D9), the
-- views pulse_pending_signals / pulse_cluster_weekly and three SQL functions:
-- pulse_claim_job (atomic lock), pulse_digest_input (digest aggregates) and
-- pulse_quality_report (test-run rubric). Additive only — no renames, no dropped
-- columns; topic_cluster_scores is untouched (output columns identical).
-- Privacy contract unchanged: commenter/reviewer identities are never ingested.
-- The LLM quote (<= 280 chars, anonymised) is permanent; body keeps the 30-day TTL.
-- RLS on, zero policies on every new table = service-role-only (like v1/v2).

-- 1) mining_runs: more providers + ISO week -------------------------------------
alter table public.mining_runs drop constraint mining_runs_provider_check;
alter table public.mining_runs add constraint mining_runs_provider_check
  check (provider in ('apify', 'deepapi', 'youtube_data_api', 'apple_rss', 'google_play', 'serpapi'));
alter table public.mining_runs add column iso_week text;
update public.mining_runs
  set iso_week = to_char(ran_at at time zone 'UTC', 'IYYY-"W"IW')
  where iso_week is null;
alter table public.mining_runs
  alter column iso_week set default to_char(now() at time zone 'UTC', 'IYYY-"W"IW');
alter table public.mining_runs alter column iso_week set not null;
create index mining_runs_iso_week_idx on public.mining_runs (iso_week, source_key);

-- 2) topic_signals: more platforms + global dedupe index --------------------------
alter table public.topic_signals drop constraint topic_signals_platform_check;
alter table public.topic_signals add constraint topic_signals_platform_check
  check (platform in ('reddit', 'youtube', 'instagram', 'tiktok', 'web', 'facebook',
                      'appstore', 'playstore', 'trustpilot', 'serp'));
create index topic_signals_platform_external_idx on public.topic_signals (platform, external_id);

-- 3) engagement backfill (D4) for the v2 battery rows, from the whitelisted metrics
--    (same formulas as lib/mining/mappers.ts). Rows without a base metric stay NULL.
update public.topic_signals s
  set engagement = v.engagement
  from (
    select id,
      case
        when platform = 'youtube' and post_type = 'comment'
          then (metrics->>'likes')::numeric + 2 * coalesce((metrics->>'replies')::numeric, 0)
        when platform = 'youtube' and post_type = 'video'
          then (metrics->>'views')::numeric
        when platform = 'tiktok' and post_type = 'comment'
          then (metrics->>'likes')::numeric + 2 * coalesce((metrics->>'replies')::numeric, 0)
        when platform = 'tiktok' and post_type = 'video'
          then coalesce((metrics->>'plays')::numeric, 0) / 100
               + (metrics->>'likes')::numeric
               + 2 * coalesce((metrics->>'comments')::numeric, 0)
               + 3 * coalesce((metrics->>'shares')::numeric, 0)
        when platform = 'instagram'
          then (metrics->>'likes')::numeric + 2 * coalesce((metrics->>'comments')::numeric, 0)
               + case when post_type = 'Video' then coalesce((metrics->>'views')::numeric, 0) / 100 else 0 end
      end as engagement
    from public.topic_signals
    where engagement is null and metrics is not null
  ) v
  where v.id = s.id and v.engagement is not null;

-- 4) topic_classifications: LLM enrichment fields (additive) ---------------------
alter table public.topic_classifications
  add column audience text check (audience in ('artist', 'endkunde', 'mixed', 'off_topic')),
  add column signal_type text check (signal_type in ('question', 'complaint', 'wish', 'praise', 'experience', 'news', 'promo', 'other')),
  add column language text,
  add column quote text check (char_length(quote) <= 280),
  add column question text,
  add column feature text,
  add column cluster_proposal text,
  add column confidence numeric check (confidence between 0 and 1),
  add column classified_by text not null default 'skill' check (classified_by in ('skill', 'llm')),
  add column model text,
  add column prompt_version text;
create index topic_classifications_signal_type_idx
  on public.topic_classifications (signal_type) where signal_type is not null;

-- 5) pulse_digests: one digest per ISO week --------------------------------------
create table public.pulse_digests (
  id                 uuid primary key default gen_random_uuid(),
  iso_week           text not null unique,
  generated_at       timestamptz not null default now(),
  model              text not null,
  prompt_version     text not null,
  input_signal_count integer not null,
  digest             jsonb not null,
  digest_md          text not null,
  cost_usd           numeric,
  status             text not null default 'final' check (status in ('draft', 'final'))
);
alter table public.pulse_digests enable row level security;

-- 6) pulse_jobs: lock + observability of the cron chain (D9) ---------------------
create table public.pulse_jobs (
  id          uuid primary key default gen_random_uuid(),
  iso_week    text not null,
  step        text not null check (step in ('battery', 'comments', 'enrich', 'digest')),
  status      text not null check (status in ('running', 'succeeded', 'failed')),
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  attempts    integer not null default 1,
  result      jsonb,
  error       text,
  constraint pulse_jobs_week_step_key unique (iso_week, step)
);
alter table public.pulse_jobs enable row level security;

-- Atomic claim: returns the claimed row, or no row when a fresh 'running' entry
-- (younger than p_stale_minutes) holds the lock. ON CONFLICT ... WHERE is evaluated
-- under the row lock, so two concurrent cron firings cannot both win.
create function public.pulse_claim_job(p_iso_week text, p_step text, p_stale_minutes integer default 15)
returns setof public.pulse_jobs
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return query
    insert into public.pulse_jobs (iso_week, step, status, started_at, attempts)
    values (p_iso_week, p_step, 'running', now(), 1)
    on conflict (iso_week, step) do update
      set status = 'running', started_at = now(), finished_at = null, error = null,
          attempts = public.pulse_jobs.attempts + 1
      where public.pulse_jobs.status <> 'running'
         or public.pulse_jobs.started_at < now() - make_interval(mins => p_stale_minutes)
    returning *;
end
$$;
revoke execute on function public.pulse_claim_job(text, text, integer) from public, anon, authenticated;
grant execute on function public.pulse_claim_job(text, text, integer) to service_role;

-- 7) pulse_pending_signals: rows of succeeded runs without a verdict (anti-join in
--    SQL — the enrichment step pages through this view in batches).
create view public.pulse_pending_signals
with (security_invoker = true) as
select s.run_id, s.external_id, s.platform, s.source, r.source_key, s.post_type,
       s.title, s.body, s.metrics, s.engagement, s.posted_at, s.ingested_at, r.iso_week
from public.topic_signals s
join public.mining_runs r on r.id = s.run_id
where r.status = 'succeeded'
  and not exists (
    select 1 from public.topic_classifications c
    where c.run_id = s.run_id and c.external_id = s.external_id
  );

-- 8) pulse_cluster_weekly: per (iso_week, cluster) — counts over every classified
--    row with a cluster, score = sum of topic_cluster_scores over the week's runs.
create view public.pulse_cluster_weekly
with (security_invoker = true) as
with rows as (
  select r.iso_week, c.cluster, s.source, s.platform, c.signal_type, c.audience
  from public.topic_classifications c
  join public.topic_signals s on s.run_id = c.run_id and s.external_id = c.external_id
  join public.mining_runs r on r.id = c.run_id
  where c.cluster is not null and r.status = 'succeeded'
),
scores as (
  select r.iso_week, t.cluster, sum(t.score) as score
  from public.topic_cluster_scores t
  join public.mining_runs r on r.id = t.run_id
  group by r.iso_week, t.cluster
)
select x.iso_week, x.cluster,
       count(*)::int                                                as n_signals,
       count(distinct x.source)::int                                as n_sources,
       count(distinct x.platform)::int                              as n_platforms,
       coalesce(sc.score, 0)                                        as score,
       count(*) filter (where x.signal_type = 'question')::int      as n_questions,
       count(*) filter (where x.signal_type = 'complaint')::int     as n_complaints,
       count(*) filter (where x.signal_type = 'wish')::int          as n_wishes,
       count(*) filter (where x.signal_type = 'praise')::int        as n_praise,
       count(*) filter (where x.audience = 'artist')::int           as n_artist,
       count(*) filter (where x.audience = 'endkunde')::int         as n_endkunde,
       count(*) filter (where x.audience = 'mixed')::int            as n_mixed,
       (count(*) >= 3 and count(distinct x.source) >= 2)            as trend_gate
from rows x
left join scores sc on sc.iso_week = x.iso_week and sc.cluster = x.cluster
group by x.iso_week, x.cluster, sc.score;

-- 9) pulse_digest_input: every SQL aggregate the weekly digest needs, in ONE call
--    (stays far below the 8 s statement_timeout on ~1500 rows/week). First-party
--    reads (instagram_interactions, post_insights, gsc_performance_daily) are foreign
--    tables and stay in lib/mining/digest.ts. Reviews are aggregated WITHOUT source
--    (= competitor name): the digest never attributes pain points.
create function public.pulse_digest_input(p_iso_week text)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
with wk as (
  select p_iso_week as iso_week, to_date(p_iso_week, 'IYYY-"W"IW') as monday
),
prev_weeks as (
  select to_char(monday - (n * interval '1 week'), 'IYYY-"W"IW') as iso_week, n
  from wk, generate_series(1, 4) as n
),
runs as (
  select id, source_key from public.mining_runs
  where iso_week = p_iso_week and status = 'succeeded'
),
sig as (
  select s.run_id, s.external_id, s.platform, s.source, r.source_key, s.post_type, s.title,
         s.post_url, s.posted_at, s.engagement, s.metrics,
         c.audience, c.signal_type, c.language, c.quote, c.question, c.feature,
         c.cluster, c.confidence
  from public.topic_signals s
  join runs r on r.id = s.run_id
  left join public.topic_classifications c on c.run_id = s.run_id and c.external_id = s.external_id
),
useful as (
  select * from sig
  where audience is not null and audience <> 'off_topic'
    and signal_type not in ('promo', 'other')
),
clusters as (
  select w.cluster, w.n_signals, w.n_sources, w.n_platforms, w.score, w.n_questions,
         w.n_complaints, w.n_wishes, w.n_praise, w.n_artist, w.n_endkunde, w.n_mixed, w.trend_gate,
         (select coalesce(round(avg(p.n_signals), 1), 0) from public.pulse_cluster_weekly p
           where p.cluster = w.cluster and p.iso_week in (select iso_week from prev_weeks)) as avg_n_4w,
         (select count(*)::int from public.pulse_cluster_weekly p
           where p.cluster = w.cluster and p.iso_week in (select iso_week from prev_weeks)) as weeks_seen_4w
  from public.pulse_cluster_weekly w
  where w.iso_week = p_iso_week
),
video_rows as (
  select * from sig where post_type = 'video' and engagement is not null
),
video_medians as (
  select run_id, source, (percentile_cont(0.5) within group (order by engagement))::numeric as med
  from video_rows group by run_id, source
),
videos as (
  select v.run_id, v.external_id, v.platform, v.source, v.title, v.post_url, v.posted_at,
         v.engagement, round(v.engagement / greatest(m.med, 1), 2) as x_ratio,
         v.cluster, v.language, v.audience, v.signal_type
  from video_rows v
  join video_medians m on m.run_id = v.run_id and m.source = v.source
  order by x_ratio desc limit 15
),
reviews as (
  select feature, signal_type, count(*)::int as n,
         round(avg((metrics->>'rating')::numeric), 2) as avg_rating,
         (array_agg(quote order by engagement desc nulls last) filter (where quote is not null))[1:5] as quotes
  from sig
  where platform in ('appstore', 'playstore', 'trustpilot')
  group by feature, signal_type
),
proposals as (
  select lower(trim(c.cluster_proposal)) as proposal, count(*)::int as n
  from public.topic_classifications c
  join public.mining_runs r on r.id = c.run_id
  where c.cluster_proposal is not null and c.cluster_proposal <> ''
    and r.iso_week in (p_iso_week, (select iso_week from prev_weeks where n = 1))
  group by 1 having count(*) >= 2
),
slots as (
  select split_part(source_key, '/', 1) as slot,
         count(*)::int as n_rows,
         count(audience)::int as n_classified,
         count(*) filter (where language = 'de')::int as n_de,
         count(*) filter (where audience in ('artist', 'mixed'))::int as n_artist_mixed,
         count(*) filter (where audience is not null and audience <> 'off_topic'
                            and signal_type not in ('promo', 'other'))::int as n_useful
  from sig group by 1
)
select jsonb_build_object(
  'week', p_iso_week,
  'monday', (select monday from wk),
  'generated_at', now(),
  'counts', (select jsonb_build_object(
      'signals', count(*),
      'classified', count(audience),
      'pending', count(*) - count(audience),
      'de', count(*) filter (where language = 'de'),
      'useful', count(*) filter (where audience is not null and audience <> 'off_topic'
                                   and signal_type not in ('promo', 'other')),
      'useful_de', count(*) filter (where language = 'de' and audience is not null
                                      and audience <> 'off_topic' and signal_type not in ('promo', 'other'))
    ) from sig),
  'signal_types', (select coalesce(jsonb_object_agg(signal_type, n), '{}'::jsonb)
    from (select signal_type, count(*) as n from sig where signal_type is not null group by 1) t),
  'audiences', (select coalesce(jsonb_object_agg(audience, n), '{}'::jsonb)
    from (select audience, count(*) as n from sig where audience is not null group by 1) t),
  'languages', (select coalesce(jsonb_object_agg(language, n), '{}'::jsonb)
    from (select language, count(*) as n from sig where language is not null group by 1) t),
  'slots', (select coalesce(jsonb_agg(to_jsonb(s) order by s.slot), '[]'::jsonb) from slots s),
  'clusters', (select coalesce(jsonb_agg(to_jsonb(c) order by c.score desc, c.n_signals desc), '[]'::jsonb) from clusters c),
  'questions', (select coalesce(jsonb_agg(to_jsonb(q) order by (q.language = 'de') desc, q.engagement desc nulls last), '[]'::jsonb)
    from (select run_id, external_id, platform, source_key, language, audience, cluster, question, quote, engagement
          from useful where signal_type = 'question' and coalesce(question, quote) is not null
          order by (language = 'de') desc, engagement desc nulls last limit 60) q),
  'complaints', (select coalesce(jsonb_agg(to_jsonb(q) order by (q.language = 'de') desc, q.engagement desc nulls last), '[]'::jsonb)
    from (select run_id, external_id, platform, source_key, language, audience, cluster, quote, engagement
          from useful where signal_type = 'complaint' and quote is not null
          order by (language = 'de') desc, engagement desc nulls last limit 40) q),
  'wishes', (select coalesce(jsonb_agg(to_jsonb(q) order by (q.language = 'de') desc, q.engagement desc nulls last), '[]'::jsonb)
    from (select run_id, external_id, platform, source_key, language, audience, cluster, quote, engagement
          from useful where signal_type = 'wish' and quote is not null
          order by (language = 'de') desc, engagement desc nulls last limit 40) q),
  'praise', (select coalesce(jsonb_agg(to_jsonb(q) order by (q.language = 'de') desc, q.engagement desc nulls last), '[]'::jsonb)
    from (select run_id, external_id, platform, source_key, language, audience, cluster, quote, engagement
          from useful where signal_type = 'praise' and quote is not null
          order by (language = 'de') desc, engagement desc nulls last limit 30) q),
  'experiences', (select coalesce(jsonb_agg(to_jsonb(q) order by (q.language = 'de') desc, q.engagement desc nulls last), '[]'::jsonb)
    from (select run_id, external_id, platform, source_key, language, audience, cluster, quote, engagement
          from useful where signal_type = 'experience' and quote is not null
          order by (language = 'de') desc, engagement desc nulls last limit 30) q),
  'news', (select coalesce(jsonb_agg(to_jsonb(q) order by q.engagement desc nulls last), '[]'::jsonb)
    from (select run_id, external_id, platform, source_key, language, cluster, title, post_url, quote, engagement
          from useful where signal_type = 'news'
          order by engagement desc nulls last limit 20) q),
  'videos', (select coalesce(jsonb_agg(to_jsonb(v) order by v.x_ratio desc), '[]'::jsonb) from videos v),
  'reviews', (select coalesce(jsonb_agg(to_jsonb(r) order by r.n desc), '[]'::jsonb) from reviews r),
  'serp', (select coalesce(jsonb_agg(to_jsonb(s) order by s.source, s.title), '[]'::jsonb)
    from (select external_id, source, title, metrics from sig where platform = 'serp' limit 80) s),
  'cluster_proposals', (select coalesce(jsonb_agg(to_jsonb(p) order by p.n desc), '[]'::jsonb) from proposals p),
  'quotes', (select coalesce(jsonb_agg(to_jsonb(q) order by (q.language = 'de') desc, q.engagement desc nulls last), '[]'::jsonb)
    from (select run_id, external_id, platform, source_key, signal_type, cluster, audience, language, quote, engagement
          from useful where quote is not null
          order by (language = 'de') desc, engagement desc nulls last limit 40) q)
);
$$;
revoke execute on function public.pulse_digest_input(text) from public, anon, authenticated;
grant execute on function public.pulse_digest_input(text) to service_role;

-- 10) pulse_quality_report: the test-run rubric (Ebene 1 per slot + Ebene 2 totals)
--     — .claude/plans/community-pulse-v3/quality-rubrik.md. Costs are added in
--     scripts/pulse-quality.ts (unit prices live in lib/mining/config.ts).
create function public.pulse_quality_report(p_iso_week text)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
with runs as (
  select id, source_key, split_part(source_key, '/', 1) as slot, status, item_count, post_count, ran_at
  from public.mining_runs where iso_week = p_iso_week
),
sig as (
  select s.run_id, s.external_id, s.platform, s.source, r.slot, s.title, s.body, s.posted_at, s.metrics,
         r.ran_at, c.audience, c.signal_type, c.language, c.quote, c.cluster
  from public.topic_signals s
  join runs r on r.id = s.run_id
  left join public.topic_classifications c on c.run_id = s.run_id and c.external_id = s.external_id
),
per_slot as (
  select r.slot,
         count(*)::int as n_runs,
         count(*) filter (where r.status = 'succeeded')::int as n_succeeded,
         count(*) filter (where r.status = 'failed')::int as n_failed,
         coalesce(sum(r.item_count), 0)::int as n_raw,
         coalesce(sum(r.post_count), 0)::int as n_new
  from runs r group by r.slot
),
per_slot_sig as (
  select slot,
         count(*)::int as n_rows,
         count(audience)::int as n_classified,
         round(100.0 * count(*) filter (where language = 'de') / nullif(count(audience), 0), 1) as pct_de,
         round(avg(char_length(coalesce(title, '') || coalesce(body, ''))), 0) as avg_text_len,
         round(100.0 * count(*) filter (where audience in ('artist', 'mixed')) / nullif(count(audience), 0), 1) as pct_artist,
         round(100.0 * count(*) filter (where audience is not null and audience <> 'off_topic'
                                          and signal_type not in ('promo', 'other')) / nullif(count(audience), 0), 1) as pct_useful,
         round(100.0 * count(*) filter (where signal_type = 'promo') / nullif(count(audience), 0), 1) as pct_spam,
         round(100.0 * count(*) filter (where posted_at >= ran_at - interval '14 days') / nullif(count(posted_at), 0), 1) as pct_recent,
         count(*) filter (where audience is not null and audience <> 'off_topic'
                            and signal_type not in ('promo', 'other'))::int as n_useful,
         count(*) filter (where language = 'de' and audience is not null and audience <> 'off_topic'
                            and signal_type not in ('promo', 'other'))::int as n_useful_de
  from sig group by slot
),
slots as (
  select p.slot, p.n_runs, p.n_succeeded, p.n_failed, p.n_raw, p.n_new,
         round(100.0 * p.n_new / nullif(p.n_raw, 0), 1) as pct_new,
         s.n_rows, s.n_classified, s.pct_de, s.avg_text_len, s.pct_artist, s.pct_useful,
         s.pct_spam, s.pct_recent, s.n_useful, s.n_useful_de
  from per_slot p left join per_slot_sig s on s.slot = p.slot
)
select jsonb_build_object(
  'week', p_iso_week,
  'generated_at', now(),
  'slots', (select coalesce(jsonb_agg(to_jsonb(s) order by s.slot), '[]'::jsonb) from slots s),
  'totals', (select jsonb_build_object(
      'runs', (select count(*) from runs),
      'runs_failed', (select count(*) from runs where status = 'failed'),
      'signals', count(*),
      'classified', count(audience),
      'pending', count(*) - count(audience),
      'useful_de', count(*) filter (where language = 'de' and audience is not null and audience <> 'off_topic'
                                      and signal_type not in ('promo', 'other')),
      'questions_de', count(*) filter (where language = 'de' and signal_type = 'question'),
      'complaints_wishes_de', count(*) filter (where language = 'de' and signal_type in ('complaint', 'wish')),
      'review_rows', count(*) filter (where platform in ('appstore', 'playstore', 'trustpilot')),
      'identity_fields', count(*) filter (where metrics ?| array['author', 'username', 'userName', 'userImage', 'name']),
      'quotes', count(quote),
      'clusters_trend_gate', (select count(*) from public.pulse_cluster_weekly w
                                where w.iso_week = p_iso_week and w.trend_gate),
      'digest_exists', exists (select 1 from public.pulse_digests d where d.iso_week = p_iso_week)
    ) from sig)
);
$$;
revoke execute on function public.pulse_quality_report(text) from public, anon, authenticated;
grant execute on function public.pulse_quality_report(text) to service_role;

-- 11) Comments ---------------------------------------------------------------------
comment on column public.mining_runs.iso_week is
  'ISO-8601 week of the run (IYYY-"W"IW, UTC), e.g. 2026-W37 — the join key of the digest layer. Default = current week; the pipeline sets it explicitly.';
comment on column public.topic_signals.engagement is
  'Scorable engagement per platform (v3, D4 formulas in lib/mining/mappers.ts): reddit post = score + 2*comments; comment (reddit/youtube/tiktok/instagram) = likes + 2*replies; youtube video = views; tiktok video = plays/100 + likes + 2*comments + 3*shares; instagram post = likes + 2*comments (+ views/100 for video); facebook group post = reactions + 2*comments + 3*shares. NULL for web/serp/reviews (rating lives in metrics).';
comment on column public.topic_classifications.audience is
  'LLM verdict (v3): artist | endkunde | mixed | off_topic. Endkunden-Signale are labelled, never discarded (marketing/brand/positioning.md: Endkunde ist immer im Raum).';
comment on column public.topic_classifications.signal_type is
  'question | complaint | wish | praise | experience | news | promo | other — the digest groups quotes/questions by this.';
comment on column public.topic_classifications.language is
  'ISO-639-1 language of the signal as detected by the LLM (de/en/…) — never translated.';
comment on column public.topic_classifications.quote is
  'Verbatim excerpt (<= 280 chars) from title/body, anonymised: no names, handles, studio names or places. Permanent (survives the body TTL) — the material content later quotes.';
comment on column public.topic_classifications.question is
  'Normalised question (only for signal_type = question).';
comment on column public.topic_classifications.feature is
  'Review rows only: booking | deposits | calendar | messaging | payments | portfolio | pricing | onboarding | bugs | support | other. Aggregated in the digest WITHOUT the competitor name (marketing/strategy/claims.md: pain points unattributed).';
comment on column public.topic_classifications.cluster_proposal is
  'Free-text cluster suggestion when no registry slug fits. >= 5 hits in 2 weeks = registry candidate (docs/blog/topic-radar.md).';
comment on column public.topic_classifications.classified_by is
  'skill = written by a human-driven skill run (may overwrite llm rows deliberately); llm = written by the enrichment step (on conflict do nothing — the cron never overwrites).';
comment on table public.pulse_digests is
  'One weekly Community-Pulse digest per ISO week (Claude synthesis over pulse_digest_input + first-party reads). Consumers (/blog-article, marketing /community-voices, clip selection) read the digest first, then topic_signals/topic_classifications rows as evidence. Never names competitors next to complaints. Service-role only.';
comment on table public.pulse_jobs is
  'Lock + observability of the weekly chain battery -> comments -> enrich -> digest (D9). UNIQUE (iso_week, step); pulse_claim_job() claims atomically and refuses while a running entry younger than 15 min exists (Vercel crons can double-fire). result jsonb carries the step summary.';
comment on view public.pulse_pending_signals is
  'topic_signals of succeeded runs without a topic_classifications row — the enrichment queue (anti-join in SQL). security_invoker: base-table RLS applies.';
comment on view public.pulse_cluster_weekly is
  'Per (iso_week, cluster): n_signals/n_sources/n_platforms over all classified rows with a cluster, score = sum of topic_cluster_scores over the week''s runs, signal-type and audience splits, trend_gate = n >= 3 over >= 2 sources. Delta base for the digest (4 prior weeks).';
comment on function public.pulse_claim_job(text, text, integer) is
  'Atomic step lock on pulse_jobs: inserts or re-claims (attempts + 1) unless a running row younger than p_stale_minutes exists (then returns no row). Service-role only.';
comment on function public.pulse_digest_input(text) is
  'All SQL aggregates for the weekly digest of p_iso_week as one jsonb (clusters + 4-week delta, questions, complaints, wishes, praise, experiences, news, top videos by x-ratio, review feedback per feature WITHOUT competitor names, SERP rows, cluster proposals, top quotes, per-slot counts). Service-role only.';
comment on function public.pulse_quality_report(text) is
  'Test-run rubric per ISO week: per-slot n_raw/n_new/%new/%DE/avg text/%artist/%useful/%spam/%recent + weekly totals (useful DACH rows, questions, complaints+wishes, review rows, identity-field check, trend-gate clusters). Service-role only.';
