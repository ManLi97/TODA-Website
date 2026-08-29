# Community-Pulse-Pipeline v2: Reddit/Apify → DeepAPI-Batterie + Umbau `/blog-article`

## §0 Plan-Fidelity (bindend)

- **Evidence beats plan.** Widerspricht die Realität einer Plan-Annahme (API-Shape, Anker,
  Constraint-Name …): Realität fixen, Abweichung im Abschlussprotokoll dokumentieren —
  nie stillschweigend umdeuten.
- **Bindend:** Scope, Quellen-Batterie-Zusammensetzung, Scoring-Semantik (D2/D3 unten),
  append-only + Keine-Autor/PII-Regel, Migrations-Disziplin, Kadenz (wöchentlich Mo),
  „nie publizieren", Stop-Regeln. **Richtwert:** exakte Query-Strings, maxItems-Zahlen,
  Modul-/Konstantennamen, Timeout-Werte — bei besserem Wissen anpassen + dokumentieren.
- Jeden `file:line`-Anker vor Benutzung gegenprüfen (Stand 29.08.2026).
- Raw-API-Feldnamen NIE raten: vor Mapper-Bau `GET /v1/capabilities?capability=<slug>`
  pro Endpoint + je 1 `dryRun`-Call (kostenlos) — die Whitelist-Typen entstehen aus dem
  Live-Kontrakt.

## Execution Brief

- **Ziel-Pfad dieses Plans:** `.claude/plans/community-pulse-pipeline.md` (TODA-Website).
- **Kickoff:** frische Session in `/Users/harvestflow/Developer/toda/TODA-Website`.
- **Preconditions:**
  1. Git: `git status` clean, Arbeit auf `staging` (main nimmt nie direkte Commits).
  2. Env-Namen vorhanden (`.env.local` nie lesen, nur `grep -c '^VAR='`):
     `DEEPAPI_API_BASE_URL`/`DEEPAPI_API_KEY` (via `source ~/.deepapi/env`),
     `YOUTUBE_API_KEY` (GCP `yt-comments-api-506923`, verifiziert 29.08.),
     `SERP_API_KEY` (SerpApi), `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
     `CRON_SECRET`.
  3. Skills: `/supabase` (Repo) + `skill:supabase-write-regime` VOR der Migration;
     `skill:deepapi` vor dem ersten DeepAPI-Call.
  4. `toda-company` existiert: `/Users/harvestflow/Developer/toda/toda-company`
     (Migrations-Spiegel + `docs/db-ownership.md`).
- **Ausführung:** Auto Mode, A → B → C → D → E; nach jedem verifizierten Workstream
  `/commit` (nie bare git commit). Kein Push außer `git push origin staging` (grün).
  Vercel-Env-Änderungen + Deploy = 🔴-Schlussblock mit Tomek.

## Kontext

`/blog-article` bezog Strom A (Community-Signal) aus einer Reddit/Apify-Pipeline
(`lib/mining/*`, Cron Mo/Mi/Fr, Shared-DB-Tabellen `mining_runs`/`topic_signals`/
`topic_classifications` + View `topic_cluster_scores`, Projekt znocynswpsfckyfumema).
Gemessen (Proben 29.08.): Reddit ist für DACH leer; echte DACH-Stimmen liefern
TikTok-Kommentare unter DE-Artist-Education-Content, YouTube-Kommentare von DACH-Kanälen
(Data API v3, kostenlos) und öffentliche FB-Gruppen. Im Marketing-Repo existiert mit
`/community-voices` eine end-to-end bewiesene wöchentliche DeepAPI-Batterie
(Baseline 28.08.) — als Datei-Sidecar statt DB. **Entscheidung Tomek:** Erhebung wird
zentrale Infrastruktur in DIESEM Repo (wöchentlicher Cron → Shared DB, eine Wahrheit);
`/blog-article` (hier) und `/community-voices` (Marketing) werden Konsumenten.
Interpretation (Cluster, ICP-Gate, Labels, Themenwahl) bleibt Skill-Arbeit.

## Bindende Entscheidungen (Tomek, 28.–29.08.)

1. Reddit/Apify-Primärquelle stirbt; **Apify komplett raus** (Code, `.env.example`,
   Vercel-Env als 🔴-Schluss). EN-Reddit (r/TattooArtists) bleibt via DeepAPI als
   Hypothese-gelabelte quantitative Diskussions-Baseline.
2. Kadenz **wöchentlich Montag** (`0 6 * * 1`).
3. Ein Plan, eine Session — inkl. Marketing-Repo (Workstream D).
4. SerpApi (`SERP_API_KEY`) für deutsche Suchvolumina — in Skill-Läufen, nicht im Cron.
5. DeepAPI `seo.rank`/`seo.audit` (SERP-Teil) für Gap-Validierung + Quellen-Discovery;
   `seo.keyword` für DE tot (gemessen).
6. YouTube-Kommentare via Data API v3: `commentThreads` (1 Einheit/100 Kommentare,
   `order=relevance`); Video-IDs aus DeepAPI-youtube/search — nie Data-API-`search`
   (100 Einheiten).
7. Brain-Test-Scrape (`~/Brain/toda/scrape/`) wird NICHT referenziert.
8. Deutsche Foren: keine Mining-Quelle → Validierungs-/Quellen-Schicht (`sources.md`).
9. Marketingbaukasten: Live-Referenzen (fokussierte Dateipfade) statt kopierter Auszüge.
10. `/podcast-article` stellt sein Kommentar-Mining mit um (Apify-MCP → Data-API-Helper).

## Design-Kern (bindend, aus verifiziertem Design-Lauf)

- **D1 Additiv, keine Renames:** Nur `ADD COLUMN` + Constraint-Swaps + Backfill +
  `CREATE OR REPLACE VIEW` (Output-Spalten unverändert → bestehende Konsumenten-SQL
  läuft weiter).
- **D2 Scorebar ist nur, was bewiesen ist:** `engagement numeric` (neu) ist non-NULL NUR
  für Reddit-broad (`up_votes + 2*comments_count`) und YouTube-Kanal-Zeilen (`views`).
  Alles andere (Suche, Hashtags, alle Kommentare, Web) = Kontext-Zeilen mit
  `engagement NULL` — von der View ausgeschlossen, aber in `topic_signals` (eine Tabelle,
  eine Wahrheit). Plattform-Rohzahlen in `metrics jsonb` → spätere A/B-Kalibrierung kann
  Quellen zu scorebar befördern ohne Re-Scrape.
- **D3 x-Ratio = bestehende View-Formel, richtig gefüttert:** Kanal-Referenz-Zeilen
  (30 neueste Videos je `source='@kanal'`, `engagement=views`) → per-(run,source)-Median
  der View IST der Kanalmedian, `outlier = x-Ratio`. Deterministisch in SQL,
  handnachrechenbar. **Konsumenten-Pflicht:** ALLE Kanal-Zeilen eines Runs klassifizieren
  (`is_discussion=true`, `cluster NULL` default; Cluster nur bei thematischem Video) —
  sonst verschiebt sich der Median.
- **D4 `pass` += `'context'`** (broad = quantitatives Rückgrat, seeded = Recall,
  context = qualitative Batterie).
- **D5 Idempotenz:** `mining_runs.provider` (`'apify'|'deepapi'|'youtube_data_api'`) +
  `source_key` (Batterie-Slot); `dataset_id` (UNIQUE) generalisiert zum Provider-Ref:
  Apify-Dataset (historisch) | DeepAPI-`requestId` | `ytapi:{isoWeek}:comments:{videoId}`.
  DeepAPI-`Idempotency-Key` deterministisch `toda-mining:{isoWeek}:{sourceKey}` →
  Same-Week-Retry = gleicher requestId = gleiche Row geheilt, kein Doppel-Spend;
  `--fresh` salzt bewusst.
- **D6 `source`-Semantik** (Median-Peer-Group): reddit→Subreddit · yt-Kanal→`@handle` ·
  yt-Suche→Query · IG→Hashtag · TikTok-Suche→Query · Kommentare→`yt:{videoId}`/
  `tiktok:{videoId}` · Web→Query. `external_id`: Plattform-ID; Web =
  `web:{16-hex sha256(url)}`.
- **D7 Privacy:** Whitelist-Mapper-Muster 1:1; Kanal-Handle veröffentlichter Videos =
  Publisher-Attribution (erlaubt, analog Subreddit); **Kommentator-Identitäten überall
  verboten.** Kommentartext = `body` → bestehende 30-Tage-TTL-Sweep greift unverändert.
- **D8 Recovery:** `--dataset`-Modus → `--request <deepapiRequestId>` (GET
  `/v1/requests/{id}` ist kostenlos).

## Workstream A — DB-Migration v2 (Shared DB, 🔴-Disziplin)

Neue Datei `supabase/migrations/<ts>_community_pulse_v2.sql`; anwenden via Write-MCP
`apply_migration`; byte-identisch spiegeln nach `toda-company` + dessen
`docs/db-ownership.md`; nie `db push`. Vorher Constraint-Namen verifizieren
(`select conname from pg_constraint where conrelid='public.mining_runs'::regclass;` —
erwartet `mining_runs_pass_check`, `mining_runs_time_window_check`).

SQL-Skizze (Richtwert; Kommentar-Volltexte bei Implementierung):

```sql
-- 1) mining_runs
alter table public.mining_runs
  add column provider text not null default 'apify',
  add column source_key text;
alter table public.mining_runs add constraint mining_runs_provider_check
  check (provider in ('apify','deepapi','youtube_data_api'));
alter table public.mining_runs alter column provider drop default;
update public.mining_runs set source_key = 'reddit-' || pass where source_key is null;
alter table public.mining_runs drop constraint mining_runs_pass_check;
alter table public.mining_runs add constraint mining_runs_pass_check
  check (pass in ('broad','seeded','context'));
alter table public.mining_runs drop constraint mining_runs_time_window_check; -- Freitext
create index mining_runs_source_key_idx on public.mining_runs (source_key, ran_at desc);
-- 2) topic_signals
alter table public.topic_signals
  add column platform text not null default 'reddit',
  add column metrics jsonb,
  add column engagement numeric;
alter table public.topic_signals add constraint topic_signals_platform_check
  check (platform in ('reddit','youtube','instagram','tiktok','web','facebook'));
alter table public.topic_signals alter column platform drop default;
-- 3) Backfill (identische Formel; View schließt seeded weiter aus)
update public.topic_signals set engagement = up_votes + 2 * comments_count
  where up_votes is not null and comments_count is not null;
-- 4) View v2: identisch zu v1, nur: classified nutzt s.engagement statt Formel,
--    Filter `s.engagement is not null` statt up_votes/comments-not-null.
--    CREATE OR REPLACE, security_invoker bleibt, Output-Spalten unverändert.
-- 5) COMMENTs aktualisieren: platform/engagement/metrics/dataset_id/View
--    (inkl. Kanal-Zeilen-Klassifikationspflicht + Kommentator-Identitäts-Verbot).
```

## Workstream B — Pipeline-Code

```
lib/mining/
  types.ts    ERWEITERN: Platform, Provider, Pass+='context'; Raw-Whitelist-Typen pro
              Quelle AUS LIVE-KONTRAKT (capabilities + dryRun) — der heutige
              RawRedditItem ist Apify-Form, DeepAPI-Reddit-Shape weicht ab;
              TopicSignalRow += platform/metrics/engagement; RunOutcome += sourceKey/provider.
  config.ts   NEU um die Batterie herum (Apify-Konstanten löschen). Feste Batterie:
              yt-search: 5 Queries („KI Tattoo", „Tattoo Podcast deutsch",
                „Tätowierer werden", „Tattoo Studio Alltag", „Tattoo Preise"),
                maxItems 15, context
              yt-channels: ["@inkarea","@honesttattooerpodcast"], maxItems 30, broad
              reddit-broad: ["TattooArtists"], top/month, 40, broad
              ig-hashtags: ["tattoodeutschland","tattooartistgermany","taetowierer"],
                50, context
              tiktok-search: ["Tätowierer werden","Tattoo Studio Alltag"], 6months, 30,
                context
              tiktok-comments: feste URL-Liste TIKTOK_COMMENT_VIDEOS, ~40, context
              web: 5 feste Query-Varianten, maxResults 10 (Param heißt maxResults!)
              + RETENTION_DAYS=30, COVERAGE_ALERT_PCT, UPSERT_CHUNK bleiben;
              DEEPAPI_SKILL_VERSION-Pin, Poll-Deadlines, YT_COMMENT_TARGETS=3.
  deepapi.ts  NEU: runScrape(path, body, idemKey, deadline) — Bearer, Content-Type,
              Idempotency-Key, X-DeepAPI-Skill-Version; `next`-Polling (GET
              /v1/requests/{id}, afterSecs beachten, auch bei status=succeeded
              weiterpollen solange polling-next da); Deadline-Fehler nennt requestId.
              getRequest(id) für Recovery. server-only.
  youtube.ts  NEU: Data-API-v3 commentThreads (key=YOUTUBE_API_KEY, maxResults=100,
              order=relevance; NIE search.list). server-only.
  mappers.ts  NEU: 1 Whitelist-Mapper pro Quelle → TopicSignalRow (Author-Stripping wie
              mapPostItem); engagement je Quelle (D2); metrics-Whitelist;
              selectYtCommentTargets(searchRows): dedupe videoId, Referenzkanäle raus,
              top 3 nach views + optionale Fix-Liste — deterministisch.
  sync.ts     Skelett behalten: ingestItems() ersetzt ingestDataset (Upserts
              onConflict dataset_id bzw. run_id,external_id unverändert, + provider/
              source_key); recordFailedRun-Heilung bleibt; computeRunStats verallgemeinert
              (broad: % Zeilen mit engagement; context: % mit title+post_url);
              runBattery(): Phase 1 = alle DeepAPI-Specs via Promise.allSettled
              (1 mining_runs-Row pro Request), Phase 2 = yt-comments aus Phase-1-Suche
              (alle Suchen tot → 1 failed 'yt-comments'-Row, sichtbare Lücke);
              redactExpiredBodies unverändert; runBatteryWithRetention().
  client.ts   LÖSCHEN (zuletzt, wenn CLI ohne kompiliert).
scripts/mining-sync.ts  Modi: default = volle Batterie; --source <key>; --request <id>
              --source <key> (Recovery, ersetzt --dataset); --fresh; --retention-only.
app/api/cron/mining-sync/route.ts  Auth unverändert (Bearer CRON_SECRET); Precondition:
              DEEPAPI_*-Env (fehlt YOUTUBE_API_KEY → yt-comments wird failed-Row, Route
              läuft weiter — Richtwert); runBatteryWithRetention; maxDuration 300 bleibt
              (Parallel-Batterie: Wall-Clock ≈ langsamster Request; Ausfälle heilen
              idempotent nach).
vercel.json  `0 6 * * 1,3,5` → `0 6 * * 1`.
.env.example DEEPAPI_API_BASE_URL/DEEPAPI_API_KEY ergänzen, YOUTUBE_API_KEY-Kommentar
             (Batterie + Skills), APIFY_TOKEN-Zeilen entfernen.
```

Kosten ~3 $/Lauf (≈15 DeepAPI-Requests) + 0 $ YouTube. Reihenfolge: API-Shapes pinnen →
Migration → Code (types→config→clients→mappers→sync→CLI→Route) → Docs → Verify.

## Workstream C — Skills + Wissensbasis (dieses Repo)

1. **`.claude/skills/blog-article/SKILL.md`**
   - Z. 3 Description: „Reddit + DACH-Radar + SEO-Gap" → „Community-Puls (DB) +
     DACH-Radar + SEO-Gap-Liste".
   - Z. 48–70 neu: Strom A = zentrale Wochen-Batterie → DB. Lese-/Klassifikations-
     Mechanik Z. 71–85 bleibt, MIT zwei Ergänzungen: (a) INSERTs in
     `topic_classifications` künftig `on conflict (run_id, external_id) do nothing`
     (zwei Konsumenten-Skills klassifizieren dieselben Runs); (b) **Kanal-Zeilen-Pflicht**
     aus D3. Freshness-Gate: jüngster succeeded Lauf je Kern-source_key ≤ 8 Tage;
     Fallback `pnpm mining:sync` (bzw. `--source`), Recovery `--request`. Apify-Reste
     (Z. 50, 57, 66–68) ersetzen; YouTube-Kommentare on demand via Data-API-Helper.
   - Z. 94 Such-Validierung: SerpApi-Volumen (google.de, `SERP_API_KEY`) + DeepAPI
     `seo.rank`/`seo.audit` SERP-Read; DACH-Kontext-Zeilen (TikTok/YT-Kommentare, Web)
     sind qualitatives Entscheidungs-Signal neben den Scores — nie selbst gescored.
   - Z. 237 „keine Reddit-Zitate" → „keine Community-Zitate (Reddit, TikTok-/YT-
     Kommentare, FB) als Faktenbeleg — Tier 3 bleibt Stimmung".
2. **`docs/blog/topic-radar.md`** (Lauf-Einträge nie anfassen):
   - Methode Z. 8–25 → „Methode v2 (Stand 2026-08)": Strom A = Batterie→DB (Verweis auf
     `lib/mining/config.ts` als Batterie-Quelle der Wahrheit); B/C unverändert.
   - Scoring Z. 45–58: Formel v2 (engagement-Spalte, D2/D3 inkl. Kanal-Zeilen-Regel).
     Reddit-Runbook Z. 60–93 als „historisch (bis 08/2026)" markieren.
   - Neuer Lauf-Eintrag „Pipeline v2 codifiziert" mit Verifikations-Belegen
     (analog Z. 395 ff.).
3. **`docs/blog/toda-context.md`** — Live-Referenz statt Kopie:
   - Z. 28–45 ICP/Anti-ICP → Pflicht-Referenz `../../../marketing/brand/positioning.md`
     (absoluter Pfad im Text: `/Users/harvestflow/Developer/toda/marketing/brand/positioning.md`)
     + nur Mining-Gate-Konsequenz (Z. 43–45) behalten.
   - Z. 79–94 Frames → Referenz + Satz „Frames = bevorzugte Sprache der einen TODA-Mention".
   - Z. 173–180 Claims → Referenz auf `strategy/claims.md` + Ein-Satz-Kern.
   - Z. 166–170 Regel 5: „Reddit & Co." plattformneutral.
4. **`docs/blog/sources.md`**:
   - Tier-3-Tabelle Z. 84–91 neu: r/TattooArtists (EN, Hypothese, via DB) ·
     TikTok-Kommentare DE-Artist-Content · YouTube-Kommentare DACH-Kanäle ·
     öffentliche FB-Gruppen (qualitativ) · Web-Snippets. Z. 90 „Brave Search MCP"
     (veraltet) → SerpApi + DeepAPI-SERP-Read.
   - „Bewusst ausgeschlossen" Z. 93–107: IG-Kommentare (gemessen: Emoji, Cap ~11) ·
     private FB-Gruppen (öffentliche OK) · tattooscout.de (Consumer-lastig, träge —
     nur Validierungs-Kontext) · Apify-Zeilen historisch.
   - Aufnahme-Protokoll Z. 52–73 unverändert.
5. **`.claude/skills/podcast-article/SKILL.md`** (Z. 42–45, 50, 69): Kommentar-Mining
   Apify-MCP → Data-API-Helper (`lib/mining/youtube.ts` bzw. Script-Aufruf).
6. **`CLAUDE.md`** (Repo): „Reddit topic mining"-Absatz → Pipeline v2; Env-Liste
   +`YOUTUBE_API_KEY` +`SERP_API_KEY` +`DEEPAPI_*`, −`APIFY_TOKEN`.

## Workstream D — Marketing-Repo (umgrenzter Schlussschritt)

Repo `/Users/harvestflow/Developer/toda/marketing`, Commits dort via `/commit`.

1. **`.claude/skills/community-voices/SKILL.md`**:
   - Setup/Batterie Z. 57–80: Erhebung zentral (toda-website, Cron Mo 06:00 UTC,
     Tabellen …); Skill LIEST via globalem Read-only-MCP (`mcp__supabase__execute_sql`,
     verifiziert global konfiguriert). Ad-hoc-Wochen-Queries weiter direkt via DeepAPI —
     „neu"-gelabelt, nie in Deltas (Kontrakt-Regel 4 bleibt).
   - Scoring Z. 82–91: liest `topic_cluster_scores` + engagement/metrics; Formel bleibt
     als Doku. Klassifiziert er selbst zuerst: gleiche Regeln wie oben
     (`on conflict do nothing`, Kanal-Zeilen-Pflicht) — Klassifikation ist geteilte
     Arbeit beider Skills am selben Datenbestand.
   - Ablage Z. 105–116: Sidecar-JSON entfällt (Delta = DB-Query über Läufe);
     Report-HTML + README-Index + Kurz-Report bleiben.
2. **`decisions/datenquellen.md:15`**: Zeile auf Pipeline v2 (Batterie statt
   „Reddit, Actor harshmaur").

## Workstream E — Verifikation (Definition of Done)

1. **Migration:** (a) `count(*) where engagement is null and up_votes/comments not null`
   = 0; (b) Kontroll-Cluster aus `topic_cluster_scores` liefert weiter exakt **9.6134**
   (View v2 ≡ v1 auf Backfill, Beweisstil der Codifizierung 12.07.); (c) `get_advisors`
   ohne neue Security-Findings (View bleibt security_invoker).
2. **Per-Source-Live-Läufe:** `pnpm mining:sync --source yt-channels`, `--source
   reddit-broad`, 1 Context-Quelle → `mining_runs`-Row (provider/source_key/
   dataset_id=requestId/coverage) + Stichproben `topic_signals` via Read-only-MCP;
   Assert: nirgends Autor-/Kommentator-Felder.
3. **x-Ratio-Handrechnung:** Kanalmedian aus Roh-JSON per Hand; Test-Klassifikationen
   über den Skill-Schreibpfad; View-Outlier = views ÷ Handmedian (Anker: @inkarea-TEMU
   war x8.65 am 28.08.).
4. **Volle Batterie + Idempotenz:** `pnpm mining:sync` zweimal am selben Tag →
   Run-Anzahl je source_key unverändert (gleiche requestIds, kein Doppel-Spend).
   Resilienz: Lauf ohne YOUTUBE_API_KEY → yt-comments = failed-Row, Rest succeeded.
5. **Retention:** `--retention-only` (0 auf frischen Daten).
6. **Cron-Route:** lokal `curl -H "Authorization: Bearer $CRON_SECRET"` → 200 mit
   Per-Source-Outcomes; falscher Token → 401.
7. **Skill-Smokes:** `/blog-article`-Mining-Pfad bis inkl. Klassifikation + Score-Read;
   `/community-voices`-Lese-Query im Marketing-Repo liefert die Lauf-Daten.
8. `pnpm lint` + `pnpm build` grün; Doku-Konsistenz (SKILL.md ↔ topic-radar ↔ sources ↔
   CLAUDE.md); Abschlussprotokoll mit Abweichungen.
9. **🔴-Schlussblock mit Tomek:** Vercel-Env `DEEPAPI_API_BASE_URL`/`DEEPAPI_API_KEY`/
   `YOUTUBE_API_KEY` setzen, `APIFY_TOKEN` entfernen; Deploy (main-Merge nur auf grün,
   Deploy-Precondition: main, clean, sync mit origin/main); ersten Montags-Cron prüfen.

## Explizit NICHT in diesem Plan

- FB-Gruppen-Discovery (kuratierte DACH-Gruppenliste) — separater Lauf; Ergebnis
  erweitert später `TIKTOK_COMMENT_VIDEOS`-analog die Batterie-Config.
- `seo.optimize` als Pre-Insert-Gate (am nächsten echten Draft testen).
- Lead-Magnet-Infra, Vergleichs-Format, Presse-Kit (offene Juli-Punkte E3/E6).
- Dashboard-/UI-Konsum der Daten.
