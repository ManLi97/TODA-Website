-- Google Search Console daily performance snapshot.
-- Snapshot-and-keep: GSC retains only ~16 months, so we persist a copy here and
-- UPSERT restated days. One long-format table covers every (search type × dimension).
create table public.gsc_performance_daily (
  id               uuid primary key default gen_random_uuid(),
  site_property    text not null,             -- 'sc-domain:todasolutions.com' OR 'https://www.todasolutions.com/'
  date             date not null,             -- the GSC DATA day (not the pull time)
  search_type      text not null,             -- web | image | video | news | discover | googleNews
  dimension        text not null,             -- total | query | page | country | device | searchAppearance
  dimension_value  text not null default '',  -- value for `dimension`; '' for the dimension='total' rows
  clicks           integer not null default 0,
  impressions      integer not null default 0,
  ctr              numeric,                   -- AVERAGE (0..1) — non-additive
  position         numeric,                   -- AVERAGE — non-additive
  data_state       text,                      -- 'final' | 'all' at fetch time (restatement debugging)
  snapshot_at      timestamptz not null default now(),
  constraint gsc_performance_daily_key
    unique (site_property, date, search_type, dimension, dimension_value)
);

-- Query patterns: per-page-over-time, per-query-over-time, and daily totals.
create index gsc_perf_page_idx  on public.gsc_performance_daily (dimension_value, date) where dimension = 'page';
create index gsc_perf_query_idx on public.gsc_performance_daily (dimension_value, date) where dimension = 'query';
create index gsc_perf_total_idx on public.gsc_performance_daily (date) where dimension = 'total';

alter table public.gsc_performance_daily enable row level security;

comment on table public.gsc_performance_daily is
  'GSC Search Analytics snapshot (append/upsert). ctr/position are AVERAGES, never summed. Per-dimension click sums are LOWER than the daily total (GSC drops anonymized queries), so the dimension=''total'' rows carry the authoritative daily totals.';
