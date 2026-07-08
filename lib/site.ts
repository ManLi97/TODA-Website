// Site-wide constants shared across sections.
// Single source for the signup funnel target — header, hero, pricing and the
// FAQ closing CTA all point here.
export const ONBOARDING_URL = "https://app.toda.ink/onboarding";

// Canonical public origin. MUST match the Vercel primary domain (www) so that
// sitemap <loc>, robots, <link rel="canonical"> and OpenGraph URLs don't emit
// the apex host (which 308-redirects to www). Overridable per environment via
// NEXT_PUBLIC_SITE_URL (set to the www origin in Vercel Production).
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.todasolutions.com";
