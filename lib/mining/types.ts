// Types for the harshmaur/reddit-scraper Apify actor and for the rows we snapshot
// into public.mining_runs / public.topic_signals.
//
// RawRedditItem is a WHITELIST: it declares only the ~11 post fields we read. The
// actor also returns authorName/authorId/authorFlairText/bodyHtml/score/
// engagementTotal/… — none of which are declared here, so they are structurally
// unreachable and can never be mapped into a row (privacy contract; see
// docs/blog/topic-radar.md).

export type Pass = "broad" | "seeded";
export type TimeWindow = "week" | "month";

// Apify REST v2 run status values (`data.status`).
export type ApifyRunStatus =
  | "READY"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "ABORTING"
  | "ABORTED"
  | "TIMING-OUT"
  | "TIMED-OUT";

export type ApifyRun = {
  id: string;
  status: ApifyRunStatus;
  defaultDatasetId: string;
};

// The ONLY Reddit post fields we read. Everything else the actor returns is
// deliberately absent so it cannot leak into topic_signals.
export type RawRedditItem = {
  dataType?: string; // "post" | "comment" — we keep only "post"
  parsedId?: string; // Reddit id36, e.g. "1up26cp"
  title?: string;
  body?: string; // selftext; "" for link/image posts
  parsedCommunityName?: string; // e.g. "TattooArtists" (no r/ prefix) — the median grouping
  flair?: string | null;
  postType?: string;
  postUrl?: string;
  createdAt?: string; // ISO 8601
  upVotes?: number;
  commentsCount?: number;
};

// One row destined for public.topic_signals (snake_case = table columns).
export type TopicSignalRow = {
  run_id: string;
  external_id: string;
  source: string;
  title: string;
  body: string | null;
  flair: string | null;
  post_type: string | null;
  post_url: string | null;
  posted_at: string | null;
  up_votes: number | null; // null = field missing (counts against coverage, excluded from scoring)
  comments_count: number | null;
  is_seeded: boolean;
  matched_term: string | null;
};

// Stats over a dataset's post items, stored on the mining_runs row.
export type RunStats = {
  itemCount: number;
  postCount: number;
  fieldCoveragePct: number; // % of posts carrying numeric upVotes AND commentsCount
};

// Describes which logical run produced a dataset.
export type IngestMeta = {
  pass: Pass;
  timeWindow: TimeWindow;
  actor: string;
  apifyRunId: string | null;
  input: unknown;
  label: string; // human label, e.g. "broad/TattooArtists/week" — for logs/warnings
};

// Result of ingesting one dataset (or recording one failed run).
export type RunOutcome = {
  runId: string | null; // mining_runs.id (uuid); null if the row write itself failed
  datasetId: string | null;
  label: string;
  pass: Pass;
  timeWindow: TimeWindow;
  status: "succeeded" | "failed";
  itemCount: number;
  postCount: number;
  signalsWritten: number;
  fieldCoveragePct: number;
  error: string | null;
};

// Aggregate result of a full cycle (cron / CLI full mode).
export type MiningSyncResult = {
  runs: RunOutcome[];
  itemsIngested: number; // total signals written across runs
  bodiesRedacted: number;
  warnings: string[];
  errors: string[];
};
