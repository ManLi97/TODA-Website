// Blog artist assets (CLI regime — companion of blog-draft-insert.ts for /artist-story).
// Upserts the artist as blog author with avatar, and sets the cover of an existing draft.
// Mirrors the admin server actions (authors/actions.ts, posts/actions.ts): same buckets,
// same `<id>/<Date.now()>.<ext>` paths, same UPDATE of the path column. Never DELETEs.
//
//   pnpm blog:artist-assets <assets.json> [--dry-run]
//
// assets.json: {
//   author?: { slug, name, slogan: { de, en?, es? }, socials: [{ platform, url }], avatar_file },
//   cover?:  { slug, locale, cover_file }
// }
// Rules: images must be JPEG (magic bytes checked); an existing author keeps its row and
// avatar; a post that already has a cover is refused (replace covers in /admin).
// Output: { author_id, avatar_path, post_id, cover_image_path } — the SELECT-back is the proof.
import { readFileSync } from "node:fs";
import { extname } from "node:path";

import { createAdminClient } from "@/lib/supabase/admin";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env already exported
}

type Assets = {
  author?: {
    slug: string;
    name: string;
    slogan: Record<string, string>;
    socials: { platform: string; url: string }[];
    avatar_file: string;
  };
  cover?: { slug: string; locale: string; cover_file: string };
};

function readJpeg(path: string): Buffer {
  const buf = readFileSync(path);
  const isJpeg = buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const ext = extname(path).toLowerCase();
  if (!isJpeg || ![".jpg", ".jpeg"].includes(ext)) throw new Error(`${path}: JPEG required (magic bytes + .jpg/.jpeg)`);
  return buf;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const path = args.find((a) => !a.startsWith("--"));
  if (!path) throw new Error("usage: pnpm blog:artist-assets <assets.json> [--dry-run]");
  const assets = JSON.parse(readFileSync(path, "utf8")) as Assets;
  if (!assets.author && !assets.cover) throw new Error("assets.author or assets.cover is required");

  const supabase = createAdminClient();
  const result: Record<string, string | null> = {};

  if (assets.author) {
    const a = assets.author;
    for (const k of ["slug", "name", "slogan", "socials", "avatar_file"] as const) {
      if (a[k] === undefined || a[k] === null || a[k] === "") throw new Error(`author.${k} is required`);
    }
    if (!a.slogan.de) throw new Error("author.slogan.de is required");
    const avatar = readJpeg(a.avatar_file);
    const { data: existing, error: lookupErr } = await supabase
      .from("blog_authors")
      .select("id, avatar_path")
      .eq("slug", a.slug)
      .maybeSingle();
    if (lookupErr) throw new Error(`author lookup failed: ${lookupErr.message}`);

    if (existing) {
      console.log(`author ${a.slug} exists (${existing.id}) — row and avatar kept`);
      result.author_id = existing.id as string;
      result.avatar_path = (existing.avatar_path as string | null) ?? null;
    } else if (dryRun) {
      console.log(`DRY RUN: would INSERT blog_authors ${a.slug} (${a.name}) and upload avatar ${avatar.length} bytes`);
    } else {
      const { data: inserted, error: insErr } = await supabase
        .from("blog_authors")
        .insert({ slug: a.slug, name: a.name, slogan: a.slogan, socials: a.socials })
        .select("id")
        .single();
      if (insErr) throw new Error(`author insert failed: ${insErr.message}`);
      const authorId = inserted.id as string;
      const avatarPath = `${authorId}/${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("blog-authors")
        .upload(avatarPath, avatar, { contentType: "image/jpeg" });
      if (upErr) throw new Error(`avatar upload failed: ${upErr.message}`);
      const { error: updErr } = await supabase.from("blog_authors").update({ avatar_path: avatarPath }).eq("id", authorId);
      if (updErr) throw new Error(`avatar_path update failed: ${updErr.message}`);
      result.author_id = authorId;
      result.avatar_path = avatarPath;
    }
  }

  if (assets.cover) {
    const c = assets.cover;
    for (const k of ["slug", "locale", "cover_file"] as const) {
      if (!c[k]) throw new Error(`cover.${k} is required`);
    }
    const cover = readJpeg(c.cover_file);
    const { data: tr, error: trErr } = await supabase
      .from("blog_post_translations")
      .select("post_id, status")
      .eq("slug", c.slug)
      .eq("locale", c.locale)
      .maybeSingle();
    if (trErr) throw new Error(`translation lookup failed: ${trErr.message}`);
    if (!tr) throw new Error(`no translation for slug ${c.slug} (${c.locale}) — insert the draft first`);
    const postId = tr.post_id as string;
    const { data: post, error: postErr } = await supabase
      .from("blog_posts")
      .select("cover_image_path")
      .eq("id", postId)
      .single();
    if (postErr) throw new Error(`post lookup failed: ${postErr.message}`);
    if (post.cover_image_path) throw new Error(`post ${postId} already has a cover (${post.cover_image_path}) — replace it in /admin`);

    if (dryRun) {
      console.log(`DRY RUN: would upload cover ${cover.length} bytes to blog-covers/${postId}/<ts>.jpg and set cover_image_path`);
      result.post_id = postId;
    } else {
      const coverPath = `${postId}/${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("blog-covers")
        .upload(coverPath, cover, { contentType: "image/jpeg" });
      if (upErr) throw new Error(`cover upload failed: ${upErr.message}`);
      const { error: updErr } = await supabase.from("blog_posts").update({ cover_image_path: coverPath }).eq("id", postId);
      if (updErr) throw new Error(`cover_image_path update failed: ${updErr.message}`);
      result.post_id = postId;
      result.cover_image_path = coverPath;
    }
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
