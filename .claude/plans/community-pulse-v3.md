# Community-Puls v3: Wochen-Delta + LLM-Verdichtung + Wochen-Digest in der Shared DB

## §0 Plan-Fidelity (bindend)

- **Evidence beats plan.** Widerspricht die Realität einer Plan-Annahme (API-Shape, Anker,
  Constraint-Name, Cron-Limit …): Realität fixen, Abweichung im Abschlussprotokoll dokumentieren,
  nie stillschweigend umdeuten.
- **Bindend:** Scope, die drei Schichten (Erhebung → Verdichtung → Digest), „nur Neues"-Semantik,
  Whitelist-/Privacy-Regel (nie Autor-/Kommentator-Identitäten, Zitate anonymisiert), append-only,
  Migrations-Disziplin (CLI-Regime, Tomek applyt), Kadenz Mo 06:00 UTC, Review-Umfang = nur die 5
  profilierten Mitbewerber, Budget-Stopp im Testlauf-Loop bei 40 $ kumuliert, „nie publizieren".
- **Richtwert:** exakte Query-Strings, maxItems/maxCostUsd-Zahlen, Prompt-Wortlaut, Modul-/
  Spaltennamen, Timeouts, Schwellen der Qualitäts-Rubrik — bei besserem Wissen anpassen und
  dokumentieren.
- Jeden `file:line`-Anker vor Benutzung gegenprüfen (Stand 06.09.2026).
- **Raw-API-Feldnamen NIE raten:** vor jedem neuen Mapper `GET /v1/capabilities?capability=<slug>`
  + 1 `dryRun`-Call (frei); SerpApi-Antwortfelder gegen die SerpApi-Doku (Context7 oder Live-Call);
  Apple-Feed + Play-Scraper-Felder sind unten aus Live-Calls (06.09.) festgehalten.
- **Kostenregel jedes bezahlten Laufs:** erst `--dry-cost` (dryRun aller Specs, Summe der Holds),
  dann Lauf, danach `GET /v1/balance` (frei) → Delta ins Spend-Ledger.

## Execution Brief

- **Ziel-Pfad dieses Plans:** `.claude/plans/community-pulse-v3.md` (TODA-Website).
- **Kickoff:** frische Session in `/Users/harvestflow/Developer/toda/TODA-Website`, Auto Mode.
- **Preconditions (verifizieren, nie annehmen):**
  1. Git: `git status` clean, Branch `staging` (main nimmt nie direkte Commits).
  2. Env-NAMEN vorhanden (`grep -c '^VAR=' .env.local`, Werte nie lesen): `NEXT_PUBLIC_SUPABASE_URL`,
     `SUPABASE_SERVICE_ROLE_KEY`, `DEEPAPI_API_BASE_URL`, `DEEPAPI_API_KEY` (oder
     `source ~/.deepapi/env` — `DEEPAPI_API_BASE_URL` steht NICHT in `.env.local`, die CLI braucht
     das Sourcing in der Shell), `YOUTUBE_API_KEY`, `SERP_API_KEY`, `ANTHROPIC_API_KEY` (Tomek hat ihn
     am 06.09. in `.env.local` und in Vercel Production angelegt + redeployed; lokal verifiziert:
     Name vorhanden). `CRON_SECRET` ist lokal nicht gesetzt (für CLI-Läufe nicht nötig; Routen-Test
     lokal mit einem temporären Wert in der Shell).
  3. Skills laden: `skill:deepapi` vor dem ersten DeepAPI-Call; `skill:supabase-write-regime` +
     `/supabase` (Repo) vor der Migration; `skill:claude-api` vor dem ersten Anthropic-SDK-Code
     (TypeScript-README + `tool-use.md` → Structured Outputs); `supabase:supabase-postgres-best-practices`
     vor dem Schreiben der Migration.
  4. `toda-company` existiert: `/Users/harvestflow/Developer/toda/toda-company` (Migrations-Spiegel
     byte-identisch + `docs/db-ownership.md`).
  5. DeepAPI-Guthaben: Tomek hat aufgeladen + Auto-Charge (06.09.). `GET /v1/balance` vor Start
     notieren (Spend-Ledger Startwert; Stand 06.09. 20:40: 45,84 $, Recherche-Spend ≈ 2,80 $ von 40 $).
- **Ausführung:** A → B → C → D → E (Testlauf-Loop) → F. Nach jedem verifizierten Workstream
  `/commit` (nie bare `git commit`). Kein Push außer `git push origin staging` (grün).
  Vercel-Env + Deploy = 🔴-Schlussblock mit Tomek.
- **Begleitdateien (im Repo, neben diesem Plan):** `.claude/plans/community-pulse-v3/facts.md`
  (alle verifizierten Fakten der Planungs-Session: DB-Stand, DeepAPI-Kontrakte, Review-Pfade,
  Marketing-Regeln), `quality-rubrik.md` (Rubrik des Testlauf-Loops), `spend.md` (Spend-Ledger,
  fortschreiben).
- **Spend-Ledger** (Pflicht, `.claude/plans/community-pulse-v3/spend.md`):
  jede bezahlte Aktion mit DeepAPI-Delta (`/v1/balance` vorher/nachher) + Anthropic-Tokens × Preis
  (Opus 5: 5 $/M in, 25 $/M out). **Bei 40 $ kumuliert (inkl. der ≈ 2,80 $ Recherche): STOPP,
  Bericht, Empfehlung — nie selbständig weiter.**

## Kontext (verifiziert 06.09.2026)

Pipeline v2 (29.08.) läuft technisch sauber (Cron 31.08.: 23/23 Slots succeeded, 640 Zeilen,
Coverage 100 %), liefert aber keine nutzbare Grundlage:

1. **Scoring hat nie gescored:** 3626 Signale seit 28.08., 60 klassifiziert (alle `cluster NULL`),
   Score-View leer. Der manuelle Klassifikationsschritt der Skills fand nie statt.
2. **Kein Wochen-Delta:** Anteil neuer `external_id`s 29.08.→31.08.: tiktok-comments 2 %,
   yt-channels 2 %, reddit-broad 6 %, yt-search 11 %, web 24 %, ig-hashtags 41 %, yt-comments 44 %,
   tiktok-search 50 %. Feste Video-Listen + Suchen ohne Zeitfilter = statischer Re-Scrape.
3. **DACH-Signal sitzt in den nicht-scorebaren Quellen:** yt-comments 95 % DE, tiktok-comments
   53–100 %, web 63–100 %, ig-hashtags 47–82 % (alle `engagement NULL`); die gescorten Quellen:
   reddit 3 % DE, yt-channels 2 %.

**Entscheidungen Tomek (06.09.):** (1) Reviews nur für die 5 profilierten Mitbewerber (inckd,
Tattoodo, Taddoo, MyInkConnect, STYNG); Liste wächst auf Zuruf. (2) Claude-Verdichtung in der
Pipeline: ja. (3) FB-Gruppen + IG-Accounts per Recherche kuratiert (Listen unten). (4) Guthaben
aufgeladen, Auto-Charge. Kosten sind kein Kriterium; Qualität, keine Duplikat-Scrapes, nichts ins
Leere. Nach dem Aufbau: Testlauf → Qualitäts-Scoring → Anpassen → Loop, Budget 40 $ gesamt.
Konsumenten: `/blog-article` (primär), Posting (Marketing-Repo, ersetzt den Legacy-Skill
`/community-voices`), Clip-Auswahl Route B, künftige Skills in anderen Repos — alle lesen die DB.

**Baukasten-Regeln, die die Pipeline einhalten muss:** Mitbewerber werden nie herabgesetzt
(`marketing/language/writing-rules.md` L9); Review-Schmerzpunkte tauchen nur unattribuiert auf
(`marketing/strategy/claims.md` L21). ICP = Solo-Artists (`marketing/brand/positioning.md` L7–25);
Endkunde ist „immer im Raum", kein zweiter ICP → `audience`-Feld statt binärem Gate.

## Design-Kern (bindend)

- **D1 Drei Schichten, eine DB.** Erhebung (`mining_runs`/`topic_signals`) → Verdichtung
  (`topic_classifications`, erweitert; je Zeile durch Claude) → Digest (`pulse_digests`, je ISO-Woche).
  Skills werden dünne Leser: Digest zuerst, Zeilen nur zum Belegen.
- **D2 „Nur Neues".** Jeder Slot nutzt den Zeitfilter der API, wo er existiert (`since: week`);
  wo keiner existiert (IG-Hashtag, FB-Gruppen, Kommentare, Reviews, Web) filtert der Ingest
  Items heraus, deren `(platform, external_id)` bereits in `topic_signals` liegt (beliebiger Run).
  Ein Run mit Roh-Items > 0 und 0 neuen Zeilen ist **succeeded** (`post_count 0`, `error NULL`),
  nicht failed (heute: „no mappable items" → failed, `lib/mining/sync.ts:151–156`).
  Dedupe-Abfrage **per Kandidaten-IDs**, nie per Tabellen-Scan: `select external_id from
  topic_signals where platform = $p and external_id = any($ids)` in Chunks à 100 (PostgREST-Zeilencap
  ~1000 + `statement_timeout` 8 s auf Service-Role-Requests, verifiziert 06.09.).
  Ausnahme: Referenz-Kanäle (`yt-channels`) bleiben Snapshot-Zeilen je Run (Views-Zeitreihe,
  Median-Basis) — dort ist Wiederholung Absicht.
- **D3 Dynamische Kommentar-Ziele statt fester Listen.** Je Plattform (YouTube, TikTok, Instagram,
  Reddit) werden die Kommentar-Ziele der Woche aus den Suchtreffern/Posts der Woche gewählt:
  deutschsprachig (GERMAN_HINT auf Titel/Text), meiste Kommentare, Referenzkanäle ausgeschlossen,
  Top N je Plattform. `TIKTOK_COMMENT_VIDEOS`/`YT_COMMENT_VIDEOS` entfallen.
- **D4 Engagement für alle Zeilen.** Je Plattform eine feste Formel (unten), `engagement` non-NULL
  für jede Zeile außer Web/SERP-Treffern und Reviews (dort `metrics.rating`). Die bestehende View
  `topic_cluster_scores` (per-(run,source)-Median, Outlier-Ratio, Σ) bleibt **unverändert** und wird
  dadurch für alle Quellen aktiv. `is_seeded` bleibt false für Batterie-Zeilen.
- **D5 Verdichtung = LLM-Klassifikation je Zeile** (Claude Opus 5, Structured Outputs, Batch von
  ~25 Zeilen je Call): `language`, `audience` (artist|endkunde|mixed|off_topic), `is_discussion`,
  `cluster` (Registry-Slug oder NULL) + `cluster_proposal` (Freitext nur, wenn kein Slug passt),
  `signal_type` (question|complaint|wish|praise|experience|news|promo|other), `quote`
  (≤ 280 Z., wörtlich aus Titel/Body, anonymisiert: keine Namen/Handles/Studios), `question`
  (normalisierte Frage, nur bei signal_type question), `feature` (nur Reviews), `confidence`.
  Schreibt `topic_classifications` mit `on conflict (run_id, external_id) do nothing` +
  `classified_by='llm'`, `model`, `prompt_version`. Skills dürfen Zeilen bewusst überschreiben
  (`update ... where classified_by='llm'`), der Cron nie.
- **D6 Digest je ISO-Woche** (`pulse_digests`): SQL-Aggregate (Cluster mit n/Quellen/Score/Delta zu
  den 4 Vorwochen, Signal-Typ-Verteilung, Top-Fragen, Top-Beschwerden/-Wünsche/-Lob, Top-Videos
  mit x-Ratio, Review-Feedback je Feature, Erstanbieter-Signale: TODAs IG-Kommentare
  (`instagram_interactions`, ohne `username`), `post_insights`-Top-Posts, GSC-Top-Queries) → eine
  Claude-Synthese (Opus 5, effort high) → `digest jsonb` (Schema unten) + `digest_md`.
  Upsert on `iso_week`. Der Digest nennt nie Mitbewerber-Namen neben Beschwerden.
- **D7 Privacy unverändert + Zitate.** Whitelist-Typen aus Live-Kontrakten; `body` behält die
  30-Tage-TTL; das LLM-`quote` (Kurzauszug, anonymisiert) bleibt dauerhaft — es ist das, was
  Content später ohnehin nutzt. Kommentator-/Reviewer-Identitäten strukturell unerreichbar
  (Apple `author`, Play `userName`/`userImage`, IG `author`, FB `author{id,name}` nie deklarieren).
- **D8 Idempotenz v3.** Idempotency-Key `toda-mining:v3:{isoWeek}:{slot}` (Versions-Präfix, damit
  ein Test im selben ISO-Week nicht auf den v2-Cron-Replay trifft). Provider-Refs:
  DeepAPI-`requestId` | `ytapi:{isoWeek}:comments:{videoId}` | `apple:{isoWeek}:{appId}:{storefront}`
  | `gplay:{isoWeek}:{packageId}` | `serpapi:{isoWeek}:{engine}:{slug}`. `--fresh` salzt weiter.
- **D9 Laufzeit-Kette als Job-Schritte mit Lock (bindend im Prinzip, Richtwert im Detail).**
  Vercel erlaubt 100 Crons je Projekt auf jedem Plan, Hobby aber nur Tages-Präzision mit ±59 min
  Jitter und ohne Retry (verifiziert 06.09.) → Folge-Schritte laufen NICHT als weitere Crons, sondern
  als **selbst-getriggerte Kette** über eine Worker-Route `/api/cron/pulse-worker?step=<step>`:
  `mining-sync` (Cron, Phase 1 = Batterie + Reviews + SerpApi, ≤ 300 s) → `comments` (Phase 2:
  Kommentar-Ziele aus den Phase-1-Zeilen der Woche in der DB, DeepAPI + Data API) → `enrich`
  (offene Zeilen ≤ 240 s, ruft sich selbst erneut, solange offen) → `digest` (wenn 0 offen und
  Wochen-Digest fehlt). Jede Route antwortet sofort 202 und arbeitet in `after()` (`next/server`,
  stabil in 15.5); der Trigger des nächsten Schritts ist ein **awaited** `fetch` mit
  `AbortSignal.timeout(5000)` und `Authorization: Bearer CRON_SECRET`; Basis-URL
  `https://${VERCEL_PROJECT_PRODUCTION_URL}` (ohne Schema geliefert; „System Environment Variables"
  im Projekt aktiviert — prüfen), Fallback Request-Origin. **Lock/Observability:** Tabelle
  `pulse_jobs (iso_week, step, status running|succeeded|failed, started_at, finished_at, attempts,
  result jsonb)` mit UNIQUE (iso_week, step); ein Schritt startet nur, wenn kein `running`-Eintrag
  jünger als 15 min existiert (Vercel kann Crons doppelt/gar nicht feuern) — verhindert doppelte
  Anthropic-Ausgaben. Alle Schritte auch per CLI (`--comments`, `--enrich`, `--digest`), gleiche
  Lock-Regel. `--source yt-comments` (heute: Phase 2 mit Fix-Liste, `sync.ts:288`) bekommt v3-
  Semantik: Phase 2 aus DB-Zielen — im CLI-Header dokumentieren.

### Engagement-Formeln (D4, Richtwert)

| Plattform / Art | engagement | metrics (Rohzahlen) |
|---|---|---|
| reddit post | score + 2·comments | score, upvoteRatio, comments |
| reddit comment | score | score, depth |
| youtube video (search/channel) | views | views, comments |
| youtube comment (Data API) | likes + 2·replies | likes, replies |
| tiktok video | plays/100 + likes + 2·comments + 3·shares | plays, likes, comments, shares, bookmarks |
| tiktok comment | likes + 2·replies | likes, replies |
| instagram post | likes + 2·comments (+ views/100 bei Video) | likes, comments, views |
| instagram comment | likes + 2·replies | likes, replies |
| facebook group post | reactions + 2·comments + 3·shares | reactions, comments, shares |
| review (apple/play/trustpilot) | NULL | rating, votes/thumbsUp, version |
| web / serp | NULL | dateText; trend_value / paa_position |

## Batterie v3 (Richtwert; `lib/mining/config.ts` bleibt Quelle der Wahrheit)

| Slot (source_key) | Endpoint / Quelle | Body-Kern | Neu-Semantik |
|---|---|---|---|
| `yt-search/*` (5 Queries wie heute) | `/v1/scrape/youtube/search` | `since:"week"`, `sort:"date"`, `maxItems:20`, `maxCostUsd` ≥ 20×0.025 | API-Filter |
| `yt-channels` | `/v1/scrape/youtube/channel` | `channels:[@inkarea,@honesttattooerpodcast]`, `since:"month"`, `maxItems:30` | Snapshot (Median-Basis) |
| `yt-comments` (dyn.) | YouTube Data API `commentThreads` | Top 5 DE-Videos der Woche nach comments; `order=relevance`, 100 | Ingest-Dedupe |
| `reddit-search/de`, `reddit-search/en` | `/v1/scrape/reddit/search` | de: `query:["Tätowierer","Tattoo Studio","tätowieren lernen"]`, en: `query:["tattoo artist","tattoo shop"]`, `since:"week"`, `sort:"new"`, `maxItems:40` | API-Filter |
| `reddit-broad` | `/v1/scrape/reddit/posts` | `subreddits:["TattooArtists"]`, `sort:"top"`, `since:"week"`, `maxItems:40` | API-Filter |
| `reddit-comments/{postId}` (dyn.) | `/v1/scrape/reddit/comments` | Top 3 Diskussions-Threads der Woche, `maxItems:40`, `depth` ≤ 1 | Ingest-Dedupe |
| `ig-hashtags/*` (3 wie heute) | `/v1/scrape/instagram/hashtag` | `maxItems:17` je Hashtag (max 50 gesamt) | Ingest-Dedupe + `postedAt` ≥ 14 Tage |
| `ig-accounts` | `/v1/scrape/instagram/posts` | `usernames:[…Liste unten…]`, `since:"week"`, `maxItems:6` je Profil | API-Filter |
| `ig-comments/{postId}` (dyn.) | `/v1/scrape/instagram/comments` | Top 5 DE-Posts der Woche (Hashtag+Accounts) nach comments, `maxItems:30` | Ingest-Dedupe |
| `tiktok-search/*` (2 wie heute) | `/v1/scrape/tiktok/search` | `since:"week"`, `sort:"latest"`, `maxItems:30`, `maxCostUsd` ≥ 30×0.01 (Default-Cap 0.10 = 10 Videos!) | API-Filter |
| `tiktok-comments/{videoId}` (dyn.) | `/v1/scrape/tiktok/comments` | Top 5 DE-Videos der Woche nach comments, `maxItems:30`, `maxCostUsd` ≥ 30×0.004 | Ingest-Dedupe |
| `fb-groups/{slug}` | `/v1/scrape/facebook/groups` | je Gruppe 1 Request, `maxItems:20` | Ingest-Dedupe |
| `web/*` (5 wie heute) | `/v1/search/web` | `maxResults:10` | Ingest-Dedupe (`web:{sha}`) |
| `reviews/apple/{appId}/{sf}` | Apple RSS (frei) `itunes.apple.com/{sf}/rss/customerreviews/id={id}/sortBy=mostRecent/json` | Storefronts de,at,ch,gb,us | Ingest-Dedupe (review id) |
| `reviews/play/{pkg}` | npm `google-play-scraper` `reviews({appId, lang:'de', country:'de', sort:NEWEST, num:40})` | + `country:'at'`/`'ch'` optional | Ingest-Dedupe |
| `reviews/trustpilot/tattoodo` | `/v1/scrape/extract` (Schema: reviews[{id,rating,title,text,date}]) auf `de.trustpilot.com/review/tattoodo.com` (+`?sort=recency`) | 1 URL; bei `source_blocked` → `/v1/browser/act`, dokumentieren | Ingest-Dedupe |
| `serp/trends/{seed}` | SerpApi `google_trends` (`geo:DE`, `date:"now 7-d"`, `data_type:RELATED_QUERIES`) | seeds: Tattoo, Tätowierer, Tattoo Studio | Wochen-Snapshot (rising queries) |
| `serp/paa/{slug}` | SerpApi `google` (`hl:de`, `gl:de`, `google_domain:google.de`) → `related_questions` | 5 DE-Queries (Tattoo Preise, Tätowierer werden, Tattoo Anzahlung, Tattoo Termin absagen, Tattoo Studio eröffnen) | Ingest-Dedupe (Fragetext-Hash) |

Review-Ziele (`REVIEW_TARGETS`, Code): inckd iOS 1526690381 / Play com.inckd.tattoo; Tattoodo iOS
1057590314 + 6444658839 / Play com.tattoodo.app + com.tattoodo.business; Taddoo iOS 6781711821 /
Play com.tattoomii.artist; STYNG Play com.styng.artattoo (404 → failed-Row sichtbar, ok);
MyInkConnect: keine App, kein Review-Portal → Eintrag mit leerer Quellenliste (bewusst dokumentiert).
Verifiziert 06.09. (frei): Apple-Feed tattoodo/de 16 Einträge, inckd/gb 28 (jüngste 1★ 2026-08-19),
inckd/ch 3, taddoo überall 0 (leer = frei); Play (`google-play-scraper` 10.1.3, Scratchpad-Test):
taddoo 1, inckd 10, tattoodo 10 + Pagination, alle DE.

Kuratierte Listen (aus den Recherchen 06.09.):
- `FB_GROUPS` (verifiziert 06.09., 19 Gruppen geprüft, 13 lesbar; alle deutschen „nur für Tätowierer"-Gruppen
  sind privat → öffentliche Gruppen liefern Job-/Guest-Spot-/Marktplatz-Transaktionen plus vereinzelte
  Meinungsposts; Wert im Loop messen, Slots ohne Nutzen streichen):
  1. `https://www.facebook.com/groups/533789960065520/` Tattoo Circle Schweiz (DE, Meinungs- + Marktsignal, maxItems 20)
  2. `https://www.facebook.com/groups/764337886989060/` Tattoo Artist`s Job-Börse B (DE/EN, maxItems 20)
  3. `https://www.facebook.com/groups/1381734435465160/` Tattoo Artist`s Job-Börse A (EN/DE, DE-Filter, maxItems 20)
  4. `https://www.facebook.com/groups/945174772295241/` Tattoobedarf für Tätowierer (DE, artist-only, maxItems 5)
  5. `https://www.facebook.com/groups/256111117762857/` Tattoo and Piercing Job Forum (EN/DE, DE-Filter, maxItems 20)
  Mapper-Regeln: `author{id,name}` nie deklarieren; Posts ohne Text verwerfen (~30 %); Text-Hash-Dedupe über
  Gruppen (Cross-Posting); zwei Läufe in Folge `listState no_results` → Gruppe als „privat geworden" melden.
  Nicht erreichbar: Verbände/Fachpresse (BVT, DOT, feelfarbig, Tattoo Spirit) betreiben nur Pages → kein Endpoint.
- `IG_ACCOUNTS` (verifiziert 06.09., 37 Profile geprüft, 18 gescrapt; alle öffentlich; realistisch liefern
  ~5 Accounts wöchentlich Diskussion — Instagram-Puls ist caption-geführt mit dünner Kommentar-Schicht):
  `bundesverbandtattoo` (BVT, Verbandspolitik) · `tattoozertifikate` (Kampagne, beste Kommentarqualität) ·
  `feelfarbig` (Fachmagazin, Meinungsposts) · `augen_zu_und_durch_podcast` (DE-Podcast) ·
  `talesfromtheneedle` (DE-Podcast, tägliche Clips) · `frecher_franz` (Coaching-Persona, viel Volumen,
  polarisierend, Konsumentenanteil hoch) · `tattoo_convention_berlin` (Veranstalter, saisonal) ·
  `dot_e.v` · `inkarea_tattoo` · `taetowiererakademie` · `zwdhpodcast` (alle vier ruhend, 0-Treffer-Läufe
  sind frei) · `tattoomed` (Supply-Brand, marginal).
  Mapper-/Slot-Regeln: `since` lässt bis zu 3 gepinnte Posts durch → `postedAt` client-seitig filtern +
  Dedupe per Post-`id` über Wochen; Collab-Posts erscheinen unter anderem `author.username` → nur per
  `id` keyen; `likes`/`posts` können `null` sein (unbekannt, nicht 0); fehlende Handles verschwinden
  stumm aus der Batch-Antwort → Diff angefragt/zurück, fehlende als failed-Row loggen; `author`,
  `avatar`, `name`, `image` (signierte, ablaufende URL) nie deklarieren, `alt`-Text erlaubt.
  Kommentare: nur die erste Seite (9 Kommentare) erreichbar, `hasMore:false` trotz 58/194 → `ig-comments`
  bleibt ein kleiner Slot (Top 5 Posts, maxItems 30 harmlos); **Lead-Magnet-Filter** vor dem
  Kommentar-Call: Captions mit „kommentier…"/„schreib … in die Kommentare" ausschließen, Stichprobe
  > 50 % Ein-Wort-Kommentare → verwerfen.

Kostenschätzung Wochenlauf: DeepAPI ≈ 9–13 $, Anthropic ≈ 6–10 $ (≈ 1000–1500 Zeilen à ~25/Call,
Opus 5 à 5 $/25 $ je MTok, Tokenizer ab 4.7 ≈ +30 % Tokens, Prompt-Caching auf dem System-Block;
Batch API mit 50 % Rabatt bewusst NICHT im ersten Wurf — spätere Optimierung), YouTube/Apple/Play
0 $, SerpApi ≈ 8 Searches (Quota via `serpapi.com/account.json`: `plan_searches_left`).
Apple-Feed: Pagination `…/customerreviews/page=2/id={id}/sortBy=mostRecent/json` (page VOR id),
50 Einträge je Seite; Content-Type ist `text/javascript`, Body JSON — nie auf Content-Type gaten;
de/at/ch-Storefronts liefern nahezu kein Wochen-Delta, gb/us tragen das Volumen (16 Reviews
Tattoodo/de gesamt, jüngste 2025-12-27).

## Workstream A — DB-Migration v3 (Shared DB, CLI-Regime)

Neue Datei `supabase/migrations/<ts>_community_pulse_v3.sql`. Vorher: Stub-Abgleich
(`supabase_migrations.schema_migrations` via Read-only-MCP vs `supabase/migrations/`; fehlende
Fremd-Stubs ergänzen), Constraint-Namen verifizieren (`select conname from pg_constraint where
conrelid in ('public.topic_signals'::regclass,'public.mining_runs'::regclass)`), Pre-Action-Report
→ **Tomek führt `supabase db push` in seinem Terminal aus** → Post-Action-Audit (Read-back,
`get_advisors`), Spiegel byte-identisch nach `toda-company` + `docs/db-ownership.md`.

SQL-Skizze (Richtwert):

```sql
-- 1) mining_runs: Provider erweitern + ISO-Woche
alter table public.mining_runs drop constraint mining_runs_provider_check;
alter table public.mining_runs add constraint mining_runs_provider_check
  check (provider in ('apify','deepapi','youtube_data_api','apple_rss','google_play','serpapi'));
alter table public.mining_runs add column iso_week text;
update public.mining_runs set iso_week = to_char(ran_at at time zone 'UTC','IYYY-"W"IW') where iso_week is null;
create index mining_runs_iso_week_idx on public.mining_runs (iso_week, source_key);
-- 2) topic_signals: Plattformen erweitern; globaler Dedupe-Index
alter table public.topic_signals drop constraint topic_signals_platform_check;
alter table public.topic_signals add constraint topic_signals_platform_check
  check (platform in ('reddit','youtube','instagram','tiktok','web','facebook','appstore','playstore','trustpilot','serp'));
create index topic_signals_platform_external_idx on public.topic_signals (platform, external_id);
-- 3) topic_classifications: Verdichtungsfelder (additiv)
alter table public.topic_classifications
  add column audience text check (audience in ('artist','endkunde','mixed','off_topic')),
  add column signal_type text check (signal_type in ('question','complaint','wish','praise','experience','news','promo','other')),
  add column language text,
  add column quote text check (char_length(quote) <= 280),
  add column question text,
  add column feature text,
  add column cluster_proposal text,
  add column confidence numeric check (confidence between 0 and 1),
  add column classified_by text not null default 'skill' check (classified_by in ('skill','llm')),
  add column model text,
  add column prompt_version text;
create index topic_classifications_signal_type_idx on public.topic_classifications (signal_type) where signal_type is not null;
-- 4) pulse_digests
create table public.pulse_digests (
  id uuid primary key default gen_random_uuid(),
  iso_week text not null unique,
  generated_at timestamptz not null default now(),
  model text not null, prompt_version text not null,
  input_signal_count int not null,
  digest jsonb not null, digest_md text not null,
  cost_usd numeric, status text not null default 'final' check (status in ('draft','final'))
);
alter table public.pulse_digests enable row level security;  -- keine Policies: nur Service-Role/Read-only-MCP
-- 5) pulse_jobs (Lock + Observability der Kette, D9)
create table public.pulse_jobs (
  id uuid primary key default gen_random_uuid(),
  iso_week text not null, step text not null check (step in ('battery','comments','enrich','digest')),
  status text not null check (status in ('running','succeeded','failed')),
  started_at timestamptz not null default now(), finished_at timestamptz,
  attempts int not null default 1, result jsonb, error text,
  unique (iso_week, step)
);
alter table public.pulse_jobs enable row level security;
-- 6) View pulse_pending_signals (security_invoker): topic_signals ohne topic_classifications-Zeile
--    (Anti-Join in SQL, nicht in supabase-js), Spalten: run_id, external_id, platform, source, title,
--    body, metrics, posted_at, iso_week; Filter run.status='succeeded'.
-- 7) View pulse_cluster_weekly (security_invoker): je (iso_week, cluster) n_signals, n_sources,
--    score (Σ outlier aus topic_cluster_scores je Run der Woche), n_questions, n_complaints,
--    n_wishes, n_praise, audience-Split. Output-Spalten der bestehenden View unverändert.
--    Schwere Aggregate (Digest-Input über 4 Wochen) als SQL-Funktion/View, damit jeder
--    PostgREST-Call unter dem 8-s-statement_timeout bleibt.
-- 8) COMMENTs auf allen neuen Spalten/Tabellen (Zweck, Privacy-Regel, Konsumenten).
```

Backfill (optional, Richtwert): `engagement` für Zeilen seit 2026-08-28 aus `metrics` nach den
Formeln oben (`platform='youtube' and post_type='comment'` → likes + 2·replies usw.); historische
Apify-Zeilen unverändert.

## Workstream B — Pipeline-Code

```
lib/mining/
  config.ts    Batterie v3 (Tabelle oben) + REVIEW_TARGETS, FB_GROUPS, IG_ACCOUNTS, SERP_*,
               COMMENT_TARGETS_PER_PLATFORM=5, DEDUPE_LOOKBACK_DAYS=120, maxCostUsd je Spec
               (≥ maxItems × Stückpreis, Stückpreise aus dryRun), idempotencyKey mit "v3"-Präfix,
               ENRICH_BATCH=25, ENRICH_MODEL="claude-opus-5", PROMPT_VERSION="v3.0".
  types.ts     Platform/Provider erweitern; neue Raw-Whitelists AUS LIVE-KONTRAKT: RawRedditSearchPost,
               RawRedditComment, RawInstagramPost (posts), RawInstagramComment, RawFacebookGroupPost,
               RawAppleReviewEntry (im:rating.label, updated.label, title.label, content.label,
               im:version.label, im:voteCount.label, id.label — author NICHT), RawPlayReview (id, score,
               date, title, text, thumbsUp, version, replyText — userName/userImage NICHT),
               RawTrustpilotReview (Extract-Schema), RawSerpTrend, RawSerpQuestion.
               TopicSignalRow unverändert; Classification-Row-Typ neu.
  mappers.ts   Mapper je Kind + engagement-Formeln; selectCommentTargets(platform, rows) deterministisch
               (GERMAN_HINT, comments desc, Referenzkanäle raus, Top N).
  deepapi.ts   unverändert (maxCostUsd kommt aus dem Body). + `getBalance()` (GET /v1/balance, frei).
  youtube.ts   unverändert.
  reviews.ts   NEU: fetchAppleReviews(appId, storefront) (fetch, JSON), fetchPlayReviews(pkg)
               (google-play-scraper), fetchTrustpilot(url) (DeepAPI extract). server-only.
  serpapi.ts   NEU: googleTrendsRelated(seed), googlePaa(query). Felder gegen SerpApi-Doku pinnen.
  sync.ts      ingestOutput: Dedupe gegen bestehende (platform, external_id) per Kandidaten-IDs in
               Chunks à 100 (`.eq('platform').in('external_id', ids)`; yt-channels ausgenommen);
               0-neu = succeeded; runBattery: Phase 1 = DeepAPI-Specs ∥ Reviews ∥ SerpApi
               (Promise.allSettled); Phase 2 (runComments) = Kommentar-Ziele je Plattform aus den
               Phase-1-Zeilen der Woche IN DER DB (nicht aus dem In-Memory-Output → als eigener
               Schritt lauffähig); iso_week auf mining_runs; runBatteryWithRetention unverändert
               im Kontrakt.
  jobs.ts      NEU: claimJob(isoWeek, step) / finishJob(...) auf pulse_jobs (Lock D9, stale nach 15 min).
  enrich.ts    NEU: pendingSignals(limit) liest die View pulse_pending_signals, classifyBatch(rows)
               (Anthropic SDK: client.messages.parse + zodOutputFormat, model claude-opus-5,
               output_config.effort "medium", system-Block mit cache_control: Registry-Slugs +
               Regeln + ICP/Anti-ICP-Kurzfassung + Anonymisierungsregel; user-Block: Zeilen als
               JSON mit id, platform, source, title, body≤1500 Z., metrics), Insert on conflict do
               nothing; parsed_output null → 1 Retry, dann Zeilen bleiben „offen" (Konsole-Warnung,
               nächster Lauf). runEnrichment({budgetMs}) → {classified, failed, costUsd}.
  digest.ts    NEU: buildDigestInput(isoWeek) (SQL-Aggregate + Erstanbieter-Reads),
               generateDigest(isoWeek) (Opus 5, effort high, zodOutputFormat DigestSchema),
               upsert pulse_digests. DigestSchema (Richtwert): { week, headline, top_topics[{cluster,
               n, sources, score, delta_vs_4w, summary, evidence_ids[]}], questions[{question, n,
               sources}], complaints[], wishes[], praise[], videos[{title, url, x_ratio, source}],
               competitor_feedback[{feature, sentiment, n, summary}]  -- ohne Firmennamen,
               first_party{ig_comment_themes[], top_posts[], gsc_rising_queries[]},
               quotes[{quote, platform, signal_type, cluster, external_id}],
               candidates[{format: blog|reel|carousel|faq|clip, topic, why, evidence_ids[]}],
               gaps[] }.
scripts/mining-sync.ts   + --dry-cost (dryRun aller Specs, Summe Holds, kein Spend) · --enrich
                         [--budget-ms] · --digest [--week] · --reclassify <prompt_version>
                         (llm-Zeilen dieser Version löschen + neu) · --quality (siehe E).
scripts/pulse-quality.ts NEU: Qualitätsbericht je Woche/Run (Rubrik E) als Tabelle + JSON.
app/api/cron/mining-sync/route.ts  202 sofort, Arbeit in after(); Lock 'battery'; am Ende Trigger
                         pulse-worker?step=comments (D9).
app/api/cron/pulse-worker/route.ts NEU: Auth wie mining-sync; ?step=comments|enrich|digest; 202 sofort,
                         Arbeit in after(); Lock je Schritt; enrich: runEnrichment(240 s) →
                         Self-Retrigger bei Rest, sonst Trigger digest. maxDuration 300.
package.json             + @anthropic-ai/sdk ^0.124, zod ^4.5, google-play-scraper ^10.1 (🟡 neue Deps).
.env.example             + ANTHROPIC_API_KEY (Kommentar), SERP_API_KEY-Kommentar erweitern.
```

Prompt-Regeln (bindend, Wortlaut Richtwert): Registry-Slugs sind die einzigen erlaubten `cluster`;
`cluster_proposal` nur als Vorschlag; `quote` wörtlich aus dem Input, gekürzt, ohne Namen/Handles/
Studionamen/Orte, sonst leer; Reviews: `feature` aus einer festen Liste (booking, deposits,
calendar, messaging, payments, portfolio, pricing, onboarding, bugs, support, other); `audience`
nach ICP-Definition; Endkunden-Signale nie verworfen, nur gelabelt; Sprache erkennen, nicht
übersetzen. Output strikt Schema (Structured Outputs), keine Prosa.

## Workstream C — Skills + Wissensbasis (dieses Repo)

1. `.claude/skills/blog-article/SKILL.md`: Strom A liest zuerst `pulse_digests` der jüngsten Woche
   (Freshness ≤ 8 Tage) und dann Zeilen zum Belegen; der manuelle Klassifikationsschritt (Z. 80–96)
   wird zu „Override nur bei Bedarf" (`classified_by='llm'` überschreiben ist erlaubt, dokumentiert);
   Kanal-Zeilen-Pflicht bleibt für Overrides. Schreibpfad (Z. 84, 205): Plugin-MCP raus →
   **CLI-Regime**: Draft-Insert über `scripts/blog-draft-insert.ts <draft.json>` (Service-Role,
   Env in-process; NEU, klein) nach Pre-Action-Report; Tomek führt aus oder gibt den Run frei.
   Kommentar-Mining on demand unverändert (`lib/mining/youtube.ts`).
2. `.claude/skills/podcast-article/SKILL.md` Z. 144 + `artist-story` analog (Insert-Pfad).
3. `.claude/skills/supabase/SKILL.md` §5 DML: Plugin-`execute_sql` → Repo-Script-Pfad; außerdem
   den veralteten Spiegel-Pfad `~/Desktop/toda/toda-company/…` (existiert nicht) auf
   `/Users/harvestflow/Developer/toda/toda-company` korrigieren (faktischer Drift, eigener
   `fix(skill:supabase)`-Commit).
4. `docs/blog/topic-radar.md`: „Methode v3 (Stand 2026-09)" (drei Schichten, Nur-Neues-Doktrin,
   Engagement-Formeln, Digest-Kontrakt, Registry-Erweiterungsprozess: `cluster_proposal` mit ≥ 5
   Treffern in 2 Wochen → Aufnahme-Kandidat, Entscheidung im Lauf-Eintrag), `reddit-seeded` als
   historisch markieren, neuer Lauf-Eintrag mit Verifikations-Belegen.
5. `docs/blog/sources.md`: Tier-3-Tabelle um FB-Gruppen, IG-Accounts, Reviews (Apple/Play/
   Trustpilot), SerpApi-Trends/PAA ergänzen; Aufnahme-Protokoll um „Nur-Neues"-Kriterium.
6. `docs/blog/toda-context.md`: Regel „Review-Schmerzpunkte nur unattribuiert" (Verweis
   `marketing/strategy/claims.md`).
7. `CLAUDE.md` (Repo): Absatz „Community-pulse topic mining v2" → v3 (Schichten, Routen, CLI-Modi,
   neue Env-Vars, neue Tabellen), Env-Liste + `ANTHROPIC_API_KEY`.
8. `.prettierignore`: `docs/blog/originals/` (Byte-Treue der Snapshots; offen seit `5cbe9b0`).

## Workstream D — Marketing-Repo (umgrenzter Schlussschritt)

Repo `/Users/harvestflow/Developer/toda/marketing`, Commits via `/commit` dort.

1. `.claude/skills/community-voices/SKILL.md` → Neufassung als **Posting-Konsument**: liest
   `pulse_digests` (Read-only-MCP) + `topic_classifications` (quotes, questions) für die Formate aus
   `channels/instagram.md` (Trial-Reel-Hooks, FAQ-Pins, Todd-Feature-Carousel-Fragen, Story-Zitate);
   Handlungskandidaten je Format mit Beleg-Zeile (n, Quelle, Woche); Mitbewerber-Guardrail;
   Report-HTML + README-Zeile bleiben; Klassifikations-Schreibpfad entfällt (kein Write-MCP mehr).
   Name bleibt `community-voices` (Tomek nutzt ihn „zum Posten").
2. `decisions/datenquellen.md` Z. 15: Pipeline v3 (Schichten, Digest, Reviews-Quelle).
3. `strategy/content-pipeline.md` Z. 78: „Eine Erhebung, drei Verbraucher" → Digest als Lese-Objekt.

## Workstream E — Verifikation + Testlauf-Loop (Definition of Done)

1. **Migration:** Read-back aller neuen Spalten/Tabellen; `get_advisors` ohne neue Security-Findings;
   `topic_cluster_scores` liefert auf Alt-Daten identische Zeilen wie vorher (Count + Stichprobe).
2. **Kontrakt-Pins:** je neuem Endpoint Capability + dryRun im Abschlussprotokoll (Felder, Stückpreis).
3. **Per-Slot-Läufe** (`--source`), Stichproben via Read-only-MCP; Assert: keine Identitätsfelder
   (`select count(*) from topic_signals where metrics ?| array['author','username','userName']` = 0;
   Body-Grep auf `@handle`-Muster nur als Warnung).
4. **Nur-Neues-Beweis:** Slot zweimal am selben Tag → zweiter Lauf 0 neue Zeilen, Status succeeded.
5. **Enrichment:** 50 Zeilen klassifizieren, Handprüfung von 15 (Sprache, audience, cluster, quote
   anonym) → Trefferquote ≥ 13/15, sonst Prompt nachziehen (prompt_version bump) + `--reclassify`.
6. **Digest:** für die Testwoche erzeugen; komplett lesen; Schema valide; keine Mitbewerber-
   Namen in complaints; Erstanbieter-Block gefüllt.
7. **Cron-Routen lokal:** 401 ohne Token; `mining-sync` 202 + `pulse_jobs`-Zeile `battery`;
   `pulse-worker?step=enrich` 202 + Zeile `enrich` mit result {classified, remaining}; Kette
   mining-sync → comments → enrich → digest einmal end-to-end (lokal via `next dev`, Trigger-URL
   auf localhost); Lock-Test: zweiter Aufruf während `running` → 409/„already running", kein
   Doppel-Spend.
8. **Testlauf-Loop (Tomeks Mandat):** Rubrik `.claude/plans/community-pulse-v3/quality-rubrik.md`,
   Bericht via `pnpm mining:sync --quality`: je Slot n_raw, n_new, %new, %DE, Ø Textlänge,
   %artist|mixed, %signal_type∉{promo,other}, Kosten/nützliche Zeile; gesamt: nützliche DACH-Zeilen/
   Woche, Cluster mit n ≥ 3 über ≥ 2 Quellen, Fragen-Anzahl, Review-Zeilen. Schwellen (Richtwert):
   DACH-Slots ≥ 60 % DE, ≥ 70 % neu, ≥ 50 % artist|mixed, Kommentar-Slots Ø ≥ 80 Z., ≤ 0,05 $ je
   nützlicher Zeile; gesamt ≥ 300 nützliche DACH-Zeilen, ≥ 5 Cluster mit Trend-Gate. Loop: Lauf 1
   voll → Bericht → Config-Änderungen → Lauf 2 nur geänderte Slots (`--source`) + `--enrich` +
   `--digest` → Bericht. **Spend-Ledger nach jedem bezahlten Schritt; 40 $ = Stopp + Rückfrage.**
9. `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm format:check` grün; Doku-Konsistenz
   (SKILL.md ↔ topic-radar ↔ sources ↔ CLAUDE.md ↔ marketing); Abschlussprotokoll mit Abweichungen
   + Spend-Summe + Qualitätsbericht Lauf 1 vs. Lauf 2.

## Workstream F — 🔴 Schlussblock mit Tomek

Vercel Production Env: `ANTHROPIC_API_KEY` ist gesetzt (Tomek, 06.09.); `SERP_API_KEY` (Cron braucht
ihn jetzt) prüfen (`vercel env ls` zeigt nur Namen);
`staging` → `main` nur grün; Deploy-Precondition (main, clean, sync mit origin/main); `vercel deploy
--prod`; ersten Montags-Cron beobachten (mining_runs + pulse_digests der Woche); Spend-Summe melden.

## Explizit NICHT in diesem Plan

- Dashboard-/UI-Konsum des Digests; E-Mail-/Slack-Zustellung des Digests.
- Massenmarkt-Buchungstools als Review-Quelle (Tomek: nur direkte Mitbewerber).
- Apify (Reserve für IG-Hashtag „recent", falls Delta nach 2 Läufen dünn — messen, dann entscheiden).
- Podcast-Transkripte fremder Kanäle als Quelle; X/Threads (kein Zeitfilter / keine Suche).
- Voice-Learning Lauf 0 (offene Fragen aus der Session vom 05.09.) — eigener Lauf.
