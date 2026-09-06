---
name: blog-article
description: Erstellt deutsche TODA-Blogartikel als Drafts im Supabase-Blog-CMS. Use when asked to write a TODA blog post (/blog-article <thema>) or to run topic mining (/blog-article mining). Covers data-based topic selection (Community-Puls (DB) + DACH-Radar + SEO-Gap-Liste), sourced research via the Quellen-Library, writing in TODA voice (Formate: Fall & Recht, Ratgeber, Vorlagen), and draft insert for review in /admin.
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
5. Gibt es nichts Neues auszuwerten: weiter, ohne Zeit zu verbrennen.

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
   - **Digest lesen:** `digest_md` + `digest` (jsonb) der jüngsten Woche —
     `top_topics` (mit Δ zu den 4 Vorwochen), `questions`, `complaints`/`wishes`/
     `praise`, `videos` (x-Ratio), `competitor_feedback` (unattribuiert),
     `first_party`, `quotes`, `candidates`, `gaps`. Das ist die Themen-Shortlist.
   - **Zeilen zum Belegen:** je Kandidat die `evidence_ids` (`run_id|external_id`)
     gegen `topic_signals` + `topic_classifications` auflösen (Titel, Quelle,
     `posted_at`, `quote`, `engagement`); Cluster-Verlauf aus
     `pulse_cluster_weekly`, Ausreißer je Run aus `topic_cluster_scores`.
   - Endkunden-Signale (`audience = 'endkunde'`) sind Kontext, nie
     Discovery-Beleg; Reddit-EN bleibt Label **Hypothese**; `is_seeded`-Zeilen
     bleiben Recall-Kontext.
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
     darf der Skill die Zeile **bewusst** überschreiben: `update
     topic_classifications set … where run_id = … and external_id = … and
     classified_by = 'llm'` — als kleines Repo-Skript (Service-Role, CLI-Regime,
     kein Write-MCP) nach Pre-Action-Report, im Lauf-Eintrag dokumentiert.
   - **Cluster nur aus der Registry** (`lib/mining/config.ts`
     `CLUSTER_REGISTRY` = `topic-radar.md`): `cluster_proposal` mit ≥ 5 Treffern
     in 2 Wochen ist ein Aufnahme-Kandidat — Entscheidung im Lauf-Eintrag, dann
     Registry in beiden Dateien erweitern. Nie Freitext-Cluster schreiben.
   - **Kanal-Zeilen-Pflicht** gilt für Overrides weiter: wer eine
     `yt-channels`-Zeile eines Runs anfasst, hält alle Zeilen des Runs
     konsistent (`is_discussion = true`, `cluster NULL` außer bei thematischem
     Video) — sonst kippt der Kanalmedian der View.
   - **Scores lesen:** `topic_cluster_scores` je `run_id` und
     `pulse_cluster_weekly` je Woche rechnen deterministisch in SQL.
     **Zielgruppen-Gate, Trend-Gate (≥ 3 Zeilen über ≥ 2 Quellen) und
     Cross-Source** wendet der Skill weiterhin selbst an (Zielgruppen-Gate →
     `toda-context.md`, „Für wen wir schreiben").
3. **Strom B checken:** tattoo-recht.de (+ ggf. weitere Tier-1/2-News)
   per WebFetch auf neue Urteile/Updates prüfen.
4. **Strom C ziehen:** nächster offener Eintrag der Ziel-Liste in
   `topic-radar.md` (höchste Prio zuerst, max. **ein** C-Slot pro Lauf);
   Listen-Status im selben Lauf pflegen.
5. **Dedup-Check:** `select t.title, t.slug, t.tags, t.status from
   blog_post_translations t` — behandelte Themen scheiden aus oder
   brauchen einen neuen Winkel.
6. **Such-Validierung:** Top-Kandidaten mit SerpApi-Suchvolumen prüfen
   (google.de, `SERPAPI_API_KEY`) + DeepAPI `seo.rank`/`seo.audit` als
   SERP-Read (wer rankt zum Thema, wie stark?). DeepAPI `seo.keyword` ist
   für DE tot (gemessen 29.08.) — nicht verwenden. Die DACH-Kontext-Zeilen
   aus Strom A (TikTok-/YT-Kommentare, Web) sind qualitatives
   Entscheidungssignal neben den Scores — nie selbst gescored.
7. **Quellen-Check:** Trägt eine Tier-1/2-Quelle das Thema? Ohne
   Faktenbasis kein eigener Artikel.
8. **Radar-Eintrag anhängen** (datiert): referenzierte `run_id`s (statt
   Scrape-Parameter-Prosa), Klassifikations-/Cluster-Tabelle, Scores aus
   der View, Dedup-Ergebnis, gewählte Topics mit Begründung.

Default-Wochenmix: 1× Strom A + 1× Strom C + 1× Strom B (wenn es News
gibt). Ist die C-Liste abgearbeitet: zurück zu 2× Strom A.

## Lauf 2 — Artikel schreiben (`/blog-article <thema>`)

### 2.0 Kontext laden (Pflicht)

1. `docs/blog/toda-context.md` — ohne dieses Dokument keinen Artikel.
2. `docs/blog/voice-learnings.md` — gelernte Stilregeln anwenden.
3. **Stil-Referenz:** die 1–2 zuletzt veröffentlichten Artikel aus der
   DB lesen — aber nur solche mit Original-Snapshot in
   `docs/blog/originals/` (= durch Tomeks Korrektur gegangen). Sie
   definieren Grammatik und Tonalität verbindlicher als jede Regel.
   Gibt es noch keine: Schicht 1 + 2 reichen.

### 2.1 Recherche — Quellen-Library zuerst

- Start in `sources.md`: passende Tier-1/2-Quellen ziehen und per
  WebFetch **im selben Lauf** verifizieren — nie aus dem Gedächtnis.
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
    auf die **verifizierte Tier-1/2-Quelle** — im selben Lauf per WebFetch
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
- Rechtsthemen: kursiver Disclaimer als letzter Absatz
  (*keine Rechtsberatung, im Zweifel Anwält:in fragen*).
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
  "category_slug": "<blog_categories.slug>",
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
   `https://<vercel-domain>/admin/posts/<post_id>`, gewähltes
   Artikel-Format (mit Begründung), **vollständige Quellenliste mit Tier
   und URL**, wo die TODA-Erwähnung sitzt, und (bei Mining) der
   Daten-Trail Thema ← Score ← Scrape.
4. **Distribution-Ausweis** (Pflichtteil des Reports; nur Ausweis — die
   Umsetzung bleibt außerhalb dieses Skills):
   - **Recycling:** 2–3 fertige Social-Hook-Zeilen aus Titel-Hook und
     gefetteten Formeln (R1/R6) — Zeilen, keine Konzepte. Bei Mining
     zusätzlich: welche Top-Cluster Toddcast-Folgen-Kandidaten wären.
   - **Earned-Media-Flag:** pitch-fähig für Fachmedien (feelfarbig,
     Tattoo Spirit)? Ja/nein + ein Satz warum.
   - **Lead-Magnet-Flag:** steckt eine Vorlage im Thema
     (→ Vorlagen-Format), auch wenn dieser Artikel keine ist?

## Harte Regeln

- Niemals publizieren, niemals bestehende Posts ändern oder löschen.
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
