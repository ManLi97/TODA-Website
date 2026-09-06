// Community-Pulse chain worker (D9): steps 2–4 of battery → comments → enrich → digest.
// Not a cron itself — triggered by the previous step (or by hand) so the weekly run
// never depends on Hobby-plan cron precision.
//
// Contract: GET /api/cron/pulse-worker?step=comments|enrich|digest, header
// `Authorization: Bearer $CRON_SECRET`. Answers 202 immediately (work in after()),
// 409 while the same step of this week is running (< 15 min), 400 on a bad step,
// 200 {skipped} when digest already exists or rows are still open.
//   comments  Phase 2 from this week's DB rows → triggers enrich
//   enrich    runEnrichment(240 s) → re-triggers itself while rows remain, else digest
//   digest    generateDigest(week) when 0 rows are open and no digest exists
import { after, NextResponse, type NextRequest } from "next/server";

import { authorized, triggerStep } from "@/lib/mining/chain";
import { runComments } from "@/lib/mining/comments";
import { isoWeek } from "@/lib/mining/config";
import { digestExists, generateDigest } from "@/lib/mining/digest";
import { pendingCount, runEnrichment } from "@/lib/mining/enrich";
import { JobLockedError, claimJob, finishJob } from "@/lib/mining/jobs";
import { summarize } from "@/lib/mining/sync";
import type { PulseStep } from "@/lib/mining/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const ENRICH_BUDGET_MS = 240_000;
const STEPS: Exclude<PulseStep, "battery">[] = ["comments", "enrich", "digest"];

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const step = request.nextUrl.searchParams.get("step") as Exclude<PulseStep, "battery"> | null;
  if (!step || !STEPS.includes(step)) {
    return NextResponse.json({ error: `step must be one of ${STEPS.join("|")}` }, { status: 400 });
  }
  const week = request.nextUrl.searchParams.get("week") ?? isoWeek();

  if (step === "digest") {
    try {
      const [open, exists] = await Promise.all([pendingCount(week), digestExists(week)]);
      if (open > 0) return NextResponse.json({ skipped: `${open} rows still open for ${week}` });
      if (exists) return NextResponse.json({ skipped: `digest for ${week} already exists` });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : String(err) },
        { status: 500 }
      );
    }
  }

  let job;
  try {
    job = await claimJob(week, step);
  } catch (err) {
    if (err instanceof JobLockedError)
      return NextResponse.json({ error: err.message }, { status: 409 });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }

  after(async () => {
    let next: Exclude<PulseStep, "battery"> | null = null;
    try {
      if (step === "comments") {
        const result = summarize(await runComments({ week }), 0);
        await finishJob(job.id, "succeeded", {
          runs: result.runs.length,
          itemsIngested: result.itemsIngested,
          errors: result.errors,
        });
        next = "enrich";
      } else if (step === "enrich") {
        const r = await runEnrichment({ week, budgetMs: ENRICH_BUDGET_MS });
        await finishJob(job.id, "succeeded", {
          classified: r.classified,
          failed: r.failed,
          remaining: r.remaining,
          calls: r.calls,
          costUsd: r.cost.costUsd,
          stoppedBy: r.stoppedBy,
        });
        // Rows that failed twice stay open; only re-trigger when there is progress to make.
        next = r.remaining > r.failed ? "enrich" : "digest";
      } else {
        const r = await generateDigest(week);
        await finishJob(job.id, "succeeded", {
          inputSignalCount: r.inputSignalCount,
          costUsd: r.cost.costUsd,
          headline: r.digest.headline,
        });
      }
    } catch (err) {
      await finishJob(
        job.id,
        "failed",
        null,
        err instanceof Error ? err.message : String(err)
      ).catch(() => {});
      return;
    }
    if (next) await triggerStep(request, next);
  });

  return NextResponse.json(
    { ok: true, step, week, job: job.id, attempts: job.attempts },
    { status: 202 }
  );
}
