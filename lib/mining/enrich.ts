// Verdichtung (server-only): LLM classification of every open topic_signals row
// (D5). Batches of ENRICH_BATCH rows → one Claude Opus 5 call with Structured
// Outputs → topic_classifications rows (classified_by 'llm', on conflict do nothing —
// the cron never overwrites; skills may). Rows whose verdict is missing after one
// retry stay open for the next run (warning on the console, never a silent drop).
import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";

import {
  ANTHROPIC_PRICE,
  CLUSTER_REGISTRY,
  ENRICH_BATCH,
  ENRICH_BODY_MAX_CHARS,
  ENRICH_CONCURRENCY,
  ENRICH_MODEL,
  PROMPT_VERSION,
  QUOTE_MAX_CHARS,
  REVIEW_FEATURES,
} from "./config";
import type { ClassificationRow, PendingSignal } from "./types";

const CLUSTER_SLUGS = CLUSTER_REGISTRY.map((c) => c.slug) as [string, ...string[]];

const VerdictSchema = z.object({
  id: z.string().describe("the input row id, verbatim"),
  language: z.string().describe("ISO-639-1 code of the text, e.g. de, en, es"),
  audience: z.enum(["artist", "endkunde", "mixed", "off_topic"]),
  is_discussion: z
    .boolean()
    .describe(
      "true = a real opinion/question/experience/complaint, false = showcase, ad, spam, empty"
    ),
  cluster: z.enum(CLUSTER_SLUGS).nullable(),
  cluster_proposal: z
    .string()
    .nullable()
    .describe(
      "short kebab-case topic label ONLY when no registry slug fits and the row is a discussion"
    ),
  signal_type: z.enum([
    "question",
    "complaint",
    "wish",
    "praise",
    "experience",
    "news",
    "promo",
    "other",
  ]),
  quote: z
    .string()
    .nullable()
    .describe(
      "verbatim excerpt from title/body, <= 280 chars, anonymised; null if nothing quotable"
    ),
  question: z
    .string()
    .nullable()
    .describe("the normalised question in the original language, only for signal_type question"),
  feature: z.enum(REVIEW_FEATURES).nullable().describe("review rows only"),
  confidence: z.number().min(0).max(1),
});
const BatchSchema = z.object({ verdicts: z.array(VerdictSchema) });
type Verdict = z.infer<typeof VerdictSchema>;

// Frozen system block (cache_control): registry + rules + ICP. Volatile content
// (the rows) goes in the user message only.
const SYSTEM_PROMPT = `Du klassifizierst Community-Signale aus der Tattoo-Szene (Reddit, YouTube, TikTok, Instagram, Facebook-Gruppen, Web, App-Store-Reviews, Google-Suchdaten) für TODA, eine Software für selbstständige Tätowierer im DACH-Raum. Jede Zeile bekommt genau ein Verdikt. Antworte ausschließlich im vorgegebenen JSON-Schema, keine Prosa.

ICP (Kern-Zielgruppe): selbstständige Solo-Tattoo-Artists (eigenes Studio oder Resident), die Termine, Anfragen, Anzahlungen, Kalender und Kundenkommunikation selbst managen. Anti-ICP: Nebenjob-Tätowierer, Ketten/Walk-in-Studios, High-End-Studios mit Manager, technikfeindliche Artists. Endkunden (Menschen, die ein Tattoo wollen oder haben) sind "immer im Raum": ihre Signale werden NIE verworfen, nur mit audience=endkunde gelabelt.

audience: artist = Tätowierer/Studio spricht oder wird als Zielgruppe adressiert; endkunde = Kunde/Interessent; mixed = beides (z. B. Artist erklärt Kunden etwas, Diskussion beider Seiten); off_topic = nichts mit Tätowieren als Beruf/Erlebnis zu tun (anderer Kontext, Spam, unlesbar).

is_discussion: true bei Meinung, Frage, Erfahrung, Beschwerde, Wunsch, Lob, Branchennews; false bei reinem Showcase ("done by me", Bild ohne Text), Werbung, Giveaways, Spam, Ein-Wort-Kommentaren, Job-Anzeigen ohne Aussage.

signal_type: question (eine echte Frage), complaint (Beschwerde/Frust/Schmerzpunkt), wish (Wunsch/Verbesserungsvorschlag), praise (Lob/Zufriedenheit), experience (Erfahrungsbericht/Meinung ohne Frage), news (Branchen-/Gesetzes-/Event-News), promo (Werbung, Angebot, Giveaway, Job-/Guest-Spot-Anzeige), other.

Konsistenzregeln: signal_type=other ⇒ is_discussion=false (z. B. SEO-/Ratgeber-Artikel, Wikipedia, Landing-Pages, Firmen-Blogs — das sind keine Community-Stimmen); signal_type=promo ⇒ is_discussion=false; news = redaktioneller/behördlicher Beitrag mit einer Neuigkeit (Gesetz, Urteil, Studie, Event), nicht jeder Artikel. Eine echte Stimme (Forum, Kommentar, Reddit, Video-Caption mit Meinung, Review) ist question/complaint/wish/praise/experience und is_discussion=true.

cluster: NUR ein Slug aus der Registry unten, sonst null. Bei einer Diskussion ohne passenden Slug: cluster=null und cluster_proposal mit einem kurzen kebab-case-Label (Registry-Erweiterung wird separat entschieden). Nicht-Diskussionen: cluster=null, cluster_proposal=null.

Registry:
${CLUSTER_REGISTRY.map((c) => `- ${c.slug}: ${c.covers}`).join("\n")}

quote: wörtlicher Auszug aus Titel/Body in Originalsprache, maximal 280 Zeichen, gekürzt mit „…" erlaubt, KEINE Übersetzung. Anonymisieren: Personennamen, @Handles, Studio-/Firmennamen, Orte und URLs weglassen oder durch „[…]" ersetzen. Wenn nichts Zitierbares übrig bleibt: null. Bei Reviews nie den App-Namen im Zitat.

question: nur bei signal_type=question — die Frage normalisiert als ein sauberer Satz in der Originalsprache (Rechtschreibung korrigiert, Kontext ergänzt, wenn nötig).

feature: nur für Reviews (platform appstore/playstore/trustpilot): welcher Produktbereich gemeint ist — ${REVIEW_FEATURES.join(", ")}. Sonst null.

language: Sprache des Textes erkennen (de, en, es, …), nie übersetzen. Dialekt/Schweizerdeutsch = de.

confidence: 0–1, wie sicher audience + cluster + signal_type zusammen sind.

Gib für JEDE Eingabezeile genau ein Verdikt mit der exakten id zurück.`;

type BatchRow = {
  id: string;
  platform: string;
  source: string;
  kind: string | null;
  title: string;
  body: string | null;
  metrics: Record<string, number | string | null> | null;
};

const rowId = (r: PendingSignal) => `${r.run_id}|${r.external_id}`;

function toBatchRow(r: PendingSignal): BatchRow {
  return {
    id: rowId(r),
    platform: r.platform,
    source: r.source_key.split("/")[0],
    kind: r.post_type,
    title: r.title,
    body: r.body ? r.body.slice(0, ENRICH_BODY_MAX_CHARS) : null,
    metrics: r.metrics,
  };
}

// Defensive anonymisation on top of the prompt rule: handles and URLs never survive.
const scrub = (s: string) =>
  s
    .replace(/https?:\/\/\S+/gi, "[…]")
    .replace(/@[\w.]+/g, "[…]")
    .replace(/\s+/g, " ")
    .trim();

export type UsageCost = {
  inputTokens: number;
  outputTokens: number;
  cacheRead: number;
  cacheWrite: number;
  costUsd: number;
};

export function usageCost(u: Anthropic.Usage): UsageCost {
  const cacheRead = u.cache_read_input_tokens ?? 0;
  const cacheWrite = u.cache_creation_input_tokens ?? 0;
  const costUsd =
    (u.input_tokens * ANTHROPIC_PRICE.input +
      u.output_tokens * ANTHROPIC_PRICE.output +
      cacheRead * ANTHROPIC_PRICE.cacheRead +
      cacheWrite * ANTHROPIC_PRICE.cacheWrite) /
    1_000_000;
  return {
    inputTokens: u.input_tokens,
    outputTokens: u.output_tokens,
    cacheRead,
    cacheWrite,
    costUsd,
  };
}

export function addCost(a: UsageCost, b: UsageCost): UsageCost {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cacheRead: a.cacheRead + b.cacheRead,
    cacheWrite: a.cacheWrite + b.cacheWrite,
    costUsd: a.costUsd + b.costUsd,
  };
}
export const zeroCost = (): UsageCost => ({
  inputTokens: 0,
  outputTokens: 0,
  cacheRead: 0,
  cacheWrite: 0,
  costUsd: 0,
});

// One classification call. Returns the verdicts keyed by input id (missing ids =
// the model skipped them) plus the usage cost.
export async function classifyBatch(
  rows: PendingSignal[],
  client = new Anthropic()
): Promise<{ verdicts: Map<string, Verdict>; cost: UsageCost }> {
  const input = rows.map(toBatchRow);
  let cost = zeroCost();
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await client.messages.parse({
      model: ENRICH_MODEL,
      max_tokens: 16000,
      output_config: { effort: "medium", format: zodOutputFormat(BatchSchema) },
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [
        {
          role: "user",
          content: `Klassifiziere diese ${input.length} Zeilen:\n${JSON.stringify(input)}`,
        },
      ],
    });
    cost = addCost(cost, usageCost(response.usage));
    if (response.parsed_output) {
      const verdicts = new Map<string, Verdict>();
      for (const v of response.parsed_output.verdicts) verdicts.set(v.id, v);
      return { verdicts, cost };
    }
    console.warn(
      `[enrich] parse failed (stop_reason ${response.stop_reason}), attempt ${attempt + 1}/2`
    );
  }
  return { verdicts: new Map(), cost };
}

function toClassificationRow(r: PendingSignal, v: Verdict): ClassificationRow {
  const isReview =
    r.platform === "appstore" || r.platform === "playstore" || r.platform === "trustpilot";
  const quote = v.quote ? scrub(v.quote).slice(0, QUOTE_MAX_CHARS) : null;
  return {
    run_id: r.run_id,
    external_id: r.external_id,
    is_discussion: v.is_discussion,
    cluster: v.cluster,
    note: null,
    audience: v.audience,
    signal_type: v.signal_type,
    language: v.language.toLowerCase().slice(0, 8),
    quote: quote && quote.length > 0 ? quote : null,
    question: v.signal_type === "question" && v.question ? scrub(v.question).slice(0, 500) : null,
    feature: isReview ? v.feature : null,
    cluster_proposal: v.cluster
      ? null
      : v.cluster_proposal?.trim().toLowerCase().slice(0, 60) || null,
    confidence: Math.max(0, Math.min(1, v.confidence)),
    classified_by: "llm",
    model: ENRICH_MODEL,
    prompt_version: PROMPT_VERSION,
  };
}

// Open rows from the enrichment queue view (oldest first). `offset` skips rows that
// already failed in this run (they stay at the head of the ordered view).
export async function pendingSignals(opts: {
  week?: string;
  limit: number;
  offset?: number;
}): Promise<PendingSignal[]> {
  const supabase = createAdminClient();
  let q = supabase
    .from("pulse_pending_signals")
    .select("*")
    .order("ingested_at", { ascending: true })
    .order("external_id", { ascending: true })
    .range(opts.offset ?? 0, (opts.offset ?? 0) + opts.limit - 1);
  if (opts.week) q = q.eq("iso_week", opts.week);
  const { data, error } = await q;
  if (error) throw new Error(`pulse_pending_signals query failed: ${error.message}`);
  return (data ?? []) as PendingSignal[];
}

export async function pendingCount(week?: string): Promise<number> {
  const supabase = createAdminClient();
  let q = supabase
    .from("pulse_pending_signals")
    .select("external_id", { count: "exact", head: true });
  if (week) q = q.eq("iso_week", week);
  const { count, error } = await q;
  if (error) throw new Error(`pulse_pending_signals count failed: ${error.message}`);
  return count ?? 0;
}

export type EnrichmentResult = {
  classified: number;
  failed: number;
  remaining: number;
  calls: number;
  cost: UsageCost;
  stoppedBy: "done" | "budget" | "maxRows";
};

// Classify open rows until none remain, the time budget is spent, or maxRows is hit.
export async function runEnrichment(
  opts: {
    week?: string;
    budgetMs?: number;
    maxRows?: number;
  } = {}
): Promise<EnrichmentResult> {
  const started = Date.now();
  const supabase = createAdminClient();
  const client = new Anthropic();
  const failedIds = new Set<string>();
  let classified = 0;
  let calls = 0;
  let cost = zeroCost();
  let stoppedBy: EnrichmentResult["stoppedBy"] = "done";

  for (;;) {
    if (opts.budgetMs && Date.now() - started > opts.budgetMs) {
      stoppedBy = "budget";
      break;
    }
    if (opts.maxRows && classified + failedIds.size >= opts.maxRows) {
      stoppedBy = "maxRows";
      break;
    }
    const want = opts.maxRows
      ? Math.min(ENRICH_BATCH * ENRICH_CONCURRENCY, opts.maxRows - classified - failedIds.size)
      : ENRICH_BATCH * ENRICH_CONCURRENCY;
    const rows = await pendingSignals({ week: opts.week, limit: want, offset: failedIds.size });
    if (rows.length === 0) break;

    // One round = up to ENRICH_CONCURRENCY parallel calls of ENRICH_BATCH rows each.
    const chunks: PendingSignal[][] = [];
    for (let i = 0; i < rows.length; i += ENRICH_BATCH)
      chunks.push(rows.slice(i, i + ENRICH_BATCH));
    const results = await Promise.all(chunks.map((chunk) => classifyBatch(chunk, client)));
    const verdicts = new Map<string, Verdict>();
    for (const r of results) {
      calls += 1;
      cost = addCost(cost, r.cost);
      for (const [k, v] of r.verdicts) verdicts.set(k, v);
    }

    const inserts: ClassificationRow[] = [];
    for (const r of rows) {
      const v = verdicts.get(rowId(r));
      if (v) inserts.push(toClassificationRow(r, v));
      else failedIds.add(rowId(r));
    }
    if (inserts.length > 0) {
      // on conflict do nothing: a skill's deliberate verdict is never overwritten.
      const { error } = await supabase
        .from("topic_classifications")
        .upsert(inserts, { onConflict: "run_id,external_id", ignoreDuplicates: true });
      if (error) throw new Error(`topic_classifications insert failed: ${error.message}`);
      classified += inserts.length;
    }
    if (inserts.length === 0) {
      console.warn(`[enrich] batch of ${rows.length} rows produced no verdicts — rows stay open`);
    }
  }

  if (failedIds.size > 0)
    console.warn(`[enrich] ${failedIds.size} rows stayed open (no verdict after retry)`);
  const remaining = await pendingCount(opts.week);
  return { classified, failed: failedIds.size, remaining, calls, cost, stoppedBy };
}

// --reclassify <prompt_version>: delete the llm rows of that version (optionally one
// week) so the next enrichment re-classifies them. Skill rows are never touched.
export async function deleteLlmClassifications(
  promptVersion: string,
  week?: string
): Promise<number> {
  const supabase = createAdminClient();
  let runIds: string[] | null = null;
  if (week) {
    const { data, error } = await supabase.from("mining_runs").select("id").eq("iso_week", week);
    if (error) throw new Error(`mining_runs lookup failed: ${error.message}`);
    runIds = (data ?? []).map((r) => r.id as string);
    if (runIds.length === 0) return 0;
  }
  let q = supabase
    .from("topic_classifications")
    .delete()
    .eq("classified_by", "llm")
    .eq("prompt_version", promptVersion);
  if (runIds) q = q.in("run_id", runIds);
  const { data, error } = await q.select("external_id");
  if (error) throw new Error(`reclassify delete failed: ${error.message}`);
  return data?.length ?? 0;
}
