// Competitor app reviews (server-only) for the battery's Phase 1 — only the 5 profiled
// competitors (config REVIEW_TARGETS). Three free/cheap paths:
//   Apple   RSS customerreviews feed (free; Content-Type is text/javascript, body is
//           JSON — never gate on the header). 50 entries/page, mostRecent.
//   Play    npm google-play-scraper (unofficial, free). Breakage surfaces as a failed
//           mining_runs row, never a silent gap.
//   Trustpilot DeepAPI /v1/scrape/extract with OUR schema (no reviewer identity in it).
// Reviewer identities (Apple `author`, Play `userName`/`userImage`) are never read.
import "server-only";

import gplay from "google-play-scraper";

import { PLAY_REVIEWS_NUM, UNIT_PRICE, costCap } from "./config";
import { runScrape } from "./deepapi";
import type { RawAppleReviewEntry, RawPlayReview, RawTrustpilotReview } from "./types";

export function appleFeedUrl(appId: string, storefront: string, page = 1): string {
  const pagePart = page > 1 ? `page=${page}/` : "";
  return `https://itunes.apple.com/${storefront}/rss/customerreviews/${pagePart}id=${appId}/sortBy=mostRecent/json`;
}

// One storefront page of most-recent reviews. An empty feed has no `entry` key; a
// single review arrives as an object, not an array.
export async function fetchAppleReviews(
  appId: string,
  storefront: string
): Promise<RawAppleReviewEntry[]> {
  const res = await fetch(appleFeedUrl(appId, storefront), {
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Apple RSS ${appId}/${storefront} failed: ${res.status}`);
  const text = await res.text();
  let json: { feed?: { entry?: RawAppleReviewEntry[] | RawAppleReviewEntry } };
  try {
    json = JSON.parse(text) as typeof json;
  } catch {
    throw new Error(`Apple RSS ${appId}/${storefront}: body is not JSON (${text.slice(0, 80)})`);
  }
  const entry = json.feed?.entry;
  if (!entry) return [];
  return Array.isArray(entry) ? entry : [entry];
}

// Newest reviews for one package/country via google-play-scraper (fields pinned
// against the 10.1.3 typings: id, date, score, title, text, thumbsUp, version,
// replyText — userName/userImage exist in the response but are never declared).
export async function fetchPlayReviews(pkg: string, country: string): Promise<RawPlayReview[]> {
  // The package's index.d.ts types `sort` as the enum *type*, not the enum object —
  // read the member through a record so TS accepts what runs fine at runtime.
  const newest = (gplay.sort as unknown as Record<string, number>).NEWEST;
  if (typeof newest !== "number") throw new Error("google-play-scraper: sort.NEWEST missing");
  const result = await gplay.reviews({
    appId: pkg,
    lang: "de",
    country,
    sort: newest as unknown as (typeof gplay)["sort"],
    num: PLAY_REVIEWS_NUM,
  });
  return result.data as RawPlayReview[];
}

const TRUSTPILOT_SCHEMA = {
  type: "object",
  properties: {
    reviews: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "review id from the review permalink, if visible" },
          rating: { type: "number", description: "star rating 1-5" },
          title: { type: "string" },
          text: { type: "string" },
          date: { type: "string", description: "ISO date of the review" },
        },
        required: ["rating", "text"],
      },
    },
  },
  required: ["reviews"],
};

// Structured extract of one Trustpilot review page (~$0.015 per page). `listState`
// source_blocked is thrown with its name so the run is a visible failed row (the
// documented fallback is /v1/browser/act — a deliberate config change, not automatic).
export async function fetchTrustpilotReviews(
  url: string,
  idemKey: string
): Promise<{ reviews: RawTrustpilotReview[]; requestId: string | null }> {
  const env = await runScrape(
    "/v1/scrape/extract",
    {
      urls: [url],
      prompt:
        "Extract every customer review on this page: star rating (1-5), title, full review text and " +
        "the review date as ISO. Do NOT extract reviewer names, avatars or locations.",
      schema: TRUSTPILOT_SCHEMA,
      maxCostUsd: costCap(2, UNIT_PRICE.extractPage),
    },
    idemKey
  );
  if (env.list?.listState === "source_blocked") {
    throw new Error(
      `Trustpilot extract blocked (listState source_blocked, request ${env.requestId})`
    );
  }
  const pages =
    (env.output as { url?: string; data?: { reviews?: RawTrustpilotReview[] } }[] | null) ?? [];
  return { reviews: pages.flatMap((p) => p.data?.reviews ?? []), requestId: env.requestId };
}
