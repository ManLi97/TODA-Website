-- Video embed fields on blog post translations: lets a translation reference a
-- source YouTube episode for the /podcast-article structured-field embed
-- (rendered outside content_md — never through the markdown sanitizer).
--
-- HISTORY-PARITY MIGRATION. These columns were applied to the shared toda-company
-- DB out-of-band (Supabase MCP apply_migration, version 20260614201615) and are
-- already live; the remote migration history already records this version. This
-- file only makes the local supabase/migrations/ history match remote — `db push`
-- sees the version as applied and runs nothing. Idempotent (IF NOT EXISTS) so it
-- is a safe no-op even if ever re-run. Do NOT `db pull` / `migration repair`.

alter table public.blog_post_translations
  add column if not exists youtube_id          text,
  add column if not exists video_start_seconds integer,
  add column if not exists video_published_at  timestamptz;
