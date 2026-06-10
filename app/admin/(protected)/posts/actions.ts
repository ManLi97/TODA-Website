"use server";

// All blog post mutations. Every action self-checks the session
// (requireAdmin) and writes through the service-role client — the anon key
// has no write path (RLS has zero write policies).
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateBlogPaths } from "@/lib/admin/revalidate";
import { slugify } from "@/lib/blog/slugify";
import { routing } from "@/i18n/routing";

const COVER_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Reads the translation fields shared by save/publish/unpublish. */
function translationFromForm(formData: FormData) {
  const postId = formString(formData, "postId");
  const locale = formString(formData, "locale");
  if (!postId) throw new Error("Missing postId");
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    throw new Error(`Invalid locale: ${locale}`);
  }

  const title = formString(formData, "title");
  const slug = slugify(formString(formData, "slug") || title);
  if (!title || !slug) throw new Error("Title (and slug) are required");

  return {
    post_id: postId,
    locale,
    title,
    slug,
    excerpt: formString(formData, "excerpt"),
    content_md: formString(formData, "contentMd"),
    tags: formString(formData, "tags")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    seo_title: formString(formData, "seoTitle") || null,
    seo_description: formString(formData, "seoDescription") || null,
  };
}

async function upsertTranslation(
  formData: FormData,
  status?: "draft" | "published"
): Promise<void> {
  await requireAdmin();
  const row = translationFromForm(formData);
  const supabase = createAdminClient();

  let publishedAt: string | undefined;
  if (status === "published") {
    // Keep the original publish date on re-publish (stable SEO date).
    const { data: existing } = await supabase
      .from("blog_post_translations")
      .select("published_at")
      .eq("post_id", row.post_id)
      .eq("locale", row.locale)
      .maybeSingle();
    publishedAt = existing?.published_at ?? new Date().toISOString();
  }

  const { error } = await supabase.from("blog_post_translations").upsert(
    {
      ...row,
      ...(status && { status }),
      ...(publishedAt && { published_at: publishedAt }),
    },
    { onConflict: "post_id,locale" }
  );
  if (error) throw new Error(`Save failed: ${error.message}`);

  revalidateBlogPaths();
  revalidatePath(`/admin/posts/${row.post_id}`);
  revalidatePath("/admin/posts");
}

export async function saveTranslation(formData: FormData): Promise<void> {
  await upsertTranslation(formData);
}

export async function publishTranslation(formData: FormData): Promise<void> {
  await upsertTranslation(formData, "published");
}

export async function unpublishTranslation(formData: FormData): Promise<void> {
  await upsertTranslation(formData, "draft");
}

export async function createPost(): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("blog_posts").insert({}).select("id").single();
  if (error || !data) throw new Error(`Create failed: ${error?.message}`);
  redirect(`/admin/posts/${data.id}`);
}

export async function setCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const postId = formString(formData, "postId");
  const categoryId = formString(formData, "categoryId") || null;
  if (!postId) throw new Error("Missing postId");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("blog_posts")
    .update({ category_id: categoryId })
    .eq("id", postId);
  if (error) throw new Error(`Category update failed: ${error.message}`);

  revalidateBlogPaths();
  revalidatePath(`/admin/posts/${postId}`);
}

export async function uploadCover(formData: FormData): Promise<void> {
  await requireAdmin();
  const postId = formString(formData, "postId");
  const file = formData.get("file");
  if (!postId) throw new Error("Missing postId");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file selected");
  }
  const ext = COVER_TYPES[file.type];
  if (!ext) throw new Error(`Unsupported image type: ${file.type}`);
  if (file.size > 8 * 1024 * 1024) throw new Error("Image exceeds 8 MB");

  const supabase = createAdminClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("cover_image_path")
    .eq("id", postId)
    .maybeSingle();

  const path = `${postId}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("blog-covers")
    .upload(path, file, { contentType: file.type });
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { error: updateError } = await supabase
    .from("blog_posts")
    .update({ cover_image_path: path })
    .eq("id", postId);
  if (updateError) throw new Error(`Cover update failed: ${updateError.message}`);

  // Best-effort cleanup of the replaced object — a stale orphan is harmless.
  if (post?.cover_image_path) {
    await supabase.storage.from("blog-covers").remove([post.cover_image_path]);
  }

  revalidateBlogPaths();
  revalidatePath(`/admin/posts/${postId}`);
}

export async function deletePost(formData: FormData): Promise<void> {
  await requireAdmin();
  const postId = formString(formData, "postId");
  if (!postId) throw new Error("Missing postId");

  const supabase = createAdminClient();

  // Remove cover objects first (DB cascade doesn't reach storage).
  const { data: objects } = await supabase.storage.from("blog-covers").list(postId);
  if (objects && objects.length > 0) {
    await supabase.storage
      .from("blog-covers")
      .remove(objects.map((object) => `${postId}/${object.name}`));
  }

  const { error } = await supabase.from("blog_posts").delete().eq("id", postId);
  if (error) throw new Error(`Delete failed: ${error.message}`);

  revalidateBlogPaths();
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}
