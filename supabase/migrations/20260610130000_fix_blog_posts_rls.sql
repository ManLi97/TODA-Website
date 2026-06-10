-- Fix: in 20260610120000 the posts RLS policy used an unqualified `id`, which
-- Postgres resolved to t.id (the translation's own id) → `t.post_id = t.id`
-- never matched and anon saw zero posts. Qualify with blog_posts.id.

drop policy "public read posts with published translation" on public.blog_posts;

create policy "public read posts with published translation"
  on public.blog_posts for select
  using (
    exists (
      select 1
      from public.blog_post_translations t
      where t.post_id = blog_posts.id
        and t.status = 'published'
        and t.published_at <= now()
    )
  );
