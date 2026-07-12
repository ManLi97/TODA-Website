// Reddit mining cron (Mo/Mi/Fr). Starts + ingests the broad/seeded scrapes, then
// runs the 30-day body retention sweep. Registered via vercel.json crons (Production
// only) and authenticated with CRON_SECRET.
//
// Contract: GET /api/cron/mining-sync, header `Authorization: Bearer $CRON_SECRET`.
// Individual run failures are persisted as failed mining_runs rows and returned in
// `errors` with HTTP 200 (the row is the durable record). Only a route-level fault
// (missing token, unexpected throw) is 500.
import { NextResponse, type NextRequest } from "next/server";
import { hasApifyToken } from "@/lib/mining/client";
import { runMiningCycleWithRetention } from "@/lib/mining/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// 3 parallel actor runs (~17s each at 15 posts, 210s poll deadline) + ingest + sweep
// fit comfortably; 300s is the max on every plan incl. Hobby (fluid compute default).
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  if (
    !process.env.CRON_SECRET ||
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasApifyToken()) {
    return NextResponse.json({ error: "APIFY_TOKEN not set" }, { status: 500 });
  }

  try {
    const result = await runMiningCycleWithRetention();
    return NextResponse.json({ ok: result.errors.length === 0, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
