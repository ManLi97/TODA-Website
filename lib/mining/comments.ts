// Phase 2 (server-only): dynamic comment targets per platform, chosen from THIS
// week's Phase-1 rows in the DB (not from in-memory output — so the step runs on its
// own: cron chain step `comments`, CLI --comments / --source <platform>-comments).
// German-hinted posts with the most comments win (selectCommentTargets); reference
// channels and IG lead magnets are excluded. YouTube comments come from the Data API
// (free quota), TikTok/Instagram/Reddit comments from DeepAPI.
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import {
  COMMENT_MAX_ITEMS,
  COMMENT_TARGETS,
  UNIT_PRICE,
  YT_COMMENTS_MAX_RESULTS,
  YT_COMMENT_VIDEOS,
  costCap,
  isoWeek,
} from "./config";
import type { SourceSpec } from "./config";
import { emptyOutcome, ingestOutput, recordFailedRun, runSource } from "./ingest";
import { mapYtApiCommentThread, selectCommentTargets } from "./mappers";
import type { CommentCandidate } from "./mappers";
import type { IngestMeta, RunOutcome, TopicSignalRow } from "./types";
import { fetchCommentThreads, hasYoutubeKey } from "./youtube";

export type CommentPlatform = keyof typeof COMMENT_TARGETS;
export const COMMENT_PLATFORMS: CommentPlatform[] = ["youtube", "tiktok", "instagram", "reddit"];
export const COMMENT_SLOT: Record<CommentPlatform, string> = {
  youtube: "yt-comments",
  tiktok: "tiktok-comments",
  instagram: "ig-comments",
  reddit: "reddit-comments",
};

// Phase-1 slots whose rows may become comment targets (never comment rows, never
// the yt-channels snapshot).
const CANDIDATE_SLOTS = [
  "yt-search",
  "tiktok-search",
  "ig-hashtags",
  "ig-accounts",
  "reddit-search",
  "reddit-broad",
];

type CandidateRow = CommentCandidate & {
  mining_runs: { source_key: string } | { source_key: string }[] | null;
};

// This week's succeeded Phase-1 rows of the candidate slots.
export async function weekCandidates(week: string): Promise<CommentCandidate[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("topic_signals")
    .select(
      "external_id, platform, source, title, body, post_url, metrics, mining_runs!inner(source_key, iso_week, status)"
    )
    .eq("mining_runs.iso_week", week)
    .eq("mining_runs.status", "succeeded")
    .in("platform", COMMENT_PLATFORMS)
    .neq("post_type", "comment")
    .limit(1000);
  if (error) throw new Error(`comment candidates query failed: ${error.message}`);
  return ((data ?? []) as unknown as CandidateRow[]).filter((r) => {
    const run = Array.isArray(r.mining_runs) ? r.mining_runs[0] : r.mining_runs;
    const slot = run?.source_key?.split("/")[0] ?? "";
    return CANDIDATE_SLOTS.includes(slot);
  });
}

// --- YouTube (Data API) --------------------------------------------------------

function ytCommentsMeta(videoId: string | null, week: string): IngestMeta {
  return {
    provider: "youtube_data_api",
    sourceKey: videoId ? `yt-comments/${videoId}` : "yt-comments",
    pass: "broad",
    timeWindow: "n/a",
    actor: "youtube_data_api:commentThreads",
    input: videoId ? { videoId, maxResults: YT_COMMENTS_MAX_RESULTS, order: "relevance" } : null,
    label: videoId ? `yt-comments/${videoId}` : "yt-comments",
    isoWeek: week,
    dedupe: true,
  };
}

// Comment scrape for one video (1 quota unit / 100 comments). Provider ref is
// deterministic per ISO week, so a same-week retry heals the same row.
export async function runYtComments(
  videoId: string,
  week = isoWeek(),
  salt?: string
): Promise<RunOutcome> {
  const meta = ytCommentsMeta(videoId, week);
  const datasetId = `ytapi:${week}:comments:${videoId}${salt ? `:${salt}` : ""}`;
  try {
    const threads = await fetchCommentThreads(videoId);
    const rows = threads
      .map((t) => mapYtApiCommentThread(t, "pending", videoId))
      .filter((r): r is TopicSignalRow => r !== null);
    return await ingestOutput(datasetId, threads, null, meta, rows, threads.length);
  } catch (err) {
    return recordFailedRun(meta, datasetId, err instanceof Error ? err.message : String(err));
  }
}

const videoIdFromUrl = (url: string) =>
  /[?&]v=([^&]+)/.exec(url)?.[1] ?? url.split("/").pop() ?? url;

// --- DeepAPI comment specs (TikTok / Instagram / Reddit) --------------------------

function commentSpec(
  platform: Exclude<CommentPlatform, "youtube">,
  target: CommentCandidate
): SourceSpec {
  const id = target.external_id;
  const url = target.post_url as string;
  switch (platform) {
    case "tiktok":
      return {
        key: `tiktok-comments/${id}`,
        kind: "tiktok-comments",
        pass: "broad",
        platform: "tiktok",
        endpoint: "/v1/scrape/tiktok/comments",
        timeWindow: "all",
        source: `tiktok:${id}`,
        body: {
          url,
          maxItems: COMMENT_MAX_ITEMS.tiktok,
          maxCostUsd: costCap(COMMENT_MAX_ITEMS.tiktok, UNIT_PRICE.tiktokComment),
        },
        unitPriceUsd: UNIT_PRICE.tiktokComment,
        dedupe: true,
      };
    case "instagram":
      return {
        key: `ig-comments/${id}`,
        kind: "ig-comments",
        pass: "broad",
        platform: "instagram",
        endpoint: "/v1/scrape/instagram/comments",
        timeWindow: "all",
        source: `ig:${id}`,
        body: {
          url,
          maxItems: COMMENT_MAX_ITEMS.instagram,
          maxCostUsd: costCap(COMMENT_MAX_ITEMS.instagram, UNIT_PRICE.igComment),
        },
        unitPriceUsd: UNIT_PRICE.igComment,
        dedupe: true,
      };
    case "reddit":
      return {
        key: `reddit-comments/${id}`,
        kind: "reddit-comments",
        pass: "broad",
        platform: "reddit",
        endpoint: "/v1/scrape/reddit/comments",
        timeWindow: "all",
        source: `reddit:${id}`,
        body: {
          url,
          maxItems: COMMENT_MAX_ITEMS.reddit,
          maxCostUsd: costCap(COMMENT_MAX_ITEMS.reddit, UNIT_PRICE.redditComment, 0.1),
        },
        unitPriceUsd: UNIT_PRICE.redditComment,
        dedupe: true,
      };
  }
}

export type CommentsOptions = {
  week?: string;
  salt?: string;
  platforms?: CommentPlatform[]; // default: all four
};

// Comment targets of the week per platform → one mining_runs row per target. A
// platform without candidates yields one visible failed row instead of a silent gap.
export async function runComments(options: CommentsOptions = {}): Promise<RunOutcome[]> {
  const week = options.week ?? isoWeek();
  const platforms = options.platforms ?? COMMENT_PLATFORMS;
  const candidates = await weekCandidates(week);
  const outcomes: RunOutcome[] = [];

  for (const platform of platforms) {
    const targets = selectCommentTargets(platform, candidates);
    if (platform === "youtube") {
      const ids = targets.map((t) => t.external_id);
      for (const fixed of YT_COMMENT_VIDEOS) if (!ids.includes(fixed)) ids.push(fixed);
      if (!hasYoutubeKey()) {
        outcomes.push(
          await recordFailedRun(ytCommentsMeta(null, week), null, "YOUTUBE_API_KEY not set")
        );
        continue;
      }
      if (ids.length === 0) {
        outcomes.push(
          await recordFailedRun(
            ytCommentsMeta(null, week),
            null,
            `no yt-search rows for ${week} — no comment targets`
          )
        );
        continue;
      }
      const settled = await Promise.allSettled(
        ids.map((id) => runYtComments(videoIdFromUrl(id), week, options.salt))
      );
      for (const s of settled) {
        if (s.status === "fulfilled") outcomes.push(s.value);
        else {
          const failed = emptyOutcome(ytCommentsMeta(null, week), null);
          failed.error = s.reason instanceof Error ? s.reason.message : String(s.reason);
          outcomes.push(failed);
        }
      }
      continue;
    }
    if (targets.length === 0) {
      const meta: IngestMeta = {
        provider: "deepapi",
        sourceKey: COMMENT_SLOT[platform],
        pass: "broad",
        timeWindow: "all",
        actor: "deepapi:comments",
        input: null,
        label: COMMENT_SLOT[platform],
        isoWeek: week,
        dedupe: true,
      };
      outcomes.push(
        await recordFailedRun(
          meta,
          null,
          `no ${platform} candidate rows for ${week} — no comment targets`
        )
      );
      continue;
    }
    const specs = targets.map((t) => commentSpec(platform, t));
    const settled = await Promise.allSettled(
      specs.map((spec) => runSource(spec, week, options.salt))
    );
    settled.forEach((s, i) => {
      if (s.status === "fulfilled") outcomes.push(s.value.outcome);
      else {
        const failed = emptyOutcome(
          {
            ...ytCommentsMeta(null, week),
            sourceKey: specs[i].key,
            label: specs[i].key,
            provider: "deepapi",
          },
          null
        );
        failed.error = s.reason instanceof Error ? s.reason.message : String(s.reason);
        outcomes.push(failed);
      }
    });
  }
  return outcomes;
}
