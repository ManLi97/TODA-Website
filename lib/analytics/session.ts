// Cookieless per-visit session id, shared by both analytics beacons.
//
// Lives in sessionStorage (dies when the tab closes) so it groups ONE visit's
// pageview + engagement rows without any cookie and without cross-day identity.
// That is what unlocks bounce (a session with a single pageview) and session
// duration (max−min event time per id) — no consent banner required.
//
// Fallback: if sessionStorage is blocked (private mode, disabled storage), an
// in-memory id keeps a single document's beacons sharing one id; it just won't
// survive a full navigation. Shape matches the server guard ^[\w-]{8,64}$.
"use client";

const KEY = "toda_sid";
let memoryId: string | null = null;

function randomId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Non-secure / old context without crypto.randomUUID — good enough for a
    // throwaway per-visit id.
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function getSessionId(): string {
  if (memoryId) return memoryId;
  try {
    const existing = sessionStorage.getItem(KEY);
    if (existing) return (memoryId = existing);
    const id = randomId();
    sessionStorage.setItem(KEY, id);
    return (memoryId = id);
  } catch {
    // Storage blocked → in-memory only, scoped to this document.
    return (memoryId = memoryId ?? randomId());
  }
}
