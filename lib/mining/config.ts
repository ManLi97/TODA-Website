// Community-Pulse battery config v3 — THE source of truth for what gets scraped weekly
// (docs/blog/topic-radar.md "Methode v3" and the marketing repo's /community-voices
// reference this file). Fixed battery = real deltas: the specs below stay identical
// week to week; extensions are deliberate config changes, never ad-hoc.
//
// v3 doctrine "only new" (D2): every slot uses the API's time filter where one exists
// (`since: "week"`); where none exists (IG hashtag, FB groups, comments, reviews, web)
// the ingest drops rows whose (platform, external_id) is already known. yt-channels
// stays a snapshot slot (views time series = channel median base).
//
// Engagement (D4): every platform row carries a scorable engagement (formulas in
// mappers.ts); web/serp/reviews stay NULL. All slots are therefore `pass: "broad"`
// candidates for topic_cluster_scores once classified; `pass` keeps its v2 meaning
// (broad = engagement expected, context = qualitative rows without engagement).
//
// Request bodies were pinned against the live DeepAPI contracts (capabilities +
// openapi.json examples + dryRun, 2026-09-06). Unit prices are the documented
// "typicalPriceLabel"s; maxCostUsd = maxItems × unit × 1.2 so the default caps never
// cut a run silently (tiktok/search default cap 0.10 = 10 videos!).
import type { Pass, Platform } from "./types";

// Discriminates which whitelist mapper handles a spec's raw items (mappers.ts).
export type SourceKind =
  | "reddit-posts"
  | "reddit-search"
  | "reddit-comments"
  | "yt-search"
  | "yt-channels"
  | "ig-hashtag"
  | "ig-accounts"
  | "ig-comments"
  | "tiktok-search"
  | "tiktok-comments"
  | "fb-groups"
  | "web";

export type SourceSpec = {
  key: string; // unique battery slot — mining_runs.source_key + idempotency-key part
  kind: SourceKind;
  pass: Pass;
  platform: Platform;
  endpoint: string; // DeepAPI path
  timeWindow: string; // recorded on mining_runs.time_window (free text)
  // Median peer group (topic_signals.source) when the spec determines it (query,
  // hashtag, video). Reddit/yt-channel/fb rows derive source from the item itself.
  source: string | null;
  body: Record<string, unknown>; // request body incl. maxCostUsd (without dryRun)
  unitPriceUsd: number; // documented per-item price — cost/useful row in the rubric
  dedupe: boolean; // D2 ingest dedupe (false = snapshot slot)
  // Client-side freshness filter for endpoints without `since` (IG hashtag): drop
  // items whose postedAt is older than this many days.
  maxAgeDays?: number;
};

// maxCostUsd as DeepAPI wants it: decimal string, ≥ maxItems × unit with 20 % headroom.
export const costCap = (items: number, unitPriceUsd: number, floorUsd = 0): string =>
  Math.max(items * unitPriceUsd * 1.2, floorUsd).toFixed(4);

// Documented per-item prices (GET /v1/capabilities, 2026-09-06).
export const UNIT_PRICE = {
  ytSearch: 0.025,
  ytChannel: 0.0125,
  redditPost: 0.0125, // $0.10 run minimum
  redditComment: 0.00625, // $0.10 run minimum
  igHashtag: 0.0125,
  igPost: 0.00625,
  igComment: 0.00625,
  tiktokVideo: 0.01,
  tiktokComment: 0.004,
  fbPost: 0.02,
  webSearch: 0.005, // per search, not per result
  extractPage: 0.015,
} as const;

// YouTube reference channels (fixed): newest videos per channel = the channel
// median base for x-ratios. Rows are broad with engagement = views (snapshot slot).
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

// Reddit keyword search (v3): DE anchors across all of Reddit + two EN artist anchors.
const REDDIT_SEARCH = {
  de: ["Tätowierer", "Tattoo Studio", "tätowieren lernen"],
  en: ["tattoo artist", "tattoo shop"],
};

// DACH supply-side hashtags. One request per hashtag so topic_signals.source is the
// hashtag itself (clean median peer group), ~50 posts total across the three.
const IG_HASHTAGS = ["tattoodeutschland", "tattooartistgermany", "taetowierer"];

// Curated DACH Instagram accounts (research 2026-09-06: 37 profiles checked, 18
// scraped, all public; realistically ~5 deliver weekly discussion — the IG pulse is
// caption-led with a thin comment layer). Dormant accounts cost nothing (0-hit runs
// are free). `author` is never declared → rows are keyed by post id only.
export const IG_ACCOUNTS = [
  "bundesverbandtattoo", // BVT — Verbandspolitik
  "tattoozertifikate", // Kampagne, beste Kommentarqualität
  "feelfarbig", // Fachmagazin, Meinungsposts
  "augen_zu_und_durch_podcast", // DE-Podcast
  "talesfromtheneedle", // DE-Podcast, tägliche Clips
  "frecher_franz", // Coaching-Persona, viel Volumen, polarisierend
  "tattoo_convention_berlin", // Veranstalter, saisonal
  "dot_e.v", // ruhend
  "inkarea_tattoo", // ruhend
  "taetowiererakademie", // ruhend
  "zwdhpodcast", // ruhend
  "tattoomed", // Supply-Brand, marginal
];

// Trend early-warning queries (mostly consumer — context, labelled by the LLM).
// "Tattoo Studio Alltag" matched EN walk-in ads + spam (measured 2026-08-29) — the
// umlaut in "Tätowierer" is the language anchor that keeps results DACH.
const TIKTOK_SEARCH_QUERIES = ["Tätowierer werden", "Tätowierer Alltag"];

// Curated public Facebook groups (research 2026-09-06: 19 groups checked, 13
// readable; every German "nur für Tätowierer" group is private → public groups yield
// job / guest-spot / marketplace posts plus occasional opinion posts). Value is
// measured in the test-run loop; useless slots get removed. `author` never declared;
// posts without text are dropped; external_id = text hash (cross-posting dedupe).
export const FB_GROUPS: { slug: string; url: string; maxItems: number; note: string }[] = [
  {
    slug: "tattoo-circle-schweiz",
    url: "https://www.facebook.com/groups/533789960065520/",
    maxItems: 20,
    note: "DE, Meinungs- + Marktsignal",
  },
  {
    slug: "job-boerse-b",
    url: "https://www.facebook.com/groups/764337886989060/",
    maxItems: 20,
    note: "Tattoo Artist`s Job-Börse B, DE/EN",
  },
  {
    slug: "job-boerse-a",
    url: "https://www.facebook.com/groups/1381734435465160/",
    maxItems: 20,
    note: "Tattoo Artist`s Job-Börse A, EN/DE",
  },
  {
    slug: "tattoobedarf",
    url: "https://www.facebook.com/groups/945174772295241/",
    maxItems: 5,
    note: "Tattoobedarf für Tätowierer, DE, artist-only",
  },
  {
    slug: "tattoo-piercing-job-forum",
    url: "https://www.facebook.com/groups/256111117762857/",
    maxItems: 20,
    note: "Tattoo and Piercing Job Forum, EN/DE",
  },
];

// Open-web variants: forums, trade press (feelfarbig, Tattoo Spirit), what platform
// endpoints don't see. 5 fixed variants — skill runs may add "neu"-labelled extras.
// "no show Anzahlung" is an EVERGREEN pain bucket (validation material, not discovery).
const WEB_QUERIES = [
  "Worüber diskutieren Tätowierer in Deutschland aktuell",
  "Tätowierer Selbstständigkeit Probleme Erfahrungen",
  "Eigenes Tattoo Studio eröffnen Erfahrungen Deutschland Tätowierer",
  "feelfarbig Tattoo Spirit aktuelle Themen Tätowierer",
  "Tattoo Preise Diskussion no show Anzahlung",
];

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// The weekly DeepAPI battery (Phase 1). One spec = one request = one mining_runs row.
// Comment slots (Phase 2) are NOT listed here: their targets are picked at runtime
// from this week's Phase-1 rows in the DB (lib/mining/comments.ts).
export const BATTERY: SourceSpec[] = [
  ...YT_SEARCH_QUERIES.map(
    (q): SourceSpec => ({
      key: `yt-search/${slug(q)}`,
      kind: "yt-search",
      pass: "broad",
      platform: "youtube",
      endpoint: "/v1/scrape/youtube/search",
      timeWindow: "week",
      source: q,
      body: {
        query: q,
        since: "week",
        sort: "date",
        maxItems: 20,
        maxCostUsd: costCap(20, UNIT_PRICE.ytSearch),
      },
      unitPriceUsd: UNIT_PRICE.ytSearch,
      dedupe: true,
    })
  ),
  {
    key: "yt-channels",
    kind: "yt-channels",
    pass: "broad",
    platform: "youtube",
    endpoint: "/v1/scrape/youtube/channel",
    timeWindow: "month",
    source: null, // per item: @handle
    body: {
      channels: YT_REFERENCE_CHANNELS,
      since: "month",
      maxItems: 30, // per channel
      maxCostUsd: costCap(60, UNIT_PRICE.ytChannel),
    },
    unitPriceUsd: UNIT_PRICE.ytChannel,
    dedupe: false, // snapshot slot: views time series per run (median base)
  },
  ...(["de", "en"] as const).map(
    (lang): SourceSpec => ({
      key: `reddit-search/${lang}`,
      kind: "reddit-search",
      pass: "broad",
      platform: "reddit",
      endpoint: "/v1/scrape/reddit/search",
      timeWindow: "week",
      source: null, // per item: subreddit
      body: {
        query: REDDIT_SEARCH[lang],
        since: "week",
        sort: "new",
        maxItems: 40,
        maxCostUsd: costCap(40, UNIT_PRICE.redditPost, 0.1),
      },
      unitPriceUsd: UNIT_PRICE.redditPost,
      dedupe: true,
    })
  ),
  {
    key: "reddit-broad",
    kind: "reddit-posts",
    pass: "broad",
    platform: "reddit",
    endpoint: "/v1/scrape/reddit/posts",
    timeWindow: "week",
    source: null, // per item: subreddit
    body: {
      subreddits: ["TattooArtists"],
      sort: "top",
      since: "week",
      maxItems: 40,
      maxCostUsd: costCap(40, UNIT_PRICE.redditPost, 0.1),
    },
    unitPriceUsd: UNIT_PRICE.redditPost,
    dedupe: true,
  },
  ...IG_HASHTAGS.map(
    (h): SourceSpec => ({
      key: `ig-hashtags/${slug(h)}`,
      kind: "ig-hashtag",
      pass: "broad",
      platform: "instagram",
      endpoint: "/v1/scrape/instagram/hashtag",
      timeWindow: "all",
      source: h,
      body: {
        hashtags: [h],
        maxItems: 17,
        contentType: "posts",
        maxCostUsd: costCap(17, UNIT_PRICE.igHashtag),
      },
      unitPriceUsd: UNIT_PRICE.igHashtag,
      dedupe: true,
      maxAgeDays: 14, // no `since` on this endpoint → client-side freshness
    })
  ),
  {
    key: "ig-accounts",
    kind: "ig-accounts",
    pass: "broad",
    platform: "instagram",
    endpoint: "/v1/scrape/instagram/posts",
    timeWindow: "week",
    source: "ig-accounts", // author never declared → one peer group for the slot
    body: {
      usernames: IG_ACCOUNTS,
      since: "week",
      maxItems: 6, // per profile
      maxCostUsd: costCap(6 * IG_ACCOUNTS.length, UNIT_PRICE.igPost),
    },
    unitPriceUsd: UNIT_PRICE.igPost,
    dedupe: true,
    maxAgeDays: 14, // `since` lets up to 3 pinned posts through
  },
  ...TIKTOK_SEARCH_QUERIES.map(
    (q): SourceSpec => ({
      key: `tiktok-search/${slug(q)}`,
      kind: "tiktok-search",
      pass: "broad",
      platform: "tiktok",
      endpoint: "/v1/scrape/tiktok/search",
      timeWindow: "week",
      source: q,
      body: {
        query: q,
        since: "week",
        sort: "latest",
        maxItems: 30,
        maxCostUsd: costCap(30, UNIT_PRICE.tiktokVideo),
      },
      unitPriceUsd: UNIT_PRICE.tiktokVideo,
      dedupe: true,
    })
  ),
  ...FB_GROUPS.map(
    (g): SourceSpec => ({
      key: `fb-groups/${g.slug}`,
      kind: "fb-groups",
      pass: "broad",
      platform: "facebook",
      endpoint: "/v1/scrape/facebook/groups",
      timeWindow: "all",
      source: g.slug,
      body: {
        urls: [g.url],
        maxItems: g.maxItems,
        maxCostUsd: costCap(g.maxItems, UNIT_PRICE.fbPost),
      },
      unitPriceUsd: UNIT_PRICE.fbPost,
      dedupe: true,
    })
  ),
  ...WEB_QUERIES.map(
    (q): SourceSpec => ({
      key: `web/${slug(q)}`,
      kind: "web",
      pass: "context",
      platform: "web",
      endpoint: "/v1/search/web",
      timeWindow: "n/a",
      source: q,
      body: { query: q, maxResults: 10, maxCostUsd: costCap(1, UNIT_PRICE.webSearch, 0.01) }, // maxResults, NOT maxItems
      unitPriceUsd: UNIT_PRICE.webSearch / 10,
      dedupe: true,
    })
  ),
];

// --- Phase 2: dynamic comment targets (lib/mining/comments.ts) ---------------

// Top N German-hinted posts of the week per platform (most comments first, reference
// channels excluded, IG lead-magnet captions excluded) get their comments scraped.
export const COMMENT_TARGETS: Record<"youtube" | "tiktok" | "instagram" | "reddit", number> = {
  youtube: 5,
  tiktok: 5,
  instagram: 5,
  reddit: 3,
};
export const COMMENT_MAX_ITEMS = { tiktok: 30, instagram: 30, reddit: 40 } as const;
export const YT_COMMENTS_MAX_RESULTS = 100; // Data API cap per commentThreads page
// Optional fixed always-scrape list (YouTube video IDs) for on-demand skill runs;
// empty = dynamic selection only.
export const YT_COMMENT_VIDEOS: string[] = [];

// --- Reviews (free: Apple RSS + google-play-scraper; Trustpilot via DeepAPI extract)

// Only the 5 profiled competitors (Tomek, 2026-09-06). The list grows on request.
export type ReviewTarget = {
  competitor: string;
  apple: string[]; // App Store ids
  play: string[]; // Play package ids
  trustpilot: string[]; // review page URLs
};
export const REVIEW_TARGETS: ReviewTarget[] = [
  { competitor: "inckd", apple: ["1526690381"], play: ["com.inckd.tattoo"], trustpilot: [] },
  {
    competitor: "tattoodo",
    apple: ["1057590314", "6444658839"],
    play: ["com.tattoodo.app", "com.tattoodo.business"],
    trustpilot: ["https://de.trustpilot.com/review/tattoodo.com?sort=recency"],
  },
  { competitor: "taddoo", apple: ["6781711821"], play: ["com.tattoomii.artist"], trustpilot: [] },
  { competitor: "styng", apple: [], play: ["com.styng.artattoo"], trustpilot: [] }, // Play 404 → visible failed row
  { competitor: "myinkconnect", apple: [], play: [], trustpilot: [] }, // no app, no review portal (documented)
];
// de/at/ch deliver almost no weekly delta; gb/us carry the volume (measured 2026-09-06).
export const APPLE_STOREFRONTS = ["de", "at", "ch", "gb", "us"];
export const PLAY_COUNTRIES = ["de"];
export const PLAY_REVIEWS_NUM = 40;

// --- SerpApi (German search demand; ~8 searches/week of the 250/month free plan) --

export const SERP_TREND_SEEDS = ["Tattoo", "Tätowierer", "Tattoo Studio"];
export const SERP_PAA_QUERIES = [
  "Tattoo Preise",
  "Tätowierer werden",
  "Tattoo Anzahlung",
  "Tattoo Termin absagen",
  "Tattoo Studio eröffnen",
];

// --- Enrichment + digest (Claude) ----------------------------------------------

export const ENRICH_MODEL = "claude-opus-5";
export const DIGEST_MODEL = "claude-opus-5";
export const PROMPT_VERSION = "v3.1";
export const ENRICH_BATCH = 25; // rows per classification call
export const ENRICH_CONCURRENCY = 4; // parallel classification calls per round
export const ENRICH_BODY_MAX_CHARS = 1500;
export const QUOTE_MAX_CHARS = 280;
// Anthropic list prices (USD per 1M tokens) for the spend ledger.
export const ANTHROPIC_PRICE = { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 };

// Canonical cluster registry (mirrors docs/blog/topic-radar.md — keep both in sync).
// The LLM may only write these slugs into topic_classifications.cluster; anything
// else goes to cluster_proposal (≥ 5 hits in 2 weeks = registry candidate).
export const CLUSTER_REGISTRY: { slug: string; covers: string }[] = [
  { slug: "no-shows", covers: "Nichterscheinen, Terminausfälle, Flakiness" },
  { slug: "deposits-anzahlung", covers: "Anzahlung / Terminkaution / Deposit-Policy" },
  { slug: "pricing", covers: "Preisgestaltung, Stundensatz, Preiskommunikation, 'was kostet'" },
  { slug: "booking-flow", covers: "Terminanfragen, Buchung, DM-/Anfrage-Chaos, Wartelisten" },
  { slug: "cancellations", covers: "Absagen, Umbuchungen, Reschedule-Policies" },
  { slug: "communication-overload", covers: "DM-Flut, Erwartungsmanagement, Kundenkommunikation" },
  { slug: "time-management", covers: "Zeitplanung, Kalender, Überlastung, Work-Life" },
  {
    slug: "client-conflict",
    covers: "Kundenkonflikte, schwierige Gespräche, Grenzen, Bewertungen",
  },
  {
    slug: "copyright-design",
    covers: "Urheberrecht, Design-Eigentum, Referenzen/Copycats, KI-Designs",
  },
  { slug: "aftercare", covers: "Nachsorge-/Heilphasen-Kommunikation" },
  { slug: "career-entry", covers: "Tätowierer werden, Ausbildung, Lehre, Selbstlernen, Einstieg" },
  {
    slug: "business-studio",
    covers: "Selbstständigkeit, Studio eröffnen, Miete, Steuern, Umsatz, Guest Spots, Jobs",
  },
  {
    slug: "regulation-hygiene",
    covers: "Gesetze, Hygiene, Zertifikate, Verbände, REACH/Farben, Behörden",
  },
  { slug: "expectation-vs-result", covers: "Briefing, Abnahme, Erwartung vs. Ergebnis, Motivwahl" },
  { slug: "coverup-removal", covers: "Cover-up, Korrektur, Entfernung, Lasern" },
  { slug: "technique-equipment", covers: "Technik, Maschinen, Nadeln, Farben, Material, Handwerk" },
];
export const REVIEW_FEATURES = [
  "booking",
  "deposits",
  "calendar",
  "messaging",
  "payments",
  "portfolio",
  "pricing",
  "onboarding",
  "bugs",
  "support",
  "other",
] as const;

// --- Shared knobs -------------------------------------------------------------

export const RETENTION_DAYS = 30;
export const COVERAGE_ALERT_PCT = 80; // broad coverage below this raises a warning
export const UPSERT_CHUNK = 1000;
export const DEDUPE_CHUNK = 100; // candidate ids per dedupe SELECT (PostgREST-safe)
export const JOB_STALE_MINUTES = 15; // pulse_jobs lock (D9)

// DeepAPI protocol: pinned skill version header + polling deadline (cron maxDuration
// is 300s; the battery runs in parallel, so wall-clock ≈ slowest request).
export const DEEPAPI_SKILL_VERSION = "e8dfb0e92258";
export const DEEPAPI_DEADLINE_MS = 210_000;
export const DEEPAPI_DEFAULT_POLL_SECS = 5;

// Deterministic idempotency key (D8): same week + same slot = same DeepAPI requestId,
// so a same-week retry heals the same mining_runs row without double spend. The "v3"
// prefix keeps a v3 test in the same ISO week off the v2 cron's replays.
// `salt` (--fresh) deliberately forces a new run.
export function idempotencyKey(sourceKey: string, week = isoWeek(), salt?: string): string {
  return `toda-mining:v3:${week}:${sourceKey}${salt ? `:${salt}` : ""}`;
}

// ISO-8601 week label, e.g. "2026-W35" (UTC-based). Matches Postgres
// to_char(ts, 'IYYY-"W"IW') — the mining_runs.iso_week default.
export function isoWeek(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7; // Mon=1..Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - day); // Thursday of this ISO week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

// Monday 00:00 UTC of an ISO week label ("2026-W36" → 2026-08-31).
export function isoWeekStart(week: string): Date {
  const m = /^(\d{4})-W(\d{2})$/.exec(week);
  if (!m) throw new Error(`bad ISO week label: ${week}`);
  const year = Number(m[1]);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4.getTime() - (jan4Day - 1) * 86400000);
  return new Date(week1Monday.getTime() + (Number(m[2]) - 1) * 7 * 86400000);
}
