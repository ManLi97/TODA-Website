-- Topic mining (Strom A of /blog-article mining): Reddit scrape snapshots.
-- Append-only snapshot semantics: one mining_runs row per Apify actor run;
-- topic_signals keyed (run_id, external_id) — same post in two runs = two rows.
-- Re-ingest of the SAME dataset is idempotent (mining_runs upserts on dataset_id,
-- signals on (run_id, external_id)). Classification is a separate auditable skill
-- step; scoring is the deterministic view topic_cluster_scores (outlier formula,
-- A/B-validated — docs/blog/topic-radar.md). Privacy: author fields are never
-- ingested; body is transient (retention sweep nulls it after 30 days); title
-- stays for audit. RLS enabled with zero policies = service-role-only, like
-- gsc_performance_daily and analytics_events.

create table public.mining_runs (
  id                 uuid primary key default gen_random_uuid(),
  ran_at             timestamptz not null default now(),
  pass               text not null check (pass in ('broad', 'seeded')),
  time_window        text not null check (time_window in ('week', 'month')),
  actor              text not null,
  apify_run_id       text,
  dataset_id         text,
  input              jsonb,
  item_count         integer,
  post_count         integer,
  field_coverage_pct numeric(5,2),
  status             text not null check (status in ('running', 'succeeded', 'failed')),
  error              text,
  constraint mining_runs_dataset_key unique (dataset_id)
);
create index mining_runs_ran_at_idx on public.mining_runs (ran_at desc);

create table public.topic_signals (
  id              uuid primary key default gen_random_uuid(),
  run_id          uuid not null references public.mining_runs (id) on delete cascade,
  external_id     text not null,
  source          text not null,
  title           text not null,
  body            text,
  flair           text,
  post_type       text,
  post_url        text,
  posted_at       timestamptz,
  up_votes        integer,
  comments_count  integer,
  is_seeded       boolean not null default false,
  matched_term    text,
  ingested_at     timestamptz not null default now(),
  body_cleared_at timestamptz,
  constraint topic_signals_run_post_key unique (run_id, external_id)
);
create index topic_signals_retention_idx
  on public.topic_signals (ingested_at) where body is not null;

create table public.topic_classifications (
  run_id        uuid not null,
  external_id   text not null,
  is_discussion boolean not null,
  cluster       text,
  note          text,
  classified_at timestamptz not null default now(),
  constraint topic_classifications_pkey primary key (run_id, external_id),
  constraint topic_classifications_signal_fkey
    foreign key (run_id, external_id)
    references public.topic_signals (run_id, external_id) on delete cascade
);

alter table public.mining_runs           enable row level security;
alter table public.topic_signals         enable row level security;
alter table public.topic_classifications enable row level security;

-- security_invoker: the view must honour the base tables' RLS instead of running
-- as its owner (which would bypass RLS and expose the rows to anon). PG15+.
create view public.topic_cluster_scores
with (security_invoker = true) as
with classified as (
  select s.run_id, s.source, c.cluster,
         (s.up_votes + 2 * s.comments_count)::numeric as engagement
  from public.topic_signals s
  join public.topic_classifications c
    on c.run_id = s.run_id and c.external_id = s.external_id
  where s.is_seeded = false
    and c.is_discussion
    and s.up_votes is not null
    and s.comments_count is not null
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

comment on table public.mining_runs is
  'One row per Apify actor run (Strom A /blog-article mining). Snapshot/append-only. dataset_id UNIQUE = idempotency anchor: re-ingesting the same dataset heals this row; failed runs without a dataset are plain inserts (multiple NULLs allowed). status running->succeeded|failed; stranded running = crashed ingest, not trustworthy.';
comment on table public.topic_signals is
  'Reddit post snapshots keyed (run_id, external_id) — same post in two runs = two rows (run-scoped medians). Author fields are NEVER ingested. body is transient: the retention sweep nulls it after 30 days (body_cleared_at audits when). title/metrics stay for audit and scoring.';
comment on column public.topic_signals.up_votes is
  'NULL = field missing in scrape (counts against field_coverage_pct); such rows are excluded from scoring.';
comment on table public.topic_classifications is
  'Skill/LLM-written verdicts (is_discussion, canonical cluster slug) — the auditable classification layer. cluster NULL = discussion without a cluster (counts into the source median, scores no cluster).';
comment on view public.topic_cluster_scores is
  'Deterministic outlier scoring (A/B-validated — docs/blog/topic-radar.md): engagement = up_votes + 2*comments_count; baseline = median engagement per (run_id, source) over classified discussion posts; score = sum(engagement/greatest(median,1)) per (run_id, cluster). security_invoker=true so base-table RLS applies. Seeded rows never enter (recall-only).';
