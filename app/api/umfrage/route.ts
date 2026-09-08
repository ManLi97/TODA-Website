// Umfrage-Werkzeug — token-gated survey API (no login, no cookies, no tracking).
//
// Contract (plan .claude/plans/umfrage-gratistermine.md §3):
//   GET  /api/umfrage?slug=<slug>&token=<token>
//        200 { ok:true, label, title, closesAt, closed, alreadyAnswered }
//   POST /api/umfrage  body { slug, token, name?, answers }  (raw body ≤ 16 KB)
//        200 { ok:true, updated }  — one row per participant, re-submit overwrites
//   400 bad_request · 404 unknown_token · 410 closed · 500 db_error
// The token IS the authorisation (12 × base62). Errors never reveal whether the
// slug or the token was wrong, and the API never returns stored answers.
// Tables have RLS on with zero policies — the service-role client is the only path.

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MAX_BODY_BYTES, SLUG_RE, TOKEN_RE, parseSubmission } from "@/lib/umfrage/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_USER_AGENT_CHARS = 400;

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
const fail = (error: string, status: number) => json({ ok: false, error }, status);

type Participant = {
  id: string;
  label: string;
  title: string;
  closesAt: string;
};

// Resolves (slug, token) to a participant. `null` = unknown slug, unknown token,
// or token belonging to another survey — all collapse to 404 upstream.
async function findParticipant(slug: string, token: string): Promise<Participant | null> {
  const { data, error } = await createAdminClient()
    .from("survey_participants")
    .select("id, label, surveys!inner(title, closes_at)")
    .eq("survey_slug", slug)
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const survey = data.surveys as unknown as { title: string; closes_at: string };
  return { id: data.id, label: data.label, title: survey.title, closesAt: survey.closes_at };
}

async function findResponseId(participantId: string): Promise<string | null> {
  const { data, error } = await createAdminClient()
    .from("survey_responses")
    .select("id")
    .eq("participant_id", participantId)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

const isClosed = (closesAt: string) => Date.now() > new Date(closesAt).getTime();

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") ?? "";
  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (!SLUG_RE.test(slug) || !TOKEN_RE.test(token)) return fail("bad_request", 400);

  try {
    const participant = await findParticipant(slug, token);
    if (!participant) return fail("unknown_token", 404);
    const responseId = await findResponseId(participant.id);
    return json({
      ok: true,
      label: participant.label,
      title: participant.title,
      closesAt: new Date(participant.closesAt).toISOString(),
      closed: isClosed(participant.closesAt),
      alreadyAnswered: responseId !== null,
    });
  } catch (err) {
    console.error("[umfrage] GET failed:", err);
    return fail("db_error", 500);
  }
}

export async function POST(request: NextRequest) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return fail("bad_request", 400);
  const raw = await request.text();
  const parsed = parseSubmission(raw);
  if (!parsed.ok) return fail("bad_request", 400);
  const { slug, token, name, answers } = parsed.value;

  try {
    const participant = await findParticipant(slug, token);
    if (!participant) return fail("unknown_token", 404);
    if (isClosed(participant.closesAt)) return fail("closed", 410);

    const userAgent = request.headers.get("user-agent")?.slice(0, MAX_USER_AGENT_CHARS) || null;
    const db = createAdminClient();
    const existingId = await findResponseId(participant.id);

    if (existingId) {
      const { error } = await db
        .from("survey_responses")
        .update({
          display_name: name,
          answers,
          user_agent: userAgent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingId);
      if (error) throw error;
      return json({ ok: true, updated: true });
    }

    const { error } = await db.from("survey_responses").insert({
      participant_id: participant.id,
      survey_slug: slug,
      display_name: name,
      answers,
      user_agent: userAgent,
    });
    if (error) throw error;
    return json({ ok: true, updated: false });
  } catch (err) {
    console.error("[umfrage] POST failed:", err);
    return fail("db_error", 500);
  }
}
