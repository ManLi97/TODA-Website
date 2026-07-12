// Active-dwell accumulator — the "how long was the user actually engaged with
// this page?" measurement behind props.dwellMs on engagement events.
//
// Counts elapsed time only while BOTH conditions hold:
//   1. the tab is VISIBLE (Page Visibility) — a backgrounded/minimised tab never
//      counts;
//   2. the user is ACTIVE — any stretch longer than `idleMs` with no interaction
//      (mousemove/scroll/key/click/touch) is idle and does not count, so an open
//      but unattended foreground tab stops adding time.
//
// This replaces the old raw span (last event − first event), which counted idle
// and open-tab time and inflated "session duration" massively (a single parked
// tab read as ~35 min).
//
// Framework-free and clock-injected (`performance.now()` passed in): there is NO
// live setTimeout. Active time is derived from interaction timestamps at read
// time — each open span is capped at `lastActivity + idleMs`. That yields the
// exact same recorded value a pause-timer would (we only ever report once, at
// flush) while making the logic pure and deterministically unit-testable.

export type DwellTracker = {
  /** Record a qualifying interaction at monotonic time `t` (ms). */
  activity(t: number): void;
  /** Tab visibility changed at `t`: hidden banks the open span, visible resumes. */
  setVisible(visible: boolean, t: number): void;
  /** Total active milliseconds up to `t` (also closes the open span). */
  value(t: number): number;
};

export function createDwellTracker(
  idleMs: number,
  startVisible: boolean,
  t0: number
): DwellTracker {
  let activeMs = 0;
  let visible = startVisible;
  // Start of the currently-open active span, or null when paused (idle/hidden).
  // Entry counts as the first interaction, so a visible entry opens a span at t0.
  let activeSince: number | null = startVisible ? t0 : null;
  let lastActivityAt = t0;

  // Fold the open span into activeMs, ending at min(t, idle cap). Idempotent.
  function close(t: number): void {
    if (activeSince === null) return;
    const end = Math.min(t, lastActivityAt + idleMs);
    if (end > activeSince) activeMs += end - activeSince;
    activeSince = null;
  }

  return {
    activity(t: number): void {
      if (!visible) return; // interactions in a hidden tab don't count
      if (activeSince === null) {
        // Paused (hidden-at-entry, or just resumed) → this interaction opens a span.
        activeSince = t;
      } else if (t > lastActivityAt + idleMs) {
        // The previous span went idle before this interaction: bank it at the cap,
        // then open a fresh span at t (the idle gap in between is not counted).
        activeMs += lastActivityAt + idleMs - activeSince;
        activeSince = t;
      }
      lastActivityAt = t;
    },
    setVisible(next: boolean, t: number): void {
      if (next === visible) return;
      visible = next;
      if (next) {
        // Returning to the tab is itself activity → (re)open a span at t.
        activeSince = t;
        lastActivityAt = t;
      } else {
        close(t); // pause + bank up to the idle cap
      }
    },
    value(t: number): number {
      close(t);
      return activeMs;
    },
  };
}
