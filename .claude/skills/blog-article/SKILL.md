---
name: blog-article
description: Erstellt deutsche TODA-Blogartikel als Drafts im Supabase-Blog-CMS. Use when asked to write a TODA blog post (/blog-article <thema>) or to run topic mining (/blog-article mining). Covers data-based topic selection (Reddit + DACH-Radar), sourced research via the Quellen-Library, writing in TODA voice, and draft insert for review in /admin.
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

1. **Strom A scrapen — alle aktiven Tier-3-Quellen aus `sources.md`.**
   Subreddits im **Mischfenster**: `top/?t=week` (was diese Woche
   brennt) + `top/?t=month` (was sich als Trend hält); Posts mit
   `includeMediaLinks: true` für Upvotes/Kommentarzahl. Dazu
   YouTube-Kommentare der gelisteten Podcast-Kanäle (Top-Kommentare
   aktueller Business-Episoden). Actor-Konfigurationen stehen bei den
   Quellen-Einträgen. Wochen-Doppelungen fängt der Dedup-Check (Schritt
   4) plus der Abgleich mit den letzten Radar-Einträgen ab.
2. **Clustern + scoren:** Jeden Post einem Themen-Cluster zuordnen,
   `Engagement = Upvotes + 2×Kommentare`, Cluster-Score = Σ der
   baseline-normalisierten Outlier je Post (Outlier = Engagement /
   Quellen-Median; volle Formel + Begründung in `topic-radar.md`).
   Die Zuordnungstabelle vollständig in den Radar-Eintrag schreiben —
   der manuelle Schritt muss überprüfbar sein.
3. **Strom B checken:** tattoo-recht.de (+ ggf. weitere Tier-1/2-News)
   per WebFetch auf neue Urteile/Updates prüfen.
4. **Dedup-Check:** `select t.title, t.slug, t.tags, t.status from
   blog_post_translations t` — behandelte Themen scheiden aus oder
   brauchen einen neuen Winkel.
5. **Such-Validierung:** Top-Kandidaten per Websuche (DACH-Suchinteresse?).
6. **Quellen-Check:** Trägt eine Tier-1/2-Quelle das Thema? Ohne
   Faktenbasis kein eigener Artikel.
7. **Radar-Eintrag anhängen** (datiert): Scrape-Parameter, Cluster-Tabelle,
   Scores, Dedup-Ergebnis, gewählte Topics mit Begründung.

Default-Wochenmix: 2× Strom A + 1× Strom B (wenn es News gibt).

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
  - `excerpt` — 1–2 Sätze für die Listing-Karte.
  - `tags` — 2–4 Stück, Title-Case.
  - `seo_title` ≤ 60 Zeichen, `seo_description` ≤ 155 Zeichen.

### 2.3 Draft in die DB schreiben

Geteiltes Supabase-Projekt `znocynswpsfckyfumema`, via Supabase-MCP
**mit Schreibzugriff** (`mcp__plugin_supabase_supabase__execute_sql`
mit `project_id` — der Standard-Supabase-MCP ist read-only). Nur
INSERTs in `blog_posts` + `blog_post_translations`, niemals DDL,
niemals UPDATE/DELETE an fremden Zeilen.

```sql
-- Kategorie wählen (vorher: select id, slug from blog_categories;)
with p as (
  insert into public.blog_posts (category_id) values ('<category_id>') returning id
)
insert into public.blog_post_translations
  (post_id, locale, slug, title, excerpt, content_md, tags, seo_title, seo_description, status)
select id, 'de', '<slug>', '<title>', '<excerpt>',
       $md$<content_md>$md$,
       array['Tag1','Tag2'], '<seo_title>', '<seo_description>', 'draft'
from p
returning post_id, id, slug;
```

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
   `https://<vercel-domain>/admin/posts/<post_id>`, **vollständige
   Quellenliste mit Tier und URL**, wo die TODA-Erwähnung sitzt, und
   (bei Mining) der Daten-Trail Thema ← Score ← Scrape.

## Harte Regeln

- Niemals publizieren, niemals bestehende Posts ändern oder löschen.
- Tier 3 belegt keine Fakten; keine Reddit-Zitate; keine unbelegten
  Rechtsaussagen.
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
