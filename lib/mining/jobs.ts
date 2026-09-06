// pulse_jobs lock + observability (D9, server-only). One row per (iso_week, step);
// pulse_claim_job() claims atomically and returns nothing while a `running` entry
// younger than JOB_STALE_MINUTES exists — the same rule for the cron chain and the
// CLI, so a double-fired Vercel cron can never double-spend on Anthropic.
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import { JOB_STALE_MINUTES } from "./config";
import type { PulseJob, PulseStep } from "./types";

export class JobLockedError extends Error {
  constructor(week: string, step: PulseStep) {
    super(
      `pulse job ${step} for ${week} is already running (younger than ${JOB_STALE_MINUTES} min)`
    );
    this.name = "JobLockedError";
  }
}

// Claim (or re-claim) a step. Throws JobLockedError when the lock is held.
export async function claimJob(week: string, step: PulseStep): Promise<PulseJob> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("pulse_claim_job", {
    p_iso_week: week,
    p_step: step,
    p_stale_minutes: JOB_STALE_MINUTES,
  });
  if (error) throw new Error(`pulse_claim_job failed: ${error.message}`);
  const rows = (Array.isArray(data) ? data : data ? [data] : []) as PulseJob[];
  if (rows.length === 0) throw new JobLockedError(week, step);
  return rows[0];
}

export async function finishJob(
  id: string,
  status: "succeeded" | "failed",
  result: Record<string, unknown> | null,
  error: string | null = null
): Promise<void> {
  const supabase = createAdminClient();
  const { error: e } = await supabase
    .from("pulse_jobs")
    .update({ status, result, error, finished_at: new Date().toISOString() })
    .eq("id", id);
  if (e) throw new Error(`pulse_jobs finish failed: ${e.message}`);
}

// Run `fn` under the step lock; the job row records the result or the error.
export async function withJob<T extends Record<string, unknown>>(
  week: string,
  step: PulseStep,
  fn: () => Promise<T>
): Promise<{ job: PulseJob; result: T }> {
  const job = await claimJob(week, step);
  try {
    const result = await fn();
    await finishJob(job.id, "succeeded", result);
    return { job, result };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await finishJob(job.id, "failed", null, message).catch(() => {});
    throw err;
  }
}
