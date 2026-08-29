// Site-wide constants shared across public pages and structured data.
export const ONBOARDING_URL = "https://app.toda.ink/onboarding";

// Canonical public origin. MUST match the Vercel primary domain (www) so that
// sitemap <loc>, robots, <link rel="canonical"> and OpenGraph URLs don't emit
// the apex host (which 308-redirects to www). Overridable per environment via
// NEXT_PUBLIC_SITE_URL (set to the www origin in Vercel Production).
const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.todasolutions.com";
export const SITE_URL = configuredSiteUrl.replace(/\/+$/, "");

// First-party identity links published in the footer and Organization graph.
export const TODA_SOCIAL_URLS = {
  instagram: "https://www.instagram.com/toda.tattoosolutions/",
  youtube: "https://www.youtube.com/@TODATattooSolutions",
  facebook: "https://www.facebook.com/profile.php?id=61587056530237",
} as const;

// Exact visible homepage offer. Keep numeric schema values locale-neutral.
export const TODA_MONTHLY_PRICE = "24.99";
export const TODA_PRICE_CURRENCY = "EUR";
