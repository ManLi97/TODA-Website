// Types for the Community-Pulse battery (DeepAPI + YouTube Data API v3) and for the
// rows we snapshot into public.mining_runs / public.topic_signals.
//
// Every Raw* type is a WHITELIST: it declares only the fields we read. The APIs also
// return author/commenter identity fields (author, authorUrl, username, name,
// authorDisplayName, …) — none of which are declared here, so they are structurally
// unreachable and can never be mapped into a row (privacy contract; see
// docs/blog/topic-radar.md). A channel handle of a PUBLISHED video is publisher
// attribution (allowed, analogous to a subreddit) and lives under `channel`.
//
// Raw field names were pinned against the live DeepAPI contracts
// (GET /v1/capabilities?capability=<slug> + dryRun, 2026-08-29) — never guessed.

export type Pass = "broad" | "seeded" | "context";
export type Platform = "reddit" | "youtube" | "instagram" | "tiktok" | "web" | "facebook";
export type Provider = "apify" | "deepapi" | "youtube_data_api";

// --- DeepAPI envelope (shared by every /v1/scrape/* + /v1/search/web call) ----

export type DeepApiNext = {
  method?: string;
  path?: string;
  afterSecs?: number;
};

export type DeepApiEnvelope<T = unknown> = {
  requestId: string | null;
  status: "running" | "succeeded" | "failed" | "dry_run" | string;
  output: T | null;
  list?: { resultCount?: number; listState?: string } | null;
  balance?: { availableMicrousd?: number } | null;
  next?: DeepApiNext | null;
  error?: { code?: string; message?: string; hint?: string } | null;
};

// --- Raw item whitelists (one per battery source) -----------------------------

// /v1/scrape/reddit/posts — excluded: author, upvoteRatio, nsfw.
export type RawRedditPost = {
  type?: string; // "post"
  id?: string;
  url?: string;
  title?: string;
  text?: string;
  subreddit?: string;
  score?: number;
  comments?: number;
  postedAt?: string;
};

// /v1/scrape/youtube/search — channel block = publisher attribution.
export type RawYoutubeSearchVideo = {
  id?: string;
  title?: string;
  url?: string;
  type?: string;
  views?: number;
  comments?: number;
  publishedAt?: string; // ISO
  description?: string;
  channel?: { handle?: string; name?: string; subscribers?: number };
};

// /v1/scrape/youtube/channel — publishedAt is RELATIVE text ("7 days ago"), not ISO.
export type RawYoutubeChannelVideo = {
  id?: string;
  title?: string;
  url?: string;
  type?: string;
  views?: number;
  publishedAt?: string;
  channel?: { handle?: string; subscribers?: number };
};

// /v1/scrape/instagram/hashtag — excluded: author {username, name}, image.
export type RawInstagramHashtagPost = {
  id?: string;
  url?: string;
  type?: string; // "Image" | "Sidecar" | "Video"
  text?: string;
  hashtags?: string[];
  likes?: number;
  comments?: number;
  views?: number;
  postedAt?: string;
};

// /v1/scrape/tiktok/search — excluded: author, authorUrl, authorVerified, music.
export type RawTiktokVideo = {
  id?: string;
  url?: string;
  text?: string;
  language?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  plays?: number;
  bookmarks?: number;
  hashtags?: string[];
  postedAt?: string;
};

// /v1/scrape/tiktok/comments — excluded: author.
export type RawTiktokComment = {
  type?: string; // "comment"
  id?: string;
  videoId?: string;
  text?: string;
  likes?: number;
  replies?: number;
  postedAt?: string;
};

// /v1/search/web result entry.
export type RawWebResult = {
  title?: string;
  url?: string;
  snippet?: string;
  dateText?: string;
};

// YouTube Data API v3 commentThreads item — excluded: authorDisplayName,
// authorProfileImageUrl, authorChannelUrl, authorChannelId.
export type RawYtApiCommentThread = {
  id?: string;
  snippet?: {
    totalReplyCount?: number;
    topLevelComment?: {
      snippet?: {
        textOriginal?: string;
        likeCount?: number;
        publishedAt?: string;
      };
    };
  };
};

// --- DB row / run bookkeeping -------------------------------------------------

// One row destined for public.topic_signals (snake_case = table columns).
export type TopicSignalRow = {
  run_id: string;
  external_id: string;
  source: string; // median peer group: subreddit | @channel | query | hashtag | yt:{videoId} | tiktok:{videoId}
  platform: Platform;
  title: string;
  body: string | null;
  flair: string | null;
  post_type: string | null;
  post_url: string | null;
  posted_at: string | null;
  up_votes: number | null;
  comments_count: number | null;
  // Scorable engagement (D2): non-NULL ONLY for reddit broad (up_votes + 2*comments)
  // and yt channel reference rows (views). NULL = context row, excluded from scoring.
  engagement: number | null;
  // Whitelisted raw platform numbers for later A/B calibration. Never identities.
  metrics: Record<string, number | string | null> | null;
  is_seeded: boolean;
  matched_term: string | null;
};

// Stats over one source's mapped rows, stored on the mining_runs row.
// coverage semantics: broad = % rows with non-null engagement;
// context = % rows with title AND post_url.
export type RunStats = {
  itemCount: number; // raw items returned by the provider
  mappedCount: number; // rows that survived the whitelist mapper
  fieldCoveragePct: number;
};

// Describes which battery slot / provider produced a run.
export type IngestMeta = {
  provider: Provider;
  sourceKey: string; // battery slot (lib/mining/config.ts) — mining_runs.source_key
  pass: Pass;
  timeWindow: string; // free text since v2 (week | month | 6months | all | n/a)
  actor: string; // endpoint identifier, e.g. "deepapi:/v1/scrape/reddit/posts"
  input: unknown;
  label: string; // human label for logs/warnings
};

// Result of ingesting one run (or recording one failed run).
export type RunOutcome = {
  runId: string | null; // mining_runs.id (uuid); null if the row write itself failed
  provider: Provider;
  sourceKey: string;
  datasetId: string | null; // provider ref: DeepAPI requestId | ytapi:{isoWeek}:comments:{videoId}
  label: string;
  pass: Pass;
  timeWindow: string;
  status: "succeeded" | "failed";
  itemCount: number;
  mappedCount: number;
  signalsWritten: number;
  fieldCoveragePct: number;
  error: string | null;
};

// Aggregate result of a full battery run (cron / CLI full mode).
export type MiningSyncResult = {
  runs: RunOutcome[];
  itemsIngested: number; // total signals written across runs
  bodiesRedacted: number;
  warnings: string[];
  errors: string[];
};
