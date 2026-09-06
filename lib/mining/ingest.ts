// Ingest core (server-only): one provider result → one mining_runs row + its
// topic_signals. Snapshot/append-only; idempotent on dataset_id (provider ref) and
// (run_id, external_id). v3 adds the "only new" dedupe (D2): rows whose
// (platform, external_id) already exist in ANY other run are dropped before the
// upsert, so a slot without an API time filter still yields a real weekly delta.
// A run with raw items but 0 new rows is `succeeded` (post_count 0) — not failed.
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

import { DEDUPE_CHUNK, UPSERT_CHUNK, idempotencyKey, isoWeek } from "./config";
import type { SourceSpec } from "./config";
import { DeepApiError, runScrape } from "./deepapi";
import { applyFreshness, mapSpecItems } from "./mappers";
import type { IngestMeta, Platform, RunOutcome, TopicSignalRow } from "./types";

// --- Stats -------------------------------------------------------------------

// Coverage: broad = % mapped rows carrying scorable engagement; context = % mapped
// rows carrying title AND post_url (audit-linkable).
export function computeCoveragePct(rows: TopicSignalRow[], pass: IngestMeta["pass"]): number {
  if (rows.length === 0) return 0;
  const good =
    pass === "broad"
      ? rows.filter((r) => r.engagement !== null)
      : rows.filter((r) => r.title && r.post_url);
  return Math.round((good.length / rows.length) * 10000) / 100;
}

// Scraped text is untrusted input, and PostgREST parses the whole row payload as
// JSON: a lone UTF-16 surrogate (a truncated emoji half) fails the entire chunk
// with "invalid input syntax for type json", and Postgres additionally rejects
// NUL (U+0000) in text/jsonb. toWellFormed() replaces lone surrogates with U+FFFD.
// First hit: a YouTube comment, 2026-08-29.
const cleanString = (s: string) => s.toWellFormed().replaceAll(String.fromCharCode(0), "");
function stripNullBytes(row: TopicSignalRow): TopicSignalRow {
  return {
    ...row,
    title: cleanString(row.title),
    source: cleanString(row.source),
    body: row.body === null ? null : cleanString(row.body),
    matched_term: row.matched_term === null ? null : cleanString(row.matched_term),
    metrics:
      row.metrics === null
        ? null
        : (Object.fromEntries(
            Object.entries(row.metrics).map(([k, v]) => [
              cleanString(k),
              typeof v === "string" ? cleanString(v) : v,
            ])
          ) as TopicSignalRow["metrics"]),
  };
}

// A single upsert statement cannot carry two rows with the same conflict key, so
// dedupe on external_id first (last write wins).
function dedupeByExternalId(rows: TopicSignalRow[]): TopicSignalRow[] {
  const map = new Map<string, TopicSignalRow>();
  for (const r of rows) map.set(r.external_id, r);
  return [...map.values()];
}

// D2: drop rows already known under (platform, external_id) in any OTHER run. Query
// per candidate ids in chunks (never a table scan; PostgREST row cap + 8 s
// statement_timeout). Excluding this run keeps recovery re-ingests (--request)
// from deduping a run against itself.
async function dedupeAgainstDb(
  supabase: SupabaseClient,
  platform: Platform,
  rows: TopicSignalRow[],
  runId: string
): Promise<TopicSignalRow[]> {
  const known = new Set<string>();
  const ids = rows.map((r) => r.external_id);
  for (let i = 0; i < ids.length; i += DEDUPE_CHUNK) {
    const { data, error } = await supabase
      .from("topic_signals")
      .select("external_id")
      .eq("platform", platform)
      .neq("run_id", runId)
      .in("external_id", ids.slice(i, i + DEDUPE_CHUNK));
    if (error) throw new Error(`dedupe lookup failed: ${error.message}`);
    for (const d of data ?? []) known.add(d.external_id as string);
  }
  return rows.filter((r) => !known.has(r.external_id));
}

// --- Run bookkeeping ---------------------------------------------------------

export function emptyOutcome(meta: IngestMeta, datasetId: string | null): RunOutcome {
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
    dedupedCount: 0,
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
    iso_week: meta.isoWeek,
  };
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
      post_count: outcome.signalsWritten,
      field_coverage_pct: outcome.fieldCoveragePct,
    })
    .eq("id", runId);
  if (e) throw new Error(`mining_runs finalize failed: ${e.message}`);
}

// Ingest one provider result into a mining_runs row + its topic_signals. Idempotent:
// mining_runs upserts on dataset_id (provider ref), signals on (run_id, external_id) —
// re-ingesting the same ref heals the same rows. Any throw becomes a failed
// RunOutcome (per-run isolation). `premappedRows` bypasses the spec mapper
// (Data API comments, reviews, SerpApi).
export async function ingestOutput(
  datasetId: string,
  output: unknown,
  spec: SourceSpec | null,
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
        { ...runRowFields(meta), dataset_id: datasetId, status: "running", error: null },
        { onConflict: "dataset_id" }
      )
      .select("id")
      .single();
    if (runErr || !runRow)
      throw new Error(`mining_runs upsert failed: ${runErr?.message ?? "no row"}`);
    const runId = runRow.id as string;
    outcome.runId = runId;

    const mapped = dedupeByExternalId(
      premappedRows?.map((r) => ({ ...r, run_id: runId })) ??
        (spec ? mapSpecItems(spec, output, runId) : [])
    );
    outcome.itemCount =
      rawItemCount ??
      (Array.isArray(output)
        ? output.length
        : ((output as { results?: unknown[] } | null)?.results?.length ?? 0));
    outcome.mappedCount = mapped.length;

    if (outcome.itemCount > 0 && mapped.length === 0) {
      // Raw items that no whitelist field matched = contract drift, not "nothing new".
      const msg = "run returned no mappable items";
      await finalizeRun(supabase, runId, "failed", msg, outcome);
      outcome.error = msg;
      return outcome;
    }

    const platform = mapped[0]?.platform ?? spec?.platform;
    const fresh = spec ? applyFreshness(spec, mapped) : mapped;
    const rows =
      meta.dedupe && platform && fresh.length > 0
        ? await dedupeAgainstDb(supabase, platform, fresh, runId)
        : fresh;
    // dedupedCount = rows dropped as stale (freshness window) or already known (D2).
    outcome.dedupedCount = mapped.length - rows.length;
    outcome.fieldCoveragePct = computeCoveragePct(rows, meta.pass);
    outcome.signalsWritten = rows.length;

    // Postgres/PostgREST reject NUL bytes and lone surrogates in scraped text.
    const sanitized = rows.map(stripNullBytes);
    for (let i = 0; i < sanitized.length; i += UPSERT_CHUNK) {
      const { error } = await supabase
        .from("topic_signals")
        .upsert(sanitized.slice(i, i + UPSERT_CHUNK), { onConflict: "run_id,external_id" });
      if (error) throw new Error(`topic_signals upsert failed: ${error.message}`);
    }

    await finalizeRun(supabase, runId, "succeeded", null, outcome);
    outcome.status = "succeeded";
    return outcome;
  } catch (err) {
    outcome.error = err instanceof Error ? err.message : String(err);
    outcome.signalsWritten = 0;
    if (outcome.runId) {
      await finalizeRun(supabase, outcome.runId, "failed", outcome.error, outcome).catch(() => {});
    }
    return outcome;
  }
}

// Record a run that never produced ingestible data. Upsert on dataset_id (when the
// provider ref is known) so a later recovery ingest heals THIS row rather than
// forking a new one; datasetId null → plain insert (the UNIQUE allows many NULLs).
export async function recordFailedRun(
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

// --- DeepAPI specs -----------------------------------------------------------

export function deepApiMeta(spec: SourceSpec, week = isoWeek()): IngestMeta {
  return {
    provider: "deepapi",
    sourceKey: spec.key,
    pass: spec.pass,
    timeWindow: spec.timeWindow,
    actor: `deepapi:${spec.endpoint}`,
    input: spec.body,
    label: spec.key,
    isoWeek: week,
    dedupe: spec.dedupe,
  };
}

// One DeepAPI spec: request → poll → ingest. Never throws.
export async function runSource(
  spec: SourceSpec,
  week = isoWeek(),
  salt?: string
): Promise<{ outcome: RunOutcome; output: unknown }> {
  const meta = deepApiMeta(spec, week);
  try {
    const env = await runScrape(
      spec.endpoint,
      spec.body,
      idempotencyKey(spec.key, week, salt, spec.body)
    );
    if (!env.requestId) throw new Error("DeepAPI returned no requestId");
    const outcome = await ingestOutput(env.requestId, env.output, spec, meta);
    return { outcome, output: env.output };
  } catch (err) {
    const requestId = err instanceof DeepApiError ? err.requestId : null;
    const message = err instanceof Error ? err.message : String(err);
    return { outcome: await recordFailedRun(meta, requestId, message), output: null };
  }
}
