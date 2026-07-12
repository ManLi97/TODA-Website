// One-time GSC backfill — pulls ~16 months of history in monthly chunks with
// dataState='final' into public.gsc_performance_daily. Run OFF Vercel (no 300s
// function cap): `pnpm gsc:backfill`. Idempotent (UPSERT) — safe to re-run.
//
// Env (loaded from .env.local): GSC_SITE_URL, GSC_SA_KEY or GSC_SA_KEY_FILE,
// NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
import { syncGscWindow } from "@/lib/gsc/sync";

// Node loads .env.local itself (no dotenv dep). Shell-provided env still wins.
try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local — assume env is already exported
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

async function main() {
  const siteUrl = process.env.GSC_SITE_URL;
  if (!siteUrl) throw new Error("GSC_SITE_URL is required (set it in .env.local)");

  // GSC retains ~16 months; final data lags ~3 days.
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 3);
  const earliest = new Date();
  earliest.setUTCMonth(earliest.getUTCMonth() - 16);

  // One chunk per calendar month from `earliest` to `end`.
  const chunks: { start: string; end: string }[] = [];
  let cursor = new Date(Date.UTC(earliest.getUTCFullYear(), earliest.getUTCMonth(), 1));
  while (cursor <= end) {
    const monthStart = cursor < earliest ? earliest : cursor;
    const monthEnd = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0));
    chunks.push({ start: iso(monthStart), end: iso(monthEnd > end ? end : monthEnd) });
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
  }

  console.log(`[gsc-backfill] ${siteUrl}: ${chunks.length} monthly chunks (final data)`);
  let total = 0;
  for (const c of chunks) {
    const r = await syncGscWindow(siteUrl, c.start, c.end, "final");
    total += r.rowsUpserted;
    const errs = r.errors.length ? `, ${r.errors.length} errors: ${JSON.stringify(r.errors)}` : "";
    console.log(
      `[gsc-backfill] ${c.start}..${c.end}: ${r.rowsUpserted} rows, ${r.calls} calls${errs}`
    );
  }
  console.log(`[gsc-backfill] done — ${total} rows upserted total`);
}

main().catch((err) => {
  console.error("[gsc-backfill] FAILED:", err);
  process.exit(1);
});
