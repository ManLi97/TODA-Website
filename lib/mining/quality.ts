// Qualitätsbericht (server-only) for the test-run loop — the rubric in
// .claude/plans/community-pulse-v3/quality-rubrik.md. SQL does the counting
// (pulse_quality_report); this module adds slot costs from the config unit prices
// and renders a table with threshold flags.
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import { UNIT_PRICE } from "./config";

export type SlotQuality = {
  slot: string;
  n_runs: number;
  n_succeeded: number;
  n_failed: number;
  n_raw: number;
  n_new: number;
  pct_new: number | null;
  n_rows: number | null;
  n_classified: number | null;
  pct_de: number | null;
  avg_text_len: number | null;
  pct_artist: number | null;
  pct_useful: number | null;
  pct_spam: number | null;
  pct_recent: number | null;
  n_useful: number | null;
  n_useful_de: number | null;
  cost_usd: number;
  cost_per_useful: number | null;
  flags: string[];
};

export type QualityReport = {
  week: string;
  generated_at: string;
  slots: SlotQuality[];
  totals: Record<string, number | boolean>;
  total_cost_usd: number;
  flags: string[];
};

// Per-item price by slot prefix (0 = free provider).
const SLOT_UNIT: Record<string, number> = {
  "yt-search": UNIT_PRICE.ytSearch,
  "yt-channels": UNIT_PRICE.ytChannel,
  "reddit-search": UNIT_PRICE.redditPost,
  "reddit-broad": UNIT_PRICE.redditPost,
  "reddit-comments": UNIT_PRICE.redditComment,
  "ig-hashtags": UNIT_PRICE.igHashtag,
  "ig-accounts": UNIT_PRICE.igPost,
  "ig-comments": UNIT_PRICE.igComment,
  "tiktok-search": UNIT_PRICE.tiktokVideo,
  "tiktok-comments": UNIT_PRICE.tiktokComment,
  "fb-groups": UNIT_PRICE.fbPost,
};
const SNAPSHOT_SLOTS = new Set(["yt-channels", "serp"]);
const EN_SLOTS = new Set([
  "reddit-search",
  "reddit-broad",
  "reddit-comments",
  "yt-channels",
  "serp",
]);
const CONSUMER_SLOTS = new Set(["tiktok-search", "web", "serp"]);
const LOW_RECENCY_SLOTS = new Set(["reviews", "fb-groups", "web"]);

function slotCost(slot: string, s: { n_raw: number; n_runs: number }): number {
  if (slot === "web") return s.n_runs * UNIT_PRICE.webSearch;
  if (slot === "reviews") return 0; // Apple/Play free; Trustpilot extract ≈ 0.015/page, negligible
  return s.n_raw * (SLOT_UNIT[slot] ?? 0);
}

function slotFlags(s: Omit<SlotQuality, "flags">): string[] {
  const f: string[] = [];
  if (s.n_raw === 0) f.push("n_raw=0");
  if (s.n_failed > 0) f.push(`${s.n_failed} failed`);
  if (!SNAPSHOT_SLOTS.has(s.slot) && s.pct_new !== null && s.pct_new < 70) f.push("%new<70");
  if (!EN_SLOTS.has(s.slot) && s.pct_de !== null && s.pct_de < 60) f.push("%DE<60");
  if (
    s.avg_text_len !== null &&
    s.avg_text_len < (s.slot === "reviews" ? 60 : 80) &&
    !SNAPSHOT_SLOTS.has(s.slot)
  )
    f.push("Øtext<80");
  const artistMin = CONSUMER_SLOTS.has(s.slot) ? 30 : 50;
  if (s.pct_artist !== null && s.pct_artist < artistMin) f.push(`%artist<${artistMin}`);
  if (s.pct_useful !== null && s.pct_useful < 50) f.push("%useful<50");
  if (s.pct_spam !== null && s.pct_spam > 15) f.push("%spam>15");
  const recentMin = LOW_RECENCY_SLOTS.has(s.slot) ? 30 : 60;
  if (s.pct_recent !== null && s.pct_recent < recentMin) f.push(`%recent<${recentMin}`);
  if (s.cost_per_useful !== null && s.cost_per_useful > 0.05) f.push("$/useful>0.05");
  return f;
}

export async function qualityReport(week: string): Promise<QualityReport> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("pulse_quality_report", { p_iso_week: week });
  if (error) throw new Error(`pulse_quality_report failed: ${error.message}`);
  const raw = data as {
    week: string;
    generated_at: string;
    slots: Omit<SlotQuality, "cost_usd" | "cost_per_useful" | "flags">[];
    totals: Record<string, number | boolean>;
  };

  const slots: SlotQuality[] = raw.slots.map((s) => {
    const cost_usd = Math.round(slotCost(s.slot, s) * 10000) / 10000;
    const cost_per_useful =
      s.n_useful && s.n_useful > 0 ? Math.round((cost_usd / s.n_useful) * 10000) / 10000 : null;
    const base = { ...s, cost_usd, cost_per_useful };
    return { ...base, flags: slotFlags(base) };
  });
  const t = raw.totals;
  const flags: string[] = [];
  if (Number(t.useful_de) < 300) flags.push("useful_de<300");
  if (Number(t.clusters_trend_gate) < 5) flags.push("trend-gate clusters<5");
  if (Number(t.questions_de) < 40) flags.push("questions_de<40");
  if (Number(t.complaints_wishes_de) < 40) flags.push("complaints+wishes_de<40");
  if (Number(t.review_rows) < 3) flags.push("review_rows<3");
  if (Number(t.identity_fields) > 0) flags.push("IDENTITY FIELDS PRESENT");
  if (Number(t.pending) > 0) flags.push(`${t.pending} rows unclassified`);
  return {
    week: raw.week,
    generated_at: raw.generated_at,
    slots,
    totals: t,
    total_cost_usd: Math.round(slots.reduce((n, s) => n + s.cost_usd, 0) * 10000) / 10000,
    flags,
  };
}

const cell = (v: number | null | undefined, digits = 0) =>
  v === null || v === undefined ? "–" : typeof v === "number" ? v.toFixed(digits) : String(v);

export function renderQualityTable(r: QualityReport): string {
  const head = [
    "slot",
    "runs",
    "fail",
    "raw",
    "new",
    "%new",
    "%DE",
    "Øtxt",
    "%art",
    "%usef",
    "%spam",
    "%rec",
    "$",
    "$/usef",
    "flags",
  ];
  const rows = r.slots.map((s) => [
    s.slot,
    String(s.n_runs),
    String(s.n_failed),
    String(s.n_raw),
    String(s.n_new),
    cell(s.pct_new),
    cell(s.pct_de),
    cell(s.avg_text_len),
    cell(s.pct_artist),
    cell(s.pct_useful),
    cell(s.pct_spam),
    cell(s.pct_recent),
    cell(s.cost_usd, 3),
    cell(s.cost_per_useful, 3),
    s.flags.join(" "),
  ]);
  const widths = head.map((h, i) => Math.max(h.length, ...rows.map((row) => row[i].length)));
  const line = (cols: string[]) => cols.map((c, i) => c.padEnd(widths[i])).join("  ");
  const out = [line(head), line(widths.map((w) => "-".repeat(w))), ...rows.map(line), ""];
  out.push(
    `totals ${r.week}: ${Object.entries(r.totals)
      .map(([k, v]) => `${k}=${v}`)
      .join("  ")}`
  );
  out.push(
    `total DeepAPI cost ≈ $${r.total_cost_usd}   flags: ${r.flags.length ? r.flags.join(" | ") : "none"}`
  );
  return out.join("\n");
}
