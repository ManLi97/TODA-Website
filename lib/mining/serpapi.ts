// SerpApi (server-only): German search demand for the battery's Phase 1.
//   google_trends RELATED_QUERIES (geo DE, last 7 days) → rising + top queries per seed
//   google (hl=de, gl=de, google.de) → related_questions (People also ask)
// Response fields pinned against live calls 2026-09-06 (related_queries.rising[]
// {query, value, extracted_value, link}; related_questions[] {question, type, snippet?,
// title?, link?}). ~8 searches/week of the 250/month free plan.
import "server-only";

import type { RawSerpQuestion, RawSerpTrendQuery } from "./types";

export function hasSerpApiKey(): boolean {
  return Boolean(process.env.SERP_API_KEY);
}

async function serp<T>(params: Record<string, string>): Promise<T> {
  const key = process.env.SERP_API_KEY;
  if (!key) throw new Error("SERP_API_KEY not set");
  const qs = new URLSearchParams({ ...params, api_key: key });
  const res = await fetch(`https://serpapi.com/search.json?${qs.toString()}`);
  const json = (await res.json()) as T & { error?: string };
  if (!res.ok || json.error)
    throw new Error(`SerpApi ${params.engine} failed: ${res.status} ${json.error ?? ""}`);
  return json;
}

export async function googleTrendsRelated(
  seed: string
): Promise<{ rising: RawSerpTrendQuery[]; top: RawSerpTrendQuery[] }> {
  const json = await serp<{
    related_queries?: { rising?: RawSerpTrendQuery[]; top?: RawSerpTrendQuery[] };
  }>({
    engine: "google_trends",
    q: seed,
    geo: "DE",
    hl: "de",
    date: "now 7-d",
    data_type: "RELATED_QUERIES",
  });
  return { rising: json.related_queries?.rising ?? [], top: json.related_queries?.top ?? [] };
}

export async function googlePaa(query: string): Promise<RawSerpQuestion[]> {
  const json = await serp<{ related_questions?: RawSerpQuestion[] }>({
    engine: "google",
    q: query,
    hl: "de",
    gl: "de",
    google_domain: "google.de",
  });
  return json.related_questions ?? [];
}
