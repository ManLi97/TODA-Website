// Static config + Apify input builders for the Reddit mining scrape.
//
// Actor: harshmaur/reddit-scraper (PAY_PER_EVENT, ~$0.002/post). Two passes:
//   • broad  — subreddit top-listings for a time window; the QUANTITATIVE spine
//              (feeds the run-scoped medians and the outlier score view).
//   • seeded — keyword search within r/TattooArtists; RECALL only, never scored.
//
// Input-shape facts verified against the live actor input schema + a volume test
// (2026-07-12):
//   • startUrls take {url} objects; the actor's sort/time/community options do NOT
//     apply to them, so the broad pass encodes the window in the URL (/top/?t=week)
//     — the exact form of the verified sample run.
//   • maxPostsCount is applied PER subreddit listing, not as a whole-run total: two
//     subs in one run with cap 200 returned tattooadvice 200 + TattooArtists 28 = 228
//     (> 200), so neither source starves the other. TattooArtists's small count is its
//     real weekly volume, not a cap artifact — so both subs share ONE broad run per
//     window (lets the view compare sources within a run).
//   • searchTerms / withinCommunity / searchSort / searchTime apply ONLY to the
//     seeded (keyword) path.
import type { TimeWindow } from "./types";

// REST v2 paths use "~" between username and actor name (not "/").
export const APIFY_ACTOR_PATH = "harshmaur~reddit-scraper";
// Human-readable actor id recorded on each mining_runs row.
export const APIFY_ACTOR_NAME = "harshmaur/reddit-scraper";

// Quantitative sources (Strom A). Both scraped in ONE broad run per window (each URL
// gets its own maxPostsCount — see note above), so the view computes per-(run, source)
// medians and can compare sources within a run. Cross-source stays a tiebreaker, never
// additive.
export const SUBREDDITS = ["TattooArtists", "tattooadvice"];

// Seeded recall vocabulary (pain points). Recall-only: seeded rows never enter the
// median/score/trend gate — quantitative use would bias them (docs/blog/topic-radar.md).
export const SEED_TERMS = ["booking", "deposit", "no-show", "pricing", "cancellation"];
export const SEEDED_COMMUNITY = "r/TattooArtists";

// Per-subreddit post cap (applied per startUrl). 100 top posts per sub per window is
// ample for a stable median and bounds cost; a high-volume sub is capped here, a small
// one returns whatever it has (e.g. r/TattooArtists ~28 in a week).
export const BROAD_MAX_POSTS = 100;
export const SEEDED_MAX_POSTS = 50;

export const RETENTION_DAYS = 30;
export const COVERAGE_ALERT_PCT = 80; // coverage below this raises a warning

// Poll a started run until terminal or this deadline (cron maxDuration is 300s).
export const RUN_TIMEOUT_MS = 210_000;
export const POLL_INTERVAL_MS = 5_000;
export const UPSERT_CHUNK = 1000;

// Broad pass: both subreddits' top-listings for a window (one startUrl each, so each
// gets its own maxPostsCount), comments off.
export function broadInput(window: TimeWindow) {
  return {
    startUrls: SUBREDDITS.map((sub) => ({
      url: `https://www.reddit.com/r/${sub}/top/?t=${window}`,
    })),
    maxPostsCount: BROAD_MAX_POSTS,
    crawlCommentsPerPost: false,
  };
}

// Seeded pass: keyword search within one community, top of the week, posts only.
export function seededInput() {
  return {
    searchTerms: [...SEED_TERMS],
    withinCommunity: SEEDED_COMMUNITY,
    searchPosts: true,
    searchSort: "top",
    searchTime: "week",
    maxPostsCount: SEEDED_MAX_POSTS,
    crawlCommentsPerPost: false,
  };
}
