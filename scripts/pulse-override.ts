// Deliberate override of an LLM verdict in topic_classifications (CLI regime — the
// write path the /blog-article skill uses when a cron verdict contradicts the registry
// logic: wrong cluster, wrong audience, a quote that is not anonymous, a video row
// that must not count as discussion). Service role in-process, UPDATE only, one row
// per entry, never DELETE, never DDL. Run after a pre-action report.
//
//   pnpm pulse:override <override.json>
//
// override.json: one object or an array of
//   { "run_id": "<uuid>", "external_id": "<id>", "reason": "<why, for the note>",
//     "set": { "cluster"?: slug|null, "audience"?, "signal_type"?, "is_discussion"?,
//              "quote"?: text|null, "question"?: text|null, "feature"?: text|null } }
// Output per row: before → after (the read-back is the proof). classified_by becomes
// 'skill', model/prompt_version stay so the original verdict remains traceable.
import { readFileSync } from "node:fs";

import { CLUSTER_REGISTRY } from "@/lib/mining/config";
import { createAdminClient } from "@/lib/supabase/admin";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env already exported
}

const AUDIENCES = ["artist", "endkunde", "mixed", "off_topic"] as const;
const SIGNAL_TYPES = [
  "question",
  "complaint",
  "wish",
  "praise",
  "experience",
  "news",
  "promo",
  "other",
] as const;
const ALLOWED = new Set([
  "cluster",
  "audience",
  "signal_type",
  "is_discussion",
  "quote",
  "question",
  "feature",
]);

type Override = {
  run_id: string;
  external_id: string;
  reason: string;
  set: Record<string, unknown>;
};

const registrySlugs = new Set<string>(CLUSTER_REGISTRY.map((c) => c.slug));

function validate(o: Override, i: number): void {
  const at = `entry ${i}`;
  if (!o.run_id || !o.external_id) throw new Error(`${at}: run_id and external_id are required`);
  if (!o.reason || o.reason.trim().length < 10)
    throw new Error(`${at}: reason must explain the override (≥ 10 chars)`);
  if (!o.set || typeof o.set !== "object" || Object.keys(o.set).length === 0)
    throw new Error(`${at}: set must contain at least one field`);
  for (const [k, v] of Object.entries(o.set)) {
    if (!ALLOWED.has(k)) throw new Error(`${at}: field ${k} is not overridable`);
    if (k === "cluster" && v !== null && !registrySlugs.has(String(v)))
      throw new Error(`${at}: cluster ${String(v)} is not in CLUSTER_REGISTRY`);
    if (k === "audience" && !AUDIENCES.includes(v as (typeof AUDIENCES)[number]))
      throw new Error(`${at}: audience ${String(v)} invalid`);
    if (k === "signal_type" && !SIGNAL_TYPES.includes(v as (typeof SIGNAL_TYPES)[number]))
      throw new Error(`${at}: signal_type ${String(v)} invalid`);
    if (k === "is_discussion" && typeof v !== "boolean")
      throw new Error(`${at}: is_discussion must be boolean`);
    if (k === "quote" && v !== null && (typeof v !== "string" || v.length > 280))
      throw new Error(`${at}: quote must be null or ≤ 280 chars (and anonymous)`);
  }
}

async function main() {
  const path = process.argv[2];
  if (!path || path.startsWith("--")) throw new Error("usage: pnpm pulse:override <override.json>");
  const parsed = JSON.parse(readFileSync(path, "utf8")) as Override | Override[];
  const entries = Array.isArray(parsed) ? parsed : [parsed];
  entries.forEach(validate);

  const supabase = createAdminClient();
  const cols =
    "run_id, external_id, is_discussion, cluster, audience, signal_type, language, quote, question, feature, classified_by, model, prompt_version, note";
  const results: unknown[] = [];
  for (const o of entries) {
    const { data: before, error: readErr } = await supabase
      .from("topic_classifications")
      .select(cols)
      .eq("run_id", o.run_id)
      .eq("external_id", o.external_id)
      .maybeSingle();
    if (readErr) throw new Error(`read failed: ${readErr.message}`);
    if (!before) throw new Error(`no classification for ${o.run_id}|${o.external_id}`);

    const stamp = new Date().toISOString().slice(0, 10);
    const prevNote = (before as Record<string, unknown>).note;
    const patch: Record<string, unknown> = {
      ...o.set,
      classified_by: "skill",
      note: `${prevNote ? `${String(prevNote)} | ` : ""}override ${stamp}: ${o.reason.trim()}`,
    };
    const { error: updErr } = await supabase
      .from("topic_classifications")
      .update(patch)
      .eq("run_id", o.run_id)
      .eq("external_id", o.external_id);
    if (updErr)
      throw new Error(`update failed for ${o.run_id}|${o.external_id}: ${updErr.message}`);

    const { data: after, error: backErr } = await supabase
      .from("topic_classifications")
      .select(cols)
      .eq("run_id", o.run_id)
      .eq("external_id", o.external_id)
      .single();
    if (backErr || !after) throw new Error(`read-back failed: ${backErr?.message ?? "no row"}`);
    results.push({ before, after });
  }
  console.log(JSON.stringify({ overridden: results.length, rows: results }, null, 2));
}

main().catch((err) => {
  console.error("[pulse-override] FAILED:", err instanceof Error ? err.message : err);
  process.exit(1);
});
