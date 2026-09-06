// Community-Pulse cron (weekly, Monday 06:00 UTC) — step 1 `battery` of the chain
// battery → comments → enrich → digest (D9). Runs Phase 1 (DeepAPI battery + reviews
// + SerpApi) and the 30-day body retention sweep, then triggers pulse-worker?step=comments.
// Registered via vercel.json crons (Production only), authenticated with CRON_SECRET.
//
// Contract: GET /api/cron/mining-sync, header `Authorization: Bearer $CRON_SECRET`.
// Answers 202 immediately (work in after()) with the pulse_jobs id; 409 while a
// `battery` job of this week is running (< 15 min); 401 without token; 500 when the
// DeepAPI env is missing. Per-slot failures are failed mining_runs rows (durable
// record; deterministic idempotency keys let a retry heal them without double spend)
// and land in pulse_jobs.result.errors.
import { after, NextResponse, type NextRequest } from "next/server";

import { authorized, triggerStep } from "@/lib/mining/chain";
import { isoWeek } from "@/lib/mining/config";
import { hasDeepApiEnv } from "@/lib/mining/deepapi";
import { JobLockedError, claimJob, finishJob } from "@/lib/mining/jobs";
import { runBatteryWithRetention } from "@/lib/mining/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Phase 1 runs in parallel (Promise.allSettled), so wall-clock ≈ the slowest request
// (210s poll deadline) + ingest + sweep; 300s is the max on every plan incl. Hobby.
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasDeepApiEnv()) {
    return NextResponse.json(
      { error: "DEEPAPI_API_BASE_URL / DEEPAPI_API_KEY not set" },
      { status: 500 }
    );
  }

  const week = isoWeek();
  let job;
  try {
    job = await claimJob(week, "battery");
  } catch (err) {
    if (err instanceof JobLockedError)
      return NextResponse.json({ error: err.message }, { status: 409 });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }

  after(async () => {
    try {
      const result = await runBatteryWithRetention({ week, skipComments: true });
      await finishJob(job.id, "succeeded", {
        runs: result.runs.length,
        itemsIngested: result.itemsIngested,
        bodiesRedacted: result.bodiesRedacted,
        warnings: result.warnings,
        errors: result.errors,
      });
    } catch (err) {
      await finishJob(
        job.id,
        "failed",
        null,
        err instanceof Error ? err.message : String(err)
      ).catch(() => {});
    }
    await triggerStep(request, "comments");
  });

  return NextResponse.json(
    { ok: true, step: "battery", week, job: job.id, attempts: job.attempts },
    { status: 202 }
  );
}
