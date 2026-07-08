// Sitemap with hreflang alternates. Article entries are emitted ONLY for
// locales with a published translation, and each entry's alternates list only
// published siblings — never a draft locale (per-locale publish).
// Revalidated on demand by admin actions (revalidateBlogPaths).
import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getCategories, getPublishedAlternates, getPublishedPosts } from "@/lib/blog/queries";
import { SITE_URL } from "@/lib/site";

const siteUrl = SITE_URL;

function allLocaleLanguages(path: string): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, `${siteUrl}/${locale}${path}`])
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages — exist in every locale.
  for (const path of ["", "/blog", "/imprint", "/privacy"]) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        alternates: { languages: allLocaleLanguages(path) },
      });
    }
  }

  // Category listing pages — exist in every locale.
  const categories = await getCategories();
  for (const category of categories) {
    const path = `/blog/category/${category.slug}`;
    for (const locale of routing.locales) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        alternates: { languages: allLocaleLanguages(path) },
      });
    }
  }

  // Articles — per published translation, alternates from published siblings.
  for (const locale of routing.locales) {
    const posts = await getPublishedPosts(locale);
    for (const post of posts) {
      const alternates = await getPublishedAlternates(post.postId);
      const languages = Object.fromEntries(
        Object.entries(alternates).map(([altLocale, altSlug]) => [
          altLocale,
          `${siteUrl}/${altLocale}/blog/${altSlug}`,
        ])
      );
      entries.push({
        url: `${siteUrl}/${locale}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        alternates: { languages },
      });
    }
  }

  return entries;
}
