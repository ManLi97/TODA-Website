# ARBEITS-NOTIZEN — Phase 1: Foundation Setup

## Was wurde gebaut

Next.js 15 Skeleton für die TODA Solutions Marketing-Website.
Routing aktiv für `/de/`, Supabase-Clients konfiguriert, i18n einsatzbereit.

---

## Projektstruktur

```
Website/
├── app/
│   └── [locale]/
│       ├── globals.css         # Tailwind v4 entry point
│       ├── layout.tsx          # Root layout mit NextIntlClientProvider
│       └── page.tsx            # Placeholder-Seite für /de/
├── i18n/
│   ├── routing.ts              # Locale-Definition und Routing-Strategie
│   └── request.ts              # Per-request i18n-Konfiguration für next-intl
├── lib/
│   └── supabase/
│       ├── client.ts           # Browser-Client (für Client Components)
│       └── server.ts           # Server-Client (für Server Components / Route Handlers)
├── messages/
│   ├── de.json                 # Deutsche Übersetzungen (Launch-Locale)
│   ├── es.json                 # Spanische Übersetzungen (vorbereitet)
│   └── en.json                 # Englische Übersetzungen (vorbereitet)
├── middleware.ts               # next-intl Middleware für Locale-Routing
├── next.config.ts              # Next.js Konfiguration mit next-intl Plugin
├── postcss.config.mjs          # PostCSS mit @tailwindcss/postcss (Tailwind v4)
├── tsconfig.json               # TypeScript-Konfiguration
├── global.d.ts                 # CSS-Typ-Deklaration für TypeScript
├── .eslintrc.json              # ESLint (next/core-web-vitals)
├── .prettierrc                 # Prettier mit prettier-plugin-tailwindcss
├── .prettierignore
├── .gitignore
├── .env.example                # Committed — enthält nur leere Variablen-Namen
├── .env.local                  # Nicht committed — enthält Platzhalter-Credentials
└── package.json
```

---

## Key Decisions

### Paket-Manager: pnpm

Per globalem Stack-Default. Ermöglicht schnellere Installs und strict dependency isolation.

### Tailwind CSS v4

Tailwind v4 verwendet keine `tailwind.config.js` mehr. Konfiguration erfolgt über CSS (`@import "tailwindcss"` in `globals.css`) und PostCSS via `@tailwindcss/postcss`. Das ist der aktuelle Best-Practice-Ansatz für v4.

### next-intl: `localePrefix: "always"`

Locale ist immer in der URL (`/de/`, `/es/`, `/en/`). Root `/` leitet automatisch auf `/de/` um (durch Middleware). Kein verstecktes Default-Routing — klare, cachebare URLs.

### App-Struktur: `app/[locale]/` ohne separates Root-Layout

Bei next-intl mit `localePrefix: "always"` gibt es kein sinnvolles Route-Segment oberhalb von `[locale]`. Das `[locale]/layout.tsx` ist das effektive Root-Layout.

### Supabase: Zwei separate Clients

- `lib/supabase/client.ts` — `createBrowserClient` für Client Components
- `lib/supabase/server.ts` — `createServerClient` mit Cookie-Handling für Server Components, Route Handlers und Server Actions
- Folgt dem offiziellen `@supabase/ssr`-Muster.

### ESLint: v8 mit `eslint-config-next@15`

`eslint-config-next@16` benötigt ESLint ≥9. ESLint 10 hat Peer-Dep-Konflikte mit gängigen Plugins. Entscheidung: ESLint 8 + `eslint-config-next@15` für reibungslose Kompatibilität. Kann geupgraded werden, wenn das Ecosystem aufgeholt hat.

### TypeScript `global.d.ts`

TypeScript erkennt CSS-Side-Effect-Imports (z.B. `import './globals.css'`) standardmäßig nicht. Das `global.d.ts` deklariert `*.css`-Module und verhindert Build-Fehler. Konventionell gelöst — kein Hack.

### Messages: Alle 3 Locales angelegt

Auch `es.json` und `en.json` wurden mit Placeholder-Inhalten erstellt. Die Routing-Konfiguration unterstützt alle drei Locales. Content wird bei Launch-Erweiterung befüllt.

---

## Installierte Versionen

| Package                     | Version |
| --------------------------- | ------- |
| next                        | 15.5.15 |
| react / react-dom           | 19.2.5  |
| next-intl                   | 4.11.0  |
| @supabase/supabase-js       | 2.105.3 |
| @supabase/ssr               | 0.10.2  |
| tailwindcss                 | 4.2.4   |
| @tailwindcss/postcss        | 4.2.4   |
| typescript                  | 6.0.3   |
| eslint                      | 8.57.1  |
| eslint-config-next          | 15.5.15 |
| prettier                    | 3.8.3   |
| prettier-plugin-tailwindcss | 0.8.0   |

---

## Abweichungen vom Standard-Setup

### `create-next-app` nicht nutzbar

Der Ordnername `Website` (Großbuchstabe) verstößt gegen npm-Naming-Regeln. Manuelles Setup wurde durchgeführt — alle Dateien von Hand erstellt, identisches Ergebnis.

### pnpm `approve-builds`

Build-Scripts für `@swc/core`, `@parcel/watcher`, `sharp`, `unrs-resolver` wurden über `pnpm.onlyBuiltDependencies` in `package.json` aktiviert. Das ist der korrekte pnpm v10-Ansatz anstelle des interaktiven `pnpm approve-builds`.

---

## Was der Entwickler manuell erledigen muss

1. **Supabase-Credentials in `.env.local` eintragen**
   - `NEXT_PUBLIC_SUPABASE_URL` → Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Supabase Anon/Public Key
   - Zu finden unter: Supabase Dashboard → Project Settings → API

2. **Vercel Deployment einrichten**
   - Projekt in Vercel verbinden (GitHub/GitLab Import oder `vercel` CLI)
   - Environment Variables in Vercel setzen (dieselben wie `.env.local`)
   - Framework: Next.js (automatisch erkannt)
   - Build command: `pnpm build`
   - Install command: `pnpm install`

3. **DNS konfigurieren**
   - Custom Domain `todasolutions.com` in Vercel hinzufügen
   - DNS-Records beim Domain-Provider setzen (A/CNAME per Vercel-Anweisung)

4. **Git Repository** — ✅ Erledigt. Repo existiert unter GitHub `TODA-Website`, Branch `main`,
   Remote `origin` konfiguriert. Kein `git init` mehr nötig.

---

# ARBEITS-NOTIZEN — Phase 2: Design System Foundation

## Was wurde gebaut

Vier Foundation-Dokumente + Tailwind v4 Token-Konfiguration + Font-Setup + Design-System-Testseite.

```
Website/
├── DESIGN.md           # Vollständiges Design-System (Farben, Typo, Komponenten, Do/Don't)
├── MOTION.md           # Motion-Richtlinien (Easing, Dauer, Scroll, GPU-Regeln)
├── BRAND.md            # Brand-Guidelines (Farbpalette, Typografie, Tone of Voice, Anti-Patterns)
├── CLAUDE.md           # Projekt-Constraints für Claude Code (Stack, Regeln, Checkliste)
├── app/[locale]/
│   ├── globals.css     # Tailwind v4 @theme mit 14 Farbtokens + 2 Font-Tokens
│   ├── layout.tsx      # Inter + Playfair Display Italic via next/font/google
│   └── page.tsx        # Design-System-Testseite (Swatches, Typo-Scale, Button)
```

---

## Key Decisions

### `getdesign` CLI hat funktioniert

`npx getdesign@latest add apple` war ein echtes npm-Paket (v0.6.12) und hat eine vollständige DESIGN.md generiert. Diese wurde als Basis verwendet und komplett für TODA adaptiert: Apple Blue → TODA Gold, Light Theme → Dark Theme, SF Pro → Inter.

### Font-Variable-Naming: `--font-inter-var` / `--font-playfair-var`

In Tailwind v4 + next/font gibt es einen potenziellen Namenskonflikt: Wenn next/font `variable: "--font-inter"` setzt UND `@theme { --font-inter: ... }` definiert ist, würde entweder eine zirkuläre Referenz oder ein Überschreiben entstehen.

**Lösung:** next/font verwendet eindeutige interne Namen (`--font-inter-var`, `--font-playfair-var`), die auf dem `<html>`-Element injiziert werden. `@theme` referenziert diese dann: `--font-inter: var(--font-inter-var)`. Das erzeugt die Tailwind-Utilities `font-inter` und `font-playfair` ohne Konflikt.

### Playfair Display: Nur Italic, nur Weight 400

Setup verlangt Playfair Display Italic für emotionale Akzente (max 2–4 Wörter, immer gold-500). Kein Regular, kein Bold geladen — minimiert den Font-Download. `style: ['italic']` + `weight: ['400']` in der next/font-Konfiguration.

### Tailwind v4 CSS-Native Config: `@theme` in globals.css

Tailwind v4 hat keine `tailwind.config.js`. Alle Design-Tokens sind als CSS Custom Properties im `@theme`-Block in `globals.css` definiert. Das generiert Utilities wie `bg-surface-base`, `text-gold-500`, `font-inter` direkt aus den Token-Namen.

Namensschema:
- `--color-{name}` → `bg-{name}`, `text-{name}`, `border-{name}`
- `--font-{name}` → `font-{name}`

### Testseite: Server Component, keine Übersetzungen

`page.tsx` wurde vollständig ersetzt. Die alte Seite nutzte `useTranslations` (korrekt für eine echte Seite), aber die Testseite ist statischer Inhalt zur Verifikation. Kein `"use client"`, kein next-intl-Import. Sauberer Server Component.

### Inline Styles nur für dynamische Swatch-Farben

Die Farbswatches in der Testseite benötigen `style={{ backgroundColor: token.hex }}` weil Tailwind-Klassen für dynamische Werte zur Laufzeit nicht generiert werden können. Das ist die einzige Ausnahme — alle anderen Stile verwenden Token-basierte Utilities.

### `active:scale-[0.97]` auf dem Button

Setup.md spezifiziert den Button-Stil aber nicht den Active-State. Laut MOTION.md ist `transform: scale(0.97-0.98)` der Standard-Active-State für Buttons. Konsistent mit dem Design-System implementiert.

---

## Abweichungen vom Plan

### Keine Abweichungen

Alle 6 Tasks wurden wie spezifiziert umgesetzt. `getdesign` CLI hat funktioniert (geplante Fallback-Implementierung war nicht nötig). TypeScript und ESLint sind grün.

---

## Was der Entwickler manuell erledigen muss

1. **Testseite visuell prüfen:** `pnpm dev` starten → `http://localhost:3000/de/` öffnen → Alle Tokens, Typo-Scale und Button visuell verifizieren.
2. **Gold 500 kalibrieren:** `#C8941A` ist ein Working Default. Wenn finale Logo-Assets vorhanden sind, diesen Wert gegen das physische TODA-Logo abgleichen und in `globals.css` + `BRAND.md` + `DESIGN.md` aktualisieren.
3. **WCAG-Audit:** `text-tertiary` (#6B6B6B auf #000000) hat 3.6:1 Kontrast — unter WCAG AA. Nur für non-essenziellen Text verwenden. Ggf. auf `#737373` erhöhen (~4.5:1) wenn zugänglicherer Wert benötigt wird.

---

# ARBEITS-NOTIZEN — Phase 3: Supabase Backend

## Was wurde gebaut

Supabase-Backend für den Blog/Content-Bereich der Marketing-Website. Ausschließlich Datenbankarbeit — keine Änderungen am Code-Repository.

---

## Datenbank-Schema

### Tabelle: `posts`

Blog-Posts mit Locale-Support. Unique-Constraint auf `(slug, locale)` statt nur `slug` — ermöglicht denselben Slug in verschiedenen Sprachen.

| Spalte | Typ | Constraints | Beschreibung |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Primärschlüssel |
| `slug` | `text` | NOT NULL, UNIQUE mit `locale` | URL-Bezeichner — z.B. `studio-organisation-2026` |
| `locale` | `text` | NOT NULL | Sprache des Posts (`de`, `en`, `es`) |
| `title` | `text` | NOT NULL | Post-Titel |
| `excerpt` | `text` | — | Kurzzusammenfassung für Listen-Ansicht und SEO |
| `content` | `text` | — | Vollständiger Post-Inhalt (Markdown) |
| `cover_image` | `text` | — | Pfad im `blog-images` Storage-Bucket |
| `status` | `text` | NOT NULL, default `'draft'` | Publishing-Status: `'draft'` oder `'published'` |
| `published_at` | `timestamptz` | — | Zeitstempel der Veröffentlichung — `null` bei Entwürfen |
| `author_id` | `uuid` | FK → `auth.users(id)` | Verknüpfung zum Supabase Auth-User |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Erstellungszeitpunkt |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Letzter Änderungszeitpunkt — via Trigger aktuell gehalten |

**UNIQUE constraint:** `(slug, locale)` — derselbe Slug kann in `de`, `en`, `es` existieren.

### Tabelle: `allowed_admins`

Whitelist der E-Mail-Adressen mit CMS-Admin-Zugriff. RLS-Policies prüfen gegen diese Tabelle. Vier Launch-E-Mails bereits eingetragen.

| Spalte | Typ | Constraints | Beschreibung |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Primärschlüssel |
| `email` | `text` | UNIQUE, NOT NULL | Erlaubte Admin-E-Mail-Adresse |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Zeitpunkt der Eintragung |

**Eingetragene Launch-Admins:**
- `tom@todasolutions.com`
- `manuel@todasolutions.com`
- `dana@todasolutions.com`
- `lucas@todasolutions.com`

---

## Indexes

Zwei zusammengesetzte Indexes für die häufigsten Query-Patterns im Blog.

| Index | Spalte(n) | Query-Pattern |
|---|---|---|
| `posts_status_published_at_idx` | `(status, published_at DESC)` | `WHERE status = 'published' ORDER BY published_at DESC` — Haupt-Listing-Query |
| `posts_locale_status_idx` | `(locale, status)` | `WHERE locale = 'de' AND status = 'published'` — Locale-gefilterte Listen |

---

## RLS Policies

Row Level Security auf beiden Tabellen aktiviert. 6 Policies gesamt.

### `posts` — 5 Policies

| Policy | Operation | Rolle | Bedingung |
|---|---|---|---|
| `posts_public_read` | `SELECT` | `anon`, `authenticated` | `status = 'published'` |
| `posts_admin_read_all` | `SELECT` | `authenticated` | E-Mail in `allowed_admins` — Admins sehen auch Entwürfe |
| `posts_admin_insert` | `INSERT` | `authenticated` | E-Mail in `allowed_admins` |
| `posts_admin_update` | `UPDATE` | `authenticated` | E-Mail in `allowed_admins` |
| `posts_admin_delete` | `DELETE` | `authenticated` | E-Mail in `allowed_admins` |

### `allowed_admins` — 1 Policy

| Policy | Operation | Rolle | Bedingung |
|---|---|---|---|
| `allowed_admins_admin_read` | `SELECT` | `authenticated` | E-Mail in `allowed_admins` — nur Admins dürfen die Whitelist lesen |

**Admin-Check-Pattern** (in allen Admin-Policies identisch):
```sql
auth.uid() IN (
  SELECT u.id FROM auth.users u
  JOIN allowed_admins a ON u.email = a.email
)
```

---

## Triggers

### 1. `posts_updated_at` — Timestamp-Aktualisierung

Setzt `updated_at = now()` bei jedem `UPDATE` auf `posts`. Via `update_updated_at()` Funktion.

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 2. `posts_revalidate` — ISR Cache-Invalidierung

Feuert bei `INSERT` und `UPDATE` auf `posts`, wenn `status = 'published'`. Schickt HTTP POST an `app.revalidate_url` (Postgres-Setting), damit Next.js ISR-Cache sofort invalidiert wird.

```sql
CREATE OR REPLACE FUNCTION notify_revalidate()
RETURNS trigger AS $$
DECLARE
  revalidate_url text;
BEGIN
  -- Graceful skip wenn URL noch nicht konfiguriert (Phase 6)
  revalidate_url := current_setting('app.revalidate_url', true);
  IF revalidate_url IS NULL OR revalidate_url = '' THEN
    RETURN NEW;
  END IF;

  IF NEW.status = 'published' THEN
    PERFORM net.http_post(
      url := revalidate_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-revalidate-secret', current_setting('app.revalidate_secret', true)
      ),
      body := jsonb_build_object('slug', NEW.slug, 'locale', NEW.locale)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER posts_revalidate
  AFTER INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION notify_revalidate();
```

**Konfiguration (Phase 6):** Sobald `/api/revalidate` in Next.js existiert:
```sql
ALTER DATABASE postgres SET app.revalidate_url = 'https://todasolutions.com/api/revalidate';
ALTER DATABASE postgres SET app.revalidate_secret = '<secret>';
```

---

## Extension: `pg_net` (v0.19.5)

Ermöglicht HTTP-Requests direkt aus PostgreSQL — Voraussetzung für den `posts_revalidate`-Trigger.

- **Installiert in:** `extensions` Schema (nicht `public`)
- **Version:** 0.19.5
- **Verwendung:** `net.http_post(...)` im `notify_revalidate()` Trigger

---

## Storage: `blog-images` Bucket

| Eigenschaft | Wert |
|---|---|
| Bucket-Name | `blog-images` |
| Sichtbarkeit | Öffentlich — alle können lesen |
| Upload | Nur Admins (authenticated + allowed_admins-Check) |
| Pfad-Konvention | `{locale}/{slug}/{filename}` — z.B. `de/studio-organisation-2026/cover.webp` |

Cover-Image-Referenz in `posts.cover_image` ist der Bucket-Pfad ohne Base-URL. Vollständige URL via `supabase.storage.from('blog-images').getPublicUrl(path)` im Frontend.

---

## Auth: Magic Link + SMTP

- **Methode:** Supabase Magic Link (passwordless)
- **SMTP:** Resend, Absender `noreply@toda.ink` — konfiguriert und aktiv
- **Flow:** Admin gibt E-Mail ein → Magic Link per Resend versendet → Klick → Session aktiv
- **Zugangskontrolle:** Magic Link klappt für jede E-Mail. Admin-Rechte (Schreiben/Lesen aller Posts) nur wenn E-Mail in `allowed_admins` steht — via RLS durchgesetzt.

---

## Verifikation: Test-Posts

Drei Test-Posts wurden angelegt, verifiziert und anschließend gelöscht:
- Schema valide: alle Spalten korrekt typisiert
- Nullable Felder (`excerpt`, `content`, `cover_image`, `published_at`) verhalten sich korrekt
- `updated_at`-Trigger feuert bei UPDATE zuverlässig
- Entwürfe haben `published_at = null` — korrekt
- `posts_public_read`-Policy liefert nur `status = 'published'` Posts an anonyme Clients

---

## Key Decisions

### `status` als Text statt `published` Boolean

`status = 'draft' | 'published'` statt `published = true/false` lässt Platz für zukünftige Zustände (z.B. `'scheduled'`, `'archived'`) ohne Schema-Migration. Kostet nichts extra.

### Unique-Constraint `(slug, locale)` statt nur `slug`

Jeder Post existiert pro Sprache separat — derselbe Artikel kann auf Deutsch und Englisch unterschiedliche Slugs haben oder denselben. Beide Varianten sind damit abgedeckt.

### `notify_revalidate()` prüft auf null-URL

Wenn `app.revalidate_url` nicht gesetzt ist, gibt die Funktion `RETURN NEW` ohne HTTP-Call. Verhindert fehlgeschlagene Inserts während der Entwicklungsphase, bevor der `/api/revalidate`-Endpunkt existiert. Wird in Phase 6 konfiguriert.

### Auth Hook Whitelist-Verdrahtung auf Phase 7 verschoben

Supabase Auth Hooks könnten den Login blockieren, bevor eine Session entsteht. Das wäre strikter als der aktuelle Ansatz (Login möglich, aber keine Rechte ohne `allowed_admins`-Eintrag). Für die Launch-Phase ist RLS-basierte Kontrolle ausreichend — kein Angreifer kann ohne `allowed_admins`-Eintrag Daten schreiben.

### `pg_net` in `extensions` Schema

Best Practice für Supabase-Projekte: Extensions landen im `extensions` Schema, nicht in `public`. Verhindert Namenskonflikte mit eigenem Code.

---

## Was in Phase 6 erledigt werden muss

1. **`/api/revalidate` Endpunkt** in Next.js anlegen (Route Handler mit Secret-Validierung).
2. **Postgres-Settings setzen:**
   ```sql
   ALTER DATABASE postgres SET app.revalidate_url = 'https://todasolutions.com/api/revalidate';
   ALTER DATABASE postgres SET app.revalidate_secret = '<geheimes-token>';
   ```
3. **`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`** in `.env.local` und Vercel Environment Variables eintragen (aus Phase 1 offen).

---

# ARBEITS-NOTIZEN — Phase 4: Core Components (Block A)

## Was wurde gebaut

Lenis Smooth Scroll, globaler Header und Footer als wiederverwendbare Komponenten.

```
components/
├── lenis-provider.tsx   # Task 1: Client Component, lerp 0.1, prefers-reduced-motion-aware
├── header.tsx           # Task 2: Client Component, sticky glass-blur, scroll-aware
└── footer.tsx           # Task 3: Server Component, 4-spaltige Sitemap, Sprachumschalter

i18n/
└── navigation.ts        # createNavigation(routing) — locale-aware Link/useRouter/usePathname

messages/
├── de.json              # nav + footer Namespaces ergänzt
├── en.json              # nav + footer Namespaces ergänzt
└── es.json              # nav + footer Namespaces ergänzt

app/[locale]/layout.tsx  # LenisProvider + Header + Footer eingebunden
```

---

## Key Decisions

### LenisProvider als separater Client Component

`layout.tsx` ist ein async Server Component (`await params`, `getMessages()`). Lenis benötigt DOM-Zugriff → muss in `"use client"` leben. Separater Wrapper hält das Layout sauber als Server Component.

### Header: native scroll events statt Lenis-API

Der Header hört auf native `window.scroll`-Events (passive). Lenis feuert diese weiterhin — keine Lenis-Context-Referenz nötig. Hält den Header unabhängig vom Scroll-Provider.

### Footer: getLocale() für aktiven Sprach-State

`getLocale()` aus `next-intl/server` liefert die aktive Locale im Server Component, ohne dass ein Client-Hook nötig ist. Aktive Sprache wird im Footer-Sprachumschalter hervorgehoben.

### Footer Sprachumschalter: Link to Locale-Home

Footer ist Server Component → kein `usePathname`. Sprachumschalter verlinkt auf die Home-Page der jeweiligen Locale (`href="/" locale="de"` etc.). Pfad-bewusster Wechsel (aktueller Pfad beibehalten) wird in **Phase 9** nachgerüstet.

---

## Bekannte Einschränkungen / Phase-9-Todos

### Footer Copyright Jahr — Build-Time-Rendering ⚠️

`new Date().getFullYear()` wird zur Build-Zeit ausgewertet, da `Footer` ein Server Component ist.
Das Jahr stimmt nur bis zum nächsten Build/Deployment. Für eine Marketing-Website mit regelmäßigen
Deploys ist das unkritisch — bei seltenen Deploys kann es passieren, dass das Footer-Jahr veraltet ist.

**Fix-Option für Phase 9:** Footer-Copyright als eigenes `"use client"` Subcomponent
auslagern, das `new Date().getFullYear()` zur Laufzeit berechnet. Alternativ: Route Segment Config
`export const dynamic = "force-dynamic"` auf der Root-Layout-Ebene (teuer — nicht empfohlen).
Einfachste Lösung: jährlicher Deploy oder das Jahr manuell hardcoden.
