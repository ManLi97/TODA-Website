// Fire-and-forget sitemap (re-)submit after a translation is published, so
// Google fetches the fresh sitemap instead of waiting weeks (the 2026 gap:
// sitemap last downloaded 08.07., DE articles unknown to Google until the
// manual submit on 12.09.). Runs inside `after()` — the publish never waits on
// Google and never fails because of it: missing credentials → warn, API
// error → error log, no throw. Evidence after a real publish: a `[gsc]` line
// in the Vercel function logs and `pnpm gsc:inspect` showing lastSubmitted.
import "server-only";

import { submitSitemap } from "./client";
import { SITE_URL } from "@/lib/site";

export async function submitSitemapAfterPublish(): Promise<void> {
  const siteUrl = process.env.GSC_SITE_URL;
  const hasKey = Boolean(process.env.GSC_SA_KEY || process.env.GSC_SA_KEY_FILE);
  if (!siteUrl || !hasKey) {
    console.warn("[gsc] sitemap not submitted: credentials missing");
    return;
  }
  const feedpath = `${SITE_URL}/sitemap.xml`;
  try {
    await submitSitemap(siteUrl, feedpath);
    console.log(`[gsc] sitemap submitted: ${feedpath}`);
  } catch (err) {
    console.error("[gsc] sitemap submit failed", err instanceof Error ? err.message : err);
  }
}
