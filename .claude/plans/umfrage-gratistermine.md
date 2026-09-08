# Umfrage-Werkzeug + Umfrage „Gratistermine" — Detailplan (Repo: TODA-Website)

## Execution Brief

- **Zielpfad (in-repo):** `/Users/harvestflow/Developer/toda/TODA-Website/.claude/plans/umfrage-gratistermine.md`
- **Repo / Branch:** `/Users/harvestflow/Developer/toda/TODA-Website` (Package `toda-marketing-website`, Next.js 15 App Router, next-intl, pnpm, Node v24.19.0). Arbeit auf **`staging`** (am 08.09. clean verifiziert). Kein Push außer `git push origin staging` bei Grün; `main` und Deploy sind Tomek.
- **Vorbedingungen der Implementierer-Session:** (1) `.claude/skills/supabase/SKILL.md` DIESES Repos lesen + `skill:supabase-write-regime` laden, bevor die Migration geschrieben wird. (2) Supabase-MCP read-only gegen `znocynswpsfckyfumema` (Projekt `toda-company`, geteilte PROD-DB — es gibt keine Dev-Instanz). (3) `.env.local` existiert mit `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — nie lesen, nie ausgeben. (4) HTML-Vorlage liegt unter `~/Desktop/toda/TODA-Gratistermin-Umfrage.html` (Tomek-abgenommen 08.09.; in Chromium 390/1000 px verifiziert, 0 Fehler).
- **Ausführung:** Auto Mode. Agent autort Code, Migration, Script, Tests, Doku; Tomek exekutiert 🔴 `supabase db push`, 🔴 Probe-Purge, 🔴 Merge/Push/Deploy. Jeder Abschluss per `/commit`.
- **Modell:** Implementierer Fable 5.1, max effort (Festlegung Tomek 03.09.).

## §0 Plan-Fidelity (bindend)

- **Evidenz schlägt Plan.** Widerspricht die Repo-Realität einer Annahme hier, Realität fixen und die Abweichung im Abschlussbericht dokumentieren — nie stillschweigend umdeuten.
- **Bindend:** Scope (§1), Datenmodell (§2), API-Kontrakt (§3), Seiten-Verhalten und Copy (§4), Script-Verhalten (§5), Verifikations-Kette (§7), Stop-Regeln (🔴-Schritte nur Tomek). **Richtwert:** Größenlimits in §3/§4 (16 KB, 80 Zeichen), Dateinamen für Helper/Tests, Formulierung von Fehlermeldungen außerhalb der zitierten Copy.
- Jeden zitierten `file:line`-Anker vor Nutzung gegenprüfen (Stand 08.09.2026).
- Bekannter Doku-Widerspruch im Repo (NICHT editieren, nur im Bericht nennen): `CLAUDE.md:61-67` beschreibt noch den MCP-Schreibweg; `.claude/skills/supabase/SKILL.md:29-33` (CLI-Regime, `db push` durch Tomek) ist kanonisch. `SKILL.md:92` („the site never db-pushes") widerspricht `SKILL.md` §3 Schritt 3 — es gilt §3: Tomek pusht aus DIESEM Repo.

## §1 Kontext

Tomek will Produktentscheidungen von echten TODA-Usern treffen lassen. Erste Umfrage: drei Wege für „Gratistermine" (Beratung / Nachstechen), Vorlage bereits gebaut. Gebraucht wird eine Seite ohne Login unter `https://www.todasolutions.com/umfrage/gratistermine?p=<token>`, persönliche Links pro Teilnehmer, Antworten landen in der Firmen-DB, wo der Agent sie per read-only MCP liest (Entscheidung 08.09.: Option a, keine Ergebnis-UI). Das Werkzeug ist von Anfang an wiederverwendbar: neue Umfrage = neue HTML-Datei + eine Zeile in `surveys`.

**Nicht-Ziele:** keine Ergebnisansicht, kein Login, kein Tracking, kein Umbau bestehender Seiten, nichts im Repo toda-v2.

## §2 Datenmodell (Shared-DB, Owner toda-website) — bindend

Datei: `supabase/migrations/<UTC-ts>_umfrage_werkzeug.sql` (Timestamp via `date -u +%Y%m%d%H%M%S`; mit `db push` ist der Dateiname die Version). Posture wie `supabase/migrations/20260708162653_analytics_events.sql:39-40`: RLS an, NULL Policies, Zugriff nur per Service-Role.

```sql
-- OWNER: toda-website
-- Umfrage-Werkzeug: Umfragen, persönliche Teilnehmer-Links, Antworten (JSON).
-- RLS an, bewusst KEINE Policies — Schreib-/Lesezugriff ausschließlich per Service-Role (Route Handler, Scripts).

create table public.surveys (
  slug        text primary key check (slug ~ '^[a-z0-9-]{3,40}$'),
  title       text not null check (char_length(title) between 1 and 120),
  closes_at   timestamptz not null,
  created_at  timestamptz not null default now()
);

create table public.survey_participants (
  id           uuid primary key default gen_random_uuid(),
  survey_slug  text not null references public.surveys(slug) on delete cascade,
  token        text not null unique check (token ~ '^[A-Za-z0-9]{12}$'),
  label        text not null check (char_length(label) between 1 and 80),
  created_at   timestamptz not null default now(),
  unique (survey_slug, label)
);
create index survey_participants_survey_slug_idx on public.survey_participants (survey_slug);

create table public.survey_responses (
  id              uuid primary key default gen_random_uuid(),
  participant_id  uuid not null unique references public.survey_participants(id) on delete cascade,
  survey_slug     text not null references public.surveys(slug) on delete cascade,
  display_name    text check (display_name is null or char_length(display_name) <= 80),
  answers         jsonb not null check (jsonb_typeof(answers) = 'object' and pg_column_size(answers) <= 16384),
  user_agent      text check (user_agent is null or char_length(user_agent) <= 400),
  submitted_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index survey_responses_survey_slug_idx on public.survey_responses (survey_slug);

alter table public.surveys             enable row level security;
alter table public.survey_participants enable row level security;
alter table public.survey_responses    enable row level security;
revoke all on public.surveys, public.survey_participants, public.survey_responses from anon, authenticated;
```

Erwartete Advisors nach Apply: nur INFO `rls_enabled_no_policy` (3×) und ggf. `unused_index` (2×). Alles andere ist ein Befund.

**Migrations-Regime (SKILL.md §1/§3/§4, Tomek exekutiert):** Identity-Check (`get_project_url` + ein SELECT auf `analytics_events`) → Stub-Abgleich `supabase_migrations.schema_migrations` vs. `supabase/migrations/` (fehlende Fremd-Versionen als Kommentar-Stubs, Format wie `supabase/migrations/001_instagram_interactions.sql:1-3`) → Pre-Action-Report → 🔴 Tomek im separaten Terminal: `supabase db push --dry-run --linked` (muss GENAU diese Datei listen) → `supabase db push --linked` → Advisors → Read-back (`body_md5` per SKILL.md §3 Schritt 5) → Spiegel `/Users/harvestflow/Developer/toda/toda-company/supabase/migrations/<version>_umfrage_werkzeug.sql` (Header-Format SKILL.md §4, kein Trailing-Newline, `tail -n +3 | md5` = `body_md5`) → `toda-company/docs/db-ownership.md` Zeile 22 (toda-website-Zeile): 3 Tabellen + Version ergänzen, „Voll-Spiegel (N Dateien)" hochzählen → EIN Commit in toda-company (nur Spiegel + Doku, kein Push).

## §3 API-Kontrakt `app/api/umfrage/route.ts` — bindend

Muster: `app/api/collect/route.ts` (`runtime = "nodejs"` `:23`, manuelle Validierung, Body-Cap `:80`, `createAdminClient()` aus `lib/supabase/admin.ts:8`). Zusätzlich `export const dynamic = "force-dynamic"` (wie `app/api/cron/gsc-sync/route.ts:11-15`). Alle Antworten JSON mit `Cache-Control: no-store`. `/api/*` ist bereits vom intl-Matcher ausgenommen (`middleware.ts:24`).

**GET `/api/umfrage?slug=<slug>&token=<token>`** — Link-Prüfung beim Laden.
- 200 `{ ok: true, label, title, closesAt (ISO), closed: boolean, alreadyAnswered: boolean }`
- 404 `{ ok: false, error: "unknown_token" }` — Slug oder Token unbekannt, oder Token gehört zu anderem Slug
- 400 `{ ok: false, error: "bad_request" }` — Parameter fehlen / Format (Token `^[A-Za-z0-9]{12}$`, Slug `^[a-z0-9-]{3,40}$`)

**POST `/api/umfrage`** — Body JSON `{ slug, token, name?: string, answers: object }`, Rohbody max. 16 384 Bytes.
- 200 `{ ok: true, updated: boolean }` — Insert, oder Update auf bestehende Zeile des `participant_id` (answers, display_name, user_agent, `updated_at = now()`); `updated = true`, wenn es schon eine Antwort gab
- 400 `bad_request` — Body kein JSON-Objekt, `answers` kein Objekt (Richtwert: ≤ 40 Keys, Werte String ≤ 4000 Zeichen oder Array ≤ 20 Strings ≤ 200 Zeichen), Body > 16 KB, `name` > 80 Zeichen, Token/Slug-Format
- 404 `unknown_token` · 410 `closed` (`now() > closes_at`) · 500 `db_error` (serverseitig `console.error` ohne Body-Inhalt)

Sicherheit: Der Token IST die Berechtigung (12×base62 ≈ 71 Bit). Keine weitere Auth, kein Rate-Limit (bewusst: winziger Teilnehmerkreis, Token-gated, Body-Cap). Die API gibt nie Antwortinhalte nach außen; Fehler verraten nicht, ob Slug oder Token falsch war. `user_agent` auf 400 Zeichen gekürzt.

Reine Prüf-/Parse-Logik in `lib/umfrage/validate.ts` (`TOKEN_RE`, `SLUG_RE`, `parseSubmission(raw: string)` → `{ ok: true, value } | { ok: false }`), getestet in `tests/umfrage-validate.test.ts` mit `node:test` (Repo-Muster `tests/alternates.test.ts`; läuft über `pnpm test`).

## §4 Seite `/umfrage/<slug>` — Auslieferung + HTML-Änderungen — bindend

**Auslieferung (statisch, kein React):** HTML nach `public/umfrage/gratistermine.html`. Pretty-URL per `next.config.ts` `rewrites()` → `{ afterFiles: [{ source: "/umfrage/:slug([a-z0-9-]+)", destination: "/umfrage/:slug.html" }] }` (Next-Reihenfolge laut Doku: headers → redirects → Middleware → beforeFiles → statische Dateien → afterFiles; ein afterFiles-Rewrite, der auf eine public-Datei auflöst, wird ausgeliefert). **Pflicht:** `middleware.ts:24` Matcher um `umfrage` erweitern: `"/((?!_next|_vercel|admin|api|umfrage|.*\\..*).*)"` — sonst 308 nach `/de/umfrage/...`. Kommentar `middleware.ts:6-7` entsprechend ergänzen. `headers()` in `next.config.ts`: `X-Robots-Tag: noindex, nofollow` für `/umfrage/:path*`; `app/robots.ts:11` `disallow: ["/admin", "/umfrage"]`. Im HTML `<meta name="robots" content="noindex, nofollow">`.
Fallback nur falls der Rewrite die public-Datei NICHT ausliefert (Evidenz §7.3): Route Handler `app/umfrage/[slug]/route.ts`, der die Datei aus `content/umfragen/<slug>.html` liest, plus `outputFileTracingIncludes` in `next.config.ts` — dann Abweichung dokumentieren.

**Änderungen an der Vorlage** (`~/Desktop/toda/TODA-Gratistermin-Umfrage.html` → `public/umfrage/gratistermine.html`). Inhalt und Optik der Sektionen „So läuft es heute", „Drei mögliche Wege" und Fragen 1–8 bleiben UNVERÄNDERT; geändert wird nur der Formular-Abschluss:

1. **Kopier-Mechanik raus:** Button `#copy`, `#toast`-Kopiertexte, Textarea `#out` und die `build()`-Kopier-Logik entfernen.
2. **Token aus der URL:** `new URLSearchParams(location.search).get("p")`. Fehlt er oder passt er nicht auf `^[A-Za-z0-9]{12}$` → statt des Formulars eine Karte „Dieser Link ist nicht gültig. Bitte melde dich kurz bei Tomek." Der Erklärteil oben bleibt sichtbar.
3. **Link-Prüfung beim Laden:** GET §3. Bei 200: über dem Formular „Hallo {label}" und „Antworten bis {closesAt}" (deutsch, `Intl.DateTimeFormat("de-DE", { weekday: "short", day: "numeric", month: "long" })`). `alreadyAnswered` → Hinweis „Du hast schon geantwortet. Erneut absenden überschreibt deine Antwort." `closed` → Formular aus, Karte „Die Umfrage ist beendet. Danke!". 404/400 → Karte aus Punkt 2. Netzfehler → Karte „Verbindung fehlgeschlagen, bitte lade die Seite neu."
4. **Absenden:** Button „Antworten absenden". Pflicht: Frage 1 gewählt, sonst Hinweis am Button „Bitte wähle bei Frage 1 einen Weg." und kein Request. Body `{ slug: "gratistermine", token, name, answers }` mit `answers = { q1, q1_text, q2: [...], q3, q3_text, q4, q5, q6: [...], q7, q8 }` — leere Werte als `""` bzw. `[]`, nie „–". Button während des Sendens deaktiviert.
5. **Nach Erfolg:** Formular durch Karte ersetzen „Danke, {label}! Deine Antwort ist angekommen." 410 → Beendet-Karte; 404 → Ungültig-Karte; 400/500/Netz → Text unter dem Button „Hat nicht geklappt, bitte versuch es nochmal." — Eingaben bleiben erhalten.
6. **Fußzeile:** bestehender Satz bleibt, plus: „Wir speichern nur deine Antworten und den Namen, den du oben freiwillig angibst, ausschließlich für diese Produktentscheidung. Löschen lassen kannst du sie jederzeit über tom@todasolutions.com." plus Link „Datenschutz" auf `https://www.todasolutions.com/de/privacy` (Route `app/[locale]/privacy/page.tsx`).
7. Keine externen Ressourcen, kein Framework, kein Tracking. Seite muss auch ohne Token sauber rendern (Punkt 2).

## §5 CLI-Script `scripts/umfrage.ts` — bindend

`package.json`: `"umfrage": "tsx --conditions=react-server scripts/umfrage.ts"` (Muster der bestehenden Scripts, `--conditions=react-server` ist nötig wegen `import "server-only"` in `lib/supabase/admin.ts:4`). Env wie `scripts/blog-draft-insert.ts:16-20` (`process.loadEnvFile(".env.local")` in try/catch). Basis-URL aus `SITE_URL` (`lib/site.ts:9`, `https://www.todasolutions.com`). Schlüssel NIE ausgeben.

- `pnpm umfrage anlegen <slug> "<Titel>" <closes_at ISO, z. B. 2026-09-14T22:00:00+02:00>` — Insert in `surveys`; existiert der Slug: Bestand ausgeben, keine Änderung.
- `pnpm umfrage teilnehmer <slug> "Name 1" "Name 2" …` — je Label ein Teilnehmer mit Token (12 Zeichen, je `crypto.randomInt(0, 62)` → base62); existiert `(slug, label)`: bestehenden Link ausgeben (idempotent). Ausgabe je Zeile `Label → https://www.todasolutions.com/umfrage/<slug>?p=<token>`.
- `pnpm umfrage status <slug>` — Tabelle Label · geantwortet ja/nein · zuletzt (`updated_at`) · `display_name`. Keine Antwortinhalte.

Fehler (unbekannter Slug, ungültiges Datum, fehlende Env) beenden mit Exit 1 und klarer Meldung.

## §6 Änderungsliste

- `middleware.ts` (Matcher + Kommentar) · `next.config.ts` (`rewrites`, `headers`) · `app/robots.ts` (disallow)
- `public/umfrage/gratistermine.html` (neu, aus Vorlage + §4)
- `app/api/umfrage/route.ts` (neu) · `lib/umfrage/validate.ts` (neu) · `tests/umfrage-validate.test.ts` (neu)
- `scripts/umfrage.ts` (neu) · `package.json` (Script)
- `supabase/migrations/<ts>_umfrage_werkzeug.sql` (neu) + Stubs, falls der Abgleich Lücken zeigt
- toda-company: Spiegel-Migration + `docs/db-ownership.md` (Zeile 22, Spiegel-Zähler)
- Doku dieses Repos: `CLAUDE.md` Feature-Karte um einen 3-Zeilen-Eintrag „Umfrage-Werkzeug" (Route, API, Script, Tabellen) ergänzen; `.claude/skills/supabase/SKILL.md:20-25` (Liste repo-eigener Tabellen) um die 3 Tabellen ergänzen.

## §7 Verifikation — Evidenz-Kette — bindend

Probe-Umfrage Slug `probe` (closes_at +2 Tage), Teilnehmer „Probe-A", „Probe-B"; zweite Probe `probe-zu` mit `closes_at` in der Vergangenheit. Probe-Zeilen bleiben bis zur Abnahme (§8).

1. Nach 🔴 `db push`: MCP `select table_name, row_security from information_schema.tables where table_schema='public' and table_name like 'survey%'` → 3 Zeilen `YES`; `get_advisors` security → nur die INFO-Lints aus §2; `select grantee, table_name, privilege_type from information_schema.role_table_grants where table_name like 'survey%' and grantee in ('anon','authenticated')` → 0 Zeilen.
2. `pnpm umfrage anlegen probe "Probe" <ISO +2d>`, `pnpm umfrage teilnehmer probe "Probe-A" "Probe-B"` → 2 Links; zweiter Lauf gibt dieselben Links (Idempotenz). `pnpm umfrage anlegen probe-zu "Probe zu" 2026-01-01T00:00:00+01:00` + 1 Teilnehmer.
3. `pnpm dev`, curl-Kette (Status + Body prüfen):
   - `GET /umfrage/probe?p=<tokenA>` → 200, `content-type: text/html`, KEIN 308 (Matcher greift); `GET /umfrage/probe` ohne Token → 200 HTML; `GET /umfrage/gibtsnicht` → 404; `GET /` → 308 nach `/de` wie bisher (Regression).
   - `GET /api/umfrage?slug=probe&token=<tokenA>` → 200 `alreadyAnswered:false`; Token `AAAAAAAAAAAA` → 404; Token `kurz` → 400; Token von `probe-zu` → 200 `closed:true`.
   - `POST` gültig → 200 `updated:false`; MCP: genau 1 Zeile für Probe-A, `answers` = gesendetes Objekt. Erneut mit anderem `name` → 200 `updated:true`; MCP: weiterhin 1 Zeile, `updated_at > submitted_at`, `display_name` neu.
   - `POST` 20-KB-Body → 400; `answers: "x"` → 400; Token Probe-B mit `slug=gratistermine` → 404; `probe-zu` → 410.
4. Browser (Playwright headless, Chromium — wie bei der Vorlage; Playwright ist im Repo NICHT installiert → temporär über `npx playwright` oder das toda-v2-`node_modules` per Script im Scratchpad, nichts ins Repo aufnehmen): Seite mit Token → Begrüßung mit Label; Absenden ohne Frage 1 → Hinweis, kein Request; Frage 1 wählen + absenden → Danke-Karte; Reload → „schon geantwortet"; ohne Token → Ungültig-Karte; 390 px ohne horizontales Scrollen; 0 Konsolen-/Seitenfehler. Screenshots im Scratchpad.
5. `pnpm test` (neuer Test grün), `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm build`.
6. `/commit` auf `staging`; toda-company-Commit für Spiegel + Doku. Kein Push, kein Deploy durch den Agenten.

## §8 Handoff an Tomek (🔴, in dieser Reihenfolge)

1. `supabase db push --dry-run --linked` → `supabase db push --linked` (aus dem TODA-Website-Repo, separates Terminal) — nach dem Pre-Action-Report des Agenten.
2. Nach Abnahme: Probe-Purge per DML-One-off nach SKILL.md §5: `delete from public.surveys where slug in ('probe','probe-zu');` (kaskadiert auf Teilnehmer + Antworten); danach MCP-Nachweis 0 Zeilen mit `slug like 'probe%'`.
3. `staging` → `main` fast-forward, Push `main`, dann `vercel deploy --prod` aus clean `main` (CLAUDE.md:89-92). Post-Deploy: `curl -sI https://www.todasolutions.com/umfrage/gratistermine` → 200 + `x-robots-tag`; `curl -s "https://www.todasolutions.com/api/umfrage?slug=gratistermine&token=AAAAAAAAAAAA"` → 404; `https://www.todasolutions.com/de` weiterhin 200.
4. Echte Umfrage anlegen: `pnpm umfrage anlegen gratistermine "Gratistermine: Wie soll es für dich laufen?" <closes_at>` und `pnpm umfrage teilnehmer gratistermine "Alina" "Mana's Ink" "DanaInk" "KingzInk" "Bibi van H" …` → Links versenden. `pnpm umfrage status gratistermine` zeigt den Rücklauf.

## §9 Auswertung (Agent, read-only MCP, nach 2–3 Tagen)

```sql
select p.label, r.display_name, r.answers->>'q1' as weg, r.answers->'q2' as kanaele, r.answers->>'q3' as slot,
       r.answers->>'q4' as beratung_dauer, r.answers->>'q5' as anlass_sichtbar, r.answers->'q6' as bisher,
       r.answers->>'q7' as weitere_anlaesse, r.answers->>'q8' as sonstiges, r.updated_at
from public.survey_responses r join public.survey_participants p on p.id = r.participant_id
where r.survey_slug = 'gratistermine' order by r.updated_at;
```

## §10 Entscheidungen / Annahmen

- Statische HTML-Auslieferung statt React-Seite: die abgenommene Vorlage bleibt byte-nah erhalten, kein CSS-Bleed aus `globals.css`, neue Umfrage = neue Datei.
- Kein Rate-Limit, keine Captcha: Token-gated, winziger Kreis, Body-Cap; bei Missbrauch Token löschen.
- Ein Teilnehmer = eine Antwort, erneutes Absenden überschreibt (Tomek 08.09.).
- `closes_at` wird beim Anlegen gesetzt und von der Seite live angezeigt; kein Datum im HTML.
- Fehlende Playwright-Installation im Website-Repo wird nicht „behoben" — Browser-Evidenz läuft aus dem Scratchpad.
