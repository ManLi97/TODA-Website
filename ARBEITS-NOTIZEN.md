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
