// GSC URL-Inspection evidence run — inspects every <loc> of the live sitemap
// (plus optional --url <u>, repeatable) through the URL Inspection API and
// prints one row per URL + the submitted-sitemap status. Readonly; runs OFF
// Vercel: `pnpm gsc:inspect [--url <u>]... [--json <path>]`.
//
// Env: GSC_SITE_URL (property, e.g. sc-domain:todasolutions.com) and
// GSC_SA_KEY or GSC_SA_KEY_FILE. .env.local is loaded in-process; shell env
// wins. Nothing secret is ever printed — only API result data.
import { writeFileSync } from "node:fs";
import { inspectUrl, listSitemaps } from "@/lib/gsc/client";
import type { SitemapResource, UrlInspectionResult } from "@/lib/gsc/types";
import { SITE_URL } from "@/lib/site";

try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local — assume env is already exported
}

const PAUSE_MS = 150;

type Row = {
  url: string;
  verdict: string;
  coverageState: string;
  indexingState: string;
  googleCanonical: string;
  userCanonical: string;
  canonicalMatches: boolean | null;
  lastCrawlTime: string;
  richResults: string[];
  referringUrls: string[];
  error?: string;
};

function parseArgs(argv: string[]): { extraUrls: string[]; jsonPath: string | null } {
  const extraUrls: string[] = [];
  let jsonPath: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--url" && argv[i + 1]) extraUrls.push(argv[++i]);
    else if (argv[i] === "--json" && argv[i + 1]) jsonPath = argv[++i];
    else throw new Error(`Unknown argument: ${argv[i]} (use --url <u> / --json <path>)`);
  }
  return { extraUrls, jsonPath };
}

async function sitemapUrls(): Promise<string[]> {
  const res = await fetch(`${SITE_URL}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml: HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

function toRow(url: string, result: UrlInspectionResult): Row {
  const index = result.indexStatusResult ?? {};
  const googleCanonical = index.googleCanonical ?? "";
  return {
    url,
    verdict: index.verdict ?? "",
    coverageState: index.coverageState ?? "",
    indexingState: index.indexingState ?? "",
    googleCanonical,
    userCanonical: index.userCanonical ?? "",
    canonicalMatches: googleCanonical ? googleCanonical === url : null,
    lastCrawlTime: index.lastCrawlTime ?? "",
    richResults: (result.richResultsResult?.detectedItems ?? [])
      .map((item) => item.richResultType ?? "")
      .filter(Boolean),
    referringUrls: index.referringUrls ?? [],
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const pad = (value: string, width: number) => value.padEnd(width).slice(0, width);
const day = (iso: string) => (iso ? iso.slice(0, 10) : "-");

function printTable(rows: Row[]): void {
  const cols: [string, number][] = [
    ["verdict", 8],
    ["coverageState", 44],
    ["canon", 6],
    ["lastCrawl", 10],
    ["richResults", 22],
  ];
  console.log(cols.map(([name, width]) => pad(name, width)).join(" | ") + " | url");
  console.log(cols.map(([, width]) => "-".repeat(width)).join("-|-") + "-|-" + "-".repeat(40));
  for (const row of rows) {
    const canon = row.error
      ? "ERR"
      : row.canonicalMatches == null
        ? "n/a"
        : row.canonicalMatches
          ? "yes"
          : "NO";
    const cells = [
      row.error ? "ERROR" : row.verdict || "-",
      row.error ? row.error : row.coverageState || "-",
      canon,
      day(row.lastCrawlTime),
      row.richResults.join(",") || "-",
    ];
    console.log(cols.map(([, width], i) => pad(cells[i], width)).join(" | ") + " | " + row.url);
  }
}

function printSummary(rows: Row[]): void {
  const byState = new Map<string, number>();
  for (const row of rows) {
    const key = row.error ? "ERROR" : row.coverageState || "(empty)";
    byState.set(key, (byState.get(key) ?? 0) + 1);
  }
  console.log("\nCoverage summary:");
  for (const [state, count] of [...byState.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(3)}  ${state}`);
  }
  const mismatches = rows.filter((row) => row.canonicalMatches === false);
  if (mismatches.length) {
    console.log("\nGoogle chose a different canonical:");
    for (const row of mismatches) console.log(`  ${row.url}\n    -> ${row.googleCanonical}`);
  }
  const unknown = rows.filter((row) => /unknown to google/i.test(row.coverageState));
  if (unknown.length) {
    console.log("\nUnknown to Google:");
    for (const row of unknown) console.log(`  ${row.url}`);
  }
}

function printSitemaps(sitemaps: SitemapResource[]): void {
  console.log("\nSubmitted sitemaps:");
  if (!sitemaps.length) console.log("  (none)");
  for (const s of sitemaps) {
    const submitted = (s.contents ?? []).map((c) => `${c.type}:${c.submitted}`).join(" ") || "-";
    console.log(
      `  ${s.path}\n    lastSubmitted=${day(s.lastSubmitted ?? "")} lastDownloaded=${day(
        s.lastDownloaded ?? ""
      )} pending=${s.isPending ?? false} errors=${s.errors ?? 0} warnings=${s.warnings ?? 0} submitted=${submitted}`
    );
  }
}

async function main() {
  const siteUrl = process.env.GSC_SITE_URL;
  if (!siteUrl) throw new Error("GSC_SITE_URL is required (e.g. sc-domain:todasolutions.com)");
  const { extraUrls, jsonPath } = parseArgs(process.argv.slice(2));

  const fromSitemap = await sitemapUrls();
  const urls = [...new Set([...fromSitemap, ...extraUrls])];
  console.log(
    `[gsc-inspect] ${siteUrl}: ${fromSitemap.length} sitemap URLs + ${extraUrls.length} extra (${urls.length} unique)\n`
  );

  const rows: Row[] = [];
  for (const url of urls) {
    try {
      rows.push(toRow(url, await inspectUrl(siteUrl, url)));
    } catch (err) {
      rows.push({ ...toRow(url, {}), error: err instanceof Error ? err.message : String(err) });
    }
    await sleep(PAUSE_MS);
  }

  printTable(rows);
  printSummary(rows);

  const sitemaps = (await listSitemaps(siteUrl)).sitemap ?? [];
  printSitemaps(sitemaps);

  if (jsonPath) {
    writeFileSync(
      jsonPath,
      JSON.stringify({ generatedAt: new Date().toISOString(), siteUrl, sitemaps, rows }, null, 2)
    );
    console.log(`\n[gsc-inspect] JSON written to ${jsonPath}`);
  }
}

main().catch((err) => {
  console.error("[gsc-inspect] FAILED:", err instanceof Error ? err.message : err);
  process.exit(1);
});
