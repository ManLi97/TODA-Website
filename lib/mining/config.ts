// Community-Pulse battery config — THE source of truth for what gets scraped weekly
// (docs/blog/topic-radar.md and the marketing repo's /community-voices reference this
// file). Fixed battery = real deltas: the specs below stay identical week to week;
// extensions are deliberate config changes, never ad-hoc.
//
// Slots (D2 scoring semantics — see the migration comments):
//   broad   — quantitative spine, rows carry engagement (reddit: up_votes + 2*comments;
//             yt channel reference rows: views → per-(run,source) channel median).
//   seeded  — recall only (currently unused by the battery; kept for skill runs).
//   context — qualitative battery (searches, hashtags, comments, web): engagement NULL,
//             excluded from the score view, raw numbers in metrics jsonb.
//
// Request bodies were pinned against the live DeepAPI contracts (capabilities + dryRun,
// 2026-08-29). /v1/search/web caps results via maxResults — NOT maxItems (silent-fail
// trap measured in the /community-voices baseline).
import type { Pass, Platform } from "./types";

// Discriminates which whitelist mapper handles a spec's raw items (mappers.ts).
export type SourceKind =
  | "reddit-posts"
  | "yt-search"
  | "yt-channels"
  | "ig-hashtag"
  | "tiktok-search"
  | "tiktok-comments"
  | "web";

export type SourceSpec = {
  key: string; // unique battery slot — mining_runs.source_key + idempotency-key part
  kind: SourceKind;
  pass: Pass;
  platform: Platform;
  endpoint: string; // DeepAPI path
  timeWindow: string; // recorded on mining_runs.time_window (free text)
  // Median peer group (topic_signals.source) when the spec determines it (query,
  // hashtag, video). Reddit/yt-channel rows derive source from the item itself.
  source: string | null;
  body: Record<string, unknown>; // request body (without dryRun / cost overrides)
};

// YouTube reference channels (fixed): 30 newest videos per channel = the channel
// median base for x-ratios. Rows are broad with engagement = views.
export const YT_REFERENCE_CHANNELS = ["@inkarea", "@honesttattooerpodcast"];

// German click-demand queries (fixed set). Doctrine: AUDIENCE/DOMAIN anchors only —
// never trend-topic anchors (a fixed "KI Tattoo" query would "discover" its own topic
// every week; measured 2026-08-29 it even matched Hindi "ki" content). Trend topics
// enter as ad-hoc skill-run queries, "neu"-labelled, recall-only. "Tattoo Preise" is
// a deliberate EVERGREEN pain bucket (permanent ICP pain, not a trend) — its hits are
// validation material, never discovery evidence. Umlaut words double as language anchor.
const YT_SEARCH_QUERIES = [
  "Tätowierer Deutschland",
  "Tattoo Podcast deutsch",
  "Tätowierer werden",
  "Tattoo Studio Alltag",
  "Tattoo Preise",
];

// DACH supply-side hashtags. One request per hashtag so topic_signals.source is the
// hashtag itself (clean median peer group), ~50 posts total across the three.
const IG_HASHTAGS = ["tattoodeutschland", "tattooartistgermany", "taetowierer"];

// Trend early-warning queries (mostly consumer — context only, labelled by consumers).
// "Tattoo Studio Alltag" matched EN walk-in ads + spam (measured 2026-08-29) — the
// umlaut in "Tätowierer" is the language anchor that keeps results DACH.
const TIKTOK_SEARCH_QUERIES = ["Tätowierer werden", "Tätowierer Alltag"];

// Fixed TikTok comment videos: DE artist-education content with active comment
// sections — real DACH voices. Selected 2026-08-29 from a live
// /v1/scrape/tiktok/search discovery ("Tätowierer werden" / "Tattoo Studio Alltag" /
// "Tätowieren lernen", 6 months): German-language artist/education videos with the
// most comments; consumer travel/challenge content excluded (Anti-ICP).
export const TIKTOK_COMMENT_VIDEOS = [
  // die.muse.tattoo Wanna-Do-Aktion removed 2026-08-29: giveaway video, comments were
  // consumer one-liners ("ich auch bitte"), Ø 19 chars — no artist voice.
  "https://www.tiktok.com/@jeanne.tattoo/video/7616787067351125270", // Beginner-Journey "Ich hab es getan", 82 comments
  "https://www.tiktok.com/@laura.tattooart/video/7633831863844457760", // Tätowieren lernen, 138 comments
  "https://www.tiktok.com/@alessandro.bongiovanni/video/7645913476631760161", // Selbstlern-Journey, 123 comments
];

// Open-web variants: forums, trade press (feelfarbig, Tattoo Spirit), what platform
// endpoints don't see. 5 fixed variants — skill runs may add "neu"-labelled extras.
// Two of the original five matched only EN SEO listicles / EN reddit snippets
// (measured 2026-08-29, 0 % German) — reworded with umlaut + "Deutschland" anchors.
// "no show Anzahlung" is an EVERGREEN pain bucket (validation material, not discovery).
const WEB_QUERIES = [
  "Worüber diskutieren Tätowierer in Deutschland aktuell",
  "Tätowierer Selbstständigkeit Probleme Erfahrungen",
  "Eigenes Tattoo Studio eröffnen Erfahrungen Deutschland Tätowierer",
  "feelfarbig Tattoo Spirit aktuelle Themen Tätowierer",
  "Tattoo Preise Diskussion no show Anzahlung",
];

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// The weekly DeepAPI battery (Phase 1). One spec = one request = one mining_runs row.
// yt-comments (Phase 2) is not listed here: its targets come from the yt-search
// results at runtime (selectYtCommentTargets) + YT_COMMENT_VIDEOS.
export const BATTERY: SourceSpec[] = [
  ...YT_SEARCH_QUERIES.map(
    (q): SourceSpec => ({
      key: `yt-search/${slug(q)}`,
      kind: "yt-search",
      pass: "context",
      platform: "youtube",
      endpoint: "/v1/scrape/youtube/search",
      timeWindow: "all",
      source: q,
      body: { query: q, maxItems: 15 },
    })
  ),
  {
    key: "yt-channels",
    kind: "yt-channels",
    pass: "broad",
    platform: "youtube",
    endpoint: "/v1/scrape/youtube/channel",
    timeWindow: "n/a",
    source: null, // per item: @handle
    body: { channels: YT_REFERENCE_CHANNELS, maxItems: 30, sort: "newest" },
  },
  {
    key: "reddit-broad",
    kind: "reddit-posts",
    pass: "broad",
    platform: "reddit",
    endpoint: "/v1/scrape/reddit/posts",
    timeWindow: "month",
    source: null, // per item: subreddit
    body: { subreddits: ["TattooArtists"], sort: "top", since: "month", maxItems: 40 },
  },
  ...IG_HASHTAGS.map(
    (h): SourceSpec => ({
      key: `ig-hashtags/${slug(h)}`,
      kind: "ig-hashtag",
      pass: "context",
      platform: "instagram",
      endpoint: "/v1/scrape/instagram/hashtag",
      timeWindow: "all",
      source: h,
      body: { hashtags: [h], maxItems: 17, contentType: "posts" },
    })
  ),
  ...TIKTOK_SEARCH_QUERIES.map(
    (q): SourceSpec => ({
      key: `tiktok-search/${slug(q)}`,
      kind: "tiktok-search",
      pass: "context",
      platform: "tiktok",
      endpoint: "/v1/scrape/tiktok/search",
      timeWindow: "6months",
      source: q,
      body: { query: q, since: "6months", sort: "relevance", maxItems: 15 },
    })
  ),
  ...TIKTOK_COMMENT_VIDEOS.map((url): SourceSpec => {
    const videoId = url.split("/video/")[1]?.split(/[/?#]/)[0] ?? url;
    return {
      key: `tiktok-comments/${videoId}`,
      kind: "tiktok-comments",
      pass: "context",
      platform: "tiktok",
      endpoint: "/v1/scrape/tiktok/comments",
      timeWindow: "all",
      source: `tiktok:${videoId}`,
      body: { url, maxItems: 15 },
    };
  }),
  ...WEB_QUERIES.map(
    (q): SourceSpec => ({
      key: `web/${slug(q)}`,
      kind: "web",
      pass: "context",
      platform: "web",
      endpoint: "/v1/search/web",
      timeWindow: "n/a",
      source: q,
      body: { query: q, maxResults: 10 }, // maxResults, NOT maxItems
    })
  ),
];

// --- yt-comments (Phase 2, YouTube Data API v3 — free quota) ------------------

export const YT_COMMENTS_SOURCE_KEY = "yt-comments";
// Dynamic targets per week: top N yt-search videos by views (reference channels
// excluded), deduped — see selectYtCommentTargets in mappers.ts.
export const YT_COMMENT_TARGETS = 3;
// Optional fixed always-scrape list (video IDs); empty = dynamic selection only.
export const YT_COMMENT_VIDEOS: string[] = [];
export const YT_COMMENTS_MAX_RESULTS = 100; // Data API cap per commentThreads page

// --- Shared knobs -------------------------------------------------------------

export const RETENTION_DAYS = 30;
export const COVERAGE_ALERT_PCT = 80; // broad coverage below this raises a warning
export const UPSERT_CHUNK = 1000;

// DeepAPI protocol: pinned skill version header + polling deadline (cron maxDuration
// is 300s; the battery runs in parallel, so wall-clock ≈ slowest request).
export const DEEPAPI_SKILL_VERSION = "b18c96c6e053";
export const DEEPAPI_DEADLINE_MS = 210_000;
export const DEEPAPI_DEFAULT_POLL_SECS = 5;

// Deterministic idempotency key (D5): same week + same slot = same DeepAPI requestId,
// so a same-week retry heals the same mining_runs row without double spend.
// `salt` (--fresh) deliberately forces a new run.
export function idempotencyKey(sourceKey: string, salt?: string): string {
  return `toda-mining:${isoWeek()}:${sourceKey}${salt ? `:${salt}` : ""}`;
}

// ISO-8601 week label, e.g. "2026-W35" (UTC-based).
export function isoWeek(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7; // Mon=1..Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - day); // Thursday of this ISO week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
