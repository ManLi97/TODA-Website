---
name: podcast-article
description: Recycelt eine Folge von TODAs eigenem Podcast Toddcast (YouTube) in einen eigenständigen, datengestützten deutschen TODA-Blogartikel als Draft im Supabase-Blog-CMS — nie 1:1-Transkript. Use when asked to turn a Toddcast episode into a blog post (/podcast-article <episode-url>) or to surface recycling candidates (/podcast-article mining). Teilt den kompletten Blog-Spine (Voice, Quellen, Lern-Loop) mit /blog-article; ergänzt Episoden-Intake, Segment-Auswahl und Video-Embed.
---

# /podcast-article — Toddcast-Folgen in TODA-Blogartikel recyceln

**Schwester-Skill von `/blog-article`.** Gleiche Stimme, gleicher Lern-Loop,
gleiches CMS, **publiziert nie**. Der Unterschied ist allein die
**Themenherkunft**: nicht Reddit/DACH-Radar, sondern eine **Toddcast**-Folge als
O-Ton-Primärquelle. Methodik: `docs/blog/podcast-radar.md` (Pflichtlektüre).

Geteilter Spine (identisch zu `/blog-article` — dort lesen, nicht duplizieren):

| Schicht | Dokument |
|---|---|
| Brand | `docs/blog/toda-context.md` (inkl. Abschnitt „Der Podcast — Toddcast") |
| Gelernte Voice | `docs/blog/voice-learnings.md` (R1–R10) + veröffentlichte Artikel (DB) + `docs/blog/originals/` |
| Vertrauensquellen | `docs/blog/sources.md` (Tier 1–2) |
| Recycling-Methodik | `docs/blog/podcast-radar.md` |

**Was dieser Skill anders macht als `/blog-article`** — nur diese vier Schichten;
alles andere (Lern-Schritt, Recherche, Schreiben, Insert, Snapshot, Report) ist
**identisch** und wird von `/blog-article` übernommen:
1. **Episoden-Intake** — URL → Transkript (DeepAPI-Transcript + Fenster-Merge).
2. **Segment-Auswahl** — welches Segment trägt den Artikel (Radar Phase A).
3. **Recycling-Disziplin** — O-Ton reframen statt transkribieren.
4. **Embed-Verdrahtung** — `youtube_id` / `video_start_seconds` / `video_published_at`.

## Lauf 0 — Lern-Schritt (Pflicht, identisch zu `/blog-article`)

Wie `/blog-article` Lauf 0: `voice-learnings.md` lesen; DB auf neu-veröffentlichte/
geänderte/gelöschte Artikel mit `originals/`-Snapshot prüfen; Delta semantisch
auswerten; Regeln + Log fortschreiben (Stil → `voice-learnings.md`, Struktur →
SKILL.md/`sources.md`/`toda-context.md`). Der Voice-Loop ist **geteilt** — ein
Toddcast-Artikel ist Stil-Lernmaterial wie jeder andere. Nichts Neues → weiter.

## Lauf 1 — Intake & Auswahl

### 1.0 Modus
- `/podcast-article <episode-url>` — diese Folge recyceln (Normalfall).
- `/podcast-article mining` — Radar Phase A: Kandidaten-Folgen/-Segmente aus
  Kanal-Signalen (Views/Likes/Kommentare + Kommentar-Mining) vorschlagen, Tomek
  wählt. Solange der Kanal klein ist, reicht Kommentar-Mining der jüngsten Folgen
  statt Voll-Scoring. **Kommentar-Mining läuft über den Data-API-Helper**
  `lib/mining/youtube.ts` (`fetchCommentThreads`, `commentThreads` mit
  `order=relevance`, 1 Quota-Einheit/100 Kommentare — nie die Data-API-`search`)
  bzw. `pnpm mining:sync --source yt-comments`; Kommentator-Identitäten werden
  nie übernommen (Whitelist-Mapper).

### 1.1 Episoden-Intake (Hybrid)
1. **Video-ID** aus der URL: `parseYouTubeInput()` aus `lib/blog/youtube.ts`
   (normalisiert watch / youtu.be / embed / live / shorts / nocookie → 11-Zeichen-ID).
2. **Captions ziehen (DeepAPI):** `POST /v1/scrape/youtube/transcript`
   (skill:deepapi laden; liefert das Transkript mit Timestamps). Die frühere
   Apify-Captions-Strecke ist ersetzt (Apify komplett raus, 08/2026).
3. **Fenster-Merge** zur Lesbarkeit: Captions in ~45-Sekunden-Fenster mit
   `[MM:SS]`-Kopf zusammenfassen (Logik wie `/tmp/toda-podcast/build.py`).
   Ergebnis: ein durchsuchbares Transkript **mit Timestamps** — Basis für den
   Segment-Deeplink (`video_start_seconds`).
4. **Qualitäts-Gate:** Dauer, Wortzahl, Stichproben (25/50/75 %) ausgeben.
   Captions sind **fehlerhaft** (Auto-ASR) — Namen, Fachbegriffe, Showname
   verrutschen. Zu schlechtes Transkript → **Fallback: Tomek liefert/pastet ein
   Transkript.**
5. **Sprecher-Lineup:** Caption-abgeleitete Namen sind **nicht vertrauenswürdig**.
   Lineup (Name + Rolle, Host/Gast) von Tomek erfragen oder aus der
   YouTube-Beschreibung ziehen. Ohne verlässliches Lineup → locker attribuieren
   („eine Gast-Künstlerin erzählt im Toddcast …"), **nie** einen aus Captions
   geratenen Namen behaupten.

### 1.2 Segment-Auswahl (Radar Phase A — Hybrid, Tomek bestätigt)
Aus dem Transkript das **eine** artikel-fähige Segment wählen: eine in sich
geschlossene These/Story/Anleitung mit DACH-Such-Demand-Potenzial. Kommentar-
Mining zeigt, welches Segment zündet. Segment-Timestamp notieren →
`video_start_seconds`. Kandidaten Tomek vorlegen, er bestätigt.
**Eine Folge → ein Artikel pro Lauf**; dieselbe Folge kann später für ein anderes
Segment wiederkommen (Dedup-Check trackt benutzte Slugs/Themen).

## Lauf 2 — Validieren, Schreiben, Einfügen

### 2.0 Kontext laden (Pflicht, wie `/blog-article` 2.0)
`toda-context.md` (inkl. Toddcast-Abschnitt) + `voice-learnings.md` + die 1–2
zuletzt veröffentlichten Artikel mit `originals/`-Snapshot (Stil-Referenz).

### 2.1 Validierung (drei Gates — `podcast-radar.md`)
1. **Dedup-Check:** `select title, slug, tags, status from
   blog_post_translations` — Thema/Segment schon abgedeckt? → anderer Winkel oder
   anderes Segment.
2. **Such-Validierung:** DACH-Suchinteresse fürs Segment-Thema (Brave Search). Bei
   supply-getriebener Auswahl **besonders scharf** — kein Interesse → Winkel auf
   einen gesuchten Teilaspekt drehen oder Folge zurückstellen.
3. **Quellen-Check / Recherche:** wie `/blog-article` 2.1 — Fakten aus
   `sources.md` Tier-1/2, per WebFetch **im selben Lauf** verifiziert, inline
   verlinkt. **Die Folge ist O-Ton, kein Faktenbeleg:** Host-Aussagen sind
   Haltung/Anekdote; jede Rechts-/Zahlen-/Faktenaussage braucht Tier-1/2.

### 2.2 Schreiben — reframen, nicht transkribieren
Voll unter R1–R10 (`voice-learnings.md`); Format identisch zu `/blog-article` 2.2
(kein H1, ~600–650 Wörter, per Du, GFM, kein Inline-HTML, Verlinkungsregeln,
Felder `title`/`slug`/`excerpt`/`tags`/`seo_*`). **Podcast-spezifisch:**
- **Kein 1:1-Transkript, keine Folgen-Zusammenfassung.** Die Kern-These des
  Segments wird in einen straffen, suchbaren TODA-Text übersetzt — eine These,
  ein Kernfakt (R4).
- **O-Ton einweben:** Host/Gast **namentlich** (laut Lineup, nicht laut Captions)
  paraphrasieren oder kurz wörtlich zitieren. Das Embed bettet die Folge ein — der
  Text doppelt sie nicht nach.
- **Showname:** immer **„Toddcast"**. Das in den Captions hörbare In-Episode-Wort
  (z. B. „Stechstunde") **nie** übernehmen.
- Rechtsthemen: kursiver Disclaimer als letzter Absatz wie `/blog-article`.

### 2.3 Draft in die DB + Embed-Felder
Insert wie `/blog-article` 2.3 (geteiltes Supabase-Projekt `znocynswpsfckyfumema`,
Schreib-MCP `mcp__plugin_supabase_supabase__execute_sql`, nur INSERT in
`blog_posts` + `blog_post_translations`, `status='draft'`), **plus die drei
Embed-Spalten:**

```sql
with p as (
  insert into public.blog_posts (category_id) values ('<category_id>') returning id
)
insert into public.blog_post_translations
  (post_id, locale, slug, title, excerpt, content_md, tags,
   seo_title, seo_description, status,
   youtube_id, video_start_seconds, video_published_at)
select id, 'de', '<slug>', '<title>', '<excerpt>',
       $md$<content_md>$md$,
       array['Tag1','Tag2'], '<seo_title>', '<seo_description>', 'draft',
       '<youtube_id>', <video_start_seconds_or_null>, '<video_published_at>'
from p
returning post_id, id, slug, youtube_id, video_start_seconds;
```

- `youtube_id` = 11-Zeichen-ID aus 1.1. `video_start_seconds` = Segment-Timestamp
  (oder NULL für Folgenstart). `video_published_at` = Veröffentlichungsdatum der
  Folge (Datum aus YouTube-Metadaten, kein `new Date()`).
- **Snapshot-Pflicht** wie `/blog-article`: `docs/blog/originals/<slug>.md`
  (Kopf-Kommentar mit Insert-Datum + post_id, dann exaktes `content_md`) +
  Registrierung im `voice-learnings.md`-Auswertungs-Log.

### 2.4 Verifizieren & berichten
1. SELECT die eingefügte Zeile zurück inkl. `youtube_id, video_start_seconds` —
   Beleg, dass Artikel **und** Embed gesetzt sind.
2. `docs/blog/podcast-radar.md` **Lauf-Eintrag** anhängen (datiert): Folge
   (Titel/URL/id), Segment + Timestamp, Engagement-Snapshot, die drei
   Gate-Ergebnisse, genutzte Tier-1/2-Quellen, Embed-Felder, Draft-Slug + post_id,
   Begründung. (Nicht `topic-radar.md`.)
3. Report an Tomek: Titel, Review-Link `https://<vercel-domain>/admin/posts/<post_id>`,
   vollständige Quellenliste (Tier + URL), wo die TODA-Erwähnung sitzt, das
   gewählte Segment (Timestamp) und die Folge.
4. **Distribution-Ausweis** (Pflichtteil des Reports; nur Ausweis):
   - **Recycling:** 2–3 fertige Social-Hook-Zeilen aus Titel-Hook und
     gefetteten Formeln (R1/R6).
   - **Beat-Empfehlung:** Artikel-Publish zeitlich an den Folgen-Push legen —
     das Embed schiebt die Folge, die Folge schiebt den Artikel (Timing statt
     Budget; Prinzip: Marketing-Baukasten, `strategy/recycling-engine.md`).
   - **Earned-Media-Flag:** pitch-fähig für Fachmedien? Ja/nein + warum.

## Harte Regeln (Spine-Regeln + Podcast-Zusätze)
- Alle harten Regeln aus `/blog-article` gelten (nie publizieren, nie fremde Posts
  ändern/löschen; Tier 3 belegt keine Fakten; Slug-Kollision → neuer Slug; eine
  Sprache pro Lauf = `de`; die Wissensdokumente sind Teil des Deliverables).
- **Nie 1:1-Transkript** — die Folge ist O-Ton, kein Faktenbeleg.
- **„Toddcast"**, nie der In-Episode-Showname aus den Captions.
- **Keine aus Auto-Captions geratenen Eigennamen** — Lineup von Tomek/Beschreibung.
- Radar-Eintrag landet in `podcast-radar.md`, nicht `topic-radar.md`.
