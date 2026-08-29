// DeepAPI client for the mining battery (server-only). Raw fetch, no SDK.
// Protocol per the deepapi skill (pinned 2026-08-29): Bearer auth, Content-Type,
// per-POST Idempotency-Key, X-DeepAPI-Skill-Version — and `next`-polling: follow the
// GET /v1/requests/{id} action while it is present, EVEN when status is already
// "succeeded" (a settling run returns succeeded with output null and a polling next).
// Never auto-follow a POST next (dry-run execution / paid pagination).
import "server-only";

import { DEEPAPI_DEADLINE_MS, DEEPAPI_DEFAULT_POLL_SECS, DEEPAPI_SKILL_VERSION } from "./config";
import type { DeepApiEnvelope } from "./types";

export function hasDeepApiEnv(): boolean {
  return Boolean(process.env.DEEPAPI_API_BASE_URL && process.env.DEEPAPI_API_KEY);
}

function baseUrl(): string {
  const base = process.env.DEEPAPI_API_BASE_URL;
  if (!base) throw new Error("DEEPAPI_API_BASE_URL not set");
  return base.replace(/\/$/, "");
}

function headers(json: boolean, idemKey?: string): Record<string, string> {
  const key = process.env.DEEPAPI_API_KEY;
  if (!key) throw new Error("DEEPAPI_API_KEY not set");
  return {
    Authorization: `Bearer ${key}`,
    "X-DeepAPI-Skill-Version": DEEPAPI_SKILL_VERSION,
    ...(json ? { "content-type": "application/json" } : {}),
    ...(idemKey ? { "Idempotency-Key": idemKey } : {}),
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Carries the requestId so a failed run can still be recorded under its provider ref
// (mining_runs.dataset_id) and healed later via `--request <id>`.
export class DeepApiError extends Error {
  constructor(
    message: string,
    public readonly requestId: string | null
  ) {
    super(message);
    this.name = "DeepApiError";
  }
}

// Follow the polling `next` until the result is final or the deadline passes. On
// deadline the error names the requestId so `--request <id>` can recover the data
// (GET /v1/requests/{id} is free; the run itself keeps going server-side).
async function pollToFinal(
  env: DeepApiEnvelope,
  deadline: number,
  label: string
): Promise<DeepApiEnvelope> {
  let current = env;
  while (current.next?.method === "GET" && current.next.path && current.status !== "failed") {
    if (Date.now() > deadline) {
      throw new DeepApiError(
        `DeepAPI request ${current.requestId ?? "unknown"} (${label}) did not settle before the ` +
          `deadline (last status ${current.status}) — recover with --request ${current.requestId}`,
        current.requestId
      );
    }
    await sleep((current.next.afterSecs ?? DEEPAPI_DEFAULT_POLL_SECS) * 1000);
    const res = await fetch(`${baseUrl()}${current.next.path}`, { headers: headers(false) });
    current = (await res.json()) as DeepApiEnvelope;
  }
  return current;
}

// Start one scrape/search request and poll it to its final envelope.
export async function runScrape(
  path: string,
  body: Record<string, unknown>,
  idemKey: string,
  deadlineMs = DEEPAPI_DEADLINE_MS
): Promise<DeepApiEnvelope> {
  const deadline = Date.now() + deadlineMs;
  const res = await fetch(`${baseUrl()}${path}`, {
    method: "POST",
    headers: headers(true, idemKey),
    body: JSON.stringify(body),
  });
  const env = (await res.json()) as DeepApiEnvelope;
  if (!res.ok || env.status === "failed" || env.error) {
    throw new DeepApiError(
      `DeepAPI ${path} failed (${res.status}${env.requestId ? `, request ${env.requestId}` : ""}): ` +
        `${env.error?.code ?? ""} ${env.error?.message ?? "unknown error"}`,
      env.requestId
    );
  }
  const final = await pollToFinal(env, deadline, path);
  if (final.status === "failed" || final.error) {
    throw new DeepApiError(
      `DeepAPI request ${final.requestId ?? "unknown"} (${path}) ended failed: ` +
        `${final.error?.code ?? ""} ${final.error?.message ?? "unknown error"}`,
      final.requestId
    );
  }
  return final;
}

// Recovery path (D8): fetch a finished request's envelope by id — free.
export async function getRequest(requestId: string): Promise<DeepApiEnvelope> {
  const deadline = Date.now() + DEEPAPI_DEADLINE_MS;
  const res = await fetch(`${baseUrl()}/v1/requests/${requestId}`, { headers: headers(false) });
  if (!res.ok) throw new Error(`DeepAPI get request ${requestId} failed: ${res.status}`);
  const env = (await res.json()) as DeepApiEnvelope;
  return pollToFinal(env, deadline, `request ${requestId}`);
}
