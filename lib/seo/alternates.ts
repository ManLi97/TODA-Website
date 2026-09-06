// hreflang / canonical URL builders — the single source for the URL contract
// (docs/seo/url-contract.md, D1–D5). Pure functions, covered by
// tests/alternates.test.ts. Used by Next Metadata (`alternates`) AND the
// sitemap so both emit byte-identical alternate sets.
import { routing } from "@/i18n/routing";
import type { BlogLocale, PublishedAlternates } from "@/lib/blog/types";
import { SITE_URL } from "@/lib/site";

/** hreflang map — locale keys plus the mandatory x-default. */
export type HreflangMap = Partial<Record<BlogLocale | "x-default", string>>;

export function localizedUrl(locale: BlogLocale, path: string): string {
  return `${SITE_URL}/${locale}${path}`;
}

/**
 * Alternates for a page that exists in every locale (home, /blog, category).
 * x-default is the German URL (D2). `path` is "" for the home page or a
 * leading-slash path without locale prefix.
 */
export function localizedAlternates(path: string): HreflangMap {
  const map: HreflangMap = {};
  for (const locale of routing.locales) {
    map[locale] = localizedUrl(locale, path);
  }
  map["x-default"] = localizedUrl(routing.defaultLocale, path);
  return map;
}

/**
 * Alternates for an article: only PUBLISHED sibling translations (the map
 * includes the article's own locale). x-default is the German sibling when
 * published, otherwise the article's own URL.
 */
export function articleAlternates(
  published: PublishedAlternates,
  locale: BlogLocale,
  slug: string
): HreflangMap {
  const map: HreflangMap = {};
  for (const altLocale of routing.locales) {
    const altSlug = published[altLocale];
    if (altSlug) map[altLocale] = localizedUrl(altLocale, `/blog/${altSlug}`);
  }
  const deSlug = published[routing.defaultLocale];
  map["x-default"] = deSlug
    ? localizedUrl(routing.defaultLocale, `/blog/${deSlug}`)
    : localizedUrl(locale, `/blog/${slug}`);
  return map;
}

/**
 * Legal pages (/imprint, /privacy) render identical German content under
 * every prefix — all three consolidate onto the DE URL, no hreflang (D5).
 */
export function legalCanonical(path: string): string {
  return localizedUrl(routing.defaultLocale, path);
}
