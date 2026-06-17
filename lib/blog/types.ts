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

/** Supported social platforms for the author signature — each maps to a brand icon. */
export const SOCIAL_PLATFORMS = [
  "instagram",
  "tiktok",
  "youtube",
  "x",
  "facebook",
  "linkedin",
  "website",
  "email",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

/** Article signature author — a person, shared across all locales of a post. */
export interface Author {
  name: string;
  slug: string;
  /** Short localized tagline shown under the name in the reader's language. */
  slogan: LocalizedName;
  avatarPath: string | null;
  socials: SocialLink[];
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
  author: Author | null;
  youtubeId: string | null;
  videoStartSeconds: number | null;
  videoPublishedAt: string | null;
}

/** Published sibling translations of one post — feeds hreflang alternates. */
export type PublishedAlternates = Partial<Record<BlogLocale, string>>;
