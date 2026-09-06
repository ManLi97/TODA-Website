// Cron-chain plumbing (server-only, D9): CRON_SECRET auth shared by both routes and
// the self-trigger of the next step. Base URL: VERCEL_PROJECT_PRODUCTION_URL (Vercel
// system env, delivered without scheme) → PULSE_BASE_URL → the incoming request's
// origin (local `next dev`). The trigger is awaited with a 5 s timeout: the worker
// answers 202 immediately and does its work in after(), so 5 s is plenty.
import "server-only";

import type { NextRequest } from "next/server";

import type { PulseStep } from "./types";

export function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

export function chainBaseUrl(request: NextRequest): string {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.PULSE_BASE_URL) return process.env.PULSE_BASE_URL.replace(/\/$/, "");
  return new URL(request.url).origin;
}

// Fire the next step. Never throws — a failed trigger is logged; the step can be
// re-run by hand (CLI) or by the next cron.
export async function triggerStep(
  request: NextRequest,
  step: Exclude<PulseStep, "battery">
): Promise<void> {
  const url = `${chainBaseUrl(request)}/api/cron/pulse-worker?step=${step}`;
  try {
    const res = await fetch(url, {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET ?? ""}` },
      signal: AbortSignal.timeout(5000),
    });
    console.log(`[pulse-chain] trigger ${step} → ${res.status}`);
  } catch (err) {
    console.error(
      `[pulse-chain] trigger ${step} failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
