// Blog draft insert (CLI regime — the write path of /blog-article, /podcast-article
// and /artist-story; the plugin write-MCP is retired). Service role in-process, only
// INSERTs into blog_posts + blog_post_translations, status 'draft', published_at NULL.
// Tomek runs it (or green-lights the run) after the skill's pre-action report.
//
//   pnpm blog:draft-insert <draft.json>
//
// draft.json: { category_slug | category_id, locale, slug, title, excerpt, content_md,
//   tags[], seo_title?, seo_description?, author_slug? | author_id?,
//   youtube_id?, video_start_seconds?, video_published_at? }
// Output: { post_id, id, slug, locale, content_length } — the SELECT-back is the proof.
import { readFileSync } from "node:fs";

import { createAdminClient } from "@/lib/supabase/admin";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env already exported
}

type Draft = {
  category_slug?: string;
  category_id?: string;
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  tags: string[];
  seo_title?: string | null;
  seo_description?: string | null;
  author_slug?: string | null;
  author_id?: string | null;
  youtube_id?: string | null;
  video_start_seconds?: number | null;
  video_published_at?: string | null;
};

const REQUIRED: (keyof Draft)[] = ["locale", "slug", "title", "excerpt", "content_md", "tags"];

async function main() {
  const path = process.argv[2];
  if (!path || path.startsWith("--")) throw new Error("usage: pnpm blog:draft-insert <draft.json>");
  const draft = JSON.parse(readFileSync(path, "utf8")) as Draft;
  for (const k of REQUIRED) {
    if (draft[k] === undefined || draft[k] === null || draft[k] === "")
      throw new Error(`draft.${k} is required`);
  }
  if (!Array.isArray(draft.tags) || draft.tags.length === 0) throw new Error("draft.tags must be a non-empty array");
  if (!draft.category_slug && !draft.category_id) throw new Error("draft.category_slug or category_id is required");

  const supabase = createAdminClient();

  let categoryId = draft.category_id ?? null;
  if (!categoryId) {
    const { data, error } = await supabase
      .from("blog_categories")
      .select("id")
      .eq("slug", draft.category_slug as string)
      .maybeSingle();
    if (error) throw new Error(`category lookup failed: ${error.message}`);
    if (!data) throw new Error(`category slug not found: ${draft.category_slug}`);
    categoryId = data.id as string;
  }

  let authorId = draft.author_id ?? null;
  if (!authorId && draft.author_slug) {
    const { data, error } = await supabase
      .from("blog_authors")
      .select("id")
      .eq("slug", draft.author_slug)
      .maybeSingle();
    if (error) throw new Error(`author lookup failed: ${error.message}`);
    if (!data) throw new Error(`author slug not found: ${draft.author_slug}`);
    authorId = data.id as string;
  }

  const { data: existing, error: dupErr } = await supabase
    .from("blog_post_translations")
    .select("id")
    .eq("locale", draft.locale)
    .eq("slug", draft.slug)
    .maybeSingle();
  if (dupErr) throw new Error(`slug check failed: ${dupErr.message}`);
  if (existing) throw new Error(`slug already exists for ${draft.locale}: ${draft.slug}`);

  const { data: post, error: postErr } = await supabase
    .from("blog_posts")
    .insert({ category_id: categoryId, author_id: authorId })
    .select("id")
    .single();
  if (postErr || !post) throw new Error(`blog_posts insert failed: ${postErr?.message ?? "no row"}`);

  const { data: tr, error: trErr } = await supabase
    .from("blog_post_translations")
    .insert({
      post_id: post.id,
      locale: draft.locale,
      slug: draft.slug,
      title: draft.title,
      excerpt: draft.excerpt,
      content_md: draft.content_md,
      tags: draft.tags,
      seo_title: draft.seo_title ?? null,
      seo_description: draft.seo_description ?? null,
      status: "draft",
      published_at: null,
      youtube_id: draft.youtube_id ?? null,
      video_start_seconds: draft.video_start_seconds ?? null,
      video_published_at: draft.video_published_at ?? null,
    })
    .select("id, post_id, slug, locale, status")
    .single();
  if (trErr || !tr) {
    // Never leave an orphan shell behind.
    await supabase.from("blog_posts").delete().eq("id", post.id);
    throw new Error(`blog_post_translations insert failed: ${trErr?.message ?? "no row"}`);
  }

  const { data: back, error: backErr } = await supabase
    .from("blog_post_translations")
    .select("id, post_id, slug, locale, status, content_md")
    .eq("id", tr.id)
    .single();
  if (backErr || !back) throw new Error(`read-back failed: ${backErr?.message ?? "no row"}`);
  console.log(
    JSON.stringify(
      {
        post_id: back.post_id,
        id: back.id,
        slug: back.slug,
        locale: back.locale,
        status: back.status,
        content_length: (back.content_md as string).length,
        review_url: `/admin/posts/${back.post_id}`,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error("[blog-draft-insert] FAILED:", err instanceof Error ? err.message : err);
  process.exit(1);
});
