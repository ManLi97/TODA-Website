// Read-side blog queries for the public pages (SSG/ISR).
// Uses the cookie-less anon client; RLS exposes published rows only, but the
// filters below are explicit anyway so intent is visible and ordering is stable.
// Every query degrades to empty results when env vars are missing so
// `pnpm build` succeeds without a database.
import { cache } from "react";
import { createStaticClient } from "@/lib/supabase/static";
import { readingMinutes } from "./reading-time";
import {
  SOCIAL_PLATFORMS,
  type Author,
  type BlogLocale,
  type Category,
  type LocalizedName,
  type PostArticle,
  type PostListItem,
  type PublishedAlternates,
  type SocialLink,
  type SocialPlatform,
} from "./types";

/** Raw author embed (jsonb slogan/socials arrive parsed). */
interface AuthorRow {
  name: string;
  slug: string;
  avatar_path: string | null;
  slogan: LocalizedName | null;
  socials: unknown;
}

/** Raw shape returned by the translation→post→category embed. */
interface TranslationRow {
  post_id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  tags: string[];
  published_at: string;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
  blog_posts: {
    cover_image_path: string | null;
    blog_categories: { slug: string; name: LocalizedName } | null;
    blog_authors?: AuthorRow | null;
  } | null;
}

const LIST_SELECT = `post_id, slug, title, excerpt, content_md, tags, published_at, updated_at, seo_title, seo_description,
  blog_posts!inner ( cover_image_path, category_id, blog_categories ( slug, name ) )`;

// Article detail also pulls the post's author (signature footer). Kept off the
// list select so the listing grid stays lean.
const ARTICLE_SELECT = `post_id, slug, title, excerpt, content_md, tags, published_at, updated_at, seo_title, seo_description,
  blog_posts!inner ( cover_image_path, category_id, blog_categories ( slug, name ),
    blog_authors ( name, slug, avatar_path, slogan, socials ) )`;

/** Normalizes the embedded author row — drops malformed socials defensively. */
function mapAuthor(raw: AuthorRow | null | undefined): Author | null {
  if (!raw) return null;
  const socials: SocialLink[] = Array.isArray(raw.socials)
    ? (raw.socials as unknown[]).flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const { platform, url } = item as { platform?: unknown; url?: unknown };
        if (
          typeof platform === "string" &&
          typeof url === "string" &&
          url.trim() &&
          SOCIAL_PLATFORMS.includes(platform as SocialPlatform)
        ) {
          return [{ platform: platform as SocialPlatform, url: url.trim() }];
        }
        return [];
      })
    : [];
  return {
    name: raw.name,
    slug: raw.slug,
    slogan: raw.slogan ?? {},
    avatarPath: raw.avatar_path,
    socials,
  };
}

function mapListItem(row: TranslationRow): PostListItem {
  return {
    postId: row.post_id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    tags: row.tags,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    readingMinutes: readingMinutes(row.content_md),
    coverImagePath: row.blog_posts?.cover_image_path ?? null,
    category: row.blog_posts?.blog_categories ?? null,
  };
}

// cache() dedupes within one render pass — generateMetadata and the page
// share the same fetch instead of hitting Supabase twice.
export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = createStaticClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_categories")
    .select("id, slug, name, sort_order")
    .order("sort_order", { ascending: true })
    .order("slug", { ascending: true });
  if (error) console.error("[blog] getCategories:", error.message);
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name as LocalizedName,
    sortOrder: row.sort_order,
  }));
});

export const getPublishedPosts = cache(
  async (locale: BlogLocale, categorySlug?: string): Promise<PostListItem[]> => {
    const supabase = createStaticClient();
    if (!supabase) return [];

    let categoryId: string | undefined;
    if (categorySlug) {
      const categories = await getCategories();
      categoryId = categories.find((c) => c.slug === categorySlug)?.id;
      if (!categoryId) return [];
    }

    let query = supabase
      .from("blog_post_translations")
      .select(LIST_SELECT)
      .eq("locale", locale)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false });
    if (categoryId) query = query.eq("blog_posts.category_id", categoryId);

    const { data, error } = await query;
    if (error) console.error("[blog] getPublishedPosts:", error.message);
    if (error || !data) return [];
    return (data as unknown as TranslationRow[]).map(mapListItem);
  }
);

export const getPostBySlug = cache(
  async (locale: BlogLocale, slug: string): Promise<PostArticle | null> => {
    const supabase = createStaticClient();
    if (!supabase) return null;

    const fetchArticle = (select: string) =>
      supabase
        .from("blog_post_translations")
        .select(select)
        .eq("locale", locale)
        .eq("slug", slug)
        .eq("status", "published")
        .lte("published_at", new Date().toISOString())
        .maybeSingle();

    let { data, error } = await fetchArticle(ARTICLE_SELECT);
    // Migration-window guard: before the blog_authors relationship is live the
    // author embed errors — fall back to the author-less select so articles
    // still render (without a signature) instead of 404-ing.
    if (error) {
      console.error("[blog] getPostBySlug (author embed):", error.message);
      ({ data, error } = await fetchArticle(LIST_SELECT));
    }
    if (error) console.error("[blog] getPostBySlug:", error.message);
    if (error || !data) return null;

    const row = data as unknown as TranslationRow;
    return {
      ...mapListItem(row),
      contentMd: row.content_md,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      author: mapAuthor(row.blog_posts?.blog_authors),
    };
  }
);

/** Locale→slug map of PUBLISHED sibling translations — feeds hreflang + sitemap. */
export async function getPublishedAlternates(postId: string): Promise<PublishedAlternates> {
  const supabase = createStaticClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("blog_post_translations")
    .select("locale, slug")
    .eq("post_id", postId)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString());
  if (error) console.error("[blog] getPublishedAlternates:", error.message);
  if (error || !data) return {};

  const alternates: PublishedAlternates = {};
  for (const row of data) {
    alternates[row.locale as BlogLocale] = row.slug;
  }
  return alternates;
}

export async function getRelatedPosts(
  postId: string,
  categorySlug: string | null,
  locale: BlogLocale,
  limit = 3
): Promise<PostListItem[]> {
  if (!categorySlug) return [];
  const posts = await getPublishedPosts(locale, categorySlug);
  return posts.filter((post) => post.postId !== postId).slice(0, limit);
}

/** Public URL for a cover image stored in the blog-covers bucket. */
export function coverImageUrl(path: string | null): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!path || !url) return null;
  return `${url}/storage/v1/object/public/blog-covers/${path}`;
}

/** Public URL for an author avatar stored in the blog-authors bucket. */
export function authorAvatarUrl(path: string | null): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!path || !url) return null;
  return `${url}/storage/v1/object/public/blog-authors/${path}`;
}
