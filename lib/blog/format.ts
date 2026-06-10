// Locale-aware display helpers shared by listing cards and the article header.
import type { BlogLocale, LocalizedName } from "./types";

export function formatDate(iso: string, locale: BlogLocale): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/** Localized category name with de → first-available fallback. */
export function categoryName(name: LocalizedName, locale: BlogLocale): string {
  return name[locale] ?? name.de ?? Object.values(name)[0] ?? "";
}
