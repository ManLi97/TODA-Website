"use server";

// Author mutations — same rules as category/post actions: self-checked auth,
// service-role writes, blanket blog revalidation (an author edit touches every
// article that author signs). Avatar uploads mirror the post cover flow.
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateBlogPaths } from "@/lib/admin/revalidate";
import { slugify } from "@/lib/blog/slugify";
import { SOCIAL_PLATFORMS, type SocialLink } from "@/lib/blog/types";

const AVATAR_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function saveAuthor(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formString(formData, "id") || null;
  const name = formString(formData, "name");
  const slug = slugify(formString(formData, "slug") || name);
  if (!name || !slug) throw new Error("Name (and slug) are required");

  const sloganDe = formString(formData, "sloganDe");
  const sloganEn = formString(formData, "sloganEn");
  const sloganEs = formString(formData, "sloganEs");

  // One URL input per supported platform → compact [{platform,url}] array.
  const socials: SocialLink[] = SOCIAL_PLATFORMS.flatMap((platform) => {
    const url = formString(formData, `social_${platform}`);
    return url ? [{ platform, url }] : [];
  });

  const row = {
    slug,
    name,
    slogan: {
      ...(sloganDe && { de: sloganDe }),
      ...(sloganEn && { en: sloganEn }),
      ...(sloganEs && { es: sloganEs }),
    },
    socials,
  };

  const supabase = createAdminClient();
  const { error } = id
    ? await supabase.from("blog_authors").update(row).eq("id", id)
    : await supabase.from("blog_authors").insert(row);
  if (error) throw new Error(`Author save failed: ${error.message}`);

  revalidateBlogPaths();
  revalidatePath("/admin/authors");
}

export async function uploadAuthorAvatar(formData: FormData): Promise<void> {
  await requireAdmin();
  const authorId = formString(formData, "authorId");
  const file = formData.get("file");
  if (!authorId) throw new Error("Missing authorId");
  if (!(file instanceof File) || file.size === 0) throw new Error("No file selected");
  const ext = AVATAR_TYPES[file.type];
  if (!ext) throw new Error(`Unsupported image type: ${file.type}`);
  if (file.size > 8 * 1024 * 1024) throw new Error("Image exceeds 8 MB");

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("blog_authors")
    .select("avatar_path")
    .eq("id", authorId)
    .maybeSingle();

  const path = `${authorId}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("blog-authors")
    .upload(path, file, { contentType: file.type });
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { error: updateError } = await supabase
    .from("blog_authors")
    .update({ avatar_path: path })
    .eq("id", authorId);
  if (updateError) throw new Error(`Avatar update failed: ${updateError.message}`);

  // Best-effort cleanup of the replaced object — a stale orphan is harmless.
  if (existing?.avatar_path) {
    await supabase.storage.from("blog-authors").remove([existing.avatar_path]);
  }

  revalidateBlogPaths();
  revalidatePath("/admin/authors");
}

export async function deleteAuthor(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) throw new Error("Missing author id");

  const supabase = createAdminClient();

  // Remove avatar objects first (DB cascade doesn't reach storage).
  const { data: objects } = await supabase.storage.from("blog-authors").list(id);
  if (objects && objects.length > 0) {
    await supabase.storage.from("blog-authors").remove(objects.map((o) => `${id}/${o.name}`));
  }

  // Posts keep existing (author_id → NULL via FK on delete set null).
  const { error } = await supabase.from("blog_authors").delete().eq("id", id);
  if (error) throw new Error(`Author delete failed: ${error.message}`);

  revalidateBlogPaths();
  revalidatePath("/admin/authors");
}
