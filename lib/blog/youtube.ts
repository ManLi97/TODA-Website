// Pure helpers: turn a pasted YouTube reference into the canonical 11-char ID
// (+ any start offset carried in the URL). No I/O — kept out of the server action
// so it is unit-testable in isolation and reusable by the /podcast-article pipeline.

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

/** "90" | "90s" | "1m30s" | "1h2m3s" -> seconds; null if absent/unparseable. */
export function parseTimeParam(raw: string | null | undefined): number | null {
  if (!raw) return null;
  if (/^\d+$/.test(raw)) {
    const n = Number(raw);
    return n > 0 ? n : null;
  }
  const m = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!m || m[0] === "") return null;
  const total = Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
  return total > 0 ? total : null;
}

export interface ParsedYouTube {
  id: string | null;
  startFromUrl: number | null;
}

/**
 * Accepts a raw 11-char ID or a common YouTube URL (watch?v=, youtu.be/, /embed/,
 * /live/, /shorts/, m. and nocookie hosts) and returns the canonical ID plus any
 * t=/start= offset. Empty input -> {null, null}. Throws on a non-empty value that
 * yields no valid ID (loud failure at the boundary, matching translationFromForm).
 */
export function parseYouTubeInput(raw: string): ParsedYouTube {
  const value = raw.trim();
  if (!value) return { id: null, startFromUrl: null };
  if (VIDEO_ID.test(value)) return { id: value, startFromUrl: null };

  let id: string | null = null;
  let startFromUrl: number | null = null;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const seg = url.pathname.slice(1);
      if (VIDEO_ID.test(seg)) id = seg;
    } else if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const v = url.searchParams.get("v");
      if (v && VIDEO_ID.test(v)) {
        id = v;
      } else {
        const m = url.pathname.match(/\/(?:embed|live|shorts)\/([A-Za-z0-9_-]{11})/);
        if (m) id = m[1];
      }
    }
    startFromUrl = parseTimeParam(url.searchParams.get("start") ?? url.searchParams.get("t"));
  } catch {
    // not a URL — fall through to the throw
  }

  if (!id) throw new Error("Invalid YouTube URL or video ID");
  return { id, startFromUrl };
}
