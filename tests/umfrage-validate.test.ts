import assert from "node:assert/strict";
import test from "node:test";
import { MAX_BODY_BYTES, SLUG_RE, TOKEN_RE, parseSubmission } from "../lib/umfrage/validate";

const TOKEN = "Ab3dEf6hIj9k";
const valid = (over: Record<string, unknown> = {}) =>
  JSON.stringify({
    slug: "probe",
    token: TOKEN,
    name: "Probe",
    answers: { q1: "A", q2: ["x"] },
    ...over,
  });

test("TOKEN_RE accepts exactly 12 base62 chars", () => {
  assert.ok(TOKEN_RE.test(TOKEN));
  assert.ok(!TOKEN_RE.test("kurz"));
  assert.ok(!TOKEN_RE.test("Ab3dEf6hIj9k1"));
  assert.ok(!TOKEN_RE.test("Ab3dEf6hIj9-"));
});

test("SLUG_RE accepts 3-40 lowercase/digits/hyphen", () => {
  assert.ok(SLUG_RE.test("gratistermine"));
  assert.ok(SLUG_RE.test("probe-zu"));
  assert.ok(!SLUG_RE.test("ab"));
  assert.ok(!SLUG_RE.test("Probe"));
  assert.ok(!SLUG_RE.test("a".repeat(41)));
});

test("parseSubmission accepts a valid body and normalises the name", () => {
  const r = parseSubmission(valid({ name: "  Probe A  " }));
  assert.ok(r.ok);
  assert.deepEqual(r.value, {
    slug: "probe",
    token: TOKEN,
    name: "Probe A",
    answers: { q1: "A", q2: ["x"] },
  });
});

test("parseSubmission treats missing/empty name as null", () => {
  const a = parseSubmission(valid({ name: undefined }));
  assert.ok(a.ok && a.value.name === null);
  const b = parseSubmission(valid({ name: "   " }));
  assert.ok(b.ok && b.value.name === null);
});

test("parseSubmission rejects malformed bodies", () => {
  assert.equal(parseSubmission("").ok, false);
  assert.equal(parseSubmission("not json").ok, false);
  assert.equal(parseSubmission("[]").ok, false);
  assert.equal(parseSubmission('"x"').ok, false);
  assert.equal(parseSubmission("x".repeat(MAX_BODY_BYTES + 1)).ok, false);
});

test("parseSubmission rejects bad slug/token/name", () => {
  assert.equal(parseSubmission(valid({ slug: "Probe" })).ok, false);
  assert.equal(parseSubmission(valid({ token: "kurz" })).ok, false);
  assert.equal(parseSubmission(valid({ name: "n".repeat(81) })).ok, false);
  assert.equal(parseSubmission(valid({ name: 42 })).ok, false);
});

test("parseSubmission rejects non-object or oversized answers", () => {
  assert.equal(parseSubmission(valid({ answers: "x" })).ok, false);
  assert.equal(parseSubmission(valid({ answers: ["x"] })).ok, false);
  assert.equal(parseSubmission(valid({ answers: undefined })).ok, false);
  assert.equal(parseSubmission(valid({ answers: { q1: 1 } })).ok, false);
  assert.equal(parseSubmission(valid({ answers: { q1: [1] } })).ok, false);
  assert.equal(parseSubmission(valid({ answers: { q1: { a: 1 } } })).ok, false);
  assert.equal(parseSubmission(valid({ answers: { "Q 1": "a" } })).ok, false);
  assert.equal(parseSubmission(valid({ answers: { q1: "x".repeat(4001) } })).ok, false);
  assert.equal(parseSubmission(valid({ answers: { q2: Array(21).fill("x") } })).ok, false);
  assert.equal(parseSubmission(valid({ answers: { q2: ["x".repeat(201)] } })).ok, false);
  const many = Object.fromEntries(Array.from({ length: 41 }, (_, i) => [`k${i}`, "v"]));
  assert.equal(parseSubmission(valid({ answers: many })).ok, false);
});

test("parseSubmission keeps empty strings and empty arrays as-is", () => {
  const r = parseSubmission(valid({ answers: { q1: "", q2: [] } }));
  assert.ok(r.ok);
  assert.deepEqual(r.value.answers, { q1: "", q2: [] });
});
