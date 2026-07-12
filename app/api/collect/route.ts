// First-party, cookieless pageview ingest.
//
// Purpose: record ONE analytics_events row per real (non-bot) pageview, sent by
// the client beacon (components/analytics-beacon.tsx) via navigator.sendBeacon.
// No cookies, no raw IP is ever stored: the visitor is identified only by a
// daily-rotating salted hash, so there is nothing to consent to (no banner).
//
// Contract: POST /api/collect  — body is text/plain JSON (that's what sendBeacon
//   sends). Two event types share this route:
//     pageview   { path, referrer?, utm?{source,medium,campaign}, screen?, sessionId? }
//     engagement { event_type:"engagement", path, maxScrollPct, dwellMs, sessionId? }
//   `event_type` defaults to "pageview". The client sends flat values; the SERVER
//   is the only validator — it clamps ranges and builds the stored `props` blob.
//   → 204 No Content, ALWAYS. Analytics must never surface an error to the page,
//   so every failure path (bad body, bot, missing config, DB error) still 204s.

import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { isbot } from "isbot";
import { createAdminClient } from "@/lib/supabase/admin";

// node:crypto + service-role client need the Node.js runtime (not edge).
export const runtime = "nodejs";

const SALT = process.env.ANALYTICS_SALT;

const LOCALES = ["de", "es", "en"] as const;
// Only our own locale-prefixed site paths are accepted; everything else is dropped.
const PATH_RE = /^\/(de|es|en)(\/[\w\-./]*)?$/;

const noContent = () => new NextResponse(null, { status: 204 });

// Accepted event types (client-supplied `event_type`, default pageview).
const EVENT_TYPES = new Set(["pageview", "engagement"]);
// Per-visit session id shape (crypto.randomUUID / fallback), sessionStorage-scoped.
const SESSION_RE = /^[\w-]{8,64}$/;

// Coerce to an integer clamped to [min,max]; null when not a finite number.
function clampInt(v: unknown, min: number, max: number): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function deviceFromUA(ua: string): "mobile" | "tablet" | "desktop" {
  if (/\b(ipad|tablet|playbook|silk)\b/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua))) {
    return "tablet";
  }
  if (/\b(mobile|iphone|ipod|windows phone)\b/i.test(ua)) return "mobile";
  return "desktop";
}

// External acquisition source only. Same-site referrers (internal nav) and
// unparseable values collapse to null ("direct"). Search engines collapse to a
// clean engine name so google.de / google.com group together.
function referrerHost(referrer: unknown, selfHost: string): string | null {
  if (typeof referrer !== "string" || referrer === "") return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host === selfHost) return null;
    return host.match(/^(google|bing|duckduckgo|ecosia|yahoo)\./)?.[1] ?? host;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const ua = request.headers.get("user-agent") ?? "";
    if (!ua || isbot(ua)) return noContent(); // drop bots + empty-UA noise

    if (!SALT) {
      // Loud in logs (server misconfig) but never break the page or write a weak hash.
      console.error("[analytics] ANALYTICS_SALT is not set — skipping insert");
      return noContent();
    }

    // sendBeacon posts text/plain — parse manually, never trust the body.
    const raw = await request.text();
    if (!raw || raw.length > 4000) return noContent();
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw);
    } catch {
      return noContent();
    }

    const path = typeof body.path === "string" ? body.path.split(/[?#]/)[0] : "";
    if (!PATH_RE.test(path)) return noContent();

    const locale = LOCALES.find((l) => path === `/${l}` || path.startsWith(`/${l}/`)) ?? null;
    const rest = locale ? path.slice(locale.length + 1) : path; // path after '/<locale>'
    const isArticle = /^\/blog\/[^/]+$/.test(rest); // article, not listing/category

    // IP is used ONLY to compute the daily hash and is never stored.
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "";
    const utcDay = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC) → rotates daily
    const visitorHash = createHash("sha256")
      .update(`${utcDay}:${SALT}:${ip}:${ua}`)
      .digest("hex");

    const selfHost = (request.headers.get("host") ?? "").replace(/^www\./, "").split(":")[0];
    const utm = (body.utm ?? {}) as Record<string, unknown>;
    const str = (v: unknown, max: number) => (typeof v === "string" && v ? v.slice(0, max) : null);

    const eventType = EVENT_TYPES.has(body.event_type as string)
      ? (body.event_type as string)
      : "pageview";
    const sessionId =
      typeof body.sessionId === "string" && SESSION_RE.test(body.sessionId) ? body.sessionId : null;

    // props carries the type-specific payload; the server-derived columns (locale,
    // is_article, device, country, visitor_hash) describe BOTH types uniformly.
    const props =
      eventType === "engagement"
        ? {
            maxScrollPct: clampInt(body.maxScrollPct, 0, 100) ?? 0,
            dwellMs: clampInt(body.dwellMs, 0, 86_400_000) ?? 0,
            ...(sessionId ? { sessionId } : {}),
          }
        : {
            ...(body.screen ? { screen: str(body.screen, 24) } : {}),
            ...(sessionId ? { sessionId } : {}),
          };

    await createAdminClient()
      .from("analytics_events")
      .insert({
        event_type: eventType,
        path: path.slice(0, 512),
        locale,
        is_article: isArticle,
        referrer_host: referrerHost(body.referrer, selfHost),
        utm_source: str(utm.source, 120),
        utm_medium: str(utm.medium, 120),
        utm_campaign: str(utm.campaign, 120),
        country: request.headers.get("x-vercel-ip-country") || null,
        device: deviceFromUA(ua),
        visitor_hash: visitorHash,
        props,
      });

    return noContent();
  } catch (err) {
    console.error("[analytics] ingest failed:", err);
    return noContent();
  }
}
