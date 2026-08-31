---
focus_plan: true
slug: "admin-mobile-foundation"
title: "Mobile-first foundation for the TODA admin backoffice"
revision: 1
auto_mode: Awaiting-Approval
execution: Not-Started
base_commit: "5cbe9b085f35cddefc694c34150627c252f1649f"
created_at: "2026-08-31T07:43:26Z"
approved_at: null
---

# Mobile-first foundation for the TODA admin backoffice

## Objective

Reach a state where every existing TODA admin surface—login, protected navigation, posts, categories, authors, and the post editor—is comfortable and reliable on smartphone viewports without regressing desktop behavior or any CMS mutation contract.

The protected admin must have a mobile navigation model that can later accommodate Social as a fourth primary destination, but this milestone must not add a Social placeholder, calendar, route, database model, or posting behavior. Existing blog administration must remain functionally unchanged while its presentation becomes mobile-first, touch-friendly, safe-area-aware, and free from page-level horizontal overflow.

## Verified baseline

### Repository and working state

- Repository: `/Users/harvestflow/Developer/toda/TODA-Website`.
- Branch: `staging`, four commits ahead of `origin/staging` at planning time.
- Base commit: `5cbe9b085f35cddefc694c34150627c252f1649f`.
- The working tree was clean before this plan was created.
- `focused-plans/` contains only the completed archived `seo-connected-entity-graph` plan. No active or blocked plan conflicts with this milestone.
- The current admin was introduced by `4ff2216`, with author administration added by `51f8e85` and podcast fields added by `27b78ae`. No later commit establishes a separate mobile admin architecture.

### Existing admin architecture

Source inspection established:

- `/admin` is a second, English-only Next.js root layout that imports the shared Tailwind/global design tokens but not the public site header, footer, or next-intl navigation.
- `app/admin/(protected)/layout.tsx` is the authenticated shell. It performs `requireAdmin()`, then renders the brand, Posts/Categories/Authors links, and Log out in one fixed-height horizontal header. It has no responsive navigation breakpoint, active-route treatment, mobile drawer, or bottom navigation.
- Admin page width is capped at `max-w-6xl`; protected content currently uses fixed `px-6 py-10` at every viewport.
- The posts index renders a `min-w-[640px]` table inside `overflow-x-auto` at every width.
- Category forms render two columns below `sm` and five at `sm+`; Delete remains in a separate form beside the save form.
- Author forms collapse their major grids, but social rows retain fixed-width labels and avatar upload controls remain a non-wrapping horizontal form.
- The post editor collapses field grids and the Markdown/preview pair, but shared-setting rows, locale controls, file upload, and publication actions remain desktop-shaped. Mobile users receive a long Markdown editor followed by a long preview rather than a write/preview mode switch.
- Shared admin inputs are duplicated as class strings in category, author, and editor components. They use `text-sm` and approximately 36–38px rendered heights. Buttons and links have no shared touch-target contract.
- Server actions, authentication, service-role access, validation, revalidation, and the public blog are separate from the presentation defects and do not need redesign.

### Smartphone runtime evidence

The current base commit was rendered through the real local Next.js application with authenticated mobile Chrome emulation at 390×844 and 320×568. Login, posts, categories, authors, and a populated post editor were inspected. Temporary browser/CDP probes and screenshots were kept outside the repository and removed or terminated after the audit.

Observed behavior:

- The login screen is already sound: it stays within the viewport, uses a constrained full-width form, and has adequately sized controls.
- At 390px, the protected header is visibly cramped: the two-word brand wraps inside the fixed 56px row, and the Authors link ends where the Log out target begins. There is no usable separation between them.
- At 320px, the protected document renders 331px wide, and Log out is clipped. Adding another inline destination would worsen the defect.
- At 390px, the posts table remains 640px wide inside a 342px scroller. Page-level overflow is contained, but users must pan sideways to discover category, three locale statuses, and update date.
- At 390px, category text inputs render about 125px wide in the forced two-column layout. Existing names and slugs truncate heavily, while Save/Delete actions are spatially disconnected.
- Protected form controls render at 14px and about 36–38px high. Locale buttons are about 32px high; most save/upload/delete controls are about 38px high; top navigation links have approximately 20px-high hit regions. These do not meet the intended 44px smartphone target, and sub-16px form text risks iOS focus zoom.
- Author and editor content is generally readable because some grids collapse, but both remain unnecessarily dense. The avatar upload row, shared editor settings, locale selector, and publication actions are the main narrow-width failure points.
- No smartphone-specific list view, editor mode switch, safe-area treatment, or responsive admin navigation currently exists.

The verified conclusion is therefore nuanced: the admin has partial responsive CSS, and login is good, but the protected backoffice is not yet smartphone-optimized or a suitable shell for an additional Social destination.

### Baseline verification evidence

Commands run at the base commit:

- `pnpm test` — passed: 7 tests, 0 failures.
- `pnpm typecheck` — passed with zero diagnostics.
- `pnpm lint` — passed with the existing Next lint deprecation notice and the existing `components/header.tsx` `<img>` warning.
- `pnpm build` — passed; 50 static pages generated and all five admin route patterns compiled.
- `pnpm format:check` — failed on 34 pre-existing paths. Two in-scope files, `app/admin/(protected)/authors/author-form.tsx` and `app/admin/(protected)/authors/page.tsx`, are in that baseline set. Every touched file must be formatted; the final full check must introduce no new failing path and should remove those two in-scope paths from the failure list.
- The repository has no browser/E2E dependency or UI component test setup. Existing deterministic tests cover structured data only. Browser layout behavior must therefore be verified against the built application with a temporary local Chrome/CDP probe unless implementation evidence justifies a narrowly scoped test addition.

## Scope rationale

This is one coherent foundation milestone: make the existing authenticated admin shell and every existing child surface mobile-first while preserving the same data and mutation boundaries. Navigation, control sizing, responsive content representations, and editor interaction are interdependent—fixing only one page would leave an inconsistent shell and would not create a trustworthy base for Social.

The scope is realistic for one run because it changes presentation and local client state only. It requires no database migration, external API, credential change, new content model, public-site redesign, or unproven integration. The existing routes and live read data provide complete runtime fixtures, and all behavior can be verified without submitting mutations against the shared production database.

## In scope

1. Replace the protected admin’s single crowded header with a responsive, active-route-aware shell:
   - compact one-line mobile app bar for brand and logout;
   - labeled mobile bottom navigation for the three real existing destinations;
   - existing-style horizontal navigation at desktop width;
   - safe-area-aware padding and no overlap with page content.
2. Establish shared admin control recipes for 16px form text, at least 44px smartphone touch targets, focus visibility, disabled state, and mobile/desktop button sizing.
3. Tighten mobile page gutters and vertical spacing while preserving the existing desktop max-width and rhythm.
4. Render the posts index as information-complete cards on phones and retain the status-matrix table on desktop.
5. Recompose category editing into labeled, single-column mobile cards with coherent save/delete actions and progressively enhanced wider grids.
6. Recompose author cards for full-width mobile fields, readable social-link rows, and a wrapping/stacking avatar upload section.
7. Recompose the post editor for narrow screens:
   - stacked shared settings and upload actions;
   - full-width, touch-sized locale selector and visible status;
   - mobile write/preview mode switching while retaining simultaneous desktop columns;
   - publication controls that wrap or stack without clipping;
   - robust handling of long titles, slugs, tags, URLs, filenames, and localized copy.
8. Preserve the already-good login layout while aligning any shared touch/focus details and safe-area behavior needed for consistency.
9. Add only the accessibility semantics directly required by the responsive work: persistent form labels where placeholders currently carry meaning, navigation labels/current state, and non-overlapping keyboard-visible focus targets.
10. Verify authenticated rendering at narrow phone, common phone, tablet boundary, and desktop widths without writing to Supabase.

## Out of scope

- No Social link, placeholder destination, calendar UI, agenda view, post composer, content scheduler, social-account integration, upload flow, notification, or publishing API.
- No database migration, Supabase DML, RLS change, storage policy change, server-action behavior change, authentication redesign, or session-lifetime change.
- No rich-text editor, Markdown syntax toolbar, autosave, revision history, unsaved-change guard, content schema change, or blog editorial workflow change.
- No public website, public blog, marketing navigation, shared design-system overhaul, or next-intl change.
- No PWA installation, offline mode, push notification, or native application behavior.
- No speculative navigation item for future features. The finished three-item mobile navigation must be structurally able to accept a fourth item later without promising functionality now.
- No broad test-stack adoption or browser dependency unless implementation proves runtime verification cannot be made reliable with the already available local Chrome. Such a dependency change would require renewed approval if it materially expands maintenance scope.
- No repository-wide Prettier cleanup, existing public-header lint correction, or Next lint migration.

## Implementation approach

### 1. Responsive admin shell

Keep `app/admin/(protected)/layout.tsx` as the server-side authorization boundary. Extract only the responsive navigation presentation into an admin component under `components/admin/`; it may use `usePathname()` to mark Posts, Categories, or Authors active while continuing to use `next/link` because `/admin` is intentionally outside locale routing.

Use one immutable navigation definition for desktop and mobile representations. Each destination must have a visible English label and an icon from the already-installed `lucide-react`; no dependency is needed. Path matching must treat `/admin/posts/[id]` as Posts.

At widths below `md`:

- show a sticky app bar containing a non-wrapping `TODA Admin` brand and touch-sized Log out action;
- hide the desktop inline route list;
- show a fixed or sticky-to-viewport bottom navigation with three equal-width route targets, active state, `aria-current="page"`, and `padding-bottom: env(safe-area-inset-bottom)`;
- add corresponding bottom space to protected main content so the navigation never covers controls or the danger zone.

At `md+`, retain a single top header with horizontal destinations and logout. All routes must remain reachable without a hamburger-only hidden interaction. The structure must be ready for a fourth destination later, but only current routes are rendered.

Set protected main gutters to a phone-first value such as `px-4 py-6`, progressing to the current desktop spacing at larger breakpoints. Add `min-w-0` at flex/grid boundaries where long CMS text can otherwise expand the page.

### 2. Shared mobile control contract

Centralize reusable admin input, label, button, and destructive-action class recipes in a small admin-only module or components. The exact file boundary may adapt, but Tailwind classes must remain statically discoverable.

Required behavior:

- text inputs, textareas, selects, and file controls use a computed font size of at least 16px on phone widths;
- every visible phone input, select, textarea, button, and primary navigation target has a minimum 44px hit height;
- buttons use `inline-flex` alignment, visible focus treatment, and coherent full-width/mobile versus intrinsic/desktop sizing;
- flex children that carry inputs or long text use `min-w-0`;
- hover styling is never the only interaction feedback; focus-visible and active/current states remain legible in the dark palette;
- existing semantic colors, surfaces, and action hierarchy are preserved.

Do not turn this into a public design-system refactor. The contract is admin-only and should remove class drift only where files are already being changed.

### 3. Posts: cards on phones, matrix on desktop

Keep the existing service-role query and locale-status derivation. Refactor presentation so the same normalized post view data feeds:

- a card list below `md`, with title as the primary route target, category, updated date, and a compact but complete de/es/en status row;
- the current table concept at `md+`, without exposing a redundant mobile horizontal scroller.

Cards must support long German titles without forcing horizontal overflow. The New post action stays prominent and touch-sized. Empty-state behavior and create/edit URLs remain unchanged.

### 4. Category and author mobile forms

For categories:

- wrap each existing category in a visible card/section;
- use persistent labels for de/en/es name, slug, and sort order rather than relying only on placeholders;
- use one column on phones, a moderate grid on intermediate widths, and the compact five-field arrangement only where space supports it;
- place Save and Delete in one visually coherent action region without nesting forms or changing server actions;
- ensure the new-category variant follows the same field contract and omits Delete.

For authors:

- preserve all existing fields and three independent forms;
- use full-width one-column phone fields and current multi-column layouts only at supported widths;
- let each social label/input pair stack at the narrowest widths, then become an inline row when enough width exists;
- recompose avatar preview, file picker, Upload, and Delete so no inner form depends on nowrap behavior;
- keep upload/delete forms and confirmation behavior unchanged.

### 5. Post editor mobile interaction

Preserve `PostEditor` data ownership, locale draft state, slug behavior, debounced real-markdown preview, and every server action. Change only responsive composition and local view state.

- Shared category, author, and cover forms stack label/control/action on phones and return to horizontal composition on wider screens.
- The shared settings card uses reduced phone padding and a full-width cover preview.
- Locale selection becomes a three-column, full-width segmented control on phones with 44px targets; status moves to a non-colliding row/position. Desktop may retain intrinsic-width tabs.
- Add local write/preview mode state for widths below the existing side-by-side breakpoint. The Markdown textarea must remain the submitted form field even when preview is selected; desktop continues to show editor and preview together. Mode controls must be real buttons with selected-state semantics.
- The preview receives a useful bounded phone height and does not create nested horizontal overflow for prose/code content.
- Save draft, Save & publish, and conditional Unpublish actions wrap or stack within the viewport and retain their exact `formAction` contracts. Destructive Delete post remains visually separate and touch-sized.
- No action may be made fixed in a way that competes with or obscures the mobile bottom navigation. If a sticky action treatment is used, its offsets and containing block must be proven at all target viewport heights; a clear non-sticky wrapping action region is acceptable when it provides stronger reliability.

### 6. Login and overflow hardening

Keep the current centered `max-w-sm` login design. Confirm that viewport/safe-area spacing, password font size, autofocus, and full-width button remain correct; add `autoComplete="current-password"` and an accessible label only if needed while touching the control.

Audit every admin route for page-level overflow. Long content must wrap, truncate visually without losing editable values, or scroll only inside an intentional content surface such as code/prose—not expand the document. File inputs require special inspection because their intrinsic width differs by browser.

### 7. Verification without production writes

Use the existing `.env.local` only through the application. Generate a valid local admin session or sign in through the rendered form without printing secrets. Load real protected pages, but do not submit create/save/publish/upload/delete actions because the configured Supabase database is shared production state.

A temporary Chrome DevTools Protocol probe may be created outside the repository. It should set mobile metrics, inspect computed layout, exercise only local client-state controls such as locale or write/preview tabs, and capture screenshots. Remove the probe and terminate local services before completion unless a retained script becomes intentionally necessary and is separately justified.

## Focus To-Do List

1. Recheck plan integrity, HEAD/working-tree drift, active plans, environment availability, and the current admin route/data baseline; approve the plan metadata in a separate commit after explicit authorization.
2. Implement the responsive authenticated shell, active desktop/mobile navigation, safe-area spacing, and shared admin control recipes without changing auth or routes.
3. Replace the phone posts table with complete mobile cards and recompose category and author forms into labeled, touch-sized narrow-screen layouts.
4. Recompose the post editor’s shared settings, locale control, write/preview interaction, uploads, and action rows while preserving all existing state and server-action contracts.
5. Align the login and harden every admin surface against long-content, file-input, and page-level overflow edge cases.
6. Format touched files and run tests, typecheck, lint, full/targeted Prettier, and production build; investigate every new warning or failure.
7. Run authenticated no-write browser verification at 320, 390, 768, and desktop widths, inspect screenshots/DOM assertions and client-only editor interactions, then review the task diff, secret exposure, and repository state before the implementation/completion commit and plan archive.

## Definition of Done

- At 320px and 390px CSS viewport widths, login and every protected admin route have `document.documentElement.scrollWidth === document.documentElement.clientWidth` with no clipped header, logout, navigation, form action, file picker, or long CMS value.
- The mobile shell renders a one-line app bar plus three labeled, equal-width bottom navigation targets with active state, at least 44px hit height, safe-area padding, and enough content padding that the bar obscures nothing.
- At desktop width, the current horizontal navigation remains available and visually coherent; mobile bottom navigation is absent.
- The navigation definition can accept a fourth destination without shell redesign, but no Social destination or placeholder is present.
- The phone posts view requires no horizontal table panning and exposes title, category, updated date, and all de/es/en statuses for every post. The desktop status table remains available.
- Category forms are labeled and one-column at narrow widths; values are comfortably editable; Save/Delete remain distinct and no form nesting or action contract changes occur.
- Author fields, social rows, avatar upload, Save, Upload, and Delete fit and remain operable at the narrowest target width.
- The post editor’s settings, locale tabs, all translation/video fields, Markdown editing, preview, publication actions, and danger zone fit at phone width. Write/preview switching works on narrow screens, while desktop still shows simultaneous editor and preview columns.
- Every visible phone form control computes to at least 16px text, and every visible phone input/select/textarea/button/primary navigation target has at least a 44px hit height.
- Keyboard focus remains visible, current navigation/mode semantics are exposed, and persistent labels replace meaning carried only by category placeholders.
- Existing admin authentication, service-role queries, server actions, locale draft/publish behavior, Markdown rendering, confirmation prompts, and public blog behavior remain unchanged.
- No Social/calendar code, database change, new dependency, public-site redesign, or production data mutation is included.
- Tests, TypeScript, lint, and production build pass at least at their verified baseline. Every touched path passes Prettier; the full formatting check adds no failing path and removes any touched in-scope path from the 34-file baseline set.
- Authenticated browser evidence covers all existing admin surfaces at 320×568, 390×844, 768×1024, and a desktop viewport, with screenshots plus objective DOM/computed-style assertions and no write actions.

## Verification plan

Run from `/Users/harvestflow/Developer/toda/TODA-Website` with the task environment available.

### Static and build verification

1. `pnpm test`
   - Expect all 7 existing structured-data tests to pass; responsive work must not affect them.
2. `pnpm typecheck`
   - Expect zero diagnostics.
3. `pnpm lint`
   - Expect success with no new warning. The existing Next lint deprecation notice and `components/header.tsx` `<img>` warning may remain.
4. `pnpm exec prettier --check <every touched path>`
   - Expect success.
5. `pnpm format:check`
   - Run and record the complete failing set. No new failing path is allowed. The two currently failing in-scope author files must no longer fail if touched, and every other touched file must be green.
6. `pnpm build`
   - Expect successful compilation, type/lint validation, page-data collection, all public static generation, and successful compilation of `/admin`, `/admin/posts`, `/admin/posts/[id]`, `/admin/categories`, and `/admin/authors`.

### Authenticated runtime verification

Launch the built application on an unused local port with environment values loaded by Next. Ensure it and any headless browser are terminated afterward.

Using installed local Chrome/CDP or an equivalently strong permitted browser method, verify these viewport classes:

- 320×568: narrow stress case;
- 390×844: common smartphone;
- 768×1024: breakpoint/tablet boundary;
- at least 1280×800: desktop regression case.

Routes:

- unauthenticated `/admin`;
- authenticated `/admin/posts`;
- authenticated `/admin/categories`;
- authenticated `/admin/authors`;
- authenticated one existing `/admin/posts/[id]` editor.

At 320 and 390, assert from the rendered DOM/computed styles:

- document scroll width equals client width;
- no two visible interactive element rectangles overlap;
- mobile app bar and bottom navigation are visible, and desktop route list is hidden;
- bottom navigation does not cover the last page control at maximum scroll;
- all visible form controls have computed font size ≥16px;
- all visible inputs, selects, textareas, buttons, and primary navigation links have bounding-box height ≥44px;
- posts cards are visible and the desktop table is hidden; no posts horizontal scroller exists;
- category fields form one column at 320 and labels remain visible;
- author social/upload controls remain within their card bounds;
- editor settings/actions remain within viewport bounds;
- Markdown/preview mode controls switch visible panels without losing textarea state;
- locale switching still changes client-side draft fields/status without submitting;
- long real titles, slugs, tags, social URLs, and filenames do not expand the page.

At 768 and desktop, verify breakpoint behavior, desktop route availability, posts table visibility, editor two-column preview at its intended breakpoint, and no regression in content measure.

Capture representative screenshots for shell/posts, categories, authors, editor write mode, and editor preview mode at 390, plus narrow stress and desktop comparison screenshots. Inspect them for visual density, truncation, safe-area spacing, sticky/fixed collisions, and dark-theme focus/active contrast.

Do not submit any mutation form. The browser check is read-only against existing data; no isolated database fixture is required.

### Final integrity checks

- `git diff --check` — expect no whitespace errors.
- Review `git diff --stat` and the complete task diff for route/action/data-scope drift, accidental public-site changes, dynamic Tailwind classes, secrets, temporary probes, screenshots, or build output.
- `git status --short` — expect only intentional task-owned files before commit and a clean tree after the coherent implementation/completion commit.
- Confirm local dev/build/browser processes are stopped.

## Risks and adaptation guidance

- **Bottom navigation versus editor actions:** A bottom navigation and sticky publication controls can compete for scarce height. Prefer a reliable wrapping action region unless sticky behavior is proven not to obscure navigation/content at both 568px and 844px heights. The exact sticky choice may change without changing the milestone.
- **File input intrinsic sizing:** Native file controls vary across Chrome and Safari. Use `min-w-0`, wrapping/stacking, and full-width containers; do not depend on one filename rendering. If native styling remains unstable, visually separated file-button styling may adapt while preserving the real input and upload action.
- **Tailwind static detection:** Shared recipes must contain complete static class strings. Do not dynamically construct class fragments that Tailwind cannot detect, and preserve the repository warning about spaces before template interpolations.
- **Client/server boundary:** Active-route navigation and editor mode state may require small client components, but `requireAdmin()` must remain server-side and every server action must retain its own authorization check. Do not move credentials or Supabase admin access into client code.
- **Duplicate responsive representations:** Posts cards and table may both exist in the DOM with CSS visibility. Normalize data once and ensure no duplicate IDs or accessibility confusion; hidden representation must not remain keyboard-focusable at its hidden breakpoint.
- **Live data variability:** Real title/URL lengths and publication states can drift. Use current long data as runtime evidence, but layout contracts must handle arbitrary long unbroken slugs/URLs. New content does not expand scope.
- **iOS-specific behavior:** Local Chrome emulation proves CSS layout and computed sizes, not every Safari quirk. The 16px input and safe-area contracts directly address the known high-risk cases. If a permitted real Safari check is available during execution, use it as extra evidence; its absence does not justify skipping Chrome layout assertions.
- **Formatting baseline:** Do not hide or broaden the existing 34-file formatting debt. Format every touched file and prove no new failing path; do not reformat unrelated files.

The implementation may adapt component names, internal class-recipe boundaries, or the exact mobile breakpoint if runtime evidence demonstrates a stronger solution. Stop for renewed approval if work would require a new dependency, database/auth/action change, Social/calendar implementation, public-site change, or a materially different admin information architecture.

## Execution handoff

A fresh Auto-Mode agent must, before changing application code:

1. Read completely:
   - `/Users/harvestflow/.pi/agent/AGENTS.md`;
   - `/Users/harvestflow/Developer/AGENTS.md`;
   - `/Users/harvestflow/Developer/toda/TODA-Website/CLAUDE.md`;
   - `/Users/harvestflow/Developer/playground/mean-machine/.pi/prompts/focus-plan.md`;
   - `/Users/harvestflow/Developer/playground/mean-machine/focused-plans/README.md`;
   - this plan.
2. Inspect the current versions of:
   - `app/admin/layout.tsx`, `app/admin/page.tsx`, and `app/admin/login-form.tsx`;
   - `app/admin/(protected)/layout.tsx`;
   - `app/admin/(protected)/posts/page.tsx`;
   - `app/admin/(protected)/posts/[id]/page.tsx` and the complete `post-editor.tsx`;
   - category and author pages/forms;
   - admin action/auth files only enough to preserve their boundaries;
   - `app/[locale]/globals.css`, `package.json`, `next.config.ts`, and `tsconfig.json`.
3. Locate the commit that introduced revision 1 of this plan. Verify that the plan is tracked, unchanged, `auto_mode: Awaiting-Approval`, and `execution: Not-Started`.
4. Compare current HEAD and working tree with base commit `5cbe9b085f35cddefc694c34150627c252f1649f`. Preserve unrelated newer work. If drift materially changes admin routes, fields, dependencies, or baseline failures, revise and recommit the plan for renewed approval rather than forcing stale instructions.
5. Re-run the active-plan guard and verify required environment variables are present without printing values. Recheck at least one populated post editor and the narrow current layouts before implementation.
6. After Tomek’s explicit approval, change only plan metadata to `auto_mode: Approved`, `execution: In-Progress`, set `approved_at`, and commit that approval state before application implementation.
7. Execute adaptively within the Objective, Out of scope, and Definition of Done. Preserve all server-action and database boundaries, do not submit runtime mutations, and record non-material adaptations plus complete evidence in the archived Execution Record.
