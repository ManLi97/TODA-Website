# CLAUDE.md — TODA Marketing Website

Read this file at the start of every session. It is the single source of constraint for this project.

---

## Session Start — Required Reading

At the beginning of every session, before writing any code:

1. Read CLAUDE.md (this file) completely
2. Read DESIGN.md
3. Read MOTION.md
4. Read BRAND.md
5. Read ARBEITS-NOTIZEN.md — understand the current project state

Then briefly confirm your understanding before starting.

---

## Design Sources of Truth

Before writing any UI code, read these files:

| File | Purpose |
|---|---|
| `DESIGN.md` | Color system, typography hierarchy, component specs, do's & don'ts |
| `MOTION.md` | Easing curves, durations, scroll patterns, GPU rules |
| `BRAND.md` | Exact color hex values, tone of voice, imagery rules, anti-patterns |

These three files are the canonical reference. If there is ever a conflict between them and this file, the three design docs take precedence for visual and motion decisions.

---

## Tech Stack Constraints

| Concern | Required | Forbidden |
|---|---|---|
| i18n | `next-intl` | `i18next`, `react-i18next`, any other i18n library |
| Package manager | `pnpm` | `npm`, `yarn` |
| Router | Next.js App Router | Pages Router patterns (`getServerSideProps`, `getStaticProps`, `_app.tsx`) |
| Styling | Tailwind CSS v4 (CSS-native) | `tailwind.config.js`, inline style overrides, hardcoded hex values |
| Fonts | `next/font/google` | `<link rel="stylesheet">` for Google Fonts, self-hosted without next/font |
| Animations | `transform` + `opacity` only | Animating `height`, `width`, `top`, `left`, `margin`, `padding` |

---

## Component Rules

### Default: Server Components

Every component is a React Server Component unless it strictly requires one of:
- User interaction handlers (`onClick`, `onChange`, `onSubmit`, etc.)
- Browser-only APIs (`window`, `document`, `navigator`, `localStorage`)
- React hooks that require client context (`useState`, `useEffect`, `useRef`, `useContext`)
- Third-party libraries that require a client context (e.g. animation libraries with DOM access)

If any of the above apply, add `"use client"` at the top of that file only — not to its parent layout or page.

### Component file rules
- One component per file.
- File name = component name in kebab-case (e.g. `hero-section.tsx` exports `HeroSection`).
- Keep files under ~300 lines. If a component grows beyond that, extract sub-components.

---

## Code Style

- **TypeScript strict mode.** No `any` types. No `@ts-ignore`. No `@ts-expect-error` without a comment explaining why.
- **No inline styles** except where genuinely unavoidable (dynamic values that cannot be expressed as Tailwind utilities). Document why with a comment.
- **No hardcoded color values** in className strings. Always use token-based utilities (`bg-surface-base`, `text-gold-500`). Exception: `currentColor` in SVGs.
- **No hardcoded font-size values** outside of Tailwind utilities or the `text-[N]px` arbitrary value syntax.
- Prefer `const` over `let` unless reassignment is necessary.
- All exported functions are named exports. Only pages and layouts use default exports (Next.js convention).

---

## Color Token Usage

All colors must use the Tailwind utility classes generated from `globals.css @theme`:

```tsx
// Correct
<div className="bg-surface-base text-text-primary border border-border-subtle">

// Incorrect — hardcoded hex
<div style={{ backgroundColor: "#000000", color: "#ffffff" }}>

// Incorrect — Tailwind arbitrary color value (not a token)
<div className="bg-[#000000]">
```

The only exception: dynamic values computed at runtime (e.g., data-driven chart colors). These must be documented with a comment.

---

## Animation Rules

All animations must follow MOTION.md. Summary:

- Standard easing: `cubic-bezier(0.4, 0, 0.2, 1)` — use the `transition-*` Tailwind utilities with `ease-[cubic-bezier(...)]` or configure in globals.css.
- Duration: 150ms for hover, 200–300ms for UI transitions, 600–800ms for section reveals.
- GPU only: `transform` and `opacity` exclusively. Never animate layout properties.
- Hover: opacity change or max `scale(1.02)` — never hard color switch without a transition.
- Every hover state must have a corresponding `:active` state.
- Respect `prefers-reduced-motion`.

---

## Anti-patterns — Never Do These

These are blocking issues in any PR review:

- **Generic hero + three feature cards with Lucide icons in circles** — the #1 SaaS cliché.
- **Purple gradients** or any multi-color decorative gradient.
- **Centered body text** — body copy is always left-aligned.
- **Stock photos or robot illustrations** — see BRAND.md.
- **GIF files** — use HTML5 `<video autoplay loop muted playsinline>`.
- **Lottie animations with excessive movement** — more than 3 simultaneous motion paths.
- **`box-shadow` on cards or UI elements** — use `surface-elevated` background instead.
- **Second accent color** — there is one accent: `gold-500`. No blue, green, or red states.
- **`i18next` or any non-next-intl i18n library.**
- **`npm install` or `yarn add`** — always `pnpm add`.
- **Pages Router patterns** in an App Router project.

---

## i18n Rules

- All user-facing strings go in `messages/{locale}.json`.
- Server Components use `getTranslations()` (async): `const t = await getTranslations('namespace');`
- Client Components use `useTranslations()` hook: `const t = useTranslations('namespace');`
- German (`de`) is the primary locale — build German first, then propagate to `en` and `es`.
- Namespace per page/feature — do not put all strings in a flat root object.

---

## Quality Checklist (before handing back)

Run these before marking a task complete:

```bash
pnpm build          # must pass with zero errors
pnpm lint           # must pass with zero warnings
npx tsc --noEmit    # must pass with zero type errors
```

Do not claim a feature is done without passing all three.