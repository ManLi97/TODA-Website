// Wochen-Digest (server-only, D6): SQL aggregates (pulse_digest_input) + first-party
// reads (TODA's own IG comments without usernames, post_insights top posts, GSC query
// deltas) → one Claude Opus 5 synthesis (Structured Outputs) → pulse_digests
// (digest jsonb + deterministic digest_md). Upsert on iso_week. The digest never
// names a competitor next to a pain point (marketing/strategy/claims.md).
import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";

import { DIGEST_MODEL, PROMPT_VERSION, REVIEW_TARGETS, isoWeek, isoWeekStart } from "./config";
import { usageCost, zeroCost } from "./enrich";
import type { UsageCost } from "./enrich";

// --- Schema (Richtwert per plan; bounded lists) ------------------------------------

const Evidence = z
  .array(z.string())
  .describe("ids in the form run_id|external_id, copied verbatim from the input");
const Themed = z.object({
  theme: z.string(),
  summary: z.string(),
  n: z.number(),
  evidence_ids: Evidence,
});
export const DigestSchema = z.object({
  week: z.string(),
  headline: z.string().describe("ein Satz: was die Szene diese Woche bewegt"),
  summary: z.string().describe("3-6 Sätze Lagebild"),
  top_topics: z.array(
    z.object({
      cluster: z.string(),
      n: z.number(),
      sources: z.number(),
      score: z.number(),
      delta_vs_4w: z.string().describe("z. B. '+40 % vs. Ø 4 Wochen' oder 'neu' oder 'stabil'"),
      summary: z.string(),
      evidence_ids: Evidence,
    })
  ),
  questions: z.array(
    z.object({
      question: z.string(),
      n: z.number().describe("wie oft (inkl. Varianten) gestellt"),
      audience: z.enum(["artist", "endkunde", "mixed"]),
      sources: z.array(z.string()),
      evidence_ids: Evidence,
    })
  ),
  complaints: z.array(Themed),
  wishes: z.array(Themed),
  praise: z.array(Themed),
  videos: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      x_ratio: z.number(),
      source: z.string(),
      why: z.string(),
    })
  ),
  competitor_feedback: z.array(
    z.object({
      feature: z.string(),
      sentiment: z.enum(["negative", "mixed", "positive"]),
      n: z.number(),
      summary: z.string().describe("ohne Firmen-/App-Namen"),
    })
  ),
  first_party: z.object({
    ig_comment_themes: z.array(z.string()),
    top_posts: z.array(z.object({ permalink: z.string(), reach: z.number(), why: z.string() })),
    gsc_rising_queries: z.array(
      z.object({ query: z.string(), impressions: z.number(), delta: z.number() })
    ),
  }),
  quotes: z.array(
    z.object({
      quote: z.string(),
      platform: z.string(),
      signal_type: z.string(),
      cluster: z.string().nullable(),
      external_id: z.string(),
    })
  ),
  candidates: z.array(
    z.object({
      format: z.enum(["blog", "reel", "carousel", "faq", "clip"]),
      topic: z.string(),
      why: z.string(),
      evidence_ids: Evidence,
    })
  ),
  gaps: z.array(z.string()).describe("was die Datenlage diese Woche NICHT hergibt"),
});
export type Digest = z.infer<typeof DigestSchema>;

// --- First-party reads (foreign tables, read-only) --------------------------------

type FirstParty = {
  ig_comments: { text: string; likes: number | null; at: string | null }[];
  top_posts: {
    permalink: string | null;
    caption: string | null;
    published_at: string | null;
    reach: number | null;
    likes: number | null;
    comments: number | null;
    saves: number | null;
    shares: number | null;
  }[];
  gsc: {
    query: string;
    impressions: number;
    clicks: number;
    prev_impressions: number;
    prev_clicks: number;
    delta_impressions: number;
  }[];
};

async function firstPartyReads(week: string): Promise<FirstParty> {
  const supabase = createAdminClient();
  const monday = isoWeekStart(week);
  const end = new Date(monday.getTime() + 7 * 86400000);
  const prevMonday = new Date(monday.getTime() - 7 * 86400000);
  const iso = (d: Date) => d.toISOString();
  const day = (d: Date) => d.toISOString().slice(0, 10);

  const [ig, posts, gsc] = await Promise.all([
    supabase
      .from("instagram_interactions")
      .select("comment_text, like_count, comment_created_at")
      .gte("comment_created_at", iso(monday))
      .lt("comment_created_at", iso(end))
      .order("like_count", { ascending: false, nullsFirst: false })
      .limit(200),
    supabase
      .from("post_insights")
      .select(
        "post_id, caption, permalink, published_at, reach, likes, comments_count, saves, shares, snapshot_at"
      )
      .gte("published_at", iso(new Date(monday.getTime() - 21 * 86400000)))
      .order("snapshot_at", { ascending: false })
      .limit(500),
    supabase
      .from("gsc_performance_daily")
      .select("dimension_value, date, clicks, impressions")
      .eq("dimension", "query")
      .gte("date", day(prevMonday))
      .lt("date", day(end))
      .limit(5000),
  ]);
  for (const r of [ig, posts, gsc])
    if (r.error) throw new Error(`first-party read failed: ${r.error.message}`);

  const igComments = (ig.data ?? [])
    .filter((c) => typeof c.comment_text === "string" && c.comment_text.trim().length > 0)
    .map((c) => ({
      text: String(c.comment_text).slice(0, 300),
      likes: c.like_count as number | null,
      at: c.comment_created_at as string | null,
    }));

  const latest = new Map<string, NonNullable<typeof posts.data>[number]>();
  for (const p of posts.data ?? [])
    if (!latest.has(p.post_id as string)) latest.set(p.post_id as string, p);
  const topPosts = [...latest.values()]
    .sort((a, b) => ((b.reach as number) ?? 0) - ((a.reach as number) ?? 0))
    .slice(0, 10)
    .map((p) => ({
      permalink: p.permalink as string | null,
      caption: p.caption ? String(p.caption).slice(0, 200) : null,
      published_at: p.published_at as string | null,
      reach: p.reach as number | null,
      likes: p.likes as number | null,
      comments: p.comments_count as number | null,
      saves: p.saves as number | null,
      shares: p.shares as number | null,
    }));

  const agg = new Map<
    string,
    { impressions: number; clicks: number; prev_impressions: number; prev_clicks: number }
  >();
  const mondayDay = day(monday);
  for (const r of gsc.data ?? []) {
    const q = r.dimension_value as string;
    const cur = (r.date as string) >= mondayDay;
    const a = agg.get(q) ?? { impressions: 0, clicks: 0, prev_impressions: 0, prev_clicks: 0 };
    if (cur) {
      a.impressions += (r.impressions as number) ?? 0;
      a.clicks += (r.clicks as number) ?? 0;
    } else {
      a.prev_impressions += (r.impressions as number) ?? 0;
      a.prev_clicks += (r.clicks as number) ?? 0;
    }
    agg.set(q, a);
  }
  const gscRows = [...agg.entries()]
    .map(([query, a]) => ({ query, ...a, delta_impressions: a.impressions - a.prev_impressions }))
    .filter((r) => r.impressions > 0);
  const top = [...gscRows].sort((a, b) => b.impressions - a.impressions).slice(0, 20);
  const rising = [...gscRows]
    .sort((a, b) => b.delta_impressions - a.delta_impressions)
    .slice(0, 15);
  const gscOut = [...new Map([...top, ...rising].map((r) => [r.query, r])).values()];

  return { ig_comments: igComments, top_posts: topPosts, gsc: gscOut };
}

export type DigestInput = { pulse: Record<string, unknown>; first_party: FirstParty };

export async function buildDigestInput(week: string): Promise<DigestInput> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("pulse_digest_input", { p_iso_week: week });
  if (error) throw new Error(`pulse_digest_input failed: ${error.message}`);
  return {
    pulse: (data ?? {}) as Record<string, unknown>,
    first_party: await firstPartyReads(week),
  };
}

// --- Synthesis -------------------------------------------------------------------

const COMPETITOR_NAMES = REVIEW_TARGETS.map((t) => t.competitor);

const SYSTEM_PROMPT = `Du schreibst den wöchentlichen Community-Puls für TODA (Software für selbstständige Tätowierer im DACH-Raum) — ein internes Lagebild, das drei Konsumenten lesen: die Blog-Redaktion (/blog-article), das Instagram-Posting (/community-voices) und die Clip-Auswahl. Du bekommst SQL-Aggregate der Woche (Cluster mit 4-Wochen-Delta, Fragen, Beschwerden, Wünsche, Lob, Erfahrungen, News, Top-Videos mit x-Ratio, Review-Feedback je Feature, Google-Suchdaten, Cluster-Vorschläge, Zitate) plus Erstanbieter-Daten (TODAs eigene Instagram-Kommentare ohne Namen, Top-Posts, Search-Console-Queries).

Regeln (bindend):
1. Nur belegen, was in den Eingabedaten steht. evidence_ids sind ausschließlich Ids aus dem Input (Form run_id|external_id). Keine erfundenen Zahlen.
2. Mitbewerber werden nie herabgesetzt und nie benannt: Review-Schmerzpunkte tauchen ausschließlich unattribuiert auf (competitor_feedback, complaints, quotes, summary) — keine App-/Firmennamen (auch nicht ${COMPETITOR_NAMES.join(", ")}).
3. quotes: nur wörtliche Zitate aus dem Feld quote der Eingabe, unverändert (bereits anonymisiert). Keine eigenen Formulierungen als Zitat.
4. Sprache: Deutsch. Englische Zitate bleiben Englisch.
5. Endkunden-Signale sind wertvoll (Endkunde ist immer im Raum): kennzeichnen, nicht verwerfen.
6. candidates: konkrete Content-Kandidaten je Format (blog, reel, carousel, faq, clip) mit Begründung aus den Daten und evidence_ids; lieber 5 gute als 15 vage.
7. gaps: ehrlich benennen, was die Woche nicht hergibt (dünne Slots, fehlende DACH-Signale, unklassifizierte Zeilen).
8. Listen bounded: top_topics ≤ 10, questions ≤ 15, complaints/wishes/praise ≤ 8, videos ≤ 8, quotes ≤ 20, candidates ≤ 8.
Antworte ausschließlich im vorgegebenen JSON-Schema.`;

export async function generateDigest(
  week = isoWeek(),
  client = new Anthropic()
): Promise<{ digest: Digest; digest_md: string; cost: UsageCost; inputSignalCount: number }> {
  const input = await buildDigestInput(week);
  const counts = (input.pulse.counts ?? {}) as { signals?: number };
  const response = await client.messages.parse({
    model: DIGEST_MODEL,
    max_tokens: 16000,
    output_config: { effort: "high", format: zodOutputFormat(DigestSchema) },
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: `ISO-Woche ${week}. Eingabedaten:\n${JSON.stringify(input)}`,
      },
    ],
  });
  const cost = response.usage ? usageCost(response.usage) : zeroCost();
  if (!response.parsed_output) {
    throw new Error(
      `digest synthesis produced no parseable output (stop_reason ${response.stop_reason})`
    );
  }
  const digest = { ...response.parsed_output, week };
  const digest_md = renderDigestMd(digest);

  const supabase = createAdminClient();
  const { error } = await supabase.from("pulse_digests").upsert(
    {
      iso_week: week,
      generated_at: new Date().toISOString(),
      model: DIGEST_MODEL,
      prompt_version: PROMPT_VERSION,
      input_signal_count: counts.signals ?? 0,
      digest,
      digest_md,
      cost_usd: Math.round(cost.costUsd * 10000) / 10000,
      status: "final",
    },
    { onConflict: "iso_week" }
  );
  if (error) throw new Error(`pulse_digests upsert failed: ${error.message}`);
  return { digest, digest_md, cost, inputSignalCount: counts.signals ?? 0 };
}

export async function digestExists(week: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("pulse_digests")
    .select("id", { count: "exact", head: true })
    .eq("iso_week", week);
  if (error) throw new Error(`pulse_digests lookup failed: ${error.message}`);
  return (count ?? 0) > 0;
}

// Deterministic markdown rendering of the digest JSON (the md is never LLM prose).
export function renderDigestMd(d: Digest): string {
  const lines: string[] = [];
  const themed = (title: string, items: { theme: string; summary: string; n: number }[]) => {
    if (items.length === 0) return;
    lines.push(`## ${title}`, "");
    for (const t of items) lines.push(`- **${t.theme}** (${t.n}): ${t.summary}`);
    lines.push("");
  };
  lines.push(`# Community-Puls ${d.week}`, "", `**${d.headline}**`, "", d.summary, "");
  if (d.top_topics.length > 0) {
    lines.push(
      "## Themen der Woche",
      "",
      "| Cluster | n | Quellen | Score | Δ 4W | |",
      "|---|---|---|---|---|---|"
    );
    for (const t of d.top_topics)
      lines.push(
        `| ${t.cluster} | ${t.n} | ${t.sources} | ${t.score} | ${t.delta_vs_4w} | ${t.summary} |`
      );
    lines.push("");
  }
  if (d.questions.length > 0) {
    lines.push("## Fragen", "");
    for (const q of d.questions)
      lines.push(`- ${q.question} _(${q.audience}, ${q.n}×, ${q.sources.join(", ")})_`);
    lines.push("");
  }
  themed("Beschwerden", d.complaints);
  themed("Wünsche", d.wishes);
  themed("Lob", d.praise);
  if (d.videos.length > 0) {
    lines.push("## Videos mit Ausreißer-Ratio", "");
    for (const v of d.videos)
      lines.push(`- [${v.title}](${v.url}) — ×${v.x_ratio} (${v.source}): ${v.why}`);
    lines.push("");
  }
  if (d.competitor_feedback.length > 0) {
    lines.push("## Review-Feedback je Feature (unattribuiert)", "");
    for (const c of d.competitor_feedback)
      lines.push(`- **${c.feature}** (${c.sentiment}, ${c.n}): ${c.summary}`);
    lines.push("");
  }
  lines.push("## Erstanbieter", "");
  if (d.first_party.ig_comment_themes.length > 0)
    lines.push(`- IG-Kommentar-Themen: ${d.first_party.ig_comment_themes.join("; ")}`);
  for (const p of d.first_party.top_posts)
    lines.push(`- Top-Post ${p.permalink} (Reach ${p.reach}): ${p.why}`);
  for (const g of d.first_party.gsc_rising_queries)
    lines.push(`- GSC „${g.query}": ${g.impressions} Impressions (Δ ${g.delta})`);
  lines.push("");
  if (d.quotes.length > 0) {
    lines.push("## Zitate", "");
    for (const q of d.quotes)
      lines.push(
        `> ${q.quote}`,
        `> — ${q.platform}, ${q.signal_type}${q.cluster ? `, ${q.cluster}` : ""} (${q.external_id})`,
        ""
      );
  }
  if (d.candidates.length > 0) {
    lines.push("## Content-Kandidaten", "");
    for (const c of d.candidates) lines.push(`- **${c.format}** — ${c.topic}: ${c.why}`);
    lines.push("");
  }
  if (d.gaps.length > 0) {
    lines.push("## Lücken", "");
    for (const g of d.gaps) lines.push(`- ${g}`);
    lines.push("");
  }
  return lines.join("\n");
}
