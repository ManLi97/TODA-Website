// Community-Pulse battery CLI (off-Vercel / manual). Mirrors scripts/gsc-backfill.ts.
//
//   pnpm mining:sync
//       Full weekly battery (DeepAPI Phase 1 + yt-comments Phase 2) + retention.
//   pnpm mining:sync --source <key>
//       One battery slot (exact key or prefix, e.g. yt-channels, reddit-broad,
//       yt-search, tiktok-comments). "yt-comments" runs Phase 2 only (fixed list).
//   pnpm mining:sync --request <deepapiRequestId> --source <key>
//       Recovery: re-ingest a finished DeepAPI request (GET /v1/requests/{id} is
//       free) into its battery slot — heals the failed mining_runs row (dataset_id).
//   pnpm mining:sync --fresh
//       Salt the idempotency keys: force new DeepAPI runs within the same ISO week.
//   pnpm mining:sync --retention-only
//       Run only the 30-day body sweep.
//
// Env (loaded from .env.local): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// DEEPAPI_API_BASE_URL, DEEPAPI_API_KEY (or `source ~/.deepapi/env` in the shell),
// YOUTUBE_API_KEY (yt-comments; missing → visible failed row).
import { ingestRequest, redactExpiredBodies, runBatteryWithRetention } from "@/lib/mining/sync";

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
  // A flag without a value (end of argv, or the next token is another flag) must fail
  // loudly — falling through to a default silently ran the FULL paid battery once.
  if (value === undefined || value.startsWith("--"))
    throw new Error(`--${name} needs a value (e.g. --${name} yt-channels)`);
  return value;
};
const flag = (name: string): boolean => process.argv.includes(`--${name}`);

async function main() {
  if (flag("retention-only")) {
    const bodiesRedacted = await redactExpiredBodies();
    console.log(JSON.stringify({ mode: "retention-only", bodiesRedacted }, null, 2));
    return;
  }

  const requestId = arg("request");
  if (requestId) {
    const sourceKey = arg("source");
    if (!sourceKey) throw new Error("--request needs --source <battery slot key>");
    const outcome = await ingestRequest(requestId, sourceKey);
    console.log(JSON.stringify({ mode: "recover", outcome }, null, 2));
    if (outcome.status === "failed") process.exit(1);
    return;
  }

  const result = await runBatteryWithRetention({
    source: arg("source"),
    salt: flag("fresh") ? `fresh-${Date.now()}` : undefined,
  });
  console.log(JSON.stringify({ mode: arg("source") ?? "full-battery", ...result }, null, 2));
  if (result.runs.length > 0 && result.runs.every((r) => r.status === "failed")) process.exit(1);
}

main().catch((err) => {
  console.error("[mining-sync] FAILED:", err);
  process.exit(1);
});
