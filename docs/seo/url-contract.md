# URL-Vertrag — Canonical, hreflang, Redirects, Breadcrumbs

Stand: 2026-09-06 · Quelle: `.claude/plans/seo-canonical-hreflang-breadcrumbs.md` (Plan) ·
Code: `i18n/routing.ts`, `middleware.ts`, `lib/seo/alternates.ts`, `lib/seo/structured-data.ts`,
`app/sitemap.ts` · Tests: `tests/alternates.test.ts`, `tests/structured-data.test.ts`

## Warum (GSC-Befund 06.09.2026)

- Google hielt für die deutsche Startseite `https://www.todasolutions.com/` für kanonisch; `/de`
  war „Duplicate, Google chose different canonical than user" — dasselbe bei DE-Artikeln und
  Kategorieseiten (Google-Canonical = präfixlose URL, die per 307 auf `/de/…` leitete).
- Ursachen: temporäre 307-Redirects (Quell-URL bleibt im Index), ein next-intl-`Link`-Header mit
  `x-default` auf die Redirect-URL und es/en-Alternates auf nicht existierende Slugs (widersprach
  dem `<head>`), externe Links auf präfixlose URLs, Legal-Seiten ohne eigene Metadata.
- Folge: Entity-Graph saß auf der falschen kanonischen URL, 10/40 Sitemap-URLs Google unbekannt,
  kein Rich Result in 90 Tagen.

## Entscheidungen (Tomek, 06.09.2026)

1. Präfix für alle drei Sprachen (`/de`, `/en`, `/es`), Deutsch hat Vorrang, wo gewählt werden muss.
2. Root `/` → 308 → `/de`. Keine automatische Sprach-Weiterleitung (Cookie/Accept-Language). Statt-
   dessen ein einmaliger, dezenter Sprachhinweis in der Gerätesprache (`components/locale-hint.tsx`,
   Wahl in `localStorage["toda.locale-hint"]`, Header-Switcher zählt als Wahl). Kein Cookie.
3. Structured Data nur mit belegbaren Fakten: BreadcrumbList + CollectionPage; kein FAQPage, keine
   Bewertungen, keine Team-Person-Knoten.

## Vertrag D1–D6 (bindend)

| #   | Regel                                                                                                                                                                                                                                                                                         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Canonical jeder öffentlichen Seite = `https://www.todasolutions.com/{locale}/{path}` (`SITE_URL` aus `lib/site.ts`). Nie präfixlos, nie Apex.                                                                                                                                                 |
| D2  | hreflang im `<head>` (Next Metadata) für Home, `/blog`, Kategorie, Artikel: `de`, `en`, `es` (Artikel: nur veröffentlichte Geschwister) **plus `x-default`** = deutsche URL; Artikel ohne veröffentlichte DE-Übersetzung: eigene URL. Kein `Link`-Header (next-intl `alternateLinks: false`). |
| D3  | Sitemap spiegelt D2 exakt — gleicher Builder (`lib/seo/alternates.ts`).                                                                                                                                                                                                                       |
| D4  | Jede präfixlose URL (`/`, `/blog/…`, `/imprint`, …) → **308** auf `/de/…` (`localeDetection: false`, Middleware wandelt next-intls 307 in 308). Slug-Heilung zwischen Sprachen (`/de/blog/<en-slug>` → `/de/blog/<de-slug>`) → 308 (`permanentRedirect`).                                     |
| D5  | Legal-Seiten (`/imprint`, `/privacy`) sind unter allen Präfixen identisch deutsch → Canonical aller drei = `/de/…`, kein hreflang, Sitemap führt nur die DE-URL. Eigener deutscher `<title>` (dokumentierte Ausnahme von „alle Copy via next-intl").                                          |
| D6  | Breadcrumbs: sichtbarer Pfad (`components/blog/breadcrumbs.tsx`) und `BreadcrumbList` identisch. Artikel: `Blog › Kategorie` (beide verlinkt, Artikel selbst kein Item). Kategorieseite: `Blog › Kategorie` (Kategorie = aktuelle Seite, ohne `item`). Artikel ohne Kategorie: nur `Blog`.    |

## Regel für externe Links

Immer `https://www.todasolutions.com/de/...` verlinken (Social-Posts, Bio-Links, Newsletter,
Partner). Apex (`todasolutions.com`) und präfixlose Pfade funktionieren weiter, leiten aber 308 —
jeder Link auf die Redirect-URL schwächt das Canonical-Signal.

## Verifikationsrezept

**Lokal** (`pnpm dev`, dann curl gegen `http://localhost:3000`) oder **Prod** (gegen
`https://www.todasolutions.com`):

```bash
B=http://localhost:3000   # oder https://www.todasolutions.com
h() { curl -s -o /dev/null -D - "$@" | tr -d '\r' | grep -i "^HTTP\|^location\|^set-cookie\|^link"; }
h "$B/"                                          # 308, location /de, kein set-cookie
h -H "Accept-Language: en" "$B/"                 # trotzdem 308 → /de
h "$B/blog/vom-dachdecker-zum-tattoo-artist"     # 308 → /de/blog/…
h "$B/de/blog/from-roofer-to-tattoo-artist"      # 308 → /de/blog/vom-dachdecker-zum-tattoo-artist
h "$B/de"                                        # 200, link: nur rel=preload (kein hreflang), kein set-cookie
curl -s "$B/de" | grep -oi '<link rel="alternate"[^>]*>'          # de/es/en + x-default (DE-URL)
curl -s "$B/en/imprint" | grep -oi '<title>[^<]*\|<link rel="canonical"[^>]*>'   # Impressum – TODA, canonical /de/imprint
curl -s "$B/sitemap.xml" | grep -c 'hreflang="x-default"'        # = Anzahl URLs minus 2 (Legal)
```

**Unit:** `pnpm test` (alternates + structured-data). **Google-Sicht:** `pnpm gsc:inspect`
(URL-Inspection-API, readonly; lokal mit `GSC_SITE_URL=sc-domain:todasolutions.com
GSC_SA_KEY_FILE=$HOME/.toda-secrets/gsc-sa-toda-gsc-snap.json` als Env-Präfix) — Tabelle je
Sitemap-URL: verdict, coverageState, googleCanonical == url?, lastCrawl, Rich Results; plus
Sitemap-Status (`lastDownloaded`, submitted/indexed).

## Status (datiert, append-only)

- 2026-09-06 — Vertrag implementiert auf `staging` (Workstreams A–F), lokal per curl-Matrix,
  Unit-Tests und cmux-Browser verifiziert. Deploy + GSC-Re-Inspektion ausstehend (🔴-Block).
- 2026-09-06 — Baseline VOR Deploy (`pnpm gsc:inspect`, 40 Sitemap-URLs + `/` + Apex): 24 „Submitted
  and indexed", 10 „URL is unknown to Google", 4 „Duplicate, Google chose different canonical"
  (`/de`, `/de/blog/category/{law-money,toda-podcast}`, `/de/blog/vom-dachdecker-…`), 2 „Alternate
  page with proper canonical tag" (`/de/blog/category/marketing`, `/de/blog/eigentlich-…`), 1 „Crawled
  – currently not indexed" (`/en/blog/category/artist-stories`); Google-Canonical der DE-Duplikate =
  präfixlose URL. Sitemap zuletzt geladen 2026-07-08 (30 URLs). Zielbild nach ≥ 7 Tagen: 0 Duplikate,
  `googleCanonical == url` für alle `/de/…`.
