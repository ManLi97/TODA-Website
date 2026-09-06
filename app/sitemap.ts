// Sitemap with hreflang alternates — mirrors the <head> alternates exactly
// (D3): every entry carries de/en/es + x-default via lib/seo/alternates.
// Article entries are emitted ONLY for locales with a published translation,
// and each entry's alternates list only published siblings — never a draft
// locale (per-locale publish). Legal pages appear once, as their DE canonical,
// without alternates (D5). Revalidated on demand by admin actions.
import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getCategories, getPublishedAlternates, getPublishedPosts } from "@/lib/blog/queries";
import {
  articleAlternates,
  legalCanonical,
  localizedAlternates,
  localizedUrl,
} from "@/lib/seo/alternates";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages — exist in every locale.
  for (const path of ["", "/blog"]) {
    for (const locale of routing.locales) {
      entries.push({
        url: localizedUrl(locale, path),
        alternates: { languages: localizedAlternates(path) },
      });
    }
  }

  // Legal pages — German-only content, one canonical URL each.
  for (const path of ["/imprint", "/privacy"]) {
    entries.push({ url: legalCanonical(path) });
  }

  // Category listing pages — exist in every locale.
  const categories = await getCategories();
  for (const category of categories) {
    const path = `/blog/category/${category.slug}`;
    for (const locale of routing.locales) {
      entries.push({
        url: localizedUrl(locale, path),
        alternates: { languages: localizedAlternates(path) },
      });
    }
  }

  // Articles — per published translation, alternates from published siblings.
  for (const locale of routing.locales) {
    const posts = await getPublishedPosts(locale);
    for (const post of posts) {
      const alternates = await getPublishedAlternates(post.postId);
      entries.push({
        url: localizedUrl(locale, `/blog/${post.slug}`),
        lastModified: post.updatedAt,
        alternates: { languages: articleAlternates(alternates, locale, post.slug) },
      });
    }
  }

  return entries;
}
