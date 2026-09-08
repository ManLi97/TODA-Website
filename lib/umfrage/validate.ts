// Umfrage-Werkzeug — pure validation/parsing for the survey API (no I/O).
//
// Contract: the token IS the authorisation (12 × base62). Everything the client
// sends is untrusted; `parseSubmission` accepts the raw POST body and returns a
// normalised submission or a plain failure — the route maps that to 400.
// Verified by tests/umfrage-validate.test.ts (pnpm test).

export const TOKEN_RE = /^[A-Za-z0-9]{12}$/;
export const SLUG_RE = /^[a-z0-9-]{3,40}$/;

// Body caps (Richtwerte, see plan §3): raw body ≤ 16 KB, ≤ 40 answer keys,
// string values ≤ 4000 chars, array values ≤ 20 strings of ≤ 200 chars each.
export const MAX_BODY_BYTES = 16_384;
const MAX_NAME_CHARS = 80;
const MAX_ANSWER_KEYS = 40;
const MAX_STRING_CHARS = 4000;
const MAX_ARRAY_ITEMS = 20;
const MAX_ARRAY_ITEM_CHARS = 200;
const KEY_RE = /^[a-z0-9_]{1,40}$/;

export type Answers = Record<string, string | string[]>;

export type Submission = {
  slug: string;
  token: string;
  name: string | null;
  answers: Answers;
};

export type ParseResult = { ok: true; value: Submission } | { ok: false };

const FAIL: ParseResult = { ok: false };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parseAnswers(raw: unknown): Answers | null {
  if (!isPlainObject(raw)) return null;
  const keys = Object.keys(raw);
  if (keys.length > MAX_ANSWER_KEYS) return null;
  const answers: Answers = {};
  for (const key of keys) {
    if (!KEY_RE.test(key)) return null;
    const value = raw[key];
    if (typeof value === "string") {
      if (value.length > MAX_STRING_CHARS) return null;
      answers[key] = value;
    } else if (Array.isArray(value)) {
      if (value.length > MAX_ARRAY_ITEMS) return null;
      if (!value.every((v) => typeof v === "string" && v.length <= MAX_ARRAY_ITEM_CHARS))
        return null;
      answers[key] = value as string[];
    } else {
      return null;
    }
  }
  return answers;
}

export function parseSubmission(raw: string): ParseResult {
  if (typeof raw !== "string" || raw.length === 0 || Buffer.byteLength(raw) > MAX_BODY_BYTES) {
    return FAIL;
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return FAIL;
  }
  if (!isPlainObject(body)) return FAIL;

  const { slug, token, name } = body;
  if (typeof slug !== "string" || !SLUG_RE.test(slug)) return FAIL;
  if (typeof token !== "string" || !TOKEN_RE.test(token)) return FAIL;

  let displayName: string | null = null;
  if (name !== undefined && name !== null) {
    if (typeof name !== "string" || name.length > MAX_NAME_CHARS) return FAIL;
    displayName = name.trim() || null;
  }

  const answers = parseAnswers(body.answers);
  if (!answers) return FAIL;

  return { ok: true, value: { slug, token, name: displayName, answers } };
}
