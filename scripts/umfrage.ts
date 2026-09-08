// Umfrage-Werkzeug CLI (service role in-process, repo-owned tables only).
// Creates surveys, mints personal participant links, shows the response status.
// Never prints answers, never prints keys.
//
//   pnpm umfrage anlegen <slug> "<Titel>" <closes_at ISO, e.g. 2026-09-14T22:00:00+02:00>
//   pnpm umfrage teilnehmer <slug> "Name 1" "Name 2" …     (idempotent per (slug, label))
//   pnpm umfrage status <slug>
//
// Exit 1 with a clear message on unknown slug, invalid date, missing env.
import { randomInt } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/site";
import { SLUG_RE } from "@/lib/umfrage/validate";

try {
  process.loadEnvFile(".env.local");
} catch {
  // env already exported
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const TOKEN_LENGTH = 12;

function die(message: string): never {
  console.error(message);
  process.exit(1);
}

function mintToken(): string {
  let out = "";
  for (let i = 0; i < TOKEN_LENGTH; i++) out += ALPHABET[randomInt(0, ALPHABET.length)];
  return out;
}

const link = (slug: string, token: string) => `${SITE_URL}/umfrage/${slug}?p=${token}`;

function requireSlug(slug: string | undefined): string {
  if (!slug || !SLUG_RE.test(slug))
    die(`Ungültiger Slug "${slug ?? ""}" (erlaubt: ^[a-z0-9-]{3,40}$).`);
  return slug;
}

async function surveyExists(slug: string) {
  const { data, error } = await db
    .from("surveys")
    .select("slug, title, closes_at")
    .eq("slug", slug)
    .maybeSingle();
  if (error) die(`DB-Fehler: ${error.message}`);
  return data;
}

async function anlegen(slug: string, title: string | undefined, closesAt: string | undefined) {
  if (!title || title.length > 120) die("Titel fehlt oder ist länger als 120 Zeichen.");
  if (!closesAt || Number.isNaN(Date.parse(closesAt)))
    die(`Ungültiges Datum "${closesAt ?? ""}" (ISO 8601 erwartet).`);
  const existing = await surveyExists(slug);
  if (existing) {
    console.log(
      `Bestand (keine Änderung): ${existing.slug} · "${existing.title}" · schließt ${existing.closes_at}`
    );
    return;
  }
  const { data, error } = await db
    .from("surveys")
    .insert({ slug, title, closes_at: new Date(closesAt).toISOString() })
    .select("slug, title, closes_at")
    .single();
  if (error) die(`Insert fehlgeschlagen: ${error.message}`);
  console.log(`Angelegt: ${data.slug} · "${data.title}" · schließt ${data.closes_at}`);
}

async function teilnehmer(slug: string, labels: string[]) {
  if (labels.length === 0) die("Mindestens ein Teilnehmer-Name nötig.");
  if (!(await surveyExists(slug)))
    die(`Umfrage "${slug}" gibt es nicht — erst \`pnpm umfrage anlegen\`.`);
  for (const label of labels) {
    if (label.length === 0 || label.length > 80)
      die(`Name "${label}" muss 1–80 Zeichen lang sein.`);
    const { data: found, error: findError } = await db
      .from("survey_participants")
      .select("token")
      .eq("survey_slug", slug)
      .eq("label", label)
      .maybeSingle();
    if (findError) die(`DB-Fehler: ${findError.message}`);
    if (found) {
      console.log(`${label} → ${link(slug, found.token)}`);
      continue;
    }
    const { data, error } = await db
      .from("survey_participants")
      .insert({ survey_slug: slug, label, token: mintToken() })
      .select("token")
      .single();
    if (error) die(`Insert für "${label}" fehlgeschlagen: ${error.message}`);
    console.log(`${label} → ${link(slug, data.token)}`);
  }
}

async function status(slug: string) {
  const survey = await surveyExists(slug);
  if (!survey) die(`Umfrage "${slug}" gibt es nicht.`);
  const { data, error } = await db
    .from("survey_participants")
    .select("label, survey_responses(updated_at, display_name)")
    .eq("survey_slug", slug)
    .order("label");
  if (error) die(`DB-Fehler: ${error.message}`);
  const rows = (data ?? []).map((p) => {
    const r = (Array.isArray(p.survey_responses) ? p.survey_responses[0] : p.survey_responses) as {
      updated_at: string;
      display_name: string | null;
    } | null;
    return {
      Label: p.label,
      Geantwortet: r ? "ja" : "nein",
      Zuletzt: r ? r.updated_at : "",
      Name: r?.display_name ?? "",
    };
  });
  const answered = rows.filter((r) => r.Geantwortet === "ja").length;
  console.log(
    `${survey.slug} · "${survey.title}" · schließt ${survey.closes_at} · ${answered}/${rows.length} geantwortet`
  );
  if (rows.length) console.table(rows);
}

let db: ReturnType<typeof createAdminClient>;

async function main() {
  const [command, slugArg, ...rest] = process.argv.slice(2);
  if (!["anlegen", "teilnehmer", "status"].includes(command ?? "")) {
    die("Befehle: anlegen <slug> <Titel> <closes_at> · teilnehmer <slug> <Name…> · status <slug>");
  }
  const slug = requireSlug(slugArg);
  db = createAdminClient();
  if (command === "anlegen") await anlegen(slug, rest[0], rest[1]);
  else if (command === "teilnehmer") await teilnehmer(slug, rest);
  else await status(slug);
}

main().catch((err) => die(`Fehler: ${err instanceof Error ? err.message : String(err)}`));
