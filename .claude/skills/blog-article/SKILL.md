---
name: blog-article
description: Erstellt deutsche TODA-Blogartikel als Drafts im Supabase-Blog-CMS. Use when asked to write a TODA blog post (/blog-article <thema>) or to run topic mining (/blog-article mining). Covers data-based topic selection (Reddit + DACH-Radar), sourced research via the Quellen-Library, writing in TODA voice, and draft insert for review in /admin.
---

# /blog-article — TODA-Blogartikel datenbasiert erzeugen

Zwei getrennte Läufe über drei Wissensdokumenten:

| Dokument | Rolle |
|---|---|
| `docs/blog/toda-context.md` | Voice, Produkt, Redaktionsregeln — Pflichtlektüre vor jedem Schreiben |
| `docs/blog/sources.md` | Quellen-Library (Tier 1–3) — Startpunkt jeder Recherche, selbstwachsend |
| `docs/blog/topic-radar.md` | Mining-Protokoll — Scoring-Methode + append-only Lauf-Einträge |

**Publiziert wird ausschließlich von Tomek im `/admin`-Editor — dieser
Skill setzt niemals `status = 'published'`.**

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
   `Engagement = Upvotes + 2×Kommentare`, Cluster-Score = Summe.
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

`docs/blog/toda-context.md` lesen — ohne dieses Dokument keinen Artikel.

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
- 900–1500 Wörter, per Du, TODA-Voice (frech, substanziell, Insider).
- Markdown: GFM; Listen, Tabellen, `>`-Quotes erlaubt. Kein Inline-HTML
  (Pipeline sanitisiert).
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
- `sources.md` und `topic-radar.md` sind Teil des Deliverables — ein
  Lauf, der sie nicht aktualisiert, ist unvollständig.
