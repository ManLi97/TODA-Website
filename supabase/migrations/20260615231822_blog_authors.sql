-- Blog authors: a small admin-managed set of people, assigned per post (shell-level,
-- one author per post across all locales — like category_id and cover_image_path).
-- Writes happen exclusively via the service-role key (admin server actions);
-- RLS exposes author rows to anon for the article signature footer — there are
-- deliberately NO write policies, matching every other blog table.

-- ── Authors ─────────────────────────────────────────────────────────────────
create table public.blog_authors (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- person's name, not localized
  name        text not null,
  -- i18n short slogan keyed by locale: {"de": "...", "en": "...", "es": "..."}
  slogan      jsonb not null default '{}'::jsonb,
  -- object path inside the 'blog-authors' storage bucket (NULL = monogram fallback)
  avatar_path text,
  -- [{ "platform": "instagram", "url": "https://..." }, ...]
  socials     jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Author link on the post shell (nullable; posts keep existing if author deleted) ──
alter table public.blog_posts
  add column author_id uuid references public.blog_authors(id) on delete set null;
create index blog_posts_author_idx on public.blog_posts (author_id);

-- ── updated_at trigger (reuses the blog updated-at fn from the schema migration) ──
create trigger set_updated_at before update on public.blog_authors
  for each row execute function public.blog_set_updated_at();

-- ── RLS: anon may read all author rows (footer renders via the anon static client);
--    no write policies at all — service-role writes only ─────────────────────────
alter table public.blog_authors enable row level security;

create policy "public read authors"
  on public.blog_authors for select
  using (true);

-- ── Avatar storage bucket (public read; uploads via service-role only) ──────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-authors',
  'blog-authors',
  true,
  8388608, -- 8 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;
