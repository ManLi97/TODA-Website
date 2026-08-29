// Community-Pulse cron (weekly, Monday 06:00 UTC). Runs the DeepAPI battery +
// yt-comments phase, then the 30-day body retention sweep. Registered via
// vercel.json crons (Production only) and authenticated with CRON_SECRET.
//
// Contract: GET /api/cron/mining-sync, header `Authorization: Bearer $CRON_SECRET`.
// Individual source failures are persisted as failed mining_runs rows and returned
// in `errors` with HTTP 200 (the row is the durable record; deterministic
// idempotency keys let a retry heal them without double spend). Only a route-level
// fault (missing DeepAPI env, unexpected throw) is 500. A missing YOUTUBE_API_KEY
// does NOT fail the route — yt-comments becomes a visible failed row.
import { NextResponse, type NextRequest } from "next/server";
import { hasDeepApiEnv } from "@/lib/mining/deepapi";
import { runBatteryWithRetention } from "@/lib/mining/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// The battery runs in parallel (Promise.allSettled), so wall-clock ≈ the slowest
// request (210s poll deadline) + ingest + sweep; 300s is the max on every plan incl.
// Hobby (fluid compute default). Stragglers heal idempotently on the next run.
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  if (
    !process.env.CRON_SECRET ||
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasDeepApiEnv()) {
    return NextResponse.json(
      { error: "DEEPAPI_API_BASE_URL / DEEPAPI_API_KEY not set" },
      { status: 500 }
    );
  }

  try {
    const result = await runBatteryWithRetention();
    return NextResponse.json({ ok: result.errors.length === 0, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
