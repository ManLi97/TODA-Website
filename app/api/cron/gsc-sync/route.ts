// Daily Google Search Console snapshot cron.
//
// Re-pulls a trailing window with dataState='all' and UPSERTs, so days GSC later
// restates self-correct while finalized days stay put. Registered via vercel.json
// crons (Production only) and authenticated with CRON_SECRET.
//
// Contract: GET /api/cron/gsc-sync, header `Authorization: Bearer $CRON_SECRET`.
import { NextResponse, type NextRequest } from "next/server";
import { syncGscWindow } from "@/lib/gsc/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// GSC pulls can take minutes across the full matrix — needs a Pro-tier duration.
export const maxDuration = 300;

// Trailing days to re-pull each run: covers GSC's ~2-3 day lag + restatement.
const WINDOW_DAYS = 7;

const iso = (d: Date) => d.toISOString().slice(0, 10);

export async function GET(request: NextRequest) {
  if (
    !process.env.CRON_SECRET ||
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const siteUrl = process.env.GSC_SITE_URL;
  if (!siteUrl) {
    return NextResponse.json({ error: "GSC_SITE_URL not set" }, { status: 500 });
  }

  // Yesterday back WINDOW_DAYS-1 (today has no data yet).
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (WINDOW_DAYS - 1));

  try {
    const result = await syncGscWindow(siteUrl, iso(start), iso(end), "all");
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
