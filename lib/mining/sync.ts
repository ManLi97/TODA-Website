// Community-Pulse battery orchestrator (server-only). Phase 1 = DeepAPI specs ∥
// competitor reviews (Apple RSS, Google Play, Trustpilot) ∥ SerpApi (trends, PAA);
// Phase 2 = comment targets from this week's rows in the DB (comments.ts); then the
// 30-day body retention sweep. Every failure becomes a failed mining_runs row /
// RunOutcome — visible gaps, never silent ones. Scoring is NOT here — it is the
// deterministic SQL view topic_cluster_scores; enrichment and digest live in
// enrich.ts / digest.ts. See docs/blog/topic-radar.md ("Methode v3").
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import {
  APPLE_STOREFRONTS,
  BATTERY,
  COVERAGE_ALERT_PCT,
  PLAY_COUNTRIES,
  RETENTION_DAYS,
  REVIEW_TARGETS,
  SERP_PAA_QUERIES,
  SERP_TREND_SEEDS,
  idempotencyKey,
  isoWeek,
  slug,
} from "./config";
import type { SourceSpec } from "./config";
import { COMMENT_PLATFORMS, COMMENT_SLOT, runComments } from "./comments";
import type { CommentPlatform } from "./comments";
import { DeepApiError, dryRunCost, getRequest } from "./deepapi";
import { deepApiMeta, emptyOutcome, ingestOutput, recordFailedRun, runSource } from "./ingest";
import {
  mapAppleReview,
  mapPlayReview,
  mapSerpQuestion,
  mapSerpTrend,
  mapTrustpilotReview,
} from "./mappers";
import { fetchAppleReviews, fetchPlayReviews, fetchTrustpilotReviews } from "./reviews";
import { googlePaa, googleTrendsRelated, hasSerpApiKey } from "./serpapi";
import type { IngestMeta, MiningSyncResult, RunOutcome, TopicSignalRow } from "./types";

// --- Phase-1 jobs: reviews + SerpApi ------------------------------------------

export type BatteryJob = { key: string; run: () => Promise<RunOutcome> };

const meta = (
  partial: Pick<IngestMeta, "provider" | "sourceKey" | "actor" | "input"> & { timeWindow?: string },
  week: string
): IngestMeta => ({
  ...partial,
  pass: "context",
  timeWindow: partial.timeWindow ?? "n/a",
  label: partial.sourceKey,
  isoWeek: week,
  dedupe: true,
});

const salted = (id: string, salt?: string) => (salt ? `${id}:${salt}` : id);

// Never throws: every job resolves to a RunOutcome (failed rows stay visible).
const guarded =
  (m: IngestMeta, datasetId: string, fn: () => Promise<RunOutcome>) =>
  async (): Promise<RunOutcome> => {
    try {
      return await fn();
    } catch (err) {
      return recordFailedRun(m, datasetId, err instanceof Error ? err.message : String(err));
    }
  };

function reviewJobs(week: string, salt?: string): BatteryJob[] {
  const jobs: BatteryJob[] = [];
  for (const t of REVIEW_TARGETS) {
    for (const appId of t.apple) {
      for (const sf of APPLE_STOREFRONTS) {
        const key = `reviews/apple/${appId}/${sf}`;
        const m = meta(
          {
            provider: "apple_rss",
            sourceKey: key,
            actor: "apple_rss:customerreviews",
            input: { appId, storefront: sf },
          },
          week
        );
        const datasetId = salted(`apple:${week}:${appId}:${sf}`, salt);
        jobs.push({
          key,
          run: guarded(m, datasetId, async () => {
            const entries = await fetchAppleReviews(appId, sf);
            const rows = entries
              .map((e) => mapAppleReview(e, "pending", t.competitor, appId, sf))
              .filter((r): r is TopicSignalRow => r !== null);
            return ingestOutput(datasetId, entries, null, m, rows, entries.length);
          }),
        });
      }
    }
    for (const pkg of t.play) {
      for (const country of PLAY_COUNTRIES) {
        const key = `reviews/play/${pkg}`;
        const m = meta(
          {
            provider: "google_play",
            sourceKey: key,
            actor: "google-play-scraper:reviews",
            input: { appId: pkg, country, lang: "de" },
          },
          week
        );
        const datasetId = salted(`gplay:${week}:${pkg}:${country}`, salt);
        jobs.push({
          key,
          run: guarded(m, datasetId, async () => {
            const items = await fetchPlayReviews(pkg, country);
            const rows = items
              .map((i) => mapPlayReview(i, "pending", t.competitor, pkg, country))
              .filter((r): r is TopicSignalRow => r !== null);
            return ingestOutput(datasetId, items, null, m, rows, items.length);
          }),
        });
      }
    }
    for (const url of t.trustpilot) {
      const key = `reviews/trustpilot/${t.competitor}`;
      const m = meta(
        {
          provider: "deepapi",
          sourceKey: key,
          actor: "deepapi:/v1/scrape/extract",
          input: { url },
        },
        week
      );
      jobs.push({
        key,
        run: async () => {
          try {
            const { reviews, requestId } = await fetchTrustpilotReviews(
              url,
              idempotencyKey(key, week, salt)
            );
            const rows = reviews
              .map((r) => mapTrustpilotReview(r, "pending", t.competitor, url))
              .filter((r): r is TopicSignalRow => r !== null);
            return await ingestOutput(
              requestId ?? salted(`trustpilot:${week}:${t.competitor}`, salt),
              reviews,
              null,
              m,
              rows,
              reviews.length
            );
          } catch (err) {
            const requestId = err instanceof DeepApiError ? err.requestId : null;
            return recordFailedRun(m, requestId, err instanceof Error ? err.message : String(err));
          }
        },
      });
    }
  }
  return jobs;
}

function serpJobs(week: string, salt?: string): BatteryJob[] {
  const jobs: BatteryJob[] = [];
  for (const seed of SERP_TREND_SEEDS) {
    const key = `serp/trends/${slug(seed)}`;
    const m = meta(
      {
        provider: "serpapi",
        sourceKey: key,
        actor: "serpapi:google_trends",
        input: { q: seed, geo: "DE", date: "now 7-d", data_type: "RELATED_QUERIES" },
        timeWindow: "week",
      },
      week
    );
    const datasetId = salted(`serpapi:${week}:google_trends:${slug(seed)}`, salt);
    jobs.push({
      key,
      run: guarded(m, datasetId, async () => {
        if (!hasSerpApiKey()) throw new Error("SERPAPI_API_KEY not set");
        const { rising, top } = await googleTrendsRelated(seed);
        const rows = [
          ...rising.map((i) => mapSerpTrend(i, "pending", seed, week, "rising")),
          ...top.map((i) => mapSerpTrend(i, "pending", seed, week, "top")),
        ].filter((r): r is TopicSignalRow => r !== null);
        return ingestOutput(datasetId, { rising, top }, null, m, rows, rising.length + top.length);
      }),
    });
  }
  for (const q of SERP_PAA_QUERIES) {
    const key = `serp/paa/${slug(q)}`;
    const m = meta(
      {
        provider: "serpapi",
        sourceKey: key,
        actor: "serpapi:google",
        input: { q, hl: "de", gl: "de", google_domain: "google.de" },
      },
      week
    );
    const datasetId = salted(`serpapi:${week}:google:${slug(q)}`, salt);
    jobs.push({
      key,
      run: guarded(m, datasetId, async () => {
        if (!hasSerpApiKey()) throw new Error("SERPAPI_API_KEY not set");
        const questions = await googlePaa(q);
        const rows = questions
          .map((i, pos) => mapSerpQuestion(i, "pending", q, pos + 1))
          .filter((r): r is TopicSignalRow => r !== null);
        return ingestOutput(datasetId, questions, null, m, rows, questions.length);
      }),
    });
  }
  return jobs;
}

// Every Phase-1 job, keyed like mining_runs.source_key (prefix-filterable).
export function phaseOneJobs(week: string, salt?: string): BatteryJob[] {
  return [
    ...BATTERY.map(
      (spec): BatteryJob => ({
        key: spec.key,
        run: () => runSource(spec, week, salt).then((r) => r.outcome),
      })
    ),
    ...reviewJobs(week, salt),
    ...serpJobs(week, salt),
  ];
}

// --- Battery -----------------------------------------------------------------

export type BatteryOptions = {
  // Restrict to jobs whose key equals or starts with this prefix (e.g. "yt-search",
  // "reviews/apple", "serp"). A comment slot ("yt-comments", "tiktok-comments",
  // "ig-comments", "reddit-comments") runs Phase 2 for that platform only, from
  // this week's rows in the DB.
  source?: string;
  // Salt for the idempotency keys / provider refs (--fresh): force new runs this week.
  salt?: string;
  week?: string;
  // Skip Phase 2 (the cron chain runs it as its own step).
  skipComments?: boolean;
};

const matchesFilter = (key: string, filter: string) =>
  key === filter || key.startsWith(`${filter}/`);

export function knownSlots(): string[] {
  const keys = phaseOneJobs("2000-W01").map((j) => j.key.split("/")[0]);
  return [...new Set([...keys, ...Object.values(COMMENT_SLOT)])];
}

// Full battery: Phase 1 = all jobs in parallel (one mining_runs row per request),
// Phase 2 = comment targets of the week from the DB.
export async function runBattery(options: BatteryOptions = {}): Promise<RunOutcome[]> {
  const { source, salt } = options;
  const week = options.week ?? isoWeek();
  const commentPlatform = source
    ? (COMMENT_PLATFORMS.find((p) => COMMENT_SLOT[p] === source) ?? null)
    : null;
  const jobs = commentPlatform
    ? []
    : source
      ? phaseOneJobs(week, salt).filter((j) => matchesFilter(j.key, source))
      : phaseOneJobs(week, salt);
  if (!commentPlatform && jobs.length === 0) {
    throw new Error(
      `--source ${source} matches no battery slot; known: ${knownSlots().join(", ")}`
    );
  }

  const settled = await Promise.allSettled(jobs.map((j) => j.run()));
  const outcomes: RunOutcome[] = settled.map((s, i) => {
    if (s.status === "fulfilled") return s.value;
    const failed = emptyOutcome(
      meta({ provider: "deepapi", sourceKey: jobs[i].key, actor: "battery", input: null }, week),
      null
    );
    failed.error = s.reason instanceof Error ? s.reason.message : String(s.reason);
    return failed;
  });

  const wantsComments = !options.skipComments && (!source || commentPlatform !== null);
  if (wantsComments) {
    const platforms: CommentPlatform[] | undefined = commentPlatform
      ? [commentPlatform]
      : undefined;
    outcomes.push(...(await runComments({ week, salt, platforms })));
  }
  return outcomes;
}

// Recovery (D8): re-ingest a finished DeepAPI request by id into its battery slot.
export async function ingestRequest(
  requestId: string,
  sourceKey: string,
  week = isoWeek()
): Promise<RunOutcome> {
  const spec = BATTERY.find((s) => s.key === sourceKey);
  if (!spec) throw new Error(`--source ${sourceKey} is not a Phase-1 DeepAPI slot key`);
  const env = await getRequest(requestId);
  return ingestOutput(requestId, env.output, spec, deepApiMeta(spec, week));
}

// --dry-cost: dryRun every Phase-1 DeepAPI spec (free) and sum the holds; Phase 2 is
// estimated from config (targets × maxItems × unit) because its targets don't exist yet.
export async function dryCost(source?: string): Promise<{
  specs: { key: string; holdUsd: number }[];
  phaseOneUsd: number;
  phaseTwoEstimateUsd: number;
}> {
  const specs: SourceSpec[] = source
    ? BATTERY.filter((s) => matchesFilter(s.key, source))
    : BATTERY;
  const holds = await Promise.all(
    specs.map(async (s) => ({ key: s.key, holdUsd: await dryRunCost(s.endpoint, s.body) }))
  );
  const phaseOneUsd = holds.reduce((n, h) => n + h.holdUsd, 0);
  const phaseTwoEstimateUsd = 5 * 30 * 0.004 + 5 * 30 * 0.00625 + 3 * 40 * 0.00625; // tiktok + ig + reddit comments
  return { specs: holds, phaseOneUsd, phaseTwoEstimateUsd };
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

export function summarize(runs: RunOutcome[], bodiesRedacted: number): MiningSyncResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  for (const r of runs) {
    if (r.status === "failed") errors.push(`${r.label}: ${r.error ?? "unknown error"}`);
    else if (
      r.pass === "broad" &&
      r.signalsWritten > 0 &&
      r.fieldCoveragePct < COVERAGE_ALERT_PCT
    ) {
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
