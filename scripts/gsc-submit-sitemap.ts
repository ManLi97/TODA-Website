// GSC sitemap submit — (re-)submits the live sitemap for the property through
// the Search Console API and prints the submitted-sitemap status before and
// after, so `lastSubmitted` moving to today is the evidence. Runs OFF Vercel:
// `pnpm gsc:submit`. Needs the SA as Full user/Owner of the property.
//
// Env: GSC_SITE_URL (property, e.g. sc-domain:todasolutions.com) and
// GSC_SA_KEY or GSC_SA_KEY_FILE. .env.local is loaded in-process; shell env
// wins. Nothing secret is ever printed — only API result data.
import { listSitemaps, submitSitemap } from "@/lib/gsc/client";
import type { SitemapResource } from "@/lib/gsc/types";
import { SITE_URL } from "@/lib/site";

try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local — assume env is already exported
}

const day = (iso: string | undefined) => (iso ? iso.slice(0, 19).replace("T", " ") : "-");

function printSitemaps(label: string, sitemaps: SitemapResource[]): void {
  console.log(`\n${label}:`);
  if (!sitemaps.length) console.log("  (none)");
  for (const s of sitemaps) {
    console.log(
      `  ${s.path}\n    lastSubmitted=${day(s.lastSubmitted)} lastDownloaded=${day(
        s.lastDownloaded
      )} pending=${s.isPending ?? false} errors=${s.errors ?? 0} warnings=${s.warnings ?? 0}`
    );
  }
}

async function main() {
  const siteUrl = process.env.GSC_SITE_URL;
  if (!siteUrl) throw new Error("GSC_SITE_URL is required (e.g. sc-domain:todasolutions.com)");
  const feedpath = `${SITE_URL}/sitemap.xml`;

  printSitemaps("Before", (await listSitemaps(siteUrl)).sitemap ?? []);
  await submitSitemap(siteUrl, feedpath);
  console.log(`\n[gsc-submit] submitted ${feedpath} for ${siteUrl}`);
  printSitemaps("After", (await listSitemaps(siteUrl)).sitemap ?? []);
}

main().catch((err) => {
  console.error("[gsc-submit] FAILED:", err instanceof Error ? err.message : err);
  process.exit(1);
});
