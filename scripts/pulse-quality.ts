// Quality report for the Community-Pulse test-run loop (rubric:
// .claude/plans/community-pulse-v3/quality-rubrik.md). Same output as
// `pnpm mining:sync --quality`, with an optional JSON file for the loop protocol.
//
//   pnpm pulse:quality [--week 2026-W37] [--out path.json]
import { writeFileSync } from "node:fs";

import { isoWeek } from "@/lib/mining/config";
import { qualityReport, renderQualityTable } from "@/lib/mining/quality";

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
  const report = await qualityReport(week);
  console.log(renderQualityTable(report));
  const outPath = arg("out");
  if (outPath) {
    writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(`written ${outPath}`);
  } else {
    console.log(JSON.stringify(report, null, 2));
  }
}

main().catch((err) => {
  console.error("[pulse-quality] FAILED:", err);
  process.exit(1);
});
