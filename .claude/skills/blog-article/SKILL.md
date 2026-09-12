---
name: blog-article
description: Erstellt deutsche TODA-Blogartikel als Drafts im Supabase-Blog-CMS. Use when asked to write a TODA blog post (/blog-article <thema>) or to run topic mining (/blog-article mining). Covers data-based topic selection (Community-Puls weekly digests from the DB with a quality gate + DACH-Radar + SEO-Gap-Liste), sourced research via the Quellen-Library (verified via DeepAPI), writing in TODA voice (Formate: Fall & Recht, Ratgeber, Vorlagen), zwei Stränge (Artist / Endkunde — Sonderregel Google-SEO, Kategorie tattoo-wissen), and draft insert for review in /admin.
---

# /blog-article — TODA-Blogartikel datenbasiert erzeugen

**Dieser Skill ist selbstlernend.** Jeder Run beginnt mit einem
Lern-Schritt und endet damit, die Wissensdokumente nachzuziehen. Die
vier Wissensschichten des Workflows:

| Schicht | Dokument | Rolle |
|---|---|---|
| 1. Brand | `docs/blog/toda-context.md` | Deklarierte Voice, Produkt, Redaktionsregeln — Pflichtlektüre vor jedem Schreiben |
| 2. Gelernte Voice | `docs/blog/voice-learnings.md` + veröffentlichte Artikel (DB) + `docs/blog/originals/` | Gemessene Grammatik/Tonalität aus Tomeks Korrekturen — Pflichtlektüre vor jedem Schreiben |
| 3. Community | `docs/blog/sources.md` (Tier 3) + `docs/blog/topic-radar.md` | Was die Leute aktuell bewegt → Top-Themen, gescort, auditierbar |
| 4. Vertrauensquellen | `docs/blog/sources.md` (Tier 1–2) | Substanz: verifizierte Fakten für jeden Artikel |

**Publiziert wird ausschließlich von Tomek im `/admin`-Editor — dieser
Skill setzt niemals `status = 'published'`.**

## Lauf 0 — Lern-Schritt (Pflicht am Anfang JEDES Runs)

Bevor irgendetwas anderes passiert:

1. `voice-learnings.md` lesen (Regeln + Auswertungs-Log).
2. DB abfragen: Welche Artikel mit Original-Snapshot in
   `docs/blog/originals/` sind inzwischen `published` und noch nicht
   ausgewertet? Außerdem prüfen: Wurden Drafts gelöscht oder Slugs/
   Titel geändert? (Auch das ist Feedback.)
3. Für jeden neuen Fall: veröffentlichte Fassung vs. Snapshot
   **semantisch** vergleichen (Umformulierungen, Streichungen,
   Ergänzungen, Umstellungen) → Muster als Regel in
   `voice-learnings.md` destillieren (Original → Korrektur als
   Beispiel), Log aktualisieren.
4. **Eskalationsregel:** Stil → `voice-learnings.md`. Struktur/Prozess
   (Themenwahl, Quellen, Ablauf, Länge, TODA-Mention-Dichte) → dieses
   SKILL.md bzw. `sources.md` / `toda-context.md` direkt anpassen.
   Der Skill schreibt sich selbst fort; Änderungen an SKILL.md im
   Report an Tomek ausweisen.
5. **Anwenden, nicht nur notieren:** Ergibt der Vergleich ein Delta, gelten
   die daraus destillierten Regeln **im selben Lauf** für den neuen Artikel —
   nie erst beim nächsten. Ein Lauf schreibt keinen Text, solange ein
   unausgewertetes Delta existiert.
6. **Log gegen DB abgleichen:** Jede Zeile des Auswertungs-Logs muss der DB
   entsprechen — umbenannte Slugs (Publish unter neuem Slug ist Feedback zum
   Titel), gelöschte Drafts, Status. Abweichungen im Log korrigieren, nie
   fortschreiben. **Eine Löschung ist erst dann Themen-Feedback, wenn Tomek
   den Grund genannt hat** — bis dahin im Report nachfragen, nicht deuten
   (08.09.2026: drei Drafts waren gelöscht, weil sie mit veraltetem Skill-
   und Puls-Stand entstanden waren, nicht wegen des Themas).
7. **Deltas nach Format trennen:** R-Regeln für die Blog-Stimme entstehen nur
   aus `/blog-article`- und `/podcast-article`-Artikeln. Korrekturen an
   Artist Stories (Kategorie `artist-stories`, Ich-Form des Artists) wandern
   in die Rubrik „Sonstige Feedback-Signale" mit Format-Label und in den
   `/artist-story`-Skill — nie in R1–R10. Korrekturen an
   **Endkunden-Artikeln** (Kategorie `tattoo-wissen`) werden als
   **E-Regeln** destilliert (`voice-learnings.md`, eigener Abschnitt),
   **nie** in R1–R14; umgekehrt gelten R-Regeln für Endkunden-Artikel nur
   als Startpunkt, solange keine E-Regel widerspricht.
8. Gibt es nichts Neues auszuwerten: weiter, ohne Zeit zu verbrennen.

## Lauf 1 — Topic-Mining (`/blog-article mining` oder wenn kein Thema gegeben)

Methode und Scoring-Formel stehen in `topic-radar.md` (Pflichtlektüre).
Ablauf:

1. **Strom A — Community-Puls aus der DB lesen (Digest zuerst, Zeilen zum Belegen).**
   Strom A ist zentrale Infrastruktur: die Wochen-Batterie v3 (DeepAPI:
   YouTube-Suche/-Referenzkanäle, Reddit-Suche/-broad, IG-Hashtags/-Accounts,
   TikTok-Suche, FB-Gruppen, Web; Kommentare je Plattform dynamisch aus den
   Wochen-Treffern; Mitbewerber-Reviews Apple/Play/Trustpilot; SerpApi
   Trends/PAA) läuft als Kette Mo 06:00 UTC (`battery → comments → enrich →
   digest`; `lib/mining/*`, Batterie-Quelle der Wahrheit `lib/mining/config.ts`):
   Erhebung (`mining_runs`/`topic_signals`, nur Neues je Woche) → LLM-Verdichtung
   je Zeile (`topic_classifications`: `audience`, `signal_type`, `language`,
   `cluster`, `quote`, `question`, `feature`) → Wochen-Digest (`pulse_digests`).
   `/community-voices` (Marketing-Repo) liest denselben Bestand. Dieser Skill
   scrapt nicht ad hoc, er liest — in dieser Reihenfolge:
   - **Freshness-Gate:** `select iso_week, generated_at, headline from
     pulse_digests order by generated_at desc limit 1` — der jüngste Digest muss
     ≤ 8 Tage alt sein. Sonst `pulse_jobs` der Woche lesen (`step, status, error,
     result`) und die Kette nachlaufen lassen (`pnpm mining:sync`, `--comments`,
     `--enrich`, `--digest`; Recovery `--request <deepapiRequestId> --source
     <key>`), bevor es weitergeht — oder dokumentierter degradierter Fallback.
   - **Qualitäts-Gate (Pflicht, seit 2026-09-08):** je Digest-Woche
     `pnpm pulse:quality --week <iso>` (oder `select
     pulse_quality_report('<iso>')->'totals'` via Service-Role-Skript) lesen.
     Eine Woche ist als **Shortlist-Basis** nur tragfähig mit `useful_de ≥ 300`
     und `questions_de ≥ 40` (Rubrik `.claude/plans/community-pulse-v3/
     quality-rubrik.md`). Dünne Wochen (Beispiel 2026-W37: 455 Signale,
     useful_de 19 — Dedupe-Schatten der Testläufe) liefern nur Δ-Kontext, nie
     die Themenwahl. Ist die jüngste Woche dünn: die letzten 2–4 Digests
     zusammen lesen und Cluster-Verläufe aus `pulse_cluster_weekly` über diese
     Wochen ziehen (`n_signals`, `score`, `trend_gate`, `n_questions`). Im
     Lauf-Eintrag steht, welche Wochen die Shortlist getragen haben.
   - **Digest lesen:** `digest_md` + `digest` (jsonb) der tragenden Woche(n) —
     `top_topics` (mit Δ zu den 4 Vorwochen), `questions`, `complaints`/`wishes`/
     `praise`, `videos` (x-Ratio), `competitor_feedback` (unattribuiert),
     `first_party`, `quotes`, `candidates`, `gaps`. Shortlist = `candidates`
     mit `format in ('blog', 'faq')` zuerst (Reel/Carousel/Clip gehören
     `/community-voices` bzw. Social), dann `top_topics` ohne Kandidat; `gaps`
     ist die Liste dessen, was diese Woche NICHT behauptet werden darf.
   - **Zeilen zum Belegen:** je Kandidat die `evidence_ids` (`run_id|external_id`)
     gegen `topic_signals` + `topic_classifications` auflösen (Titel, Quelle,
     `posted_at`, `quote`, `engagement`); Cluster-Verlauf aus
     `pulse_cluster_weekly`, Ausreißer je Run aus `topic_cluster_scores`.
   - Endkunden-Signale (`audience = 'endkunde'`) sind für den
     **Artist-Strang** Kontext, nie Discovery-Beleg; Reddit-EN bleibt Label
     **Hypothese**; `is_seeded`-Zeilen bleiben Recall-Kontext. Für den
     **Endkunden-Strang** (Sonderregel, `toda-context.md`) gilt die eigene
     Shortlist:
   - **Endkunden-Shortlist:** aus `pulse_cluster_weekly` der tragenden
     Woche(n) die Cluster mit `n_endkunde > n_artist + n_mixed`,
     `trend_gate = true`, die **blog-beantwortbar** sind (nicht lokal
     „tätowierer <stadt>", nicht Motiv-Inspiration, nicht `off_topic`) —
     plus die Digest-`questions` mit `audience in ('endkunde','mixed')` je
     Cluster. Serp-Zeilen (`platform = 'serp'`, PAA-Fragen) sind hier
     **Discovery-Beleg**, weil sie die Google-Nachfrage direkt zeigen.
     Beide Shortlists (Artist / Endkunde) stehen getrennt im Radar-Eintrag.
     **Nie** ein Endkunden-Thema aus einem Artist-Kandidaten oder -Artikel
     ableiten.
   - **Digest-`quotes` sind Tier 3.** Die anonymisierten O-Töne des Digests
     (und die `quote`-Spalte der Klassifikation) gehören in den Report und
     in die Social-Ausleitung — im Artikeltext erscheinen sie nie wörtlich,
     nur als lose Stimmung (`sources.md`, Regel 2).
   - **YouTube-Kommentare on demand** (aktuelle Business-Episoden der
     Podcast-Kanäle, nur qualitativ): Data-API-Helper `lib/mining/youtube.ts`
     (`commentThreads`, `order=relevance` — nie die teure Data-API-`search`);
     Video-IDs aus den yt-search-Zeilen der DB.
   Wochen-Doppelungen fängt der Dedup-Check (Schritt 5) plus der Abgleich
   mit den letzten Radar-Einträgen ab.
2. **Override nur bei Bedarf** — klassifiziert wird von der Pipeline:
   - Der Cron schreibt jede Zeile mit `classified_by = 'llm'` (`model`,
     `prompt_version`) und überschreibt nie. Widerspricht ein Verdikt der
     Registry-Logik (falscher Cluster, falsche `audience`, Zitat nicht anonym),
     darf der Skill die Zeile **bewusst** überschreiben — über
     `pnpm pulse:override <override.json>` (`scripts/pulse-override.ts`:
     Service-Role, CLI-Regime, nur UPDATE je Zeile, Cluster nur aus der
     Registry, `classified_by` → `skill`, Grund landet in `note`, Vorher/
     Nachher als Read-back) nach Pre-Action-Report, im Lauf-Eintrag
     dokumentiert. Wofür: eine falsche Zeile verfälscht Score und Digest
     der Woche (Cluster-Summen, x-Ratio-Liste, Zitat-Pool) — typische
     Fälle: Video fälschlich als Diskussion gezählt, Zitat nicht anonym,
     Endkunden-Signal als Artist gelabelt. Selten nötig; nie in Masse
     (dafür `pnpm mining:sync --reclassify <version>`).
   - **Cluster nur aus der Registry** (`lib/mining/config.ts`
     `CLUSTER_REGISTRY` = `topic-radar.md`): `cluster_proposal` mit ≥ 5 Treffern
     in 2 Wochen ist ein Aufnahme-Kandidat — Entscheidung im Lauf-Eintrag, dann
     Registry in beiden Dateien erweitern. Nie Freitext-Cluster schreiben.
   - **Kanal-Zeilen-Pflicht** gilt für Overrides weiter: wer eine
     `yt-channels`-Zeile eines Runs anfasst, hält alle Zeilen des Runs
     konsistent (`is_discussion = true`, `cluster NULL` außer bei thematischem
     Video) — sonst kippt der Kanalmedian der View.
   - **Scores lesen:** `topic_cluster_scores` je `run_id` und
     `pulse_cluster_weekly` je Woche rechnen deterministisch in SQL — inklusive
     `trend_gate` (≥ 3 Zeilen über ≥ 2 Quellen) und `n_sources`/`n_platforms`
     (Cross-Source). Der Skill wendet nur noch das **Zielgruppen-Gate** selbst
     an (`toda-context.md`, „Für wen wir schreiben": `n_artist`/`n_mixed`
     gegen `n_endkunde` je Cluster). Das Gate gilt **je Strang**:
     Artist-Strang wie bisher; der Endkunden-Strang besteht es, wenn der
     Cluster endkundenlastig und blog-beantwortbar ist.
3. **Strom B checken (datiert, nicht „mal draufschauen"):**
   - **feelfarbig** über den RSS-Feed `https://feelfarbig.com/feed/`
     (`curl`, kostenlos, `pubDate` je Beitrag) — nur Beiträge seit dem
     letzten Radar-Eintrag zählen als neu.
   - **tattoo-recht.de:** Stand 08.09.2026 liefert die Startseite keine
     Urteile mehr und **jede Unterseite antwortet 404** (Menü-Ziele
     `/sample-page/wichtige-urteile/`, `/home/court-decisions/…`, auch
     `/feed/` und `/wp-json/`; per DeepAPI und `curl` geprüft). Pro Lauf
     genau diese Pfade erneut probieren; bleibt es 404, ist Strom B für
     Urteile **degradiert** und der Lauf-Eintrag sagt das. Urteils-Volltexte
     kommen dann direkt aus Tier 1 (NRWE, dejure — beide per DeepAPI lesbar,
     geprüft 08.09.2026).
   - **@recht_bunt** (Instagram, RA Urban Slamal — Tomeks benannte
     Vertrauensquelle, `sources.md` Tier 2): DeepAPI `POST /v1/scrape/
     instagram/posts` `{ "usernames": ["recht_bunt"] }` — Posts mit `postedAt`
     seit dem letzten Radar-Eintrag sind Trigger; ein Reel ist als Permalink
     verlinkbar („Anwalt X sagt …"), Zahlen/§§ weiter gegen Tier 1.
   - Weitere Tier-1/2-Seiten per DeepAPI `POST /v1/scrape/website`
     (`skill:deepapi` vor dem ersten Call laden); WebFetch nur als Fallback
     und nie als „die Seite" (Abdeckungslücken benennen).
4. **Strom C ziehen:** nächster offener Eintrag der Ziel-Liste in
   `topic-radar.md` (höchste Prio zuerst, max. **ein** C-Slot pro Lauf);
   Listen-Status im selben Lauf pflegen.
5. **Dedup-Check:** `select t.title, t.slug, t.tags, t.status from
   blog_post_translations t` — behandelte Themen scheiden aus oder
   brauchen einen neuen Winkel. Zusätzlich für den Endkunden-Strang: das
   Thema darf keinen Themen-Zwilling eines Artist-Artikels bilden
   (Slug/Titel/Tags beider Stränge vergleichen).
6. **Such-Validierung — erst die eigenen SERP-Zeilen, dann SerpApi:**
   Die Batterie speichert jede Woche Google-Trends-Rising/Top (`serp/
   trends/*`) und People-also-ask (`serp/paa/*`) in `topic_signals`
   (`platform = 'serp'`, Werte in `metrics`, Digest-Block `serp`). Diese
   Zeilen zuerst lesen (kostenlos, schon DACH-gefiltert). Nur für
   Kandidaten ohne Treffer dort: SerpApi-Suchvolumen (google.de,
   `SERPAPI_API_KEY`, Free-Plan 250/Monat — die Batterie braucht ~8/Woche)
   + DeepAPI `seo.rank`/`seo.audit` als SERP-Read (wer rankt zum Thema, wie
   stark?). DeepAPI `seo.keyword` ist für DE tot (gemessen 29.08.) — nicht
   verwenden. Die DACH-Kontext-Zeilen aus Strom A (TikTok-/YT-Kommentare,
   Web) sind qualitatives Entscheidungssignal neben den Scores — nie selbst
   gescored.
7. **Quellen-Check:** Trägt eine Tier-1/2-Quelle das Thema? Ohne
   Faktenbasis kein eigener Artikel.
8. **Radar-Eintrag anhängen** (datiert): referenzierte `run_id`s (statt
   Scrape-Parameter-Prosa), Klassifikations-/Cluster-Tabelle, Scores aus
   der View, Dedup-Ergebnis, gewählte Topics mit Begründung, Feld
   „Strang: artist | endkunde" + beide Shortlists.

Default-Wochenmix: 1× Strom A + 1× Strom C + 1× Strom B (wenn es News
gibt). Ist die C-Liste abgearbeitet: zurück zu 2× Strom A.

## Lauf 2 — Artikel schreiben (`/blog-article <thema>`)

### 2.0 Kontext laden (Pflicht)

1. `docs/blog/toda-context.md` — ohne dieses Dokument keinen Artikel.
2. `docs/blog/voice-learnings.md` — gelernte Stilregeln anwenden.
3. **Stil-Referenz:** die 1–2 zuletzt veröffentlichten Artikel aus der
   DB lesen — aber nur solche mit Original-Snapshot in
   `docs/blog/originals/` (= durch Tomeks Korrektur gegangen) und **nicht**
   aus der Kategorie `artist-stories` (Ich-Form des Artists, fremde Stimme;
   `select t.slug from blog_post_translations t join blog_posts p on p.id =
   t.post_id join blog_categories c on c.id = p.category_id where t.locale =
   'de' and t.status = 'published' and c.slug <> 'artist-stories' order by
   t.published_at desc limit 2`). Sie definieren Grammatik und Tonalität
   verbindlicher als jede Regel. Gibt es noch keine: Schicht 1 + 2 reichen.
   **Endkunden-Artikel:** die 1–2 zuletzt veröffentlichten Artikel der
   Kategorie `tattoo-wissen` mit Snapshot (gleiches SQL mit `c.slug =
   'tattoo-wissen'`); gibt es keine (Pilot): Schicht 1 + 2 + der
   E-Regeln-Abschnitt in `voice-learnings.md`, auch wenn er leer ist.

### 2.1 Recherche — Quellen-Library zuerst

- Start in `sources.md`: passende Tier-1/2-Quellen ziehen und per
  DeepAPI (`POST /v1/scrape/website`, PDFs `POST /v1/scrape/pdf`;
  `skill:deepapi` laden) **im selben Lauf** verifizieren — nie aus dem
  Gedächtnis. WebFetch nur, wenn DeepAPI nicht erreichbar ist, und dann
  mit benannter Abdeckungslücke.
- Reicht die Library nicht: gezielt neue Primär-/Fachquellen suchen,
  verifizieren, und **nur die tatsächlich verwendeten** als neuen
  Eintrag in `sources.md` aufnehmen (Tier, Zugriffsweg, Notizen).
  Extrem selektiv — die Library ist Wissensbasis, kein Bookmark-Ordner.
- **Quellen-Hierarchie im Artikel:**
  - Jede Rechts-/Zahlen-/Faktenaussage → Tier 1–2, verifiziert.
  - Community-Material (Tier 3) erscheint ausschließlich als lose
    Stimmung: „Man hört gerade oft von Artists, dass …" /
    „In den Communities häufen sich Berichte über …" — nie als
    Faktenbeleg, nie als wörtliches Zitat, nie mit Username/Link.
- Alle verwendeten Quellen mit URL für den Report notieren.

### 2.2 Schreiben

**Artikel-Format wählen** — Palette und Regeln in `toda-context.md`
(„Artikel-Formate"): Fall & Recht, Ratgeber oder Vorlagen-Format; Wahl +
Begründung in den Report. Im **Vorlagen-Format** ist die kopierbare
Vorlage (Blockquote/Codeblock) der Kern des Artikels und die
Feature-Brücke („… oder direkt digital in TODA") die eine TODA-Mention.

Format (Konvention der bestehenden Posts):

- **Kein H1 im `content_md`** — der Titel wird aus der DB gerendert.
  Erster Absatz = Einstieg, danach `##`-Sektionen.
- ~600–650 Wörter, per Du, TODA-Voice (frech, substanziell, Insider) —
  Zielwert aus `voice-learnings.md` R2 (an Tomeks veröffentlichten
  Fassungen gemessen, nicht geschätzt).
- Markdown: GFM; Listen, Tabellen, `>`-Quotes, **Emojis** (Unicode direkt
  im Text, an beliebiger Stelle) erlaubt. Emoji-Dosis NICHT vorschreiben —
  der Voice-Loop lernt sie aus Tomeks veröffentlichten Fassungen. Kein
  Inline-HTML (Pipeline sanitisiert; rohes HTML wird stillschweigend verworfen).
- **Verlinkung** (beide Arten laufen ohne Pipeline-Eingriff; externe Links
  öffnen automatisch in neuem Tab + `rel="noopener noreferrer"` via
  Post-Sanitize-Transform in `lib/blog/markdown.ts`):
  - **Quellen (extern):** Jede namentliche Fakten-/Rechtsaussage (Urteil, §,
    Studie, Zahl, Verordnung) bekommt einen Inline-Link `[Text](https://…)`
    auf die **verifizierte Tier-1/2-Quelle** — im selben Lauf per DeepAPI
    geprüft, Linkziel öffentlich lesbar (kein CAPTCHA/Login), URL fix in
    `sources.md`. Tier-3-Community wird **nie** verlinkt (bleibt Stimmung).
  - **Intern (Artikel ↔ Artikel):** Nur auf **veröffentlichte** Geschwister
    derselben Locale linken — `[Text](/<locale>/blog/<slug>)`, thematisch
    relevant. **Nie auf Drafts** (per-Locale-Publish → 404). Ziele per
    `select slug, title from blog_post_translations where locale = '<l>' and
    status = 'published'` ziehen. Keine veröffentlichten Geschwister da: keine
    internen Links erzwingen, stattdessen Kandidaten im Report vorschlagen
    (Tomek setzt sie beim Publish).
- TODA-Erwähnung: max. 1–2 Stellen, organisch dort, wo das Produkt den
  konkreten Schmerzpunkt löst. Kein Werbeblock, kein „Jetzt registrieren".
- **Endkunden-Artikel** (Strang Endkunde): R-Regeln gelten als Start (R2
  Länge, R5 Listen, R8 genau eine Mention); Mention-Frame „geführte
  Anfrage" und Haltung (immer zugunsten des Artists) aus dem
  Endkunden-Abschnitt in `toda-context.md`; im Report steht
  „Strang: Endkunde".
- Rechtsthemen: **kein Disclaimer** (Tomeks Entscheidung 08.09.2026 — er
  hatte ihn in beiden DE-Rechtsartikeln gestrichen). Korrektheit trägt der
  Fakten-Audit (2.4), nicht ein Schlussabsatz.
- Felder:
  - `title` — klickstark, ehrlich, ≤ ~70 Zeichen.
  - `slug` — Regeln aus `lib/blog/slugify.ts`: lowercase, `ä→ae ö→oe
    ü→ue ß→ss`, nur `[a-z0-9-]`. Unique pro Locale — vorher per SELECT prüfen.
    In `slug`/`seo_title`/`seo_description` ist Suchsprache erlaubt
    („Tätowierer") — Fließtext und `title` bleiben „Tattoo Artist"
    (`toda-context.md`, Regel 8).
  - `excerpt` — 1–2 Sätze für die Listing-Karte.
  - `tags` — 2–4 Stück, Title-Case.
  - `seo_title` ≤ 60 Zeichen, `seo_description` ≤ 155 Zeichen.

### 2.3 Draft in die DB schreiben

Geteiltes Supabase-Projekt `znocynswpsfckyfumema` — **CLI-Regime** (der
Plugin-Write-MCP ist abgeschafft): der Draft geht als JSON-Datei durch das
Repo-Skript `scripts/blog-draft-insert.ts` (Service-Role in-process, nur
INSERT in `blog_posts` + `blog_post_translations`, niemals DDL, niemals
UPDATE/DELETE). Ablauf: Draft-JSON ins Scratchpad schreiben →
**Pre-Action-Report** (Ziel prod, Kategorie, Locale, Slug, Länge) → Tomek
führt aus oder gibt den Lauf frei → `pnpm blog:draft-insert <draft.json>` →
Ausgabe `post_id`, `id`, `slug`, `content_length` (= Read-back-Beleg).

```json
{
  "category_slug": "<blog_categories.slug — Endkunden-Strang: tattoo-wissen>",
  "locale": "de",
  "slug": "<slug>",
  "title": "<title>",
  "excerpt": "<excerpt>",
  "content_md": "<content_md>",
  "tags": ["Tag1", "Tag2"],
  "seo_title": "<seo_title>",
  "seo_description": "<seo_description>"
}
```

Optional im JSON: `youtube_id`, `video_start_seconds`, `video_published_at`
(`/podcast-article`), `author_slug` (`/artist-story`), `category_id` /
`author_id` statt der Slugs.

`status = 'draft'`, `published_at` bleibt NULL. Cover-Bild leer lassen —
setzt Tomek beim Publish im Admin.

**Snapshot-Pflicht:** Unmittelbar nach dem Insert die Claude-Fassung
als `docs/blog/originals/<slug>.md` ablegen (Kopf-Kommentar mit
Insert-Datum + post_id, dann das exakte `content_md`). Ohne Snapshot
kann der Lern-Schritt (Lauf 0) das Korrektur-Delta nie messen — Tomeks
Edit im Admin überschreibt die DB-Fassung. Zusätzlich den Artikel im
Auswertungs-Log von `voice-learnings.md` registrieren.

### 2.4 Verifizieren & berichten

1. SELECT die eingefügte Zeile zurück (post_id, slug,
   `length(content_md)`, status) — das ist der Beleg.
2. Wissensdokumente nachziehen: neue Quellen → `sources.md`;
   Mining-Lauf → `topic-radar.md`-Eintrag.
3. Report an Tomek: Titel, Review-Link
   `https://www.todasolutions.com/admin/posts/<post_id>`, gewähltes
   Artikel-Format (mit Begründung), **vollständige Quellenliste mit Tier
   und URL**, wo die TODA-Erwähnung sitzt, und (bei Mining) der
   Daten-Trail Thema ← Score ← Scrape.
   **Fakten-Audit (Pflichtteil, seit 08.09.2026):** eine Tabelle
   *Behauptung im Artikel | Quelle (Tier, URL) | wörtliche Belegpassage aus
   dem DeepAPI-Scrape dieses Laufs*. Jede Zahl, jedes Aktenzeichen, jeder
   Paragraf, jede Frist ist eine Zeile. Eine Behauptung ohne Belegpassage
   fliegt aus dem Artikel, bevor der Draft geschrieben wird. Das ist Tomeks
   Prüfmethode — er liest die Tabelle, nicht die Quellen.
4. **Distribution-Ausweis** (Pflichtteil des Reports; nur Ausweis — die
   Umsetzung bleibt außerhalb dieses Skills):
   - **Recycling:** 2–3 fertige Social-Hook-Zeilen aus Titel-Hook und
     gefetteten Formeln (R1/R6) — Zeilen, keine Konzepte. Bei Mining
     zusätzlich: welche Top-Cluster Toddcast-Folgen-Kandidaten wären.
   - **Earned-Media-Flag:** pitch-fähig für Fachmedien (feelfarbig,
     Tattoo Spirit)? Ja/nein + ein Satz warum.
   - **Lead-Magnet-Flag:** steckt eine Vorlage im Thema
     (→ Vorlagen-Format), auch wenn dieser Artikel keine ist?
   - **Artikel-Story:** Story-Bild im Website-Look für den Link-Sticker —
     `/artist-story` Lauf 6 baut es aus der publizierten URL; gilt für
     jeden Artikel, nicht nur Artist-Stories.

## Harte Regeln

- Niemals publizieren, niemals bestehende Posts ändern oder löschen.
- Endkunden-Thema kommt nur aus der Endkunden-Shortlist des Pulses — nie
  als Zwilling eines Artist-Artikels.
- Tier 3 belegt keine Fakten; keine Community-Zitate (Reddit, TikTok-/
  YT-Kommentare, FB) als Faktenbeleg — Tier 3 bleibt Stimmung; keine
  unbelegten Rechtsaussagen.
- Slug-Kollision → neuen Slug wählen, nicht überschreiben.
- Eine Sprache pro Lauf (v1: nur `de`). Übersetzungen sind ein
  separater, späterer Schritt.
- Die Wissensdokumente sind Teil des Deliverables — ein Lauf ist erst
  vollständig, wenn aktualisiert sind: `sources.md` (neue/getestete
  Quellen), `topic-radar.md` (Mining-Eintrag), `voice-learnings.md`
  (Lern-Schritt + Log) und `originals/` (Snapshot je Insert).
- Neue Community-Kanäle nur über das Aufnahme-Protokoll in
  `sources.md` (Test-Scrape → Signal-Bewertung → dokumentiertes
  Verdikt) — nie unbewertet in den Mining-Mix.
