// Reddit mining CLI (off-Vercel / manual). Mirrors scripts/gsc-backfill.ts.
//
//   pnpm mining:sync
//       Full cycle (broad/week + broad/month + seeded/week) + retention. Needs APIFY_TOKEN.
//   pnpm mining:sync --dataset <id> --pass broad|seeded --window week|month [--run <apifyRunId>]
//       Ingest one EXISTING dataset (tokenless) — today's "run via Apify MCP → ingest"
//       path, and the recovery path for a run that finished after the cron's poll deadline.
//   pnpm mining:sync --retention-only
//       Run only the 30-day body sweep.
//
// Env (loaded from .env.local): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// and (full mode only) APIFY_TOKEN.
import { APIFY_ACTOR_NAME } from "@/lib/mining/config";
import { ingestDataset, redactExpiredBodies, runMiningCycleWithRetention } from "@/lib/mining/sync";
import type { Pass, TimeWindow } from "@/lib/mining/types";

// Node loads .env.local itself (no dotenv dep). Shell-provided env still wins.
try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local — assume env is already exported
}

const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const flag = (name: string): boolean => process.argv.includes(`--${name}`);

async function main() {
  if (flag("retention-only")) {
    const bodiesRedacted = await redactExpiredBodies();
    console.log(JSON.stringify({ mode: "retention-only", bodiesRedacted }, null, 2));
    return;
  }

  const datasetId = arg("dataset");
  if (datasetId) {
    const pass = arg("pass") as Pass | undefined;
    const window = arg("window") as TimeWindow | undefined;
    if (pass !== "broad" && pass !== "seeded") throw new Error("--pass must be broad|seeded");
    if (window !== "week" && window !== "month") throw new Error("--window must be week|month");
    const outcome = await ingestDataset(datasetId, {
      pass,
      timeWindow: window,
      actor: APIFY_ACTOR_NAME,
      apifyRunId: arg("run") ?? null,
      input: null,
    });
    console.log(JSON.stringify({ mode: "ingest", outcome }, null, 2));
    if (outcome.status === "failed") process.exit(1);
    return;
  }

  const result = await runMiningCycleWithRetention();
  console.log(JSON.stringify({ mode: "full-cycle", ...result }, null, 2));
  if (result.runs.length > 0 && result.runs.every((r) => r.status === "failed")) process.exit(1);
}

main().catch((err) => {
  console.error("[mining-sync] FAILED:", err);
  process.exit(1);
});
