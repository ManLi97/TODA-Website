// GSC → Supabase sync engine, shared by the daily cron and the one-time backfill.
//
// Snapshot-and-keep: pull a date window per (search type × dimension-set), map each
// API row to a gsc_performance_daily row, and UPSERT on the natural key so restated
// days self-correct and finalized days stay put. The one durable guarantee is that
// history persists past Google's ~16-month window.
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { searchAnalyticsQuery } from "./client";
import { MAX_PAGES, ROW_LIMIT, SEARCH_MATRIX, type MatrixEntry } from "./config";
import type { DataState, GscDimension, GscPerfRow, SearchAnalyticsRow, SearchType } from "./types";

export type SyncResult = {
  siteProperty: string;
  startDate: string;
  endDate: string;
  dataState: DataState;
  rowsUpserted: number;
  calls: number;
  errors: { type: SearchType; dimensions: string; message: string }[];
};

// Day-only sets are the true daily totals; otherwise the grouping is the 2nd dim.
const dimensionLabel = (dims: GscDimension[]): string => (dims.length === 1 ? "total" : dims[1]);

function mapRows(
  entry: MatrixEntry,
  rows: SearchAnalyticsRow[],
  siteProperty: string,
  dataState: DataState
): GscPerfRow[] {
  const label = dimensionLabel(entry.dimensions);
  const out: GscPerfRow[] = [];
  for (const r of rows) {
    const keys = r.keys ?? [];
    const date = keys[0]; // "date" is always the first requested dimension
    if (!date) continue;
    out.push({
      site_property: siteProperty,
      date,
      search_type: entry.type,
      dimension: label,
      dimension_value: label === "total" ? "" : (keys[1] ?? ""),
      // clicks/impressions are integer counts; ctr/position are non-additive averages.
      clicks: Math.round(r.clicks ?? 0),
      impressions: Math.round(r.impressions ?? 0),
      ctr: r.ctr ?? null,
      position: r.position ?? null,
      data_state: dataState,
    });
  }
  return out;
}

async function upsertRows(rows: GscPerfRow[]): Promise<void> {
  if (rows.length === 0) return;
  const supabase = createAdminClient();
  for (let i = 0; i < rows.length; i += 1000) {
    const { error } = await supabase.from("gsc_performance_daily").upsert(rows.slice(i, i + 1000), {
      onConflict: "site_property,date,search_type,dimension,dimension_value",
    });
    if (error) throw new Error(`upsert failed: ${error.message}`);
  }
}

// Fetch every page for one matrix entry across the window.
async function fetchEntry(
  siteUrl: string,
  entry: MatrixEntry,
  startDate: string,
  endDate: string,
  dataState: DataState
): Promise<GscPerfRow[]> {
  const collected: GscPerfRow[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await searchAnalyticsQuery(siteUrl, {
      startDate,
      endDate,
      dimensions: entry.dimensions,
      type: entry.type,
      dataState,
      rowLimit: ROW_LIMIT,
      startRow: page * ROW_LIMIT,
    });
    const rows = res.rows ?? [];
    collected.push(...mapRows(entry, rows, siteUrl, dataState));
    if (rows.length < ROW_LIMIT) break; // short page = last page
  }
  return collected;
}

// Sync one property over [startDate, endDate]. Per-entry faults are isolated so a
// single bad (type, dimensions) combination is logged and skipped, never fatal.
export async function syncGscWindow(
  siteUrl: string,
  startDate: string,
  endDate: string,
  dataState: DataState
): Promise<SyncResult> {
  const result: SyncResult = {
    siteProperty: siteUrl,
    startDate,
    endDate,
    dataState,
    rowsUpserted: 0,
    calls: 0,
    errors: [],
  };
  for (const entry of SEARCH_MATRIX) {
    try {
      const rows = await fetchEntry(siteUrl, entry, startDate, endDate, dataState);
      await upsertRows(rows);
      result.rowsUpserted += rows.length;
      result.calls += 1;
    } catch (err) {
      result.errors.push({
        type: entry.type,
        dimensions: entry.dimensions.join("+"),
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return result;
}
