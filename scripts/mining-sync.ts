// Community-Pulse CLI v3 (off-Vercel / manual). Mirrors the cron chain step by step.
//
//   pnpm mining:sync                      Full weekly run: Phase 1 (DeepAPI battery +
//                                         reviews + SerpApi) + Phase 2 (comments from the
//                                         week's DB rows) + retention. Lock: pulse_jobs battery.
//   pnpm mining:sync --source <key>       One slot (exact key or prefix: yt-search,
//                                         reviews/apple, serp, fb-groups …). A comment slot
//                                         (yt-comments | tiktok-comments | ig-comments |
//                                         reddit-comments) runs Phase 2 for that platform
//                                         from THIS week's rows in the DB (v3 semantics).
//   pnpm mining:sync --comments           Phase 2 for all platforms (lock: comments).
//   pnpm mining:sync --dry-cost [--source <key>]
//                                         dryRun every Phase-1 DeepAPI spec (free) → sum of holds.
//   pnpm mining:sync --enrich [--budget-ms N] [--max-rows N] [--week W | --all]
//                                         LLM classification of open rows (lock: enrich).
//   pnpm mining:sync --digest [--week W]  Weekly digest (lock: digest).
//   pnpm mining:sync --reclassify <prompt_version> [--week W]
//                                         Delete llm rows of that version, then --enrich.
//   pnpm mining:sync --quality [--week W] Quality report (rubric) as table + JSON.
//   pnpm mining:sync --balance            DeepAPI balance (free) for the spend ledger.
//   pnpm mining:sync --request <deepapiRequestId> --source <key>
//                                         Recovery: re-ingest a finished DeepAPI request.
//   pnpm mining:sync --fresh              Salt idempotency keys / provider refs (new runs).
//   pnpm mining:sync --retention-only     Only the 30-day body sweep.
//   --week <ISO week>                     Target week (default: current), e.g. 2026-W37.
//
// Env (loaded from .env.local): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// DEEPAPI_API_BASE_URL + DEEPAPI_API_KEY (or `source ~/.deepapi/env`), YOUTUBE_API_KEY,
// SERPAPI_API_KEY, ANTHROPIC_API_KEY (enrich/digest). Missing keys = visible failed rows.
import { runComments } from "@/lib/mining/comments";
import { isoWeek } from "@/lib/mining/config";
import { getBalance } from "@/lib/mining/deepapi";
import { generateDigest } from "@/lib/mining/digest";
import { deleteLlmClassifications, runEnrichment } from "@/lib/mining/enrich";
import { withJob } from "@/lib/mining/jobs";
import { qualityReport, renderQualityTable } from "@/lib/mining/quality";
import {
  dryCost,
  ingestRequest,
  redactExpiredBodies,
  runBatteryWithRetention,
  summarize,
} from "@/lib/mining/sync";

// Node loads .env.local itself (no dotenv dep). Shell-provided env still wins.
try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local — assume env is already exported
}

const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`);
  if (i < 0) return undefined;
  const value = process.argv[i + 1];
  // A flag without a value must fail loudly — falling through to a default silently
  // ran the FULL paid battery once.
  if (value === undefined || value.startsWith("--"))
    throw new Error(`--${name} needs a value (e.g. --${name} yt-channels)`);
  return value;
};
const flag = (name: string): boolean => process.argv.includes(`--${name}`);
const out = (v: unknown) => console.log(JSON.stringify(v, null, 2));

async function main() {
  const week = arg("week") ?? isoWeek();
  const salt = flag("fresh") ? `fresh-${Date.now()}` : undefined;

  if (flag("balance")) return out({ mode: "balance", availableUsd: await getBalance() });

  if (flag("retention-only"))
    return out({ mode: "retention-only", bodiesRedacted: await redactExpiredBodies() });

  if (flag("dry-cost")) {
    const r = await dryCost(arg("source"));
    return out({ mode: "dry-cost", ...r, totalUsd: r.phaseOneUsd + r.phaseTwoEstimateUsd });
  }

  if (flag("quality")) {
    const report = await qualityReport(week);
    console.log(renderQualityTable(report));
    return out(report);
  }

  const requestId = arg("request");
  if (requestId) {
    const sourceKey = arg("source");
    if (!sourceKey) throw new Error("--request needs --source <battery slot key>");
    const outcome = await ingestRequest(requestId, sourceKey, week);
    out({ mode: "recover", outcome });
    if (outcome.status === "failed") process.exit(1);
    return;
  }

  const reclassify = arg("reclassify");
  if (reclassify) {
    const deleted = await deleteLlmClassifications(reclassify, flag("all") ? undefined : week);
    console.log(
      `[reclassify] deleted ${deleted} llm rows of ${reclassify}${flag("all") ? "" : ` in ${week}`}`
    );
  }

  if (flag("enrich") || reclassify) {
    const { job, result } = await withJob(week, "enrich", () =>
      runEnrichment({
        week: flag("all") ? undefined : week,
        budgetMs: arg("budget-ms") ? Number(arg("budget-ms")) : undefined,
        maxRows: arg("max-rows") ? Number(arg("max-rows")) : undefined,
      })
    );
    return out({ mode: "enrich", job: job.id, attempts: job.attempts, ...result });
  }

  if (flag("digest")) {
    const { job, result } = await withJob(week, "digest", () => generateDigest(week));
    console.log(result.digest_md);
    return out({
      mode: "digest",
      job: job.id,
      week,
      inputSignalCount: result.inputSignalCount,
      cost: result.cost,
    });
  }

  if (flag("comments")) {
    const { job, result } = await withJob(week, "comments", async () =>
      summarize(await runComments({ week, salt }), 0)
    );
    out({ mode: "comments", job: job.id, ...result });
    if (result.runs.length > 0 && result.runs.every((r) => r.status === "failed")) process.exit(1);
    return;
  }

  const source = arg("source");
  if (source) {
    const result = await runBatteryWithRetention({ source, salt, week });
    out({ mode: source, ...result });
    if (result.runs.length > 0 && result.runs.every((r) => r.status === "failed")) process.exit(1);
    return;
  }

  const { job, result } = await withJob(week, "battery", () =>
    runBatteryWithRetention({ salt, week })
  );
  out({ mode: "full-battery", job: job.id, ...result });
  if (result.runs.length > 0 && result.runs.every((r) => r.status === "failed")) process.exit(1);
}

main().catch((err) => {
  console.error("[mining-sync] FAILED:", err);
  process.exit(1);
});
