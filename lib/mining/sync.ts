// Reddit mining → Supabase ingest (server-only). Maps whitelisted post fields into
// topic_signals, records each scrape in mining_runs (snapshot / append-only), and
// runs the body retention sweep. Scoring is NOT here — it is the deterministic SQL
// view topic_cluster_scores. See docs/blog/topic-radar.md.
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getDatasetItems, hasApifyToken, startActorRun, waitForRun } from "./client";
import {
  APIFY_ACTOR_NAME,
  COVERAGE_ALERT_PCT,
  RETENTION_DAYS,
  RUN_TIMEOUT_MS,
  SEED_TERMS,
  SEEDED_COMMUNITY,
  UPSERT_CHUNK,
  broadInput,
  seededInput,
} from "./config";
import type {
  IngestMeta,
  MiningSyncResult,
  Pass,
  RawRedditItem,
  RunOutcome,
  RunStats,
  TimeWindow,
  TopicSignalRow,
} from "./types";

// --- Mapping ---------------------------------------------------------------

// Seed matcher: normalise so "no-show" also matches "no show" / "noshow".
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
const NORMALIZED_SEEDS = SEED_TERMS.map((t) => ({ term: t, norm: normalize(t) }));

function matchSeedTerm(title: string, body: string | null): string | null {
  const hay = normalize(`${title} ${body ?? ""}`);
  for (const { term, norm } of NORMALIZED_SEEDS) {
    if (norm && hay.includes(norm)) return term;
  }
  return null;
}

// Whitelist constructor: builds a row from NAMED fields only, so author fields /
// bodyHtml / engagementTotal are structurally unreachable. Returns null for
// non-posts or posts missing the identity/grouping fields.
export function mapPostItem(
  item: RawRedditItem,
  runId: string,
  isSeeded: boolean
): TopicSignalRow | null {
  if (item.dataType !== "post") return null;
  const externalId = item.parsedId;
  const source = item.parsedCommunityName;
  const title = item.title;
  if (!externalId || !source || !title) return null;

  const body = item.body && item.body.trim() !== "" ? item.body : null;
  const num = (v: unknown): number | null => (typeof v === "number" ? v : null);

  return {
    run_id: runId,
    external_id: externalId,
    source,
    title,
    body,
    flair: item.flair ?? null,
    post_type: item.postType ?? null,
    post_url: item.postUrl ?? null,
    posted_at: item.createdAt ?? null,
    up_votes: num(item.upVotes),
    comments_count: num(item.commentsCount),
    is_seeded: isSeeded,
    matched_term: isSeeded ? matchSeedTerm(title, body) : null,
  };
}

export function computeRunStats(items: RawRedditItem[]): RunStats {
  const posts = items.filter((i) => i.dataType === "post");
  const withMetrics = posts.filter(
    (i) => typeof i.upVotes === "number" && typeof i.commentsCount === "number"
  );
  const postCount = posts.length;
  return {
    itemCount: items.length,
    postCount,
    fieldCoveragePct:
      postCount === 0 ? 0 : Math.round((withMetrics.length / postCount) * 10000) / 100,
  };
}

// A single upsert statement cannot carry two rows with the same conflict key, so
// dedupe on external_id first (last write wins).
function dedupeByExternalId(rows: TopicSignalRow[]): TopicSignalRow[] {
  const map = new Map<string, TopicSignalRow>();
  for (const r of rows) map.set(r.external_id, r);
  return [...map.values()];
}

// --- Ingest ----------------------------------------------------------------

async function finalizeRun(
  supabase: SupabaseClient,
  runId: string,
  status: "succeeded" | "failed",
  error: string | null
): Promise<void> {
  const { error: e } = await supabase.from("mining_runs").update({ status, error }).eq("id", runId);
  if (e) throw new Error(`mining_runs finalize failed: ${e.message}`);
}

// Ingest one dataset into a mining_runs row + its topic_signals. Idempotent:
// mining_runs upserts on dataset_id, signals on (run_id, external_id) — re-ingesting
// the same dataset heals the same rows. Any throw becomes a failed RunOutcome
// (per-run isolation), mirroring the gsc sync engine.
export async function ingestDataset(datasetId: string, meta: IngestMeta): Promise<RunOutcome> {
  const supabase = createAdminClient();
  const outcome: RunOutcome = {
    runId: null,
    datasetId,
    label: meta.label,
    pass: meta.pass,
    timeWindow: meta.timeWindow,
    status: "failed",
    itemCount: 0,
    postCount: 0,
    signalsWritten: 0,
    fieldCoveragePct: 0,
    error: null,
  };

  try {
    const items = await getDatasetItems(datasetId);
    const stats = computeRunStats(items);
    outcome.itemCount = stats.itemCount;
    outcome.postCount = stats.postCount;
    outcome.fieldCoveragePct = stats.fieldCoveragePct;

    const { data: runRow, error: runErr } = await supabase
      .from("mining_runs")
      .upsert(
        {
          pass: meta.pass,
          time_window: meta.timeWindow,
          actor: meta.actor,
          apify_run_id: meta.apifyRunId,
          dataset_id: datasetId,
          input: meta.input,
          item_count: stats.itemCount,
          post_count: stats.postCount,
          field_coverage_pct: stats.fieldCoveragePct,
          status: "running",
        },
        { onConflict: "dataset_id" }
      )
      .select("id")
      .single();
    if (runErr || !runRow)
      throw new Error(`mining_runs upsert failed: ${runErr?.message ?? "no row"}`);
    outcome.runId = runRow.id as string;

    if (stats.postCount === 0) {
      await finalizeRun(supabase, outcome.runId, "failed", "dataset contained no posts");
      outcome.error = "dataset contained no posts";
      return outcome;
    }

    const rows = dedupeByExternalId(
      items
        .map((i) => mapPostItem(i, outcome.runId as string, meta.pass === "seeded"))
        .filter((r): r is TopicSignalRow => r !== null)
    );
    for (let i = 0; i < rows.length; i += UPSERT_CHUNK) {
      const { error } = await supabase
        .from("topic_signals")
        .upsert(rows.slice(i, i + UPSERT_CHUNK), { onConflict: "run_id,external_id" });
      if (error) throw new Error(`topic_signals upsert failed: ${error.message}`);
    }

    await finalizeRun(supabase, outcome.runId, "succeeded", null);
    outcome.status = "succeeded";
    outcome.signalsWritten = rows.length;
    return outcome;
  } catch (err) {
    outcome.error = err instanceof Error ? err.message : String(err);
    if (outcome.runId) {
      await finalizeRun(supabase, outcome.runId, "failed", outcome.error).catch(() => {});
    }
    return outcome;
  }
}

// Record a run that never produced ingestible data. Upsert on dataset_id so, if the
// Apify run finishes late, a later `--dataset` ingest heals THIS row rather than
// forking a new one. datasetId null → plain insert (the UNIQUE allows many NULLs).
async function recordFailedRun(
  meta: IngestMeta,
  apifyRunId: string | null,
  datasetId: string | null,
  error: string
): Promise<RunOutcome> {
  const supabase = createAdminClient();
  const { data, error: e } = await supabase
    .from("mining_runs")
    .upsert(
      {
        pass: meta.pass,
        time_window: meta.timeWindow,
        actor: meta.actor,
        apify_run_id: apifyRunId,
        dataset_id: datasetId,
        input: meta.input,
        status: "failed",
        error,
      },
      { onConflict: "dataset_id" }
    )
    .select("id")
    .single();
  return {
    runId: e ? null : (data?.id as string),
    datasetId,
    label: meta.label,
    pass: meta.pass,
    timeWindow: meta.timeWindow,
    status: "failed",
    itemCount: 0,
    postCount: 0,
    signalsWritten: 0,
    fieldCoveragePct: 0,
    error: e ? `${error}; mining_runs write also failed: ${e.message}` : error,
  };
}

// --- Cycle -----------------------------------------------------------------

type RunSpec = { pass: Pass; timeWindow: TimeWindow; input: unknown; label: string };

// Both subs share each broad run (per-URL cap, so no source starves — see config),
// plus one seeded recall run. 3 runs, all started + polled in parallel.
const CYCLE_SPECS: RunSpec[] = [
  { pass: "broad", timeWindow: "week", input: broadInput("week"), label: "broad/week" },
  { pass: "broad", timeWindow: "month", input: broadInput("month"), label: "broad/month" },
  {
    pass: "seeded",
    timeWindow: "week",
    input: seededInput(),
    label: `seeded/${SEEDED_COMMUNITY}/week`,
  },
];

// Full cycle: start + poll all specs in PARALLEL, ingest each SUCCEEDED dataset. A
// failed/timed-out run is still recorded (failed mining_runs row WITH dataset_id).
// Requires APIFY_TOKEN.
export async function runMiningCycle(): Promise<RunOutcome[]> {
  if (!hasApifyToken()) throw new Error("APIFY_TOKEN not set — required for the full mining cycle");

  const settled = await Promise.allSettled(
    CYCLE_SPECS.map(async (spec): Promise<RunOutcome> => {
      const meta: IngestMeta = {
        pass: spec.pass,
        timeWindow: spec.timeWindow,
        actor: APIFY_ACTOR_NAME,
        apifyRunId: null,
        input: spec.input,
        label: spec.label,
      };
      let datasetId: string | null = null;
      let apifyRunId: string | null = null;
      try {
        const started = await startActorRun(spec.input);
        apifyRunId = started.id;
        datasetId = started.defaultDatasetId;
        const finished = await waitForRun(started.id, RUN_TIMEOUT_MS);
        if (finished.status !== "SUCCEEDED") {
          return recordFailedRun(meta, apifyRunId, datasetId, `actor run ended ${finished.status}`);
        }
        return ingestDataset(finished.defaultDatasetId, { ...meta, apifyRunId });
      } catch (err) {
        return recordFailedRun(
          meta,
          apifyRunId,
          datasetId,
          err instanceof Error ? err.message : String(err)
        );
      }
    })
  );

  return settled.map((s, i) =>
    s.status === "fulfilled"
      ? s.value
      : {
          runId: null,
          datasetId: null,
          label: CYCLE_SPECS[i].label,
          pass: CYCLE_SPECS[i].pass,
          timeWindow: CYCLE_SPECS[i].timeWindow,
          status: "failed" as const,
          itemCount: 0,
          postCount: 0,
          signalsWritten: 0,
          fieldCoveragePct: 0,
          error: s.reason instanceof Error ? s.reason.message : String(s.reason),
        }
  );
}

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

// One call for the cron and the CLI full mode: scrape cycle + retention sweep.
export async function runMiningCycleWithRetention(): Promise<MiningSyncResult> {
  const runs = await runMiningCycle();
  const bodiesRedacted = await redactExpiredBodies();
  return summarize(runs, bodiesRedacted);
}
