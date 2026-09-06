-- Community-Pulse v3.1 — digest input refinements after test run 1 (2026-09-06):
--   • videos (x-ratio list) exclude unclassified and off_topic rows — run 1 listed wrestling,
--     politics and diet clips because the median/outlier maths ignored the verdict.
--   • serp rows carry run_id so the digest can cite them as run_id|external_id.
-- Function body otherwise identical to 20260906171527_community_pulse_v3.sql.

create or replace function public.pulse_digest_input(p_iso_week text)
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
  select * from sig
  where post_type = 'video' and engagement is not null
    and audience is not null and audience <> 'off_topic'
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
    from (select run_id, external_id, source, post_type, title, metrics from sig where platform = 'serp' limit 80) s),
  'cluster_proposals', (select coalesce(jsonb_agg(to_jsonb(p) order by p.n desc), '[]'::jsonb) from proposals p),
  'quotes', (select coalesce(jsonb_agg(to_jsonb(q) order by (q.language = 'de') desc, q.engagement desc nulls last), '[]'::jsonb)
    from (select run_id, external_id, platform, source_key, signal_type, cluster, audience, language, quote, engagement
          from useful where quote is not null
          order by (language = 'de') desc, engagement desc nulls last limit 40) q)
);
$$;
revoke execute on function public.pulse_digest_input(text) from public, anon, authenticated;

grant execute on function public.pulse_digest_input(text) to service_role;
