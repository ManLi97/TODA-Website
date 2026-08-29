// Whitelist mappers: one per battery source kind → TopicSignalRow. The privacy
// contract is structural (like the old mapPostItem): rows are built from NAMED
// whitelisted fields only, so author/commenter identities can never leak into
// topic_signals. engagement per D2: reddit broad = up_votes + 2*comments;
// yt channel reference rows = views; every other source = NULL (context row).
import { createHash } from "node:crypto";

import { YT_COMMENT_TARGETS, YT_COMMENT_VIDEOS, YT_REFERENCE_CHANNELS } from "./config";
import type { SourceKind, SourceSpec } from "./config";
import type {
  Platform,
  RawInstagramHashtagPost,
  RawRedditPost,
  RawTiktokComment,
  RawTiktokVideo,
  RawWebResult,
  RawYoutubeChannelVideo,
  RawYoutubeSearchVideo,
  RawYtApiCommentThread,
  TopicSignalRow,
} from "./types";

const num = (v: unknown): number | null => (typeof v === "number" ? v : null);

// topic_signals.title is NOT NULL — comment-/caption-style items get a truncated
// first line of their text as title (full text stays in body under the 30-day TTL).
function makeTitle(text: string | undefined): string | null {
  const t = text?.replace(/\s+/g, " ").trim();
  if (!t) return null;
  return t.length > 120 ? `${t.slice(0, 119)}…` : t;
}

// ISO timestamps only — /v1/scrape/youtube/channel returns RELATIVE publishedAt
// ("7 days ago"), which must not be guessed into a timestamptz.
function isoOrNull(v: string | undefined): string | null {
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

// --- Per-source mappers -------------------------------------------------------

function mapRedditPost(item: RawRedditPost, runId: string): TopicSignalRow | null {
  if (item.type !== "post") return null;
  if (!item.id || !item.subreddit || !item.title) return null;
  const row = baseRow(runId, item.id, item.subreddit, "reddit", item.title);
  row.body = item.text?.trim() ? item.text : null;
  row.post_type = "post";
  row.post_url = item.url ?? null;
  row.posted_at = isoOrNull(item.postedAt);
  row.up_votes = num(item.score);
  row.comments_count = num(item.comments);
  row.engagement =
    row.up_votes !== null && row.comments_count !== null
      ? row.up_votes + 2 * row.comments_count
      : null;
  row.metrics = { score: num(item.score), comments: num(item.comments) };
  return row;
}

function mapYtSearchVideo(
  item: RawYoutubeSearchVideo,
  runId: string,
  query: string
): TopicSignalRow | null {
  if (!item.id || !item.title) return null;
  const row = baseRow(runId, item.id, query, "youtube", item.title);
  row.post_type = "video";
  row.post_url = item.url ?? `https://www.youtube.com/watch?v=${item.id}`;
  row.posted_at = isoOrNull(item.publishedAt);
  row.metrics = {
    views: num(item.views),
    comments: num(item.comments),
    channelHandle: item.channel?.handle ?? null, // publisher attribution (allowed)
    subscribers: num(item.channel?.subscribers),
  };
  return row; // context: engagement stays NULL
}

const toHandle = (h: string) => `@${h.replace(/^@/, "")}`;

function mapYtChannelVideo(item: RawYoutubeChannelVideo, runId: string): TopicSignalRow | null {
  if (!item.id || !item.title || !item.channel?.handle) return null;
  const row = baseRow(runId, item.id, toHandle(item.channel.handle), "youtube", item.title);
  row.post_type = "video";
  row.post_url = item.url ?? `https://www.youtube.com/watch?v=${item.id}`;
  row.posted_at = isoOrNull(item.publishedAt); // relative text → null
  row.engagement = num(item.views); // broad: channel-median base (D3)
  row.metrics = { views: num(item.views), subscribers: num(item.channel?.subscribers) };
  return row;
}

function mapIgHashtagPost(
  item: RawInstagramHashtagPost,
  runId: string,
  hashtag: string
): TopicSignalRow | null {
  const title = makeTitle(item.text);
  if (!item.id || !title) return null;
  const row = baseRow(runId, item.id, hashtag, "instagram", title);
  row.body = item.text ?? null;
  row.post_type = item.type ?? null;
  row.post_url = item.url ?? null;
  row.posted_at = isoOrNull(item.postedAt);
  row.metrics = {
    likes: num(item.likes),
    comments: num(item.comments),
    views: num(item.views),
  };
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
  row.metrics = {
    likes: num(item.likes),
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
  row.metrics = { likes: num(item.likes), replies: num(item.replies) };
  return row;
}

function mapWebResult(item: RawWebResult, runId: string, query: string): TopicSignalRow | null {
  if (!item.url || !item.title) return null;
  const hash = createHash("sha256").update(item.url).digest("hex").slice(0, 16);
  const row = baseRow(runId, `web:${hash}`, query, "web", item.title);
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
  row.metrics = {
    likes: num(top?.likeCount),
    replies: num(item.snippet?.totalReplyCount),
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
        return mapRedditPost(item as RawRedditPost, runId);
      case "yt-search":
        return mapYtSearchVideo(item as RawYoutubeSearchVideo, runId, spec.source ?? "yt-search");
      case "yt-channels":
        return mapYtChannelVideo(item as RawYoutubeChannelVideo, runId);
      case "ig-hashtag":
        return mapIgHashtagPost(item as RawInstagramHashtagPost, runId, spec.source ?? "ig");
      case "tiktok-search":
        return mapTiktokVideo(item as RawTiktokVideo, runId, spec.source ?? "tiktok-search");
      case "tiktok-comments":
        return mapTiktokComment(item as RawTiktokComment, runId, String(spec.body.url ?? ""));
      case "web":
        return mapWebResult(item as RawWebResult, runId, spec.source ?? "web");
    }
  });
  return rows.filter((r): r is TopicSignalRow => r !== null);
}

// --- yt-comments target selection (Phase 2) -----------------------------------

// Deterministic: dedupe by videoId, drop reference-channel videos (their comments
// would double-count the channels we already median), take the top N by views,
// then append the optional fixed list.
export function selectYtCommentTargets(searchItems: RawYoutubeSearchVideo[]): string[] {
  const refHandles = new Set(YT_REFERENCE_CHANNELS.map((h) => h.replace(/^@/, "").toLowerCase()));
  const byId = new Map<string, RawYoutubeSearchVideo>();
  for (const item of searchItems) {
    if (!item.id || byId.has(item.id)) continue;
    const handle = item.channel?.handle?.replace(/^@/, "").toLowerCase();
    if (handle && refHandles.has(handle)) continue;
    byId.set(item.id, item);
  }
  const top = [...byId.values()]
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, YT_COMMENT_TARGETS)
    .map((v) => v.id as string);
  for (const fixed of YT_COMMENT_VIDEOS) if (!top.includes(fixed)) top.push(fixed);
  return top;
}
