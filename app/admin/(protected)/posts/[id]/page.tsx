// Editor shell — loads the post, its (up to 3) translations and the category
// list, hands everything to the client editor.
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { coverImageUrl } from "@/lib/blog/queries";
import { PostEditor, type EditorTranslation } from "./post-editor";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditPostPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [postResult, translationsResult, categoriesResult, authorsResult] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("id, category_id, author_id, cover_image_path")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("blog_post_translations")
      .select(
        "locale, slug, title, excerpt, content_md, tags, seo_title, seo_description, status, youtube_id, video_start_seconds, video_published_at"
      )
      .eq("post_id", id),
    supabase
      .from("blog_categories")
      .select("id, slug, name")
      .order("sort_order", { ascending: true }),
    supabase.from("blog_authors").select("id, name").order("name", { ascending: true }),
  ]);

  const post = postResult.data;
  if (!post) notFound();

  const translations: Record<string, EditorTranslation> = {};
  for (const row of translationsResult.data ?? []) {
    translations[row.locale] = {
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      contentMd: row.content_md,
      tags: (row.tags ?? []).join(", "),
      seoTitle: row.seo_title ?? "",
      seoDescription: row.seo_description ?? "",
      status: row.status,
      youtubeId: row.youtube_id ?? "",
      videoStartSeconds: row.video_start_seconds != null ? String(row.video_start_seconds) : "",
      videoPublishedAt: row.video_published_at ? row.video_published_at.slice(0, 10) : "",
    };
  }

  return (
    <PostEditor
      postId={post.id}
      categoryId={post.category_id}
      authorId={post.author_id}
      coverUrl={coverImageUrl(post.cover_image_path)}
      categories={(categoriesResult.data ?? []).map((category) => ({
        id: category.id,
        label: category.name?.de ?? category.slug,
      }))}
      authors={(authorsResult.data ?? []).map((author) => ({
        id: author.id,
        label: author.name,
      }))}
      translations={translations}
    />
  );
}
