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

## Abschlussprotokoll (vom Implementierer auszufüllen)

- Commits (Hash + Titel je Workstream).
- V1-Tabelle mit tatsächlichen Werten, V2-Ausgaben, V3-Screenshots (Pfade), F-Tabelle.
- Abweichungen vom Plan mit Begründung (§0).
- Offene 🔴-Punkte und der Termin für den zweiten `pnpm gsc:inspect`-Lauf.
