// YouTube Data API v3 helper (server-only) — comment scraping for the battery's
// Phase 2 and for on-demand skill runs (/blog-article, /podcast-article).
// commentThreads costs 1 quota unit per call (up to 100 comments) — NEVER use
// search.list here (100 units per call); video IDs come from the DeepAPI
// yt-search results instead.
import "server-only";

import { YT_COMMENTS_MAX_RESULTS } from "./config";
import type { RawYtApiCommentThread } from "./types";

export function hasYoutubeKey(): boolean {
  return Boolean(process.env.YOUTUBE_API_KEY);
}

// Top-level comment threads for one video, ordered by relevance (YouTube's own
// "top comments" ranking — surfaces the discussed ones, not the newest drive-bys).
export async function fetchCommentThreads(
  videoId: string,
  maxResults = YT_COMMENTS_MAX_RESULTS
): Promise<RawYtApiCommentThread[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY not set — required for yt-comments");
  const url =
    "https://www.googleapis.com/youtube/v3/commentThreads" +
    `?part=snippet&videoId=${encodeURIComponent(videoId)}` +
    `&maxResults=${maxResults}&order=relevance&textFormat=plainText&key=${key}`;
  const res = await fetch(url);
  if (!res.ok) {
    // 403 commentsDisabled / 404 videoNotFound etc. — surface the API's own reason.
    const text = await res.text();
    throw new Error(
      `YouTube commentThreads for ${videoId} failed: ${res.status} ${text.slice(0, 300)}`
    );
  }
  const json = (await res.json()) as { items?: RawYtApiCommentThread[] };
  return json.items ?? [];
}
