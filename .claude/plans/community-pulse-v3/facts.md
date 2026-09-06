# Community-Puls v3 — verifizierte Fakten (Session 2026-09-06)

## Entscheidungen Tomek (06.09.)
1. Reviews: NUR die 5 profilierten Mitbewerber (inckd, tattoodo, taddoo, myinkconnect, styng). Liste wächst auf Zuruf.
2. Claude-Verdichtung in der Pipeline: JA (Opus 5 via Anthropic SDK; neuer Env-Key = 🔴).
3. FB-Gruppen: Sub-Agent-Recherche, ich werte aus (läuft).
4. DeepAPI-Guthaben aufgeladen + Auto-Charge.
- Kosten sind kein Kriterium; Qualität, keine Duplikat-Scrapes, nichts ins Leere.
- Supabase-Writes: Migrationsskript im CLI-Regime, Tomek applyt (skill:supabase-write-regime + /supabase).
- Plugin-MCP-Insert-Pfad in den 3 Blog-Skills existiert nicht mehr → auf CLI-Regime umstellen.

## DB-Stand (06.09., Read-only MCP)
- mining_runs cols: id, ran_at, pass, time_window, actor, apify_run_id, dataset_id, input, item_count, post_count, field_coverage_pct, status, error, provider, source_key
- topic_signals cols: id, run_id, external_id, source, title, body, flair, post_type, post_url, posted_at, up_votes, comments_count, is_seeded, matched_term, ingested_at, body_cleared_at, platform, metrics, engagement
- topic_classifications cols: run_id, external_id, is_discussion, cluster, note, classified_at
- Seit 28.08.: 3626 Signale, 60 klassifiziert (alle cluster NULL), 0 Cluster → Score-View leer.
- Cron 31.08.: 23 Slots succeeded, 340 DeepAPI + 300 yt-comments Items.
- Wochen-Delta 29.08.→31.08. (Anteil neuer external_ids): tiktok-comments 2 %, yt-channels 2 %, reddit-broad 6 %, yt-search 11 %, web 24 %, ig-hashtags 41 %, yt-comments 44 %, tiktok-search 50 %.
- DE-Anteil 31.08.: yt-comments 95 %, tiktok-comments 53–100 %, web 63–100 %, ig-hashtags 47–82 %, yt-search 13–73 %, tiktok-search 33–40 %, reddit 3 %, yt-channels 2 %.
- Erstanbieter-Tabellen (Shared DB, read-only nutzbar): instagram_interactions (579 Zeilen; comment_text, username [Identität!], like_count, comment_created_at, sentiment leer), post_insights (68; caption, reach, likes, comments_count, saves, shares), gsc_performance_daily (789; dimension query/page/total).

## DeepAPI-Oberfläche (Agent-Report 06.09., capabilities + dryRun, alles frei)
- youtube/search: since hour|24h|week|month|year, sort relevance|date|views|rating, ~$0.025/Video, default cap $0.625 (=25). Felder views, comments, publishedAt ISO; Identität channel{…}.
- youtube/channel: since 24h|week|month (sort wird bei since ignoriert), maxItems PRO Kanal, ~$0.0125/Video; publishedAt evtl. relativ ("7 days ago") → defensiv parsen.
- YouTube-Kommentare: KEIN DeepAPI-Endpoint → Data API v3 bleibt.
- tiktok/search: since 24h|week|month|3months|6months, sort relevance|liked|latest, ~$0.01/Video, DEFAULT CAP $0.10 = 10 Videos (!). Felder likes, comments, shares, plays, bookmarks, text, language, hashtags, postedAt; Identität author, authorUrl, music.author.
- tiktok/comments: nur url, kein since/sort, ~$0.004, cap $0.10 (=25). Identität author.
- tiktok/posts: usernames, sort latest|popular, KEIN since.
- reddit/search: since hour|24h|week|month|year, sort relevance|hot|top|new|comments, query string|list, subreddits optional (leer = ganz Reddit), ~$0.0125/Post, Minimum $0.10/Run. Felder score, upvoteRatio, comments, title, text, flair, subreddit, postedAt.
- reddit/posts: since nur mit sort=top. reddit/comments: url, depth, ~$0.00625.
- instagram/hashtag: KEIN since/sort, maxItems GESAMT über hashtags, hart max 50, ~$0.0125, cap ≥ $0.025. Felder likes, comments, views, text, hashtags, type, postedAt; Identität author{username,name}. Reihenfolge undokumentiert → postedAt client-seitig filtern.
- instagram/posts: usernames, since 24h|week|month, def 12/Profil, ~$0.00625. instagram/comments: url, ~$0.00625, Identität author{username}.
- facebook/groups: public group urls → NEUESTE Posts, maxItems gesamt, kein since/sort, ~$0.02/Post. Felder reactions, comments, shares, text, postedAt; Identität author{id,name}, group{name,url}. Keine Pages-, keine Kommentar-Endpoints.
- Reviews: KEIN Endpoint für Trustpilot/TripAdvisor/App Store/Play. google/places: rating + reviews-COUNT, keine Texte. Fallback scrape/extract: $0.015/Seite, ≤10 URLs, prompt/schema → JSON (URL-only). browser/act $0.125–0.75/Task. Trustpilot-Inhalt via scrape/website UNVERIFIZIERT (dryRun ok).
- search/web: nur query + maxResults (1–100); country/language/freshness abgelehnt; dateText optional.
- research/deep: kein dateRange/sources; Floor $0.35.
- twitter/search: kein since. threads: nur per Post-URL. Keine Podcast-Endpoints. Keine LLM-Klassifikation auf DeepAPI-Seite.
- Gotchas: maxItems vs maxResults; Default-Caps schneiden still ab (maxCostUsd ≥ maxItems×Unit setzen); listState results|no_results|source_blocked; next-Polling auch bei succeeded weiter.
- Rate-Limit 300 req/min. Guthaben 06.09. 18:xx: $8.93 → Tomek hat aufgeladen (Auto-Charge).

## Reviews der 5 Mitbewerber (Marketing-Repo + eigene Checks)
- iOS-IDs: taddoo 6781711821 / inckd 1526690381 / tattoodo 1057590314 (+ Books 6444658839); Play: com.tattoomii.artist, com.inckd.tattoo, com.tattoodo.app, com.tattoodo.business, com.styng.artattoo (404). myinkconnect: keine App.
- Trustpilot: nur Tattoodo (245 Reviews; curl 403). Google Business / TripAdvisor: nirgends vorhanden → gestrichen.
- Apple-RSS-Feed (frei, verifiziert 06.09.): itunes.apple.com/{sf}/rss/customerreviews/id={id}/sortBy=mostRecent/json → tattoodo/de = 16 Einträge (im:rating, updated, title, content, im:version, im:voteCount; author = Identität, strippen). inckd/de = 0, taddoo/de = 0 → andere Storefronts prüfen (ch/at/us/gb).

## Marketing-Repo (Agent-Report)
- /community-voices: liest DB (Freshness ≤ 8 Tage), schreibt topic_classifications (on conflict do nothing), erzeugt research/YYYY-MM-DD-community-voices.html + README-Zeile. Labels: belegt/Hypothese, Diskussionsthema vs Klick-Thema, neu, ICP-Gate. Kein Post-Material (Zitate, Fragen, Hooks, Hashtags fehlen). body-TTL 30 Tage killt Zitate.
- Regeln: Mitbewerber nie herabsetzen (language/writing-rules.md L9); Vergleiche nur im Respekt-Format (strategy/claims.md L21). Review-Schmerzpunkte nur unattribuiert.
- ICP: Solo-Artists, keine Studios; Anti-ICP Nebenjob, Ketten, Walk-in, High-End, technikfeindlich. Endkunde = "immer im Raum", kein zweiter ICP.
- IG-Formate (channels/instagram.md): Trial-Reels (Hook 125 Z., Du-Frage-CTA, 5 Hashtags), Swipe/FAQ-Pins (Fragen), Artist-Story-Carousel (O-Ton), Feature-Testimonial, Todd-Feature-Carousel (FAQ/Preis-Frage), Collab (Endkunden-Publikum).
- Social-Konsument braucht: verbatim Zitate mit Quelle/Datum, Fragen-Form, Hook/Framing + Hashtag-Signal je Zeile, audience-Feld statt binärem ICP-Gate, Handlungskandidat je Format mit Beleg-Zeile + Mitbewerber-Guardrail.
- Competitor-Daten: nur Dateien (Competitor-Profiles/, sop/), keine DB-Tabelle, kein Turnus.

## Review-Pfade verifiziert (06.09., frei)
- Apple-RSS je Storefront: inckd gb = 28 Einträge (jüngste 1★ 2026-08-19, 08-17, 07-04, 06-21), inckd ch = 3, inckd de/at/us = 0; tattoodo de = 16; taddoo de/ch/at/us/gb = 0. → Storefront-Liste de,at,ch,gb,us je App abfragen; leer = frei.
- Google Play via npm `google-play-scraper` 10.1.3 (inoffiziell, frei; Scratchpad-Test): gplay.reviews({appId, lang:'de', country:'de', sort: NEWEST, num}) → taddoo 1 Review (2026-07-30, DE, 5★), inckd 10 (DE), tattoodo 10 + nextPaginationToken. Felder: id, userName+userImage (Identität, strippen), date, score, title, text, thumbsUp, version, replyDate/replyText (Dev-Antwort). Bruch-Risiko inoffiziell → failed-Row sichtbar, kein stiller Ausfall.
- SerpApi (Tomek-Check 06.09. via account.json): Free Plan, 250 Suchen/Monat, 250 übrig, 0 genutzt, Rate-Limit 250/h. Wochen-Slot ≈ 8 Suchen → ≈ 35/Monat, passt.

## Build-Session 06.09. (17:10–18:50 UTC) — neue verifizierte Fakten
- DeepAPI `GET /v1/capabilities?capability=<slug>` liefert Request-Schema + Pricing, aber KEIN Output-Item-Schema; Output-Felder stehen in `https://deepapi.co/openapi.json` (Response-Examples je Pfad) → dort gepinnt (Scratchpad `deepapi-output-fields.md`). dryRun-Envelope: `estimate.{maxDebitMicrousd,maxDebitUsd,basis}`, `debitMicrousd 0`.
- Stückpreise (capabilities): yt search 0.025 · yt channel 0.0125 · reddit search/posts 0.0125 (min 0.10/Run) · reddit comments 0.00625 (min 0.10) · ig hashtag 0.0125 · ig posts/comments 0.00625 · tiktok search 0.01 · tiktok comments 0.004 · fb groups 0.02 · web 0.005/Suche · extract 0.015/Seite. `--dry-cost` Phase 1 = 9,815 $ Holds (Caps), Phase 2 ≈ 2,29 $.
- DeepAPI Skill-Version aktuell `e8dfb0e92258` (Config-Header nachgezogen; v2 hatte `b18c96c6e053`).
- SerpApi: **Free Plan**, 250 Suchen/Monat (248 übrig nach 2 Pins). `related_queries.{rising,top}[] {query,value,extracted_value,link,serpapi_link}`; `related_questions[]` — `ai_overview`-Items nur `question`+`type`, klassische Items mit `snippet,title,link,date`.
- Google Play `com.styng.artattoo`: `google-play-scraper` wirft KEINEN Fehler (kein 404 wie im Plan angenommen) → wird ein succeeded-Run mit 0 Items.
- Postgres 17.6 live; `to_date('2026-W36','IYYY-"W"IW')` = 2026-08-31; Migration v1→v2→v3 lokal (Docker `postgres:17`) sauber, Lock/Views/Funktionen mit Fixture geprüft.
- Stubs: 48 lokale Migrationsdateien = 48 remote Versionen → `db push --dry-run` muss genau `20260906171527_community_pulse_v3` listen.
- Mirror-Diff v2: die toda-company-Kopie der v2-Migration ist NICHT byte-identisch zur Website-Datei (Header + Leerzeilen-Formatierung) — Mirror-Regel = Read-back-Body aus `schema_migrations`, nicht die Website-Datei.
- `format:check` war schon vor v3 rot (37 Dateien: docs/blog/originals, Skills, Pläne, einige Components); `.prettierignore` um `docs/blog/originals/` ergänzt (C8). Alle v3-Dateien sind Prettier-clean.
- `next lint` Warnung `components/header.tsx` `<img>` ist Bestand (nicht v3).
