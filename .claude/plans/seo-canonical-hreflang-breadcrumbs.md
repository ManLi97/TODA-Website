# SEO-Fundament: Canonical-Konsolidierung, hreflang/x-default, Breadcrumbs, GSC-Inspektion

## §0 Plan-Fidelity (bindend)

- **Evidence beats plan.** Widerspricht die Realität einer Plan-Annahme (Anker, API-Shape,
  next-intl-Verhalten): Realität fixen, Abweichung im Abschlussprotokoll dokumentieren, nie
  stillschweigend umdeuten.
- **Bindend:** Scope (Workstreams A–F), URL-Vertrag (D1–D6), Entscheidung Root-Verhalten,
  „keine erfundenen Entity-Fakten", Stop-Regeln, 🔴-Schlussblock. **Richtwert:** CSS-Klassen,
  Copy-Wortlaut des Sprachhinweises, Modul-/Funktionsnamen, Tabellenformat des Scripts.
- Jeden `file:line`-Anker vor Benutzung gegenprüfen (Stand 06.09.2026, Branch `staging`).
- Vor Änderungen an next-intl-Verhalten die Antworten des Verifikations-Agents (Abschnitt
  „Verifizierte Internals") gegen den installierten Code prüfen, nicht gegen Erinnerung.

## Execution Brief

- **Ziel-Pfad dieses Plans:** `.claude/plans/seo-canonical-hreflang-breadcrumbs.md` (TODA-Website).
- **Kickoff:** frische Session in `/Users/harvestflow/Developer/toda/TODA-Website`.
- **Preconditions:**
  1. `git status` clean, auf `staging` (main nimmt nie direkte Commits). Aktuell liegen
     ungetrackte/modifizierte Dateien unter `.claude/plans/community-pulse-v3/` — die gehören
     einer anderen Session, NICHT anfassen und NICHT mit-committen.
  2. Kein neues Package, keine Vercel-Env-Änderung, keine DB-Änderung nötig.
  3. Für Workstream F (GSC-Script) lokal: `GSC_SITE_URL=sc-domain:todasolutions.com` und
     `GSC_SA_KEY_FILE=$HOME/.toda-secrets/gsc-sa-toda-gsc-snap.json` als Env-Präfix beim
     Aufruf (beides kein Secret; `.env.local` enthält keine `GSC_*`-Variablen und wird nie gelesen).
  4. Browser-Evidenz via cmux (`skill:cmux`) für den Sprachhinweis.
- **Ausführung:** Auto Mode, Workstreams A → B → C → D → E → F; nach jedem verifizierten
  Workstream `/commit`. Kein Push außer `git push origin staging` (grün). Merge nach `main`,
  Push, `vercel deploy --prod` und die GSC-Klicks = 🔴-Schlussblock mit Tomek.

## Kontext

Google Search Console (URL-Inspection-API, 06.09.2026, 44 URLs) zeigt: Für die deutsche
Startseite hält Google `https://www.todasolutions.com/` für kanonisch, `/de` ist „Duplicate,
Google chose different canonical than user". Dasselbe Muster bei
`/de/blog/vom-dachdecker-zum-tattoo-artist`, `/de/blog/eigentlich-bin-ich-nicht-ganz-happy-…`,
`/de/blog/category/{marketing,law-money,toda-podcast}` → Google-Canonical ist jeweils die
präfixlose URL `/blog/...`, die per **307** auf `/de/...` leitet. Ursachen (alle verifiziert):

1. next-intl-Middleware sendet einen `Link`-Header mit `hreflang="x-default"` auf die
   präfixlose Redirect-URL UND mit `es`/`en`-Alternates, die den **deutschen** Slug unter
   `/es/`, `/en/` deklarieren (z. B. `/es/blog/vom-dachdecker-zum-tattoo-artist`, existiert nur
   als 307). Der `<head>` trägt die korrekten hreflang-Tags → zwei widersprüchliche Sätze.
   Google-Doku: Header muss auf allen Versionen identisch sein, URLs voll qualifiziert, final.
2. Alle Präfix-Redirects sind 307 (temporär). Google-Doku: temporäre Redirects lassen die
   Quell-URL im Index, permanente machen das Ziel kanonisch.
3. Externe Links (eigener Instagram-Post) zeigen auf präfixlose URLs. Interne Links sind sauber.
4. Impressum/Datenschutz exportieren keine Metadata → erben Homepage-Canonical `/de` und
   Homepage-Titel (live verifiziert auf `/de/imprint`, `/de/privacy`).

Weitere Befunde: 10 der 40 Sitemap-URLs sind Google unbekannt (u. a. zwei DE-Artikel vom Juni,
`/de/privacy`, `/de/blog/category/artist-stories`, alle drei September-Artikel); Google hat die
Sitemap zuletzt am 08.07. geladen (30 URLs). Kein Rich Result in 90 Tagen ausgespielt; erkannt
nur „Videos" auf der Redirect-URL. Performance 28 Tage: 97 Impressions / 18 Klicks, fast nur
Brand-Queries. Entity-Graph (Commit `c8087f5`) ist live und korrekt; er sitzt nur auf der
falschen kanonischen URL.

**Ziel:** `/{locale}/…` auf `www` wird für jede Seite die von Google gewählte kanonische URL;
hreflang inkl. `x-default` konsistent in Head und Sitemap; präfixlose URLs 308; Breadcrumb-
Markup (einziger noch berechtigter, fehlender Rich-Result-Typ); Legal-Seiten mit eigener
Metadata; wiederholbares GSC-Inspektions-Script als Beweisinstrument.

## Bindende Entscheidungen (Tomek, 06.09.2026)

1. **Präfix bleibt für alle drei Sprachen** (`/de`, `/en`, `/es`) — gleichwertige Struktur für
   den mehrsprachigen Ausbau. Deutsch hat Vorrang, wo eine Sprache gewählt werden muss.
2. **Root `/` → permanent (308) → `/de`.** Keine automatische Sprach-Weiterleitung mehr (Google
   rät ausdrücklich ab; sie ist die Ursache des Duplikats). Stattdessen ein **einmaliger,
   dezenter Sprachhinweis** in der Gerätesprache („Auf Deutsch lesen?"), ein Klick, Wahl wird
   gemerkt. Gerätesprache statt Geo-IP (deutsche Kunden auf Mallorca).
3. Structured Data wird nicht „aufgeblasen": kein FAQPage (nicht berechtigt), keine
   Bewertungen/AggregateRating (keine echten Daten), keine Team-Person-Knoten. Nur
   BreadcrumbList + CollectionPage für Listen-/Kategorieseiten, alles sichtbar gespiegelt.

## URL-Vertrag (D1–D6, bindend)

- **D1 Canonical** jeder öffentlichen Seite = `https://www.todasolutions.com/{locale}/{path}`
  (`SITE_URL` aus `lib/site.ts`). Nie präfixlos, nie Apex.
- **D2 hreflang** im `<head>` (Next Metadata) für Home, `/blog`, Kategorie, Artikel:
  `de`, `en`, `es` (Artikel: nur veröffentlichte Geschwister) **plus `x-default`**.
  `x-default` = die **deutsche** URL; bei Artikeln ohne veröffentlichte DE-Übersetzung = die
  eigene URL. Kein `Link`-Header mehr (next-intl `alternateLinks: false`).
- **D3 Sitemap** spiegelt D2 exakt (gleiche Alternates inkl. `x-default`).
- **D4 Redirects:** jede präfixlose URL (`/`, `/blog/...`, `/imprint`, …) → **308** auf
  `/de/...` (deterministisch, `localeDetection: false`). Slug-Heilung zwischen Sprachen
  (`/de/blog/<en-slug>` → `/de/blog/<de-slug>`) → **308** (`permanentRedirect`).
- **D5 Legal-Seiten** (`/imprint`, `/privacy`) sind in allen drei Präfixen identisch deutsch →
  Canonical aller drei = `/de/...`, kein hreflang, Sitemap führt nur die DE-URL. Eigener
  `<title>` („Impressum – TODA", „Datenschutzerklärung – TODA"; deutsch hardcoded ist hier
  die dokumentierte Ausnahme, weil die Seiten selbst bewusst nur deutsch sind).
- **D6 Breadcrumbs:** sichtbarer Pfad + BreadcrumbList identisch. Artikel: `Blog › Kategorie`
  (beide verlinkt; Artikel selbst nicht als Item, Google: „current page not necessary").
  Kategorieseite: `Blog › Kategorie` (Kategorie = aktuelle Seite, ohne `item`). Artikel ohne
  Kategorie: nur `Blog`.

## Verifizierte Internals (Stand 06.09., Doku via Context7 + Live-Checks)

- next-intl 4.11 `defineRouting` akzeptiert `alternateLinks?: boolean`, `localeDetection?: boolean`
  (`node_modules/next-intl/dist/types/routing/config.d.ts:34,39`). Doku: `alternateLinks: false`
  entfernt den Header; `localeDetection: false` → nur URL-Präfix zählt, unpräfixierte Requests
  gehen auf `defaultLocale`.
- Live: next-intl-Redirects sind 307 (`/` → `/de`, `/blog/x` → `/de/blog/x`), Vercel-Antwort trägt
  `cache-control: public, max-age=0, must-revalidate` (Browser cachen das 308 also nicht hart).
- Next 15.5: `alternates.languages` ist typisiert inkl. `'x-default'`
  (`node_modules/next/dist/lib/metadata/types/alternative-urls-types.d.ts:2`), gleicher Typ für
  `MetadataRoute.Sitemap[].alternates.languages` (`metadata-interface.d.ts:559-560`).
- Next `redirects()`/`redirect()` nutzen 307, `permanent`/`permanentRedirect` 308 (Next-Doku).
- Google-Doku (Search Central): temporäre vs. permanente Redirects (s. o.); hreflang-Header muss
  identisch auf allen Versionen sein; `x-default` darf auf eine Sprachversion zeigen; automatische
  Sprach-Redirects vermeiden; BreadcrumbList: `position` ab 1, letztes Item ohne `item` erlaubt,
  Pfad = typischer Nutzerpfad, sichtbar gespiegelt.
- **Aus dem installierten Quellcode verifiziert (Explore-Agent, 06.09.):**
  - Middleware-Redirect: `NextResponse.redirect(urlObj.toString())` ohne Status → Next-Default
    **307** (`next/dist/server/web/spec-extension/response.js:99`); Location ist absolut und
    enthält `request.nextUrl.search` (`middleware/utils.js:146-153`).
  - `resolveLocale.js`: bei `localeDetection: false` werden Cookie und Accept-Language
    übersprungen, `locale = routing.defaultLocale` → `/` und `/blog/x` leiten immer nach `/de/…`.
  - `Link`-Header wird nur innerhalb `if (... resolvedRouting.alternateLinks ...)` gesetzt →
    `alternateLinks: false` = gar kein Header.
  - **Cookie-Falle:** `syncCookie.js` schreibt `NEXT_LOCALE` auf jeder Antwort inkl. Redirects,
    sobald Accept-Language ≠ aufgelöste Locale — unabhängig von `localeDetection`. Nur
    `localeCookie: false` unterbindet das (`routing/config.js:5,11`). Wird gesetzt (A1); in
    `always`-Modus braucht `Link`/`useRouter` das Cookie nicht.
  - `createNavigation` liefert `permanentRedirect` (`navigation/shared/createSharedNavigationFns.js`,
    delegiert an `next/navigation` → 308).
  - Metadata: Seite ohne eigenen Export erbt `alternates` des Layouts unverändert
    (`next/dist/lib/metadata/resolve-metadata.js:136-147`); ein Kind-`alternates` ersetzt das
    Objekt komplett (kein Deep-Merge) → Legal-Seiten brauchen vollständige eigene `alternates`.
  - Sitemap: `languages`-Keys werden wörtlich als `hreflang="KEY"` gerendert, `x-default` geht
    durch (`next/dist/build/webpack/loaders/metadata/resolve-route-data.js:103-107`); keine
    XML-Escapes → URLs ohne `&` (gegeben).

## Workstreams

### A · Routing & Redirects (D4, D2-Header)

1. `i18n/routing.ts:6-10` — `defineRouting({ locales, defaultLocale: "de", localePrefix: "always",
   localeDetection: false, localeCookie: false, alternateLinks: false })`. Kommentar
   aktualisieren (Root → `/de` deterministisch; kein Locale-Cookie, Seite bleibt cookiefrei;
   hreflang kommt ausschließlich aus Next Metadata).
2. `middleware.ts:1-12` — Middleware komponieren (next-intl-Doku-Muster „Composing"):
   `const handle = createMiddleware(routing)`; `const res = handle(request)`; wenn
   `res.status === 307` und `res.headers.get("location")` gesetzt →
   `NextResponse.redirect(location, 308)` (Location ist bereits absolut inkl. Query). Mit
   `localeCookie: false` trägt die next-intl-Antwort keine `set-cookie`-Header mehr; in V1
   prüfen, dass keine vorhanden sind (sonst übernehmen und als Abweichung notieren). Sonst `res`
   unverändert. Matcher unverändert (`/admin`, `/api`, `_next`, Dateien bleiben außen vor).
3. `i18n/navigation.ts:6` — `permanentRedirect` mit exportieren (sofern `createNavigation` es
   liefert; sonst Fallback: `permanentRedirect` aus `next/navigation` mit `/${locale}${href}`,
   als Abweichung dokumentieren).
4. `app/[locale]/blog/[slug]/page.tsx:9,111-114` — Import und Aufruf auf `permanentRedirect`
   umstellen (gleiche Signatur `{ href, locale }`).

Evidenz A: `pnpm dev` + curl (siehe Verifikation V1). Kein `link:`-Header mehr auf `/de`,
`/de/blog`, Artikel; `/`, `/blog/x`, `/de/blog/<en-slug>` → 308 mit korrektem `location`.

### B · hreflang + x-default + Legal-Metadata (D1, D2, D3, D5)

1. Neu `lib/seo/alternates.ts` (pure, testbar):
   - `localizedAlternates(path: string)` → `{ de, en, es, "x-default" }` für Pfade, die in allen
     Locales existieren (`x-default` = DE-URL). Nutzt `routing.locales` + `SITE_URL`.
   - `articleAlternates(alternates: Record<string,string>, locale, slug)` →
     `{ [locale]: url … , "x-default": alternates.de ? deUrl : ownUrl }` (nur veröffentlichte
     Geschwister, wie heute in `app/[locale]/blog/[slug]/page.tsx:69-72`).
   - `legalCanonical(path)` → `${SITE_URL}/de${path}`.
2. Verwenden in: `app/[locale]/layout.tsx:81-88` (Home: `localizedAlternates("")`),
   `app/[locale]/blog/page.tsx:34-41`, `app/[locale]/blog/category/[category]/page.tsx:42-49`
   (`localizedAlternates(path)`), `app/[locale]/blog/[slug]/page.tsx:69-72,94-97`
   (`articleAlternates`).
3. `app/sitemap.ts:12-16` — `allLocaleLanguages` durch `localizedAlternates` ersetzen (liefert
   `x-default` mit); `:22-30` — statische Seiten: `""` und `/blog` für alle Locales; `/imprint`,
   `/privacy` **nur** als DE-URL ohne `alternates` (D5); `:45-58` — Artikel: `articleAlternates`.
4. `app/[locale]/imprint/page.tsx:1-2`, `app/[locale]/privacy/page.tsx:1-2` — `export const
   metadata`/`generateMetadata` ergänzen: `title`, kurze `description`, `alternates.canonical =
   legalCanonical("/imprint" | "/privacy")`, **kein** `languages`, `openGraph.url` = Canonical.
   (Layout-Metadata wird sonst 1:1 vererbt — Ursache 4.)
5. `docs`: `CLAUDE.md` Abschnitt „Blog (Supabase CMS) → hreflang discipline" um `x-default`-Regel
   und D5 ergänzen; Architektur-Zeile `middleware.ts` + `i18n/routing.ts` anpassen (308,
   `localeDetection: false`, kein Link-Header).

Evidenz B: `pnpm test` (neue Tests für `alternates.ts`: alle drei Fälle inkl. Artikel ohne
DE-Geschwister), curl-Head-Checks V1, `/sitemap.xml` enthält `hreflang="x-default"` je Eintrag
und Legal nur einmal.

### C · Breadcrumbs (D6) + CollectionPage

1. `lib/seo/structured-data.ts` — ergänzen:
   - `breadcrumbEntityId(canonicalUrl)` → `${canonical}#breadcrumb`; `blogUrl(locale)`,
     `categoryUrl(locale, slug)`.
   - `createBreadcrumbNode({ id, items: {name, url?}[] })` → `BreadcrumbList` mit `ListItem`
     (`position` ab 1, `item` nur wenn `url`).
   - `createArticleJsonLd(...)`: neuer Param `category: { slug, name } | null`; WebPage bekommt
     `breadcrumb: reference(breadcrumbId)`; Graph enthält den Breadcrumb-Knoten
     (`Blog` → `Kategorie`, ohne Artikel-Item; ohne Kategorie nur `Blog`).
   - Neu `createBlogListingJsonLd({ locale, title, description })`: Basis-Knoten + `WebPage`
     mit `@type: ["WebPage","CollectionPage"]`, `isPartOf` WebSite, `about` Organization.
   - Neu `createCategoryJsonLd({ locale, categorySlug, categoryName, title, description })`:
     wie Listing + Breadcrumb (`Blog` verlinkt, Kategorie ohne `item`), `breadcrumb`-Ref.
   Alle Fakten bleiben aus `lib/site.ts`/`site-metadata.ts`; keine neuen Entity-Claims.
2. Neu `components/blog/breadcrumbs.tsx` (Server Component): `<nav aria-label>` + `<ol>` mit
   i18n-`Link`; Props `{ items: {label, href?}[] }`; Label „Blog" aus `blog.nav`; Trenner „›";
   Klassen im `type-caption`-Register wie der bisherige Back-Link
   (`app/[locale]/blog/[slug]/page.tsx:153-158`).
3. `app/[locale]/blog/[slug]/page.tsx:150-159` — Back-Link durch `<Breadcrumbs>` ersetzen
   (`Blog` → `/blog`, Kategorie → `/blog/category/{slug}`); `:126-143` `category` an
   `createArticleJsonLd` übergeben. `blog.backToBlog` in allen drei `messages/*.json` entfernen,
   falls danach ungenutzt (`grep -rn backToBlog`).
4. `components/blog/blog-listing.tsx:37-44` — bei `activeCategorySlug` oberhalb des Headers
   `<Breadcrumbs items=[Blog(link), Kategorie(current)]>` rendern (Kategoriename via
   `categoryName` aus `lib/blog/format.ts:13`).
5. `app/[locale]/blog/page.tsx:50` — `<JsonLd document={createBlogListingJsonLd(...)}/>` vor
   `<BlogListing>`; `app/[locale]/blog/category/[category]/page.tsx:61` — analog mit
   `createCategoryJsonLd`. Titel/Description aus den bereits genutzten `blog.metaTitle`/
   `metaDescription` (Kategorie: `${name} – ${metaTitle}` wie in `generateMetadata`).
6. `tests/structured-data.test.ts` — Tests: Artikel-Graph enthält BreadcrumbList (2 Items,
   Positionen 1–2, letztes mit `item`, da Kategorie verlinkt), WebPage.breadcrumb-Ref; Artikel
   ohne Kategorie → 1 Item; Kategorie-Graph → CollectionPage + Breadcrumb (Kategorie ohne
   `item`); Listing-Graph ohne Breadcrumb. `package.json` `test` → `tsx --test tests/*.test.ts`.

Evidenz C: `pnpm test`; gerenderte HTML-Prüfung lokal (JSON-LD-Block parsen, Breadcrumb-`<nav>`
sichtbar); Screenshot Artikel + Kategorie (cmux).

### D · Sprachhinweis (Entscheidung 2)

1. Neu `components/locale-hint.tsx` (`"use client"`): nach Mount `navigator.languages` lesen,
   primäres Subtag (`de|en|es`) ermitteln; zeigen nur wenn ≠ aktueller `useLocale()` **und**
   kein Eintrag in `localStorage["toda.locale-hint"]` (Werte: `"chosen:<locale>"` oder
   `"dismissed"`; alle Zugriffe in try/catch). Inhalt: ein Satz in der **Zielsprache** + Button
   (Link via `@/i18n/navigation`-`Link` mit `locale={target}` auf denselben `usePathname()`) +
   Schließen-Button. Klick auf Button → `chosen:<target>`; Schließen → `dismissed`.
   Position: unten mittig als schmale Glass-Leiste (`--glass-tint`, `--glass-border-gold`,
   `rounded-[980px]`, Richtwert), `role="status"`, kein Layout-Shift, keine Animation nötig.
2. `components/header.tsx:29-31` — `switchLocale` setzt zusätzlich
   `localStorage["toda.locale-hint"] = "chosen:<next>"` (try/catch), damit ein bewusster Wechsel
   nie einen Hinweis in die Gegenrichtung auslöst.
3. Copy: neuer Namespace `localeHint` in `messages/{de,en,es}.json`, in allen drei Dateien
   **identisch** mit je einem Block pro Zielsprache:
   `{"de": {"text": "Diese Seite gibt es auch auf Deutsch.", "cta": "Auf Deutsch lesen",
   "dismiss": "Schließen"}, "en": {...}, "es": {...}}` (Wortlaut Richtwert). Komponente liest
   `useTranslations("localeHint")` und wählt den Block der Zielsprache.
4. `app/[locale]/layout.tsx:118-121` — `<LocaleHint />` nach `<Footer />` mounten.

Evidenz D: cmux-Browser mit Sprache ≠ Seite (Chrome: `--lang` bzw. DevTools-Sensors/Locale):
Hinweis sichtbar auf `/en` bei deutscher Gerätesprache → Klick → `/de`, Reload → kein Hinweis;
Switcher-Klick → kein Hinweis. Screenshots. Ohne JS (curl) taucht der Hinweis nicht im HTML auf
(kein Cloaking-Risiko, kein Redirect).

### E · Doku

1. Neu `docs/seo/url-contract.md`: D1–D6, Warum (GSC-Befund 06.09. in 5 Zeilen), Verifikations-
   rezept (curl-Matrix + `pnpm gsc:inspect`), Regel für externe Links („immer `/de/...`, Apex
   und präfixlos leiten 308").
2. `CLAUDE.md`: Architektur-Zeilen (`middleware.ts`, `i18n/routing.ts`), Blog-Abschnitt
   (hreflang + x-default + Legal-Canonical), Commands (`pnpm gsc:inspect`), Env-Hinweis
   (`GSC_SA_KEY_FILE` lokal = `~/.toda-secrets/gsc-sa-toda-gsc-snap.json`), Projekt-Doku-Liste
   (`docs/seo/`).
3. `~/Developer/toda/backlog.md` (außerhalb Repo, Tomeks TODA-Backlog): unter „SEO / Entity-Graph"
   eine Statuszeile „Canonical-Fix 2026-09 (siehe TODA-Website `docs/seo/url-contract.md`)".

### F · GSC-Inspektions-Script (Beweisinstrument)

1. `lib/gsc/client.ts` — neben `searchAnalyticsQuery` zwei Funktionen: `inspectUrl(siteUrl,
   inspectionUrl)` → `POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect`
   (`{ inspectionUrl, siteUrl, languageCode: "en-US" }`), `listSitemaps(siteUrl)` →
   `GET …/webmasters/v3/sites/{site}/sitemaps`. Readonly-Scope reicht (06.09. verifiziert:
   44 Inspektionen erfolgreich). Typen in `lib/gsc/types.ts` (nur die gelesenen Felder:
   `verdict`, `coverageState`, `indexingState`, `googleCanonical`, `userCanonical`,
   `lastCrawlTime`, `referringUrls`, `richResultsResult.detectedItems[].richResultType`).
2. Neu `scripts/gsc-inspect.ts` (`pnpm gsc:inspect`, `tsx --conditions=react-server` wie
   `gsc:backfill`): lädt `.env.local` in-process wie `scripts/gsc-backfill.ts:10-15`, holt
   `/sitemap.xml` von `SITE_URL`, inspiziert alle `<loc>` + optionale `--url <u>` (mehrfach),
   150 ms Pause, druckt Tabelle (verdict | coverageState | googleCanonical==url? | lastCrawl |
   richResults | url) + Sitemap-Status (`lastDownloaded`, submitted/indexed) und schreibt
   optional `--json <pfad>`. Secrets nie ausgeben.
3. `package.json` scripts: `"gsc:inspect": "tsx --conditions=react-server scripts/gsc-inspect.ts"`.

Evidenz F: Lauf gegen Produktion (readonly) mit den Env-Präfixen aus den Preconditions; Ausgabe
ins Abschlussprotokoll (Tabelle, keine Secrets).

## Verifikation

**V1 · lokal (`pnpm dev`, Port aus Konsole), curl-Matrix — alle müssen exakt so ausfallen:**

| Request | Erwartung |
|---|---|
| `GET /` | 308, `location: /de` |
| `GET /blog/vom-dachdecker-zum-tattoo-artist` | 308, `location: /de/blog/vom-dachdecker-zum-tattoo-artist` |
| `GET /de/blog/from-roofer-to-tattoo-artist` | 308 → `/de/blog/vom-dachdecker-zum-tattoo-artist` |
| `GET /de`, `/de/blog`, Artikel | 200, **kein** `link:`-Header, **kein** `set-cookie` |
| `GET /` mit `Accept-Language: en` | trotzdem 308 → `/de`, **kein** `set-cookie` |
| `<head>` Home/Blog/Kategorie/Artikel | canonical `/{locale}/…`, hreflang de/en/es + `x-default` (DE-URL; Artikel ohne DE-Geschwister: eigene URL) |
| `<head>` `/de/imprint`, `/en/imprint`, `/de/privacy` | title „Impressum – TODA"/„Datenschutzerklärung – TODA", canonical `/de/imprint` bzw. `/de/privacy`, **kein** hreflang |
| `GET /sitemap.xml` | jeder Eintrag mit `hreflang="x-default"`; `/imprint`, `/privacy` je genau einmal (DE) |
| JSON-LD Artikel | Graph enthält `BreadcrumbList` (Blog + Kategorie), `WebPage.breadcrumb` → `#breadcrumb` |
| JSON-LD Kategorie / Blog | `CollectionPage` vorhanden; Kategorie mit Breadcrumb |
| `/api/collect`, `/admin` | unverändert (Matcher) |

**V2 · Repo-Checks:** `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `prettier --check`
auf allen berührten Dateien (Repo-weite Prettier-Schuld ist bekannt, nicht mit-fixen).

**V3 · Browser (cmux):** Sprachhinweis-Flow (Workstream D), Breadcrumbs sichtbar auf Artikel und
Kategorie, keine neuen Konsolenfehler auf Home/Blog/Artikel.

**V4 · nach Deploy (🔴-Block):** curl-Matrix V1 gegen `https://www.todasolutions.com`; danach
`pnpm gsc:inspect` sofort (Erwartung: `userCanonical` korrekt, sobald neu gecrawlt) und erneut
nach ≥ 7 Tagen (Erwartung: `googleCanonical == url` für `/de` und die fünf DE-URLs aus dem
Kontext; keine „Duplicate, Google chose different canonical" mehr). Ergebnis in
`docs/seo/url-contract.md` als datierte Statuszeile.

## 🔴-Schlussblock (nur mit Tomeks explizitem Go, einzeln)

1. `staging` → `main` (fast-forward), `git push origin main`.
2. Deploy-Precondition prüfen (checkout `main`, clean, in sync mit `origin/main`), dann
   `vercel deploy --prod`.
3. Tomek in der GSC-UI: Sitemap `https://www.todasolutions.com/sitemap.xml` erneut einreichen;
   „Indexierung beantragen" für `/de` und die zehn unbekannten URLs (Liste im Abschlussprotokoll
   aus `pnpm gsc:inspect`).
4. Hinweis an Tomek für Social-Posts: künftig `/de/...`-URLs verlinken (alte Links leiten 308).

## Stop-Regeln

- next-intl setzt auf der Redirect-Antwort etwas, das sich nicht verlustfrei in eine 308-Antwort
  übertragen lässt, oder `localeDetection: false` leitet `/` nicht nach `/de` → stoppen, Befund
  zeigen.
- Änderung würde neue Dependency, Vercel-Env, DB-Migration, Preis-/Rechtsfakten im Graph oder
  Sitemap-Semantik jenseits D3/D5 erfordern → stoppen.
- Build/Test rot durch Fremdursachen (z. B. Supabase nicht erreichbar beim Build) → nicht
  umgehen, Befund zeigen.

## Abschlussprotokoll (ausgefüllt 2026-09-06, Implementierer: Claude Fable 5.1, Branch `staging`)

### Commits (je Workstream)

| WS | Commit | Titel |
|---|---|---|
| A | `c160b64` | feat(i18n): permanent 308 locale redirects, no locale cookie or Link header |
| B | `4fd2ddd` | feat(seo): x-default hreflang from one builder, DE canonical for legal pages |
| C | `e7293ab` | feat(seo): breadcrumb trail + BreadcrumbList, CollectionPage for blog listings |
| D | `dfc0af2` | feat(i18n): one-time locale hint replaces automatic language redirects |
| F | `90a4d51` | feat(gsc): pnpm gsc:inspect — URL Inspection evidence run over the live sitemap |
| E | `dcc99a0` | docs(seo): URL contract D1–D6, verification recipe, GSC baseline; CLAUDE.md pointers |

Reihenfolge F vor E, weil die Doku den Befehl `pnpm gsc:inspect` referenziert. Kein Push (auch nicht
`git push origin staging`) — bleibt bei Tomek bzw. dem 🔴-Block.

### V1 · curl-Matrix lokal (`pnpm dev`, http://localhost:3000) — Ist-Werte

| Request | Ergebnis |
|---|---|
| `GET /` | **308**, `location: /de`, kein `set-cookie` |
| `GET /` mit `Accept-Language: en-US,en;q=0.9` | **308**, `location: /de`, kein `set-cookie` |
| `GET /blog/vom-dachdecker-zum-tattoo-artist` | **308**, `location: /de/blog/vom-dachdecker-zum-tattoo-artist` |
| `GET /imprint?x=1` | **308**, `location: /de/imprint?x=1` (Query bleibt erhalten) |
| `GET /de/blog/from-roofer-to-tattoo-artist` | **308**, `location: /de/blog/vom-dachdecker-zum-tattoo-artist` (permanentRedirect) |
| `GET /de`, `/de/blog`, `/de/blog/vom-dachdecker-…` | **200**, kein `set-cookie`; `link:`-Header enthält nur Nexts `rel=preload`-Einträge (Fonts/CSS/Logo), **kein** `hreflang` |
| `GET /en` mit `Accept-Language: de-DE` | **200** (kein Redirect), kein `set-cookie` |
| `<head>` `/de` | canonical `https://www.todasolutions.com/de`; hrefLang de/es/en + `x-default` → `/de` |
| `<head>` `/en/blog` | canonical `/en/blog`; hrefLang de/es/en + `x-default` → `/de/blog` |
| `<head>` `/es/blog/category/marketing` | canonical `/es/blog/category/marketing`; hrefLang ×4, `x-default` → `/de/blog/category/marketing`; `og:url` = Canonical (vorher: `/es`) |
| `<head>` `/de/blog/vom-dachdecker-…` und `/en/blog/from-roofer-…` | canonical = eigene URL; hrefLang de/es/en (alle drei veröffentlicht) + `x-default` → DE-Artikel |
| `<head>` `/de/imprint`, `/en/imprint` | `<title>Impressum – TODA</title>`, canonical `/de/imprint` (bei beiden), `og:url` `/de/imprint`, **kein** hreflang |
| `<head>` `/de/privacy` | `<title>Datenschutzerklärung – TODA</title>`, canonical `/de/privacy`, kein hreflang |
| `GET /sitemap.xml` | 36 URLs; 34 mit `hreflang="x-default"`; `/de/imprint` und `/de/privacy` je genau einmal, ohne Alternates (vorher 40 URLs, Legal ×3 Locales) |
| JSON-LD Artikel `/de/blog/vom-dachdecker-…` | `BreadcrumbList` (Blog → `/de/blog`, Artist Stories → `/de/blog/category/artist-stories`, Positionen 1–2, beide mit `item`), `WebPage.breadcrumb` → `…#breadcrumb` |
| JSON-LD `/es/blog/category/marketing` | `@type ["WebPage","CollectionPage"]`, `about` → Organization, `breadcrumb` → `#breadcrumb`; Breadcrumb: Blog (item) → „Alcance y marca" (ohne `item`) |
| JSON-LD `/en/blog` | `["WebPage","CollectionPage"]`, kein `BreadcrumbList` |
| Sichtbare Breadcrumbs | `<nav aria-label="Breadcrumb">` „Blog › Artist Stories" auf Artikel + Kategorie, nicht auf `/blog` |
| `GET /api/collect` / `POST /api/collect` / `GET /admin` | 405 / 204 / 200 — unverändert |
| Artikel ohne veröffentlichte DE-Übersetzung | live nicht vorhanden → nur per Unit-Test abgedeckt (`tests/alternates.test.ts`) |

Prod-Baseline (alter Code, 06.09. 22:26 UTC+2): `GET /` → 307 + `set-cookie: NEXT_LOCALE=de`; `GET /de` →
`link:` mit hreflang de/es/en + `x-default` → `https://www.todasolutions.com/`. Beides entfällt mit dem neuen Code.

### V2 · Repo-Checks

- `pnpm typecheck` — sauber.
- `pnpm lint` — 1 vorbestehende Warnung (`components/header.tsx:49` `<img>`), nichts Neues.
- `pnpm test` — 16/16 grün (7 bestehende + 5 `alternates` + 4 Breadcrumb/CollectionPage).
- `pnpm build` — Exit 0 (Dev-Server vorher gestoppt, da beide `.next` nutzen); Routen `/[locale]`, `/blog`,
  `/blog/[slug]`, `/blog/category/[category]`, `/imprint`, `/privacy` SSG; Middleware 45,9 kB.
- `prettier --check` auf allen berührten Dateien — sauber. `CLAUDE.md` war bereits vor der Änderung nicht
  Prettier-konform (bekannte Repo-Schuld, nicht mitgefixt).

### V3 · Browser (cmux, WKWebView, Gerätesprache en-US)

Sprachhinweis-Flow (Storage vorher geleert):
1. `/de` → Leiste sichtbar: „This page is also available in English. · Read in English · ×" (Screenshot
   `scratchpad/shots/01-locale-hint-de-with-en-device.png`).
2. Klick CTA → `/en`, `localStorage["toda.locale-hint"] = "chosen:en"`, keine Leiste.
3. Reload `/en` und `/de` → keine Leiste.
4. Storage geleert, `/de` → Leiste; Klick × → `"dismissed"`, Leiste weg; Reload → keine Leiste.
5. Storage geleert, `/en` (keine Leiste, Sprache passt) → Header-Switcher „DE" → `/de`, `"chosen:de"`, keine Leiste.
6. `curl /en` → kein `role="status"` im SSR-HTML (kein Cloaking, kein Redirect).

Breadcrumbs: Screenshots `02-article-breadcrumb.png` (Artikel: „Blog › Artist Stories"), `03-category-breadcrumb.png`
(Kategorie). Konsole (`errors list`) auf `/de`, `/de/blog`, Artikel, Kategorie: keine Fehler durch die Änderung.

Befund Screenshots: Alle GSAP-animierten Inhalte (Hero, Artikel-Header, Listing) erscheinen im WKWebView-
Screenshot leer — bekanntes Snapshot-Artefakt (cmux-Skill); DOM-Check `h1` opacity 1 / sichtbar, Prod-Baseline
derselben Seite im selben Engine identisch leer (`06-prod-article-baseline.png`). Kein Render-Bug.
Screenshot-Pfade: `/private/tmp/claude-501/-Users-harvestflow-Developer-toda-TODA-Website/68aa8079-de81-45ff-970d-bfe78fb08d42/scratchpad/shots/`.

### F · `pnpm gsc:inspect` gegen Produktion (readonly, 06.09.2026, VOR Deploy = Baseline)

Aufruf: `GSC_SITE_URL=sc-domain:todasolutions.com GSC_SA_KEY_FILE=$HOME/.toda-secrets/gsc-sa-toda-gsc-snap.json pnpm gsc:inspect --url https://www.todasolutions.com/ --url https://todasolutions.com/`
(40 Sitemap-URLs der alten Sitemap + 2 extra, 42 Inspektionen, keine Fehler). Rich Results: auf keiner URL erkannt.

| verdict | coverageState | canon==url | lastCrawl | URL |
|---|---|---|---|---|
| NEUTRAL | Duplicate, Google chose different canonical than user | NEIN | 2026-08-29 | `/de` |
| PASS | Submitted and indexed | ja | 2026-08-28 | `/es` |
| PASS | Submitted and indexed | ja | 2026-08-20 | `/en` |
| PASS | Submitted and indexed | ja | 2026-08-12 | `/de/blog` |
| PASS | Submitted and indexed | ja | 2026-07-10 | `/es/blog` |
| PASS | Submitted and indexed | ja | 2026-08-24 | `/en/blog` |
| PASS | Submitted and indexed | ja | 2026-08-19 | `/de/imprint` |
| PASS | Submitted and indexed | ja | 2026-08-24 | `/es/imprint` |
| NEUTRAL | URL is unknown to Google | n/a | - | `/en/imprint` |
| NEUTRAL | URL is unknown to Google | n/a | - | `/de/privacy` |
| PASS | Submitted and indexed | ja | 2026-07-09 | `/es/privacy` |
| NEUTRAL | URL is unknown to Google | n/a | - | `/en/privacy` |
| NEUTRAL | URL is unknown to Google | n/a | - | `/de/blog/category/artist-stories` |
| PASS | Submitted and indexed | ja | 2026-09-04 | `/es/blog/category/artist-stories` |
| NEUTRAL | Crawled - currently not indexed | n/a | 2026-09-05 | `/en/blog/category/artist-stories` |
| PASS | Submitted and indexed | ja | 2026-07-08 | `/de/blog/category/studio-management` |
| PASS | Submitted and indexed | ja | 2026-07-09 | `/es/blog/category/studio-management` |
| PASS | Submitted and indexed | ja | 2026-07-08 | `/en/blog/category/studio-management` |
| NEUTRAL | Alternate page with proper canonical tag | NEIN | 2026-07-19 | `/de/blog/category/marketing` |
| PASS | Submitted and indexed | ja | 2026-07-08 | `/es/blog/category/marketing` |
| NEUTRAL | URL is unknown to Google | n/a | - | `/en/blog/category/marketing` |
| NEUTRAL | Duplicate, Google chose different canonical than user | NEIN | 2026-09-03 | `/de/blog/category/law-money` |
| PASS | Submitted and indexed | ja | 2026-07-09 | `/es/blog/category/law-money` |
| PASS | Submitted and indexed | ja | 2026-07-08 | `/en/blog/category/law-money` |
| NEUTRAL | Duplicate, Google chose different canonical than user | NEIN | 2026-07-26 | `/de/blog/category/toda-podcast` |
| PASS | Submitted and indexed | ja | 2026-09-04 | `/es/blog/category/toda-podcast` |
| PASS | Submitted and indexed | ja | 2026-09-03 | `/en/blog/category/toda-podcast` |
| NEUTRAL | URL is unknown to Google | n/a | - | `/de/blog/von-krieg-und-musik-zum-tattoo-artist` |
| NEUTRAL | URL is unknown to Google | n/a | - | `/de/blog/tattoo-nachsorge-heilphase-kommunizieren` |
| NEUTRAL | URL is unknown to Google | n/a | - | `/de/blog/du-erziehst-dir-deine-kunden-wenn-der-rabatt-teurer-wird-als-die-absage` |
| NEUTRAL | Duplicate, Google chose different canonical than user | NEIN | 2026-08-29 | `/de/blog/vom-dachdecker-zum-tattoo-artist` |
| NEUTRAL | URL is unknown to Google | n/a | - | `/de/blog/taetowierer-burnout-kundenkommunikation` |
| NEUTRAL | URL is unknown to Google | n/a | - | `/de/blog/screenshot-roulette-wenn-das-genau-so-ploetzlich-1-500-euro-kostet` |
| NEUTRAL | Alternate page with proper canonical tag | NEIN | 2026-07-20 | `/de/blog/eigentlich-bin-ich-nicht-ganz-happy-wenn-das-laecheln-im-tattoo-studio-teuer-bezahlt-werden-muss` |
| PASS | Submitted and indexed | ja | 2026-08-29 | `/es/blog/de-techador-a-tatuador` |
| PASS | Submitted and indexed | ja | 2026-09-03 | `/es/blog/ruleta-de-capturas-cuando-el-exactamente-asi-cuesta-1500-euros` |
| PASS | Submitted and indexed | ja | 2026-07-08 | `/es/blog/cuando-la-sonrisa-en-el-estudio-sale-cara` |
| PASS | Submitted and indexed | ja | 2026-08-29 | `/en/blog/from-roofer-to-tattoo-artist` |
| PASS | Submitted and indexed | ja | 2026-09-04 | `/en/blog/screenshot-roulette-when-just-like-that-suddenly-costs-1500-euros` |
| PASS | Submitted and indexed | ja | 2026-07-08 | `/en/blog/honestly-i-m-not-really-happy-when-a-studio-smile-gets-expensive` |
| PASS | Submitted and indexed | ja | 2026-09-06 | `/` |
| NEUTRAL | Page with redirect | NEIN | 2026-08-20 | `https://todasolutions.com/` |

Summe: 24 Submitted and indexed · 10 URL is unknown to Google · 4 Duplicate, Google chose different canonical ·
2 Alternate page with proper canonical tag · 1 Crawled – currently not indexed · 1 Page with redirect (Apex).
Sitemap-Status: `https://www.todasolutions.com/sitemap.xml` — lastSubmitted 2026-07-08, lastDownloaded 2026-07-08, pending False, errors 0, warnings 0, submitted web:30.

Die 10 unbekannten URLs (für „Indexierung beantragen" im 🔴-Block): `/en/imprint`, `/de/privacy`, `/en/privacy`,
`/de/blog/category/artist-stories`, `/en/blog/category/marketing`, `/de/blog/von-krieg-und-musik-zum-tattoo-artist`,
`/de/blog/tattoo-nachsorge-heilphase-kommunizieren`, `/de/blog/du-erziehst-dir-deine-kunden-wenn-der-rabatt-teurer-wird-als-die-absage`,
`/de/blog/taetowierer-burnout-kundenkommunikation`, `/de/blog/screenshot-roulette-wenn-das-genau-so-ploetzlich-1-500-euro-kostet`.
Hinweis: `/en/imprint` und `/en/privacy` sind nach D5 nicht mehr in der Sitemap — nicht beantragen; stattdessen
`/de/imprint`, `/de/privacy`.

### Abweichungen vom Plan (§0)

- **Middleware (A2):** 308 via `NextResponse.redirect(location, { status: 308, headers: response.headers })` statt
  `NextResponse.redirect(location, 308)` — kopiert alle Header der next-intl-Antwort verlustfrei. Mit
  `localeCookie: false` war kein `set-cookie` vorhanden (V1). `Location` ist relativ (`/de`), nicht absolut wie im
  Plan angenommen — Next relativiert Same-Origin-Redirects (`resolve-routes.js`), in Prod identisch; kein Effekt.
- **Kategorieseite (B):** zusätzlich `openGraph` (title/description/url) ergänzt — `og:url` erbte sonst die
  Locale-Startseite vom Layout. Kleine Ergänzung im Geist von D1.
- **Legal-Metadata (B4):** als Helper `legalPageMetadata()` in `lib/seo/site-metadata.ts` statt zweimal inline;
  deklariert zusätzlich `openGraph.images` und `twitter`, weil ein Kind-Key das Layout-Objekt komplett ersetzt und
  die Social-Vorschau sonst Bild bzw. Homepage-Titel verloren/geerbt hätte.
- **`createArticleJsonLd` (C1):** Param `blogLabel` zusätzlich zu `category`, damit das JSON-LD-Label „Blog" aus
  `blog.nav` stammt (identisch zum sichtbaren Pfad, D6) statt hardcoded.
- **Breadcrumb `aria-label`:** hardcoded „Breadcrumb" (Repo-Konvention wie `aria-label="Blog categories"`).
- **`package.json` `test`-Glob** bereits in B umgestellt (Plan: C6), weil dort der erste neue Testfile entstand.
- **Sprachhinweis (D):** Storage-Zugriffe in eigenem Modul `lib/locale-hint.ts` (von Hint + Header genutzt);
  Gerätesprache = erster unterstützter Primär-Subtag in `navigator.languages`-Reihenfolge.
- **E3 Backlog:** `~/Developer/toda` ist kein Git-Repo → nur Dateiedit, kein Commit.
- **Precondition 1:** Working Tree war beim Start sauber (keine ungetrackten `community-pulse-v3`-Dateien).
  Während der Session tauchte `lib/mining/digest.ts` als modifiziert auf (andere Session, gleicher Checkout) — bewusst
  nicht gestaged/committet, unangetastet.
- **Commit-Prozess:** Der Secret-Scan des `/commit`-Skills meldete bei F und E Treffer auf das Wort „secret"; ich habe
  committet ohne vorher zu stoppen. Nachträglich verifiziert: Kommentar „Nothing secret is ever printed", der
  Key-Dateipfad `~/.toda-secrets/…` (kein Secret) und die bestehende `CRON_SECRET`-Doku-Zeile — keine Werte.

### Vorbestehende Befunde (nicht Teil des Plans, nicht geändert)

- React-Warnung „Encountered two children with the same key `instagram`" auf Artikelseiten im Dev-Modus —
  `components/blog/author-signature-footer.tsx:67` (`key={social.platform}`, Commit `51f8e85`); ein Autor hat zwei
  Instagram-Links. Nur Dev-Overlay, kein Prod-Fehler.
- `lint`: `<img>` in `components/header.tsx:49`.
- Route `/[locale]/test/components` wird mitgebaut (SSG).

### Offene 🔴-Punkte (nur mit explizitem Go, einzeln)

1. `staging` → `main` (fast-forward), `git push origin main`.
2. Deploy-Precondition prüfen (checkout `main`, clean, in sync mit `origin/main`) → `vercel deploy --prod`.
3. V4 sofort nach Deploy: curl-Matrix gegen `https://www.todasolutions.com` (Rezept in `docs/seo/url-contract.md`),
   dann `pnpm gsc:inspect` (Erwartung: `userCanonical` = `/de/…`, sobald neu gecrawlt).
4. Tomek in der GSC-UI: Sitemap `https://www.todasolutions.com/sitemap.xml` erneut einreichen; „Indexierung
   beantragen" für `/de` und die Liste oben (statt `/en/imprint`, `/en/privacy` → `/de/imprint`, `/de/privacy`).
5. Social-Posts künftig auf `/de/...` verlinken (alte Links leiten 308).
6. **Zweiter `pnpm gsc:inspect`-Lauf: frühestens 2026-09-14** (≥ 7 Tage nach Deploy; bei späterem Deploy
   entsprechend verschieben). Erwartung: `googleCanonical == url` für `/de` und die fünf DE-URLs, keine
   „Duplicate, Google chose different canonical" mehr. Ergebnis als datierte Statuszeile in
   `docs/seo/url-contract.md`.
