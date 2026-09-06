// Whitelist mappers: one per source kind → TopicSignalRow. The privacy contract is
// structural: rows are built from NAMED whitelisted fields only, so author /
// commenter / reviewer identities can never leak into topic_signals.
//
// Engagement (D4, v3) — one fixed formula per platform, mirrored in the
// topic_signals.engagement column COMMENT:
//   reddit post          score + 2·comments        reddit comment    score
//   youtube video        views                     youtube comment   likes + 2·replies
//   tiktok video         plays/100 + likes + 2·comments + 3·shares
//   tiktok comment       likes + 2·replies         instagram post    likes + 2·comments (+ views/100 video)
//   instagram comment    likes + 2·replies         facebook post     reactions + 2·comments + 3·shares
//   reviews / web / serp NULL (rating / trend numbers live in metrics)
import { createHash } from "node:crypto";

import { COMMENT_TARGETS, YT_REFERENCE_CHANNELS, slug } from "./config";
import type { SourceKind, SourceSpec } from "./config";
import type {
  Platform,
  RawAppleReviewEntry,
  RawFacebookGroupPost,
  RawInstagramComment,
  RawInstagramPost,
  RawPlayReview,
  RawRedditComment,
  RawRedditPost,
  RawSerpQuestion,
  RawSerpTrendQuery,
  RawTiktokComment,
  RawTiktokVideo,
  RawTrustpilotReview,
  RawWebResult,
  RawYoutubeChannelVideo,
  RawYoutubeSearchVideo,
  RawYtApiCommentThread,
  TopicSignalRow,
} from "./types";

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const numStr = (v: unknown): number | null => {
  if (typeof v === "number") return num(v);
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return null;
};
export const sha16 = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 16);

// topic_signals.title is NOT NULL — comment-/caption-style items get a truncated
// first line of their text as title (full text stays in body under the 30-day TTL).
function makeTitle(text: string | undefined | null): string | null {
  const t = text?.replace(/\s+/g, " ").trim();
  if (!t) return null;
  return t.length > 120 ? `${t.slice(0, 119)}…` : t;
}

// ISO timestamps only — /v1/scrape/youtube/channel returns RELATIVE publishedAt
// ("7 days ago"), which must not be guessed into a timestamptz.
function isoOrNull(v: string | undefined | null): string | null {
  if (!v) return null;
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

function baseRow(
  runId: string,
  externalId: string,
  source: string,
  platform: Platform,
  title: string
): TopicSignalRow {
  return {
    run_id: runId,
    external_id: externalId,
    source,
    platform,
    title,
    body: null,
    flair: null,
    post_type: null,
    post_url: null,
    posted_at: null,
    up_votes: null,
    comments_count: null,
    engagement: null,
    metrics: null,
    is_seeded: false,
    matched_term: null,
  };
}

// --- Engagement formulas (D4) --------------------------------------------------

const commentEngagement = (likes: number | null, replies: number | null) =>
  likes === null ? null : likes + 2 * (replies ?? 0);

// --- Per-source mappers -------------------------------------------------------

function mapRedditPost(item: RawRedditPost, runId: string): TopicSignalRow | null {
  if (item.type && item.type !== "post") return null;
  if (!item.id || !item.subreddit || !item.title) return null;
  const row = baseRow(runId, item.id, item.subreddit, "reddit", item.title);
  row.body = item.text?.trim() ? item.text : null;
  row.flair = item.flair ?? null;
  row.post_type = "post";
  row.post_url = item.url ?? null;
  row.posted_at = isoOrNull(item.postedAt);
  row.up_votes = num(item.score);
  row.comments_count = num(item.comments);
  row.engagement = row.up_votes === null ? null : row.up_votes + 2 * (row.comments_count ?? 0);
  row.metrics = {
    score: num(item.score),
    upvoteRatio: num(item.upvoteRatio),
    comments: num(item.comments),
  };
  return row;
}

function mapRedditComment(
  item: RawRedditComment,
  runId: string,
  postId: string
): TopicSignalRow | null {
  const title = makeTitle(item.text);
  if (!item.id || !title) return null;
  const row = baseRow(runId, item.id, `reddit:${item.postId ?? postId}`, "reddit", title);
  row.body = item.text ?? null;
  row.post_type = "comment";
  row.post_url = item.url ?? item.postUrl ?? null;
  row.posted_at = isoOrNull(item.postedAt);
  row.up_votes = num(item.score);
  row.engagement = num(item.score);
  row.metrics = {
    score: num(item.score),
    depth: num(item.depth),
    subreddit: item.subreddit ?? null,
  };
  return row;
}

function mapYtSearchVideo(
  item: RawYoutubeSearchVideo,
  runId: string,
  query: string
): TopicSignalRow | null {
  if (!item.id || !item.title) return null;
  const row = baseRow(runId, item.id, query, "youtube", item.title);
  row.body = item.description?.trim() ? item.description : null;
  row.post_type = "video";
  row.post_url = item.url ?? `https://www.youtube.com/watch?v=${item.id}`;
  row.posted_at = isoOrNull(item.publishedAt);
  row.comments_count = num(item.comments);
  row.engagement = num(item.views);
  row.metrics = {
    views: num(item.views),
    comments: num(item.comments),
    channelHandle: item.channel?.handle ?? null, // publisher attribution (allowed)
    subscribers: num(item.channel?.subscribers),
  };
  return row;
}

const toHandle = (h: string) => `@${h.replace(/^@/, "")}`;

function mapYtChannelVideo(item: RawYoutubeChannelVideo, runId: string): TopicSignalRow | null {
  if (!item.id || !item.title || !item.channel?.handle) return null;
  const row = baseRow(runId, item.id, toHandle(item.channel.handle), "youtube", item.title);
  row.post_type = "video";
  row.post_url = item.url ?? `https://www.youtube.com/watch?v=${item.id}`;
  row.posted_at = isoOrNull(item.publishedAt); // relative text → null
  row.engagement = num(item.views); // channel-median base
  row.metrics = { views: num(item.views), subscribers: num(item.channel?.subscribers) };
  return row;
}

function mapIgPost(item: RawInstagramPost, runId: string, source: string): TopicSignalRow | null {
  const title = makeTitle(item.text);
  if (!item.id || !title) return null;
  const row = baseRow(runId, item.id, source, "instagram", title);
  row.body = item.text ?? null;
  row.post_type = item.type ?? null;
  row.post_url = item.url ?? null;
  row.posted_at = isoOrNull(item.postedAt);
  const likes = num(item.likes); // null = unknown, not 0
  const comments = num(item.comments);
  const views = num(item.views);
  row.comments_count = comments;
  row.engagement =
    likes === null
      ? null
      : likes + 2 * (comments ?? 0) + (item.type === "Video" ? (views ?? 0) / 100 : 0);
  row.metrics = { likes, comments, views };
  return row;
}

function mapIgComment(
  item: RawInstagramComment,
  runId: string,
  source: string,
  postUrl: string
): TopicSignalRow | null {
  const title = makeTitle(item.text);
  if (!item.id || !title) return null;
  const row = baseRow(runId, item.id, source, "instagram", title);
  row.body = item.text ?? null;
  row.post_type = "comment";
  row.post_url = item.url ?? item.postUrl ?? postUrl;
  row.posted_at = isoOrNull(item.postedAt);
  row.engagement = commentEngagement(num(item.likes), num(item.replies));
  row.metrics = { likes: num(item.likes), replies: num(item.replies) };
  return row;
}

function mapTiktokVideo(item: RawTiktokVideo, runId: string, query: string): TopicSignalRow | null {
  const title = makeTitle(item.text);
  if (!item.id || !title) return null;
  const row = baseRow(runId, item.id, query, "tiktok", title);
  row.body = item.text ?? null;
  row.post_type = "video";
  row.post_url = item.url ?? null;
  row.posted_at = isoOrNull(item.postedAt);
  const likes = num(item.likes);
  row.comments_count = num(item.comments);
  row.engagement =
    likes === null
      ? null
      : (num(item.plays) ?? 0) / 100 +
        likes +
        2 * (num(item.comments) ?? 0) +
        3 * (num(item.shares) ?? 0);
  row.metrics = {
    likes,
    comments: num(item.comments),
    shares: num(item.shares),
    plays: num(item.plays),
    bookmarks: num(item.bookmarks),
    language: item.language ?? null,
  };
  return row;
}

function mapTiktokComment(
  item: RawTiktokComment,
  runId: string,
  videoUrl: string
): TopicSignalRow | null {
  const title = makeTitle(item.text);
  if (!item.id || !item.videoId || !title) return null;
  const row = baseRow(runId, item.id, `tiktok:${item.videoId}`, "tiktok", title);
  row.body = item.text ?? null;
  row.post_type = "comment";
  row.post_url = videoUrl;
  row.posted_at = isoOrNull(item.postedAt);
  row.engagement = commentEngagement(num(item.likes), num(item.replies));
  row.metrics = { likes: num(item.likes), replies: num(item.replies) };
  return row;
}

// Posts without text are dropped (~30 % measured 2026-09-06); external_id is the
// normalised text hash so cross-posts across groups (and re-posts across weeks)
// collapse into one signal. The post id survives in post_url.
function mapFbGroupPost(
  item: RawFacebookGroupPost,
  runId: string,
  group: string
): TopicSignalRow | null {
  const title = makeTitle(item.text);
  if (!item.id || !title || !item.text) return null;
  const norm = item.text.toLowerCase().replace(/\s+/g, " ").trim();
  const row = baseRow(runId, `fb:${sha16(norm)}`, group, "facebook", title);
  row.body = item.text;
  row.post_type = "post";
  row.post_url = item.url ?? null;
  row.posted_at = isoOrNull(item.postedAt);
  row.comments_count = num(item.comments);
  const reactions = num(item.reactions);
  row.engagement =
    reactions === null
      ? null
      : reactions + 2 * (num(item.comments) ?? 0) + 3 * (num(item.shares) ?? 0);
  row.metrics = {
    reactions,
    comments: num(item.comments),
    shares: num(item.shares),
    groupName: item.group?.name ?? null,
  };
  return row;
}

function mapWebResult(item: RawWebResult, runId: string, query: string): TopicSignalRow | null {
  if (!item.url || !item.title) return null;
  const row = baseRow(runId, `web:${sha16(item.url)}`, query, "web", item.title);
  row.body = item.snippet ?? null;
  row.post_type = "web-result";
  row.post_url = item.url;
  row.metrics = { dateText: item.dateText ?? null };
  return row;
}

export function mapYtApiCommentThread(
  item: RawYtApiCommentThread,
  runId: string,
  videoId: string
): TopicSignalRow | null {
  const top = item.snippet?.topLevelComment?.snippet;
  const title = makeTitle(top?.textOriginal);
  if (!item.id || !title) return null;
  const row = baseRow(runId, item.id, `yt:${videoId}`, "youtube", title);
  row.body = top?.textOriginal ?? null;
  row.post_type = "comment";
  row.post_url = `https://www.youtube.com/watch?v=${videoId}&lc=${item.id}`;
  row.posted_at = isoOrNull(top?.publishedAt);
  row.engagement = commentEngagement(num(top?.likeCount), num(item.snippet?.totalReplyCount));
  row.metrics = {
    likes: num(top?.likeCount),
    replies: num(item.snippet?.totalReplyCount),
  };
  return row;
}

// --- Reviews (source = competitor slug; the digest aggregates WITHOUT it) -------

export function mapAppleReview(
  entry: RawAppleReviewEntry,
  runId: string,
  competitor: string,
  appId: string,
  storefront: string
): TopicSignalRow | null {
  const id = entry.id?.label;
  const title = makeTitle(entry.title?.label) ?? makeTitle(entry.content?.label);
  if (!id || !title) return null;
  const row = baseRow(runId, `apple:${id}`, competitor, "appstore", title);
  row.body = entry.content?.label ?? null;
  row.post_type = "review";
  row.post_url = `https://apps.apple.com/${storefront}/app/id${appId}?see-all=reviews`;
  row.posted_at = isoOrNull(entry.updated?.label);
  row.metrics = {
    rating: numStr(entry["im:rating"]?.label),
    votes: numStr(entry["im:voteCount"]?.label),
    version: entry["im:version"]?.label ?? null,
    storefront,
    app: appId,
  };
  return row;
}

export function mapPlayReview(
  item: RawPlayReview,
  runId: string,
  competitor: string,
  pkg: string,
  country: string
): TopicSignalRow | null {
  const title = makeTitle(item.title) ?? makeTitle(item.text);
  if (!item.id || !title) return null;
  const row = baseRow(runId, `gplay:${item.id}`, competitor, "playstore", title);
  row.body = item.text ?? null;
  row.post_type = "review";
  row.post_url = `https://play.google.com/store/apps/details?id=${pkg}&hl=de&gl=${country}`;
  row.posted_at = isoOrNull(item.date);
  row.metrics = {
    rating: num(item.score),
    thumbsUp: num(item.thumbsUp),
    version: item.version ?? null,
    country,
    app: pkg,
    devReply: item.replyText ? 1 : 0,
  };
  return row;
}

export function mapTrustpilotReview(
  item: RawTrustpilotReview,
  runId: string,
  competitor: string,
  pageUrl: string
): TopicSignalRow | null {
  const title = makeTitle(item.title) ?? makeTitle(item.text);
  if (!title) return null;
  const id = item.id?.trim() || sha16(`${item.date ?? ""}|${item.text ?? item.title ?? ""}`);
  const row = baseRow(runId, `tp:${id}`, competitor, "trustpilot", title);
  row.body = item.text ?? null;
  row.post_type = "review";
  row.post_url = pageUrl;
  row.posted_at = isoOrNull(item.date);
  row.metrics = { rating: num(item.rating) };
  return row;
}

// --- SerpApi (weekly snapshot for trends, dedupe by question hash for PAA) ------

export function mapSerpTrend(
  item: RawSerpTrendQuery,
  runId: string,
  seed: string,
  week: string,
  kind: "rising" | "top"
): TopicSignalRow | null {
  if (!item.query) return null;
  const row = baseRow(
    runId,
    `trend:${week}:${slug(seed)}:${kind}:${sha16(item.query)}`,
    seed,
    "serp",
    item.query
  );
  row.post_type = `trend-${kind}`;
  row.post_url = item.link ?? null;
  row.metrics = {
    trend_value: num(item.extracted_value),
    trend_kind: kind,
    value_text: item.value ?? null,
  };
  return row;
}

export function mapSerpQuestion(
  item: RawSerpQuestion,
  runId: string,
  query: string,
  position: number
): TopicSignalRow | null {
  if (!item.question) return null;
  const row = baseRow(
    runId,
    `paa:${sha16(item.question.toLowerCase().trim())}`,
    query,
    "serp",
    item.question
  );
  row.body = item.snippet ?? null;
  row.post_type = "paa";
  row.post_url = item.link ?? null;
  row.metrics = {
    paa_position: position,
    paa_type: item.type ?? null,
    source_title: item.title ?? null,
  };
  return row;
}

// --- Dispatch -----------------------------------------------------------------

// Map one DeepAPI output array through the spec's whitelist mapper. `source` for
// query-/hashtag-/video-scoped specs comes from the spec; reddit/yt-channel rows
// derive it from the item (subreddit / @handle).
export function mapSpecItems(spec: SourceSpec, output: unknown, runId: string): TopicSignalRow[] {
  const items = Array.isArray(output)
    ? output
    : // /v1/search/web wraps its entries in output.results
      ((output as { results?: unknown[] } | null)?.results ?? []);
  const kind: SourceKind = spec.kind;
  const rows = items.map((item): TopicSignalRow | null => {
    switch (kind) {
      case "reddit-posts":
      case "reddit-search":
        return mapRedditPost(item as RawRedditPost, runId);
      case "reddit-comments":
        return mapRedditComment(item as RawRedditComment, runId, String(spec.body.url ?? ""));
      case "yt-search":
        return mapYtSearchVideo(item as RawYoutubeSearchVideo, runId, spec.source ?? "yt-search");
      case "yt-channels":
        return mapYtChannelVideo(item as RawYoutubeChannelVideo, runId);
      case "ig-hashtag":
      case "ig-accounts":
        return mapIgPost(item as RawInstagramPost, runId, spec.source ?? "instagram");
      case "ig-comments":
        return mapIgComment(
          item as RawInstagramComment,
          runId,
          spec.source ?? "instagram",
          String(spec.body.url ?? "")
        );
      case "tiktok-search":
        return mapTiktokVideo(item as RawTiktokVideo, runId, spec.source ?? "tiktok-search");
      case "tiktok-comments":
        return mapTiktokComment(item as RawTiktokComment, runId, String(spec.body.url ?? ""));
      case "fb-groups":
        return mapFbGroupPost(item as RawFacebookGroupPost, runId, spec.source ?? "facebook");
      case "web":
        return mapWebResult(item as RawWebResult, runId, spec.source ?? "web");
    }
  });
  return rows.filter((r): r is TopicSignalRow => r !== null);
}

// Client-side freshness window (maxAgeDays) for endpoints without `since`. Applied by
// the ingest AFTER mapping so stale-but-mappable items count as filtered, not as
// "no mappable items" (which flags contract drift).
export function applyFreshness(spec: SourceSpec, rows: TopicSignalRow[]): TopicSignalRow[] {
  if (!spec.maxAgeDays) return rows;
  const cutoff = Date.now() - spec.maxAgeDays * 86400000;
  return rows.filter((r) => r.posted_at === null || Date.parse(r.posted_at) >= cutoff);
}

// --- Comment target selection (Phase 2) ----------------------------------------

// Cheap German heuristic: umlauts/ß or German function words. Dynamic comment
// targets must stay DACH — raw view sorting picked EN videos (measured 2026-08-29:
// 298 comments, 0 % German).
export const GERMAN_HINT =
  /[äöüß]|\b(der|die|das|und|nicht|ich|mit|für|ist|wie|dein|beim|auch|noch|schon|oder|aber|euch|ihr)\b/i;

// IG lead-magnet captions ("kommentier X", "schreib … in die Kommentare") produce
// one-word comment sections — excluded before the paid comment call.
const LEAD_MAGNET = /kommentier|schreib\w*\s+[^.!?]{0,40}\bkommentare\b|comment\s+\w+\s+below/i;

export type CommentCandidate = {
  external_id: string;
  platform: Platform;
  title: string;
  body: string | null;
  post_url: string | null;
  metrics: Record<string, number | string | null> | null;
};

// Deterministic: dedupe by id, drop reference-channel videos (their comments would
// double-count the channels we already median), drop IG lead magnets, prefer
// German-hinted posts by comment count (fallback: overall top comments, so Phase 2
// never starves), take the platform's top N.
export function selectCommentTargets(
  platform: keyof typeof COMMENT_TARGETS,
  rows: CommentCandidate[]
): CommentCandidate[] {
  const refHandles = new Set(YT_REFERENCE_CHANNELS.map((h) => h.replace(/^@/, "").toLowerCase()));
  const byId = new Map<string, CommentCandidate>();
  for (const r of rows) {
    if (r.platform !== platform || byId.has(r.external_id) || !r.post_url) continue;
    const handle = String(r.metrics?.channelHandle ?? "")
      .replace(/^@/, "")
      .toLowerCase();
    if (handle && refHandles.has(handle)) continue;
    if (platform === "instagram" && LEAD_MAGNET.test(`${r.title} ${r.body ?? ""}`)) continue;
    if ((Number(r.metrics?.comments) || 0) <= 0) continue;
    byId.set(r.external_id, r);
  }
  const byComments = [...byId.values()].sort(
    (a, b) => (Number(b.metrics?.comments) || 0) - (Number(a.metrics?.comments) || 0)
  );
  const german = byComments.filter(
    (r) => r.metrics?.language === "de" || GERMAN_HINT.test(`${r.title} ${r.body ?? ""}`)
  );
  return (german.length > 0 ? german : byComments).slice(0, COMMENT_TARGETS[platform]);
}
