-- Blog schema: posts (hreflang group) + per-locale translations + admin-managed categories.
-- Writes happen exclusively via the service-role key (admin server actions);
-- RLS exposes published content only — there are deliberately NO write policies.

-- ── Categories ──────────────────────────────────────────────────────────────
create table public.blog_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- i18n names keyed by locale: {"de": "...", "en": "...", "es": "..."}
  name        jsonb not null default '{}'::jsonb,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Posts — locale-independent shell; translations link via post_id ─────────
create table public.blog_posts (
  id               uuid primary key default gen_random_uuid(),
  category_id      uuid references public.blog_categories(id) on delete set null,
  -- object path inside the 'blog-covers' storage bucket
  cover_image_path text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── Per-locale translations; each publishes independently ───────────────────
create type public.blog_status as enum ('draft', 'published');

create table public.blog_post_translations (
  id              uuid primary key default gen_random_uuid(),
  post_id         uuid not null references public.blog_posts(id) on delete cascade,
  locale          text not null check (locale in ('de', 'es', 'en')),
  slug            text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title           text not null,
  excerpt         text not null default '',
  content_md      text not null default '',
  tags            text[] not null default '{}',
  seo_title       text,
  seo_description text,
  status          public.blog_status not null default 'draft',
  -- set on first publish, kept on re-publish (stable SEO date)
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (post_id, locale),
  unique (locale, slug)
);

create index blog_translations_listing_idx
  on public.blog_post_translations (locale, status, published_at desc);
create index blog_translations_post_idx
  on public.blog_post_translations (post_id);
create index blog_translations_tags_idx
  on public.blog_post_translations using gin (tags);
create index blog_posts_category_idx
  on public.blog_posts (category_id);

-- ── updated_at triggers ──────────────────────────────────────────────────────
create or replace function public.blog_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

create trigger set_updated_at before update on public.blog_categories
  for each row execute function public.blog_set_updated_at();
create trigger set_updated_at before update on public.blog_posts
  for each row execute function public.blog_set_updated_at();
create trigger set_updated_at before update on public.blog_post_translations
  for each row execute function public.blog_set_updated_at();

-- ── RLS: anon may read published content only; no write policies at all ─────
alter table public.blog_categories        enable row level security;
alter table public.blog_posts             enable row level security;
alter table public.blog_post_translations enable row level security;

create policy "public read categories"
  on public.blog_categories for select
  using (true);

create policy "public read published translations"
  on public.blog_post_translations for select
  using (status = 'published' and published_at <= now());

create policy "public read posts with published translation"
  on public.blog_posts for select
  using (
    exists (
      select 1
      from public.blog_post_translations t
      where t.post_id = id
        and t.status = 'published'
        and t.published_at <= now()
    )
  );
