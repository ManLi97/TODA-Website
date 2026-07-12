"use client";

// One engagement row per page-view: max scroll depth + active dwell time.
//
// Companion to <AnalyticsBeacon /> (which records the pageview). Together they
// answer Tomek's #1 question — "do readers reach the end of an article?" — plus
// bounce and active-time-on-page, all without a cookie: rows are grouped by the
// per-visit sessionStorage id (lib/analytics/session.ts).
//
// dwellMs = ACTIVE time only (tab visible AND user interacting), computed by the
// pure lib/analytics/dwell.ts accumulator. It is NOT the raw span between entry
// and leave — an idle or backgrounded tab must not inflate it. Interaction =
// scroll / mousemove / keydown / click / touchstart; idle after IDLE_MS.
//
// Exactly one row is emitted per page-view, on the FIRST terminal signal:
//   • tab hidden / closed / backgrounded → visibilitychange:hidden + pagehide
//   • client-side navigation to another path → the [pathname] effect flushes the
//     previous view before starting the next.
// A `sent` guard makes the first signal win; every later one is a no-op.
//
// Load-bearing subtleties (see the [pathname] effect):
//   • The previous view is flushed at the START of the next effect run, NEVER in
//     cleanup — a cleanup flush would emit a 0-dwell row on StrictMode's throwaway
//     unmount. A same-path re-run is treated as a remount and keeps its timing.
//   • The active view is held in a ref with its path captured at entry, so the
//     terminal handlers report the right path even after usePathname() moved on.
//   • Scroll depth uses the same math as reading-progress.tsx, but is NOT gated on
//     prefers-reduced-motion (that only hides the visual bar, not the measurement).
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getSessionId } from "@/lib/analytics/session";
import { createDwellTracker, type DwellTracker } from "@/lib/analytics/dwell";

// Interaction gap after which the user counts as idle and dwell stops accruing.
const IDLE_MS = 25_000;

type PageView = {
  path: string;
  dwell: DwellTracker; // active-time accumulator (visible + interacting only)
  maxScrollPct: number; // 0..100, high-water mark
  sent: boolean;
};

export function AnalyticsEngagement() {
  const pathname = usePathname();
  const view = useRef<PageView | null>(null);

  // Stable identities (useRef().current): the global listener effect attaches
  // these once and the [pathname] effect calls the very same functions.
  const measure = useRef(() => {
    const v = view.current;
    if (!v) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    // Nothing to scroll → the whole page is visible = fully read.
    const pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 100;
    if (pct > v.maxScrollPct) v.maxScrollPct = pct;
  }).current;

  // Any qualifying interaction keeps the active-dwell span alive (and resumes it
  // after an idle gap). Cheap: a few comparisons in the tracker, no timers.
  const bump = useRef(() => {
    view.current?.dwell.activity(performance.now());
  }).current;

  const flush = useRef(() => {
    const v = view.current;
    if (!v || v.sent) return;
    v.sent = true;
    // Final synchronous read before sending: requestAnimationFrame (the live
    // scroll tracker) is throttled/suspended in a backgrounded tab, so the last
    // scroll before leaving may never have been measured. measure() only raises
    // the high-water mark, so this can never lower a depth recorded while active.
    measure();
    const payload = JSON.stringify({
      event_type: "engagement",
      path: v.path,
      maxScrollPct: Math.round(v.maxScrollPct),
      dwellMs: Math.round(v.dwell.value(performance.now())),
      sessionId: getSessionId(),
    });
    try {
      navigator.sendBeacon("/api/collect", payload);
    } catch {
      // Best-effort — analytics never throws into the app.
    }
  }).current;

  // Global scroll + interaction + terminal-signal listeners — attached once for
  // the app's life.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
      bump(); // scrolling is an interaction
    };
    const onVisibility = () => {
      const visible = document.visibilityState === "visible";
      view.current?.dwell.setVisible(visible, performance.now());
      if (!visible) flush(); // leaving the tab is a terminal signal
    };
    const activityEvents = ["mousemove", "keydown", "click", "touchstart"] as const;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    activityEvents.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      activityEvents.forEach((e) => window.removeEventListener(e, bump));
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      cancelAnimationFrame(raf);
    };
  }, [flush, measure, bump]);

  // Per page-view lifecycle. Flushing the previous view happens HERE (start of
  // the next run), never in cleanup — see the header note on StrictMode.
  useEffect(() => {
    if (!pathname) return;
    const prev = view.current;
    // Same path still active → StrictMode remount / redundant render: keep timing.
    if (prev && prev.path === pathname && !prev.sent) return;
    // Real client-side navigation away from an unsent view → record it first.
    if (prev && !prev.sent) flush();
    const visible = document.visibilityState === "visible";
    view.current = {
      path: pathname,
      dwell: createDwellTracker(IDLE_MS, visible, performance.now()),
      maxScrollPct: 0,
      sent: false,
    };
    measure(); // seed depth so short pages register as fully read
  }, [pathname, flush, measure]);

  return null;
}
