// Defines supported locales and routing strategy for next-intl.
// localePrefix "always": every public URL carries /de|/en|/es. Root / and any
// unprefixed path redirect deterministically to /de (localeDetection false —
// no cookie, no Accept-Language sniffing; Google advises against automatic
// language redirects and they produced duplicate canonicals). The site stays
// cookie-free (localeCookie false). hreflang comes exclusively from Next
// Metadata + the sitemap, never from the middleware Link header
// (alternateLinks false — it declared non-existent sibling URLs).
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["de", "es", "en"],
  defaultLocale: "de",
  localePrefix: "always",
  localeDetection: false,
  localeCookie: false,
  alternateLinks: false,
});
