---
name: blog-article
description: Erstellt einen deutschen TODA-Blogartikel als Draft im Supabase-Blog-CMS. Use when asked to write a TODA blog post (/blog-article <thema>) — covers research, writing in TODA voice, and inserting the draft for review in /admin. Also covers topic mining from Reddit when no topic is given.
---

# /blog-article — TODA-Blogartikel als Draft erzeugen

Pipeline: Thema → Recherche → Artikel (de) → Draft-Insert in Supabase →
Verifikation → Report. **Publiziert wird ausschließlich von Tomek im
`/admin`-Editor — dieser Skill setzt niemals `status = 'published'`.**

## 0. Kontext laden (Pflicht)

Lies zuerst `docs/blog/toda-context.md` — Voice, Produkt-Bausteine und die
harten Redaktionsregeln (90 % Mehrwert, CTA in den Zeilen, Disclaimer bei
Rechtsthemen, Reddit nur als Themensignal). Ohne dieses Dokument keinen
Artikel schreiben.

## 1. Thema & Recherche

- Ohne Thema: Topic-Mining. Signalquelle ist **r/TattooArtists** (Diskussionen,
  echte Schmerzpunkte) + r/tattooadvice; r/tattoos ist Bilder-Showcase, wenig Signal.
- Apify-Actors, die funktionieren (Stand Juni 2026):
  - Thread + Kommentare: `clearpath/reddit-post-comments-bulk-scraper`
    (`postUrls`, `sort: "top"`, `maxCommentsPerPost`).
  - Subreddit-Posts: `trudax/reddit-scraper-lite` (`startUrls` auf
    `…/top/?t=month`, `proxy: {useApifyProxy: true, apifyProxyGroups: ["RESIDENTIAL"]}`).
  - `khadinakbar/reddit-posts-comments-scraper` liefert 403s — nicht verwenden.
  - `apify/rag-web-browser` kommt bei reddit.com nicht durch; für normale
    Webseiten und Google-Suchen ist er gut.
- **Jede Rechts-/Faktenbehauptung braucht eine Primär- oder Fachquelle**
  (EUR-Lex, BMUV/BfR, tattoo-recht.de, ECHA …) — per WebFetch verifizieren,
  nie aus dem Gedächtnis. Quellen mit URL für den Report notieren.
- Reddit liefert nur das *Was beschäftigt die Leute* — keine wörtlichen Zitate
  übernehmen.

## 2. Artikel schreiben

Format (Konvention der bestehenden Posts):

- **Kein H1 im `content_md`** — der Titel wird aus der DB gerendert.
  Erster Absatz = Einstieg, danach `##`-Sektionen.
- 900–1500 Wörter, per Du, TODA-Voice (frech, substanziell, Insider).
- Markdown: GFM; Listen, Tabellen, `>`-Quotes erlaubt. Die Pipeline
  sanitisiert HTML — kein Inline-HTML verwenden.
- TODA-Erwähnung: max. 1–2 Stellen, organisch dort, wo das Produkt den
  konkreten Schmerzpunkt löst. Kein Werbeblock, kein "Jetzt registrieren".
- Rechtsthemen: kursiver Disclaimer als letzter Absatz
  (*keine Rechtsberatung, im Zweifel Anwält:in fragen*).
- Felder:
  - `title` — klickstark, ehrlich, ≤ ~70 Zeichen.
  - `slug` — Regeln aus `lib/blog/slugify.ts`: lowercase, `ä→ae ö→oe ü→ue ß→ss`,
    nur `[a-z0-9-]`, kein führender/abschließender Bindestrich.
    Unique pro Locale — vorher per SELECT prüfen.
  - `excerpt` — 1–2 Sätze für die Listing-Karte.
  - `tags` — 2–4 Stück, Title-Case.
  - `seo_title` ≤ 60 Zeichen, `seo_description` ≤ 155 Zeichen.

## 3. Draft in die DB schreiben

Ziel ist das geteilte Supabase-Projekt (`znocynswpsfckyfumema`) via
Supabase MCP. Nur INSERTs in `blog_posts` + `blog_post_translations`,
niemals DDL, niemals UPDATE/DELETE an fremden Zeilen.

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

## 4. Verifizieren & berichten

1. SELECT die eingefügte Zeile zurück (post_id, slug, `length(content_md)`,
   status) — das ist der Beleg.
2. Report an Tomek: Titel, Review-Link
   `https://<vercel-domain>/admin/posts/<post_id>`, verwendete Quellen
   (URLs), wo die TODA-Erwähnung sitzt.

## Harte Regeln

- Niemals publizieren, niemals bestehende Posts ändern oder löschen.
- Keine Reddit-Zitate, keine unbelegten Rechtsaussagen.
- Slug-Kollision → neuen Slug wählen, nicht überschreiben.
- Eine Sprache pro Lauf (v1: nur `de`). Übersetzungen sind ein separater,
  späterer Schritt.
