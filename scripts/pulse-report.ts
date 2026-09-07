// Standalone HTML report of one week's Community-Pulse digest (team mail attachment).
// Reads pulse_digests + pulse_quality_report + the week's job costs, renders
// lib/mining/report.ts, writes ONE self-contained file. Read-only against the DB.
//
//   pnpm pulse:report [--week 2026-W37] [--out reports/pulse-2026-W37.html]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { isoWeek } from "@/lib/mining/config";
import { DigestSchema } from "@/lib/mining/digest";
import { qualityReport } from "@/lib/mining/quality";
import { renderDigestHtml } from "@/lib/mining/report";
import { createAdminClient } from "@/lib/supabase/admin";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env already exported
}

const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`);
  if (i < 0) return undefined;
  const value = process.argv[i + 1];
  if (value === undefined || value.startsWith("--")) throw new Error(`--${name} needs a value`);
  return value;
};

async function main() {
  const week = arg("week") ?? isoWeek();
  const out = resolve(arg("out") ?? `reports/pulse-${week}.html`);
  const supabase = createAdminClient();

  const { data: row, error } = await supabase
    .from("pulse_digests")
    .select("generated_at, model, prompt_version, input_signal_count, digest, status, cost_usd")
    .eq("iso_week", week)
    .maybeSingle();
  if (error) throw new Error(`pulse_digests read failed: ${error.message}`);
  if (!row)
    throw new Error(
      `no digest for ${week} — run the chain (or pnpm mining:sync --digest --week ${week}) first`
    );
  const digest = DigestSchema.parse(row.digest);

  const { data: jobs, error: jobsErr } = await supabase
    .from("pulse_jobs")
    .select("step, result")
    .eq("iso_week", week)
    .in("step", ["enrich", "digest"]);
  if (jobsErr) throw new Error(`pulse_jobs read failed: ${jobsErr.message}`);
  // Anthropic spend: enrich + digest job results (cron chain). Digest falls back to
  // pulse_digests.cost_usd for weeks generated via the CLI (no job row).
  const jobCost = (step: string): number | null => {
    const r = ((jobs ?? []).find((j) => j.step === step)?.result ?? null) as Record<
      string,
      unknown
    > | null;
    return r && typeof r.costUsd === "number" ? r.costUsd : null;
  };
  const anthropic = (jobCost("enrich") ?? 0) + (jobCost("digest") ?? Number(row.cost_usd ?? 0));

  const quality = await qualityReport(week);

  let logo: string | null = null;
  try {
    logo = `data:image/svg+xml;base64,${readFileSync("public/TODA-LOGO.svg").toString("base64")}`;
  } catch {
    logo = null;
  }

  const html = renderDigestHtml(digest, {
    generated_at: row.generated_at as string,
    model: row.model as string,
    prompt_version: row.prompt_version as string,
    input_signal_count: row.input_signal_count as number,
    totals: quality.totals,
    cost: { deepapi_estimate_usd: quality.total_cost_usd, anthropic_usd: anthropic },
    logo_data_uri: logo,
  });
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log(
    JSON.stringify(
      {
        week,
        out,
        bytes: Buffer.byteLength(html),
        candidates: digest.candidates.length,
        quotes: digest.quotes.length,
        anthropic_usd: Number(anthropic.toFixed(2)),
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error("[pulse-report] FAILED:", err instanceof Error ? err.message : err);
  process.exit(1);
});
