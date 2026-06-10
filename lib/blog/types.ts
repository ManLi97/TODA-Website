// Shared blog domain types. DB rows are snake_case (Supabase), app-facing
// shapes are camelCase — queries.ts owns the mapping.
import type { routing } from "@/i18n/routing";

export type BlogLocale = (typeof routing.locales)[number];

export type TranslationStatus = "draft" | "published";

/** Localized category names keyed by locale, e.g. {"de": "Pflege", "en": "Care"}. */
export type LocalizedName = Partial<Record<BlogLocale, string>>;

export interface Category {
  id: string;
  slug: string;
  name: LocalizedName;
  sortOrder: number;
}

/** Card-level shape for the listing grid. */
export interface PostListItem {
  postId: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  coverImagePath: string | null;
  category: Pick<Category, "slug" | "name"> | null;
}

/** Full article shape for the detail page. */
export interface PostArticle extends PostListItem {
  contentMd: string;
  seoTitle: string | null;
  seoDescription: string | null;
}

/** Published sibling translations of one post — feeds hreflang alternates. */
export type PublishedAlternates = Partial<Record<BlogLocale, string>>;
