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

4. **Git Repository initialisieren**
   ```bash
   git init
   git add .
   git commit -m "chore: phase 1 foundation setup"
   ```
   Dann Remote verbinden und auf Vercel deployen.
