// Google Search Console API client (server-only). Uses a service-account JWT to
// call the raw "Search Analytics: query" REST endpoint — no heavyweight googleapis
// package. Credentials come from GSC_SA_KEY (prod: the JSON key as a string) or
// GSC_SA_KEY_FILE (local: a path to the JSON key written by the setup script).
import "server-only";

import { readFileSync } from "node:fs";
import { JWT } from "google-auth-library";
import type { QueryRequest, SearchAnalyticsResponse } from "./types";

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

function loadCredentials(): { client_email: string; private_key: string } {
  let json = process.env.GSC_SA_KEY;
  if (!json && process.env.GSC_SA_KEY_FILE) {
    json = readFileSync(process.env.GSC_SA_KEY_FILE, "utf8");
  }
  if (!json) {
    throw new Error(
      "GSC credentials missing: set GSC_SA_KEY (prod JSON string) or GSC_SA_KEY_FILE (local path)"
    );
  }
  const parsed = JSON.parse(json) as { client_email?: string; private_key?: string };
  const client_email = parsed.client_email;
  // Keys pasted into env vars usually carry literal "\n" — restore real newlines.
  const private_key = parsed.private_key?.replace(/\\n/g, "\n");
  if (!client_email || !private_key) {
    throw new Error("GSC credentials malformed: client_email / private_key missing");
  }
  return { client_email, private_key };
}

let cached: JWT | null = null;
function getClient(): JWT {
  if (!cached) {
    const { client_email, private_key } = loadCredentials();
    cached = new JWT({ email: client_email, key: private_key, scopes: [SCOPE] });
  }
  return cached;
}

// Execute one Search Analytics query for a property. The JWT client injects and
// refreshes the OAuth access token itself.
export async function searchAnalyticsQuery(
  siteUrl: string,
  body: QueryRequest
): Promise<SearchAnalyticsResponse> {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    siteUrl
  )}/searchAnalytics/query`;
  const res = await getClient().request<SearchAnalyticsResponse>({
    url,
    method: "POST",
    data: body,
  });
  return res.data;
}
