// Apify REST v2 client (server-only). Raw fetch, no SDK. Auth is always a Bearer
// header (never ?token= in the URL). Starting/polling a run needs APIFY_TOKEN;
// reading a dataset does NOT — public/unnamed datasets are readable tokenless
// (verified), which is what lets the "run via MCP → `--dataset` ingest" path work
// before the token is provisioned.
import "server-only";

import { APIFY_ACTOR_PATH, POLL_INTERVAL_MS } from "./config";
import type { ApifyRun, ApifyRunStatus, RawRedditItem } from "./types";

const API = "https://api.apify.com/v2";

export function hasApifyToken(): boolean {
  return Boolean(process.env.APIFY_TOKEN);
}

function authHeaders(required: boolean): Record<string, string> {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    if (required) throw new Error("APIFY_TOKEN not set — required to start/poll actor runs");
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

type RunData = { id: string; status: string; defaultDatasetId: string };

const toRun = (d: RunData): ApifyRun => ({
  id: d.id,
  status: d.status as ApifyRunStatus,
  defaultDatasetId: d.defaultDatasetId,
});

// Start an actor run (needs token). Async — returns immediately with the run handle.
export async function startActorRun(input: unknown): Promise<ApifyRun> {
  const res = await fetch(`${API}/acts/${APIFY_ACTOR_PATH}/runs`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(true) },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Apify start run failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { data: RunData };
  return toRun(json.data);
}

export async function getRun(runId: string): Promise<ApifyRun> {
  const res = await fetch(`${API}/actor-runs/${runId}`, { headers: authHeaders(true) });
  if (!res.ok) throw new Error(`Apify get run failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { data: RunData };
  return toRun(json.data);
}

const TERMINAL = new Set<ApifyRunStatus>(["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"]);

// Poll a run until terminal or the deadline. On deadline the error names runId +
// datasetId so a later `--dataset` ingest can recover the data (the Apify run is
// never aborted — if it finishes late, re-ingesting its dataset heals the row).
export async function waitForRun(runId: string, timeoutMs: number): Promise<ApifyRun> {
  const deadline = Date.now() + timeoutMs;
  let run = await getRun(runId);
  while (!TERMINAL.has(run.status)) {
    if (Date.now() > deadline) {
      throw new Error(
        `Apify run ${runId} did not finish within ${timeoutMs}ms ` +
          `(last status ${run.status}; dataset ${run.defaultDatasetId})`
      );
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    run = await getRun(runId);
  }
  return run;
}

// Read every item from a dataset (token OPTIONAL). Paginates by offset; clean=true
// skips hidden/empty fields. 401/403 without a token → actionable error.
export async function getDatasetItems(datasetId: string): Promise<RawRedditItem[]> {
  const items: RawRedditItem[] = [];
  const limit = 1000;
  for (let offset = 0; ; offset += limit) {
    const url = `${API}/datasets/${datasetId}/items?clean=true&format=json&limit=${limit}&offset=${offset}`;
    const res = await fetch(url, { headers: authHeaders(false) });
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Apify dataset ${datasetId} not readable (${res.status}) — set APIFY_TOKEN for a private dataset`
      );
    }
    if (!res.ok) throw new Error(`Apify dataset read failed: ${res.status} ${await res.text()}`);
    const page = (await res.json()) as RawRedditItem[];
    items.push(...page);
    if (page.length < limit) break; // short page = last page
  }
  return items;
}
