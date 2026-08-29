// Community-Pulse battery → Supabase ingest (server-only). Runs the weekly DeepAPI
// battery (Phase 1) + YouTube-Data-API comment scrape (Phase 2), maps whitelisted
// fields into topic_signals, records each request in mining_runs (snapshot /
// append-only), and runs the body retention sweep. Scoring is NOT here — it is the
// deterministic SQL view topic_cluster_scores. See docs/blog/topic-radar.md.
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  BATTERY,
  COVERAGE_ALERT_PCT,
  RETENTION_DAYS,
  UPSERT_CHUNK,
  YT_COMMENTS_SOURCE_KEY,
  YT_COMMENT_VIDEOS,
  YT_COMMENTS_MAX_RESULTS,
  idempotencyKey,
  isoWeek,
} from "./config";
import type { SourceSpec } from "./config";
import { DeepApiError, getRequest, runScrape } from "./deepapi";
import { mapSpecItems, mapYtApiCommentThread, selectYtCommentTargets } from "./mappers";
import { fetchCommentThreads, hasYoutubeKey } from "./youtube";
import type {
  IngestMeta,
  MiningSyncResult,
  RawYoutubeSearchVideo,
  RunOutcome,
  TopicSignalRow,
} from "./types";

// --- Stats -------------------------------------------------------------------

// Generalised coverage (v2): broad = % mapped rows carrying scorable engagement;
// context/seeded = % mapped rows carrying title AND post_url (audit-linkable).
export function computeCoveragePct(rows: TopicSignalRow[], pass: IngestMeta["pass"]): number {
  if (rows.length === 0) return 0;
  const good =
    pass === "broad"
      ? rows.filter((r) => r.engagement !== null)
      : rows.filter((r) => r.title && r.post_url);
  return Math.round((good.length / rows.length) * 10000) / 100;
}

// A single upsert statement cannot carry two rows with the same conflict key, so
// dedupe on external_id first (last write wins).
function dedupeByExternalId(rows: TopicSignalRow[]): TopicSignalRow[] {
  const map = new Map<string, TopicSignalRow>();
  for (const r of rows) map.set(r.external_id, r);
  return [...map.values()];
}

// --- Ingest ------------------------------------------------------------------

function emptyOutcome(meta: IngestMeta, datasetId: string | null): RunOutcome {
  return {
    runId: null,
    provider: meta.provider,
    sourceKey: meta.sourceKey,
    datasetId,
    label: meta.label,
    pass: meta.pass,
    timeWindow: meta.timeWindow,
    status: "failed",
    itemCount: 0,
    mappedCount: 0,
    signalsWritten: 0,
    fieldCoveragePct: 0,
    error: null,
  };
}

function runRowFields(meta: IngestMeta) {
  return {
    provider: meta.provider,
    source_key: meta.sourceKey,
    pass: meta.pass,
    time_window: meta.timeWindow,
    actor: meta.actor,
    input: meta.input,
  };
}

// Ingest one provider result into a mining_runs row + its topic_signals. Idempotent:
// mining_runs upserts on dataset_id (provider ref), signals on (run_id, external_id) —
// re-ingesting the same ref heals the same rows. Any throw becomes a failed
// RunOutcome (per-run isolation), mirroring the gsc sync engine.
export async function ingestOutput(
  datasetId: string,
  output: unknown,
  spec: SourceSpec | null, // null → yt-comments (mapped by caller)
  meta: IngestMeta,
  premappedRows?: TopicSignalRow[],
  rawItemCount?: number
): Promise<RunOutcome> {
  const supabase = createAdminClient();
  const outcome = emptyOutcome(meta, datasetId);

  try {
    const { data: runRow, error: runErr } = await supabase
      .from("mining_runs")
      .upsert(
        { ...runRowFields(meta), dataset_id: datasetId, status: "running" },
        { onConflict: "dataset_id" }
      )
      .select("id")
      .single();
    if (runErr || !runRow)
      throw new Error(`mining_runs upsert failed: ${runErr?.message ?? "no row"}`);
    const runId = runRow.id as string;
    outcome.runId = runId;

    const mapped =
      premappedRows?.map((r) => ({ ...r, run_id: runId })) ??
      (spec ? mapSpecItems(spec, output, runId) : []);
    const rows = dedupeByExternalId(mapped);
    outcome.itemCount =
      rawItemCount ??
      (Array.isArray(output)
        ? output.length
        : ((output as { results?: unknown[] } | null)?.results?.length ?? 0));
    outcome.mappedCount = rows.length;
    outcome.fieldCoveragePct = computeCoveragePct(rows, meta.pass);

    if (rows.length === 0) {
      const msg = "run returned no mappable items";
      await finalizeRun(supabase, runId, "failed", msg, outcome);
      outcome.error = msg;
      return outcome;
    }

    for (let i = 0; i < rows.length; i += UPSERT_CHUNK) {
      const { error } = await supabase
        .from("topic_signals")
        .upsert(rows.slice(i, i + UPSERT_CHUNK), { onConflict: "run_id,external_id" });
      if (error) throw new Error(`topic_signals upsert failed: ${error.message}`);
    }

    await finalizeRun(supabase, runId, "succeeded", null, outcome);
    outcome.status = "succeeded";
    outcome.signalsWritten = rows.length;
    return outcome;
  } catch (err) {
    outcome.error = err instanceof Error ? err.message : String(err);
    if (outcome.runId) {
      await finalizeRun(supabase, outcome.runId, "failed", outcome.error, outcome).catch(() => {});
    }
    return outcome;
  }
}

async function finalizeRun(
  supabase: SupabaseClient,
  runId: string,
  status: "succeeded" | "failed",
  error: string | null,
  outcome: RunOutcome
): Promise<void> {
  const { error: e } = await supabase
    .from("mining_runs")
    .update({
      status,
      error,
      item_count: outcome.itemCount,
      post_count: outcome.mappedCount,
      field_coverage_pct: outcome.fieldCoveragePct,
    })
    .eq("id", runId);
  if (e) throw new Error(`mining_runs finalize failed: ${e.message}`);
}

// Record a run that never produced ingestible data. Upsert on dataset_id (when the
// provider ref is known) so a later recovery ingest heals THIS row rather than
// forking a new one; datasetId null → plain insert (the UNIQUE allows many NULLs).
async function recordFailedRun(
  meta: IngestMeta,
  datasetId: string | null,
  error: string
): Promise<RunOutcome> {
  const supabase = createAdminClient();
  const { data, error: e } = await supabase
    .from("mining_runs")
    .upsert(
      { ...runRowFields(meta), dataset_id: datasetId, status: "failed", error },
      { onConflict: "dataset_id" }
    )
    .select("id")
    .single();
  const outcome = emptyOutcome(meta, datasetId);
  outcome.runId = e ? null : (data?.id as string);
  outcome.error = e ? `${error}; mining_runs write also failed: ${e.message}` : error;
  return outcome;
}

// --- Battery -----------------------------------------------------------------

function deepApiMeta(spec: SourceSpec): IngestMeta {
  return {
    provider: "deepapi",
    sourceKey: spec.key,
    pass: spec.pass,
    timeWindow: spec.timeWindow,
    actor: `deepapi:${spec.endpoint}`,
    input: spec.body,
    label: spec.key,
  };
}

// Phase 1 for one spec: request → poll → ingest. Never throws.
async function runSource(
  spec: SourceSpec,
  salt?: string
): Promise<{ outcome: RunOutcome; output: unknown }> {
  const meta = deepApiMeta(spec);
  try {
    const env = await runScrape(spec.endpoint, spec.body, idempotencyKey(spec.key, salt));
    if (!env.requestId) throw new Error("DeepAPI returned no requestId");
    const outcome = await ingestOutput(env.requestId, env.output, spec, meta);
    return { outcome, output: env.output };
  } catch (err) {
    const requestId = err instanceof DeepApiError ? err.requestId : null;
    const message = err instanceof Error ? err.message : String(err);
    return { outcome: await recordFailedRun(meta, requestId, message), output: null };
  }
}

function ytCommentsMeta(videoId: string | null): IngestMeta {
  return {
    provider: "youtube_data_api",
    sourceKey: YT_COMMENTS_SOURCE_KEY,
    pass: "context",
    timeWindow: "n/a",
    actor: "youtube_data_api:commentThreads",
    input: videoId ? { videoId, maxResults: YT_COMMENTS_MAX_RESULTS, order: "relevance" } : null,
    label: videoId ? `yt-comments/${videoId}` : "yt-comments",
  };
}

// Phase 2: comment scrape for one video via the Data API (1 quota unit / 100
// comments). Provider ref is deterministic per ISO week, so a same-week retry
// heals the same row.
async function runYtComments(videoId: string): Promise<RunOutcome> {
  const meta = ytCommentsMeta(videoId);
  const datasetId = `ytapi:${isoWeek()}:comments:${videoId}`;
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

export type BatteryOptions = {
  // Restrict Phase 1 to specs whose key equals or starts with this prefix
  // (e.g. "yt-search" or "yt-search/ki-tattoo"). "yt-comments" runs Phase 2 only
  // (fixed YT_COMMENT_VIDEOS list — dynamic targets need the yt-search phase).
  source?: string;
  // Salt for the idempotency keys (--fresh): forces new DeepAPI runs this week.
  salt?: string;
};

const matchesFilter = (key: string, filter: string) =>
  key === filter || key.startsWith(`${filter}/`);

// Full battery: Phase 1 = all DeepAPI specs in parallel (one mining_runs row per
// request), Phase 2 = yt-comments targets picked from the Phase-1 yt-search output.
// Every failure becomes a failed mining_runs row / RunOutcome — visible gaps, never
// silent ones.
export async function runBattery(options: BatteryOptions = {}): Promise<RunOutcome[]> {
  const { source, salt } = options;
  const commentsOnly = source === YT_COMMENTS_SOURCE_KEY;
  const specs = commentsOnly
    ? []
    : source
      ? BATTERY.filter((s) => matchesFilter(s.key, source))
      : BATTERY;
  if (!commentsOnly && specs.length === 0) {
    throw new Error(
      `--source ${source} matches no battery slot; known: ` +
        `${[...new Set(BATTERY.map((s) => s.key.split("/")[0]))].join(", ")}, yt-comments`
    );
  }

  const settled = await Promise.allSettled(specs.map((spec) => runSource(spec, salt)));
  const outcomes: RunOutcome[] = [];
  const searchItems: RawYoutubeSearchVideo[] = [];
  let ytSearchSucceeded = 0;
  settled.forEach((s, i) => {
    if (s.status === "fulfilled") {
      outcomes.push(s.value.outcome);
      if (specs[i].kind === "yt-search" && s.value.outcome.status === "succeeded") {
        ytSearchSucceeded += 1;
        if (Array.isArray(s.value.output))
          searchItems.push(...(s.value.output as RawYoutubeSearchVideo[]));
      }
    } else {
      const failed = emptyOutcome(deepApiMeta(specs[i]), null);
      failed.error = s.reason instanceof Error ? s.reason.message : String(s.reason);
      outcomes.push(failed);
    }
  });

  // Phase 2 runs for the full battery and for --source yt-search / yt-comments.
  const wantsComments = !source || commentsOnly || source.startsWith("yt-search");
  if (wantsComments) {
    if (!hasYoutubeKey()) {
      outcomes.push(await recordFailedRun(ytCommentsMeta(null), null, "YOUTUBE_API_KEY not set"));
    } else if (commentsOnly) {
      if (YT_COMMENT_VIDEOS.length === 0) {
        throw new Error(
          "--source yt-comments needs YT_COMMENT_VIDEOS (fixed list) — dynamic targets " +
            "come from the yt-search phase; run the full battery or --source yt-search"
        );
      }
      for (const videoId of YT_COMMENT_VIDEOS) outcomes.push(await runYtComments(videoId));
    } else if (ytSearchSucceeded === 0) {
      // All searches dead → one visible failed row instead of a silent gap.
      outcomes.push(
        await recordFailedRun(
          ytCommentsMeta(null),
          null,
          "all yt-search sources failed — no comment targets"
        )
      );
    } else {
      const targets = selectYtCommentTargets(searchItems);
      const commentOutcomes = await Promise.allSettled(targets.map((v) => runYtComments(v)));
      for (const c of commentOutcomes) {
        if (c.status === "fulfilled") outcomes.push(c.value);
        else {
          const failed = emptyOutcome(ytCommentsMeta(null), null);
          failed.error = c.reason instanceof Error ? c.reason.message : String(c.reason);
          outcomes.push(failed);
        }
      }
    }
  }

  return outcomes;
}

// Recovery (D8): re-ingest a finished DeepAPI request by id into its battery slot.
export async function ingestRequest(requestId: string, sourceKey: string): Promise<RunOutcome> {
  const spec = BATTERY.find((s) => s.key === sourceKey);
  if (!spec) throw new Error(`--source ${sourceKey} is not a battery slot key`);
  const env = await getRequest(requestId);
  return ingestOutput(requestId, env.output, spec, deepApiMeta(spec));
}

// --- Retention + summary -----------------------------------------------------

// Retention sweep: null out bodies older than `days`. Rides the partial index
// topic_signals_retention_idx (WHERE body IS NOT NULL). Returns the row count.
export async function redactExpiredBodies(days = RETENTION_DAYS): Promise<number> {
  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("topic_signals")
    .update({ body: null, body_cleared_at: new Date().toISOString() })
    .lt("ingested_at", cutoff)
    .not("body", "is", null)
    .select("id");
  if (error) throw new Error(`retention sweep failed: ${error.message}`);
  return data?.length ?? 0;
}

function summarize(runs: RunOutcome[], bodiesRedacted: number): MiningSyncResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  for (const r of runs) {
    if (r.status === "failed") errors.push(`${r.label}: ${r.error ?? "unknown error"}`);
    else if (r.pass === "broad" && r.fieldCoveragePct < COVERAGE_ALERT_PCT) {
      warnings.push(
        `${r.label}: field coverage ${r.fieldCoveragePct}% below ${COVERAGE_ALERT_PCT}%`
      );
    }
  }
  return {
    runs,
    itemsIngested: runs.reduce((n, r) => n + r.signalsWritten, 0),
    bodiesRedacted,
    warnings,
    errors,
  };
}

// One call for the cron and the CLI full mode: battery + retention sweep.
export async function runBatteryWithRetention(
  options: BatteryOptions = {}
): Promise<MiningSyncResult> {
  const runs = await runBattery(options);
  const bodiesRedacted = await redactExpiredBodies();
  return summarize(runs, bodiesRedacted);
}
