"use client";

// Cookieless first-party pageview beacon. Fires once per navigation (initial load
// AND client-side route changes) and POSTs a minimal payload to /api/collect via
// navigator.sendBeacon (survives page unload). Renders nothing. No cookies, no
// client-side identity — the server derives a daily-rotating anonymous hash.
// usePathname comes from next/navigation (NOT @/i18n/navigation) so we get the
// real, locale-prefixed path (/de/blog/...); the intl wrapper strips the locale.
// See app/api/collect/route.ts for the ingest contract.
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getSessionId } from "@/lib/analytics/session";

export function AnalyticsBeacon() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    // Guard StrictMode's double-invoke (dev) and any same-path refire.
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    const params = new URLSearchParams(window.location.search);
    const source = params.get("utm_source") ?? undefined;
    const medium = params.get("utm_medium") ?? undefined;
    const campaign = params.get("utm_campaign") ?? undefined;

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || undefined,
      utm: source || medium || campaign ? { source, medium, campaign } : undefined,
      screen: `${window.screen.width}x${window.screen.height}`,
      sessionId: getSessionId(),
    });

    try {
      navigator.sendBeacon("/api/collect", payload);
    } catch {
      // Best-effort — analytics never throws into the app.
    }
  }, [pathname]);

  return null;
}
