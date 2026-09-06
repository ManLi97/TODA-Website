// Types for the Community-Pulse pipeline v3 (DeepAPI + YouTube Data API v3 + Apple RSS +
// Google Play + SerpApi) and for the rows we snapshot into public.mining_runs /
// public.topic_signals / public.topic_classifications / public.pulse_*.
//
// Every Raw* type is a WHITELIST: it declares only the fields we read. The APIs also
// return author/commenter/reviewer identity fields (author, authorUrl, username, name,
// userName, userImage, authorDisplayName, …) — none of which are declared here, so they
// are structurally unreachable and can never be mapped into a row (privacy contract;
// see docs/blog/topic-radar.md). A channel handle of a PUBLISHED video is publisher
// attribution (allowed, analogous to a subreddit) and lives under `channel`.
//
// Raw field names were pinned against the live contracts — DeepAPI openapi.json response
// examples + GET /v1/capabilities (2026-09-06), Apple RSS + google-play-scraper 10.1.3
// live calls (2026-09-06), SerpApi live calls (2026-09-06) — never guessed.

export type Pass = "broad" | "seeded" | "context";
export type Platform =
  | "reddit"
  | "youtube"
  | "instagram"
  | "tiktok"
  | "web"
  | "facebook"
  | "appstore"
  | "playstore"
  | "trustpilot"
  | "serp";
export type Provider =
  | "apify"
  | "deepapi"
  | "youtube_data_api"
  | "apple_rss"
  | "google_play"
  | "serpapi";

// --- DeepAPI envelope (shared by every /v1/scrape/* + /v1/search/web call) ----

export type DeepApiNext = {
  method?: string;
  path?: string;
  afterSecs?: number | null;
};

export type DeepApiEnvelope<T = unknown> = {
  requestId: string | null;
  status: "running" | "succeeded" | "failed" | "dry_run" | string;
  output: T | null;
  list?: { resultCount?: number; listState?: string } | null;
  balance?: { availableMicrousd?: number } | null;
  // dryRun only: the credit hold the real call would place.
  estimate?: { maxDebitMicrousd?: number; maxDebitUsd?: string; basis?: string } | null;
  debitMicrousd?: number | null;
  next?: DeepApiNext | null;
  error?: { code?: string; message?: string; hint?: string } | null;
};

// --- Raw item whitelists (one per battery source) -----------------------------

// /v1/scrape/reddit/posts + /v1/scrape/reddit/search — excluded: author, nsfw.
export type RawRedditPost = {
  type?: string; // "post"
  id?: string;
  url?: string;
  title?: string;
  text?: string;
  subreddit?: string;
  flair?: string;
  score?: number;
  upvoteRatio?: number;
  comments?: number;
  postedAt?: string;
};

// /v1/scrape/reddit/comments — excluded: author.
export type RawRedditComment = {
  type?: string; // "comment"
  id?: string;
  url?: string;
  text?: string;
  subreddit?: string;
  score?: number;
  depth?: number;
  postId?: string;
  postTitle?: string;
  postUrl?: string;
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

// /v1/scrape/instagram/hashtag + /v1/scrape/instagram/posts — excluded: author
// {username, name}, image (signed, expiring URL), mentions.
export type RawInstagramPost = {
  id?: string;
  url?: string;
  type?: string; // "Image" | "Sidecar" | "Video"
  text?: string;
  hashtags?: string[];
  likes?: number | null;
  comments?: number | null;
  views?: number | null;
  postedAt?: string;
};

// /v1/scrape/instagram/comments — excluded: author {username, verified}.
export type RawInstagramComment = {
  id?: string;
  url?: string;
  text?: string;
  postUrl?: string;
  postedAt?: string;
  likes?: number;
  replies?: number;
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

// /v1/scrape/facebook/groups — excluded: author {id, name}. group = publisher context.
export type RawFacebookGroupPost = {
  id?: string;
  url?: string;
  text?: string;
  postedAt?: string;
  reactions?: number;
  comments?: number;
  shares?: number;
  group?: { name?: string; url?: string };
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

// Apple App Store RSS customerreviews entry — excluded: author, link, im:contentType.
type AppleLabel = { label?: string };
export type RawAppleReviewEntry = {
  id?: AppleLabel;
  title?: AppleLabel;
  content?: AppleLabel;
  updated?: AppleLabel;
  "im:rating"?: AppleLabel;
  "im:version"?: AppleLabel;
  "im:voteCount"?: AppleLabel;
};

// google-play-scraper reviews() item — excluded: userName, userImage, url, criterias.
export type RawPlayReview = {
  id?: string;
  date?: string;
  score?: number;
  title?: string | null;
  text?: string;
  thumbsUp?: number;
  version?: string;
  replyText?: string | null;
};

// /v1/scrape/extract on Trustpilot — the schema WE request (lib/mining/reviews.ts);
// no reviewer identity is part of the schema.
export type RawTrustpilotReview = {
  id?: string;
  rating?: number;
  title?: string;
  text?: string;
  date?: string;
};

// SerpApi google_trends RELATED_QUERIES entry (rising + top).
export type RawSerpTrendQuery = {
  query?: string;
  value?: string; // "+ 1.800 %" (rising) | "100" (top)
  extracted_value?: number;
  link?: string;
};

// SerpApi google related_questions entry (People also ask; ai_overview items carry
// question + type only).
export type RawSerpQuestion = {
  question?: string;
  type?: string;
  snippet?: string;
  title?: string;
  link?: string;
};

// --- DB row / run bookkeeping -------------------------------------------------

// One row destined for public.topic_signals (snake_case = table columns).
export type TopicSignalRow = {
  run_id: string;
  external_id: string;
  source: string; // median peer group: subreddit | @channel | query | hashtag | yt:{videoId} | tiktok:{videoId} | ig:{postId} | reddit:{postId} | fb group | competitor | trend seed
  platform: Platform;
  title: string;
  body: string | null;
  flair: string | null;
  post_type: string | null;
  post_url: string | null;
  posted_at: string | null;
  up_votes: number | null;
  comments_count: number | null;
  // Scorable engagement (D4, v3): non-NULL for every platform row except web/serp/
  // reviews. Formulas live in mappers.ts and in the topic_signals.engagement COMMENT.
  engagement: number | null;
  // Whitelisted raw platform numbers for later A/B calibration. Never identities.
  metrics: Record<string, number | string | null> | null;
  is_seeded: boolean;
  matched_term: string | null;
};

export type Audience = "artist" | "endkunde" | "mixed" | "off_topic";
export type SignalType =
  | "question"
  | "complaint"
  | "wish"
  | "praise"
  | "experience"
  | "news"
  | "promo"
  | "other";

// One LLM verdict destined for public.topic_classifications (v3 columns).
export type ClassificationRow = {
  run_id: string;
  external_id: string;
  is_discussion: boolean;
  cluster: string | null;
  note: string | null;
  audience: Audience;
  signal_type: SignalType;
  language: string;
  quote: string | null;
  question: string | null;
  feature: string | null;
  cluster_proposal: string | null;
  confidence: number;
  classified_by: "llm";
  model: string;
  prompt_version: string;
};

// One row of the view public.pulse_pending_signals (enrichment queue).
export type PendingSignal = {
  run_id: string;
  external_id: string;
  platform: Platform;
  source: string;
  source_key: string;
  post_type: string | null;
  title: string;
  body: string | null;
  metrics: Record<string, number | string | null> | null;
  engagement: number | null;
  posted_at: string | null;
  ingested_at: string;
  iso_week: string;
};

// One row of public.pulse_jobs (chain lock, D9).
export type PulseStep = "battery" | "comments" | "enrich" | "digest";
export type PulseJob = {
  id: string;
  iso_week: string;
  step: PulseStep;
  status: "running" | "succeeded" | "failed";
  started_at: string;
  finished_at: string | null;
  attempts: number;
  result: Record<string, unknown> | null;
  error: string | null;
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
  isoWeek: string; // mining_runs.iso_week — the digest join key
  // "Only new" (D2): drop rows whose (platform, external_id) already exists in
  // topic_signals from any other run. false = snapshot slot (yt-channels).
  dedupe: boolean;
};

// Result of ingesting one run (or recording one failed run).
export type RunOutcome = {
  runId: string | null; // mining_runs.id (uuid); null if the row write itself failed
  provider: Provider;
  sourceKey: string;
  datasetId: string | null; // provider ref: DeepAPI requestId | ytapi:… | apple:… | gplay:… | serpapi:…
  label: string;
  pass: Pass;
  timeWindow: string;
  status: "succeeded" | "failed";
  itemCount: number;
  mappedCount: number;
  dedupedCount: number; // mapped rows dropped because already known (D2)
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
