---
focus_plan: true
slug: "seo-connected-entity-graph"
title: "Connected structured-data entity graph for TODA"
revision: 1
auto_mode: Approved
execution: Completed
base_commit: "effac142e4ff1a4efbee549371cf45b661457751"
created_at: "2026-08-28T23:47:33Z"
approved_at: "2026-08-29T00:00:31Z"
completed_at: "2026-08-29T00:09:44Z"
---

# Connected structured-data entity graph for TODA

## Objective

Reach a state where every localized TODA homepage emits one valid, connected JSON-LD graph for the verified TODA organization, website, localized webpage, software application, and visible monthly offer, while every published article emits a self-contained graph that reuses the same stable entity identifiers and connects its WebPage, Article, publisher, author, and optional video correctly.

The implementation must preserve current multilingual canonical/hreflang behavior, avoid unsupported entity claims, and include deterministic tests plus rendered-HTML verification.

## Verified baseline

### Repository and working state

- Repository: `/Users/harvestflow/Developer/toda/TODA-Website`.
- Branch: `staging`, seven commits ahead of `origin/staging` at planning time.
- Base commit: `effac142e4ff1a4efbee549371cf45b661457751`.
- The working tree was clean before this plan was created. A provisional implementation file created immediately before Focus Plan Mode was removed; no application implementation is part of this planning commit.
- No other `focused-plans/*.md` file exists in this repository, so there is no active-plan conflict.

### Existing crawler and metadata foundation

Source inspection and a production-render smoke check established:

- `lib/site.ts` provides `SITE_URL`, defaulting to the canonical `https://www.todasolutions.com` origin, and `ONBOARDING_URL`.
- `app/robots.ts` permits public crawling, disallows `/admin`, and points to the canonical sitemap.
- `app/sitemap.ts` emits all locale-prefixed static routes, category routes, and published article translations. Article hreflang alternates are restricted to published siblings through `getPublishedAlternates()`.
- `app/[locale]/layout.tsx` emits per-locale canonical URLs, de/en/es alternates, Open Graph metadata, Twitter metadata, and the app icon.
- Article metadata in `app/[locale]/blog/[slug]/page.tsx` preserves per-locale canonical and published-only hreflang URLs.
- Rendered `/de` contained the expected canonical plus de/en/es alternates and no JSON-LD.
- Rendered representative article `/de/blog/screenshot-roulette-wenn-das-genau-so-ploetzlich-1-500-euro-kostet` contained the expected canonical plus all three published sibling alternates and exactly one standalone `Article` JSON-LD object.
- Rendered `robots.txt` and `sitemap.xml` used the `www` origin as intended.

Crawler files, sitemap construction, canonical rules, and hreflang selection are therefore not defects to redesign in this milestone.

### Current structured-data defects

`app/[locale]/blog/[slug]/page.tsx` currently constructs JSON-LD inline:

- The homepage has no Organization, WebSite, WebPage, SoftwareApplication, or Offer graph.
- Article, publisher, author, and VideoObject objects have no stable `@id` values.
- The publisher is repeated inline as `TODA Solutions` rather than referring to one canonical organization entity.
- Articles do not connect to a WebSite entity or a locale-specific WebPage entity.
- The CMS author shape is always serialized as `Person` when present.
- A read-only anon query against the live RLS-visible blog data showed the only current author is `Dein TODA Team` with slug `toda-team`, a TODA avatar, TODA Instagram/YouTube/site links, and assignment to every current published translation. The rendered article incorrectly marks this collective as a `Person`.
- Optional VideoObject data is nested without a stable ID. `startOffset` is currently placed directly on VideoObject even though the visible player offset is not enough to construct a complete clip entity; this direct property must not be carried forward.
- JSON-LD is serialized with raw `JSON.stringify()` directly into a script. CMS strings are escaped by JSON syntax but `<` is not neutralized against an HTML `</script>` boundary.

### Verified first-party facts available to mark up

Only these repository-visible facts may be used:

- Brand name: `TODA Tattoo Solutions`; alternate brand name: `TODA`.
- Legal entity: `TODA Tattoo Solutions S.L.` from `app/[locale]/imprint/page.tsx`.
- Public address: Carrer de Miquel Barceló 2-4, Bloque A2 Apt. 201, 07180 Calvià, Illes Balears, Spain.
- Public NIF: `B26574699` and contact email `manuel@todasolutions.com`.
- Organization logo/app icon: `/toda-app-icon.svg`, with an intrinsic 1024×1024 SVG size.
- First-party footer identity links: TODA Instagram, YouTube, and Facebook URLs in `components/footer.tsx`.
- Product: a web app for tattoo artists. Visible homepage content supports requests, booking/calendar, and booking-page capabilities.
- Visible offer: EUR 24.99 per month, cancellable monthly, in every locale’s `home.pricing` copy.
- The offer CTA points to `https://app.toda.ink/onboarding`.
- Supported site locales: de, es, en; locale prefixes are always present.
- Blog author records can contain a stable slug, avatar, localized slogan, and social/website links.

No external account ownership was independently researched during planning; the social URLs are eligible because TODA itself publishes them as its identity links. No ratings, aggregate score, app-store listing, download count, version, telephone, unsupported feature, or extra company/person fact is available.

### Baseline verification evidence

Commands run at the base commit:

- `pnpm exec tsc --noEmit` — passed.
- `pnpm lint` — passed with the existing `next lint` deprecation notice and one existing `@next/next/no-img-element` warning in `components/header.tsx`.
- `pnpm build` — passed; all 44 static pages generated, including the three homepages and six current article translations.
- Production server smoke check with `pnpm exec next start -p 3100` and local HTTP requests — homepage/article canonicals and alternates, current article JSON-LD, robots, and sitemap inspected successfully.
- `pnpm format:check` — failed on 31 pre-existing files. This is an existing repository-wide formatting debt, not caused by this milestone. `lib/site.ts` is among those files; any touched existing file and every new file must be formatted, and the final full check must introduce no additional failing path. An unrelated whole-repository formatting sweep is excluded.
- No repository test script or test runner configuration currently exists. `tsx` and Node types are already dev dependencies, so focused tests can use Node’s built-in test runner through `tsx` without adding a dependency.

## Scope rationale

This is one cohesive SEO data-boundary milestone: define canonical entities once, render them on the two public surfaces that currently own structured data, and prove the graph and serialization contracts. It introduces no database migration, external API, UI redesign, crawler rewrite, or new dependency, so implementation and end-to-end verification fit one run with margin for integration corrections.

## In scope

1. Centralize stable entity identifiers, verified organization facts, first-party social URLs, visible offer facts, and locale-aware URL helpers.
2. Centralize the existing per-locale site metadata so the homepage graph and Next metadata cannot drift.
3. Add a safe reusable JSON-LD serializer/render component.
4. Emit one connected homepage `@graph` for Organization, logo ImageObject, WebSite, locale WebPage, SoftwareApplication, and monthly Offer.
5. Replace article inline JSON-LD with one connected `@graph` using the same Organization/WebSite IDs plus locale WebPage, Article, optional Person author, and optional VideoObject.
6. Correct the current `toda-team` author from Person to the canonical Organization reference while supporting future genuine person authors from existing CMS data.
7. Add focused graph/serialization tests and package scripts needed to run them and type checking consistently.
8. Verify all locales and representative rendered homepage/article output without changing canonical/hreflang behavior.

## Out of scope

- No FAQPage markup. The FAQ content is visible and structurally suitable, but TODA is not in the government/health classes currently eligible for Google FAQ rich results; omitting it keeps this run focused on the durable entity graph rather than unsupported rich-result expectations.
- No Person entities for the five homepage team cards. They expose only first names, roles, and photos, with no public profile pages or first-party identity links sufficient for a robust person graph.
- No author profile routes, team detail routes, or CMS schema/admin changes.
- No Review, AggregateRating, LocalBusiness, Product, founder, employee/member, app-store, version, download, telephone, feature, or availability claims beyond facts explicitly listed in the verified baseline.
- No changes to robots, sitemap, middleware, canonical, hreflang, Open Graph, Twitter metadata, public page copy, visual UI, pricing, or onboarding behavior.
- No `llms.txt`, crawler-specific AI files, off-site profile work, backlink campaign, Google Business/Profile work, or claim that structured data guarantees a Knowledge Card.
- No external standards research unless implementation exposes a genuinely unresolved schema contract. If that occurs, follow the repository’s DeepAPI rules and prefer primary search-engine/schema documentation.
- No repository-wide Prettier sweep and no cleanup of the existing header lint warning or `next lint` deprecation.

## Implementation approach

### 1. Stable facts and metadata boundaries

Update `lib/site.ts` to:

- normalize a configured `NEXT_PUBLIC_SITE_URL` by removing trailing slashes before URL composition;
- retain `ONBOARDING_URL`;
- export the three existing TODA social URLs as one immutable, named source used by both footer links and Organization `sameAs`;
- export the canonical monthly numeric price (`"24.99"`) and EUR currency if the structured-data module would otherwise duplicate them.

Create `lib/seo/site-metadata.ts` and move the exact de/en/es title, description, Open Graph title, and Open Graph description objects from `app/[locale]/layout.tsx` into it. The layout must consume this source with no output change. Homepage structured data must use the same locale title/description rather than introducing alternate SEO copy.

### 2. Pure graph builder and stable IDs

Create `lib/seo/structured-data.ts` as a server-safe, side-effect-free module. It should own:

- canonical IDs:
  - `${SITE_URL}/#organization`
  - `${SITE_URL}/#logo`
  - `${SITE_URL}/#website`
  - `${SITE_URL}/#software-application`
  - `${SITE_URL}/#monthly-offer`
- helpers for locale homepage URLs and per-page IDs such as `<canonical>#webpage`, `<canonical>#article`, and `<canonical>#video`;
- a stable person ID derived from the validated CMS slug, rooted at the canonical site origin;
- a base Organization node, logo ImageObject node, and WebSite node reused unchanged by homepage and article graph builders;
- a homepage graph builder;
- an article graph builder;
- safe JSON-LD serialization.

The Organization node should use only baseline facts: brand and legal names, canonical URL, logo reference, legal postal address, NIF/tax ID, public email, and the three footer `sameAs` URLs. The WebSite must refer to Organization as publisher and declare de/es/en language support.

The serializer must use `JSON.stringify()` and neutralize `<`, U+2028, and U+2029 so content cannot terminate the script element. Its output must remain valid JSON that round-trips through `JSON.parse()`.

Use small explicit TypeScript input types rather than introducing a schema library or a broad speculative schema model.

### 3. Homepage graph

Create `components/json-ld.tsx`, a minimal server component that renders one `script[type="application/ld+json"]` using the safe serializer.

Update `app/[locale]/page.tsx` to receive `params`, validate/use the locale already accepted by the locale layout, call `setRequestLocale(locale)` before translations, build the graph, and render exactly one JSON-LD script without changing the ten visible sections.

The homepage graph must contain:

- `Organization` and its `ImageObject` logo;
- `WebSite`, published by the Organization;
- locale-specific `WebPage` with exact canonical URL, locale, `isPartOf` WebSite, `about` references to Organization and SoftwareApplication, and SoftwareApplication as `mainEntity`;
- global `SoftwareApplication` named `TODA Tattoo Solutions`, categorized conservatively as a business application, operating system `Web`, with the verified localized description, canonical Organization publisher, locale WebPage relationship, and Offer reference;
- monthly `Offer` with numeric `24.99`, `EUR`, visible locale `#pricing` URL, onboarding URL only where semantically valid, seller Organization, and `itemOffered` SoftwareApplication. Express the monthly billing period only through a schema-supported UnitPriceSpecification/billing duration if implementation-time type/schema verification confirms the property; otherwise retain the accurate price/currency and do not invent a period property.

All graph edges must use `{"@id": ...}` references rather than duplicate anonymous entities.

### 4. Article graph and author correctness

Update `app/[locale]/blog/[slug]/page.tsx` to delegate graph construction and script rendering while leaving metadata queries, ISR, markdown, video facade, published-alternate handling, and UI unchanged.

The article graph must include the same full Organization/logo/WebSite base nodes so each article is independently interpretable, then:

- locale `WebPage` at the exact article canonical with WebSite `isPartOf` and Article `mainEntity` references;
- `Article` with stable `@id`, canonical URL, current headline/description/dates/language/image, WebPage `mainEntityOfPage`, WebSite `isPartOf`, Organization publisher, and author reference;
- if `post.author.slug === "toda-team"`, use the canonical Organization as author and emit no false Person node;
- for any other author, emit one Person node with stable slug-based ID, name, optional public avatar, optional validated HTTP(S) website URL, and optional validated HTTP(S) identity/social URLs as `sameAs`. Do not emit email in `sameAs`, and do not assert employment, membership, founder status, or affiliation;
- optional VideoObject with stable ID, title/description/thumbnail/embed URL, Organization publisher, optional known upload date, and Article relationship. If a visible start offset exists, it may be reflected in the embed URL; do not put `startOffset` directly on VideoObject or synthesize an incomplete Clip.

The current live author record must therefore resolve to the Organization node without changing CMS data or the visible author signature.

### 5. Single sources in existing presentation

Update `components/footer.tsx` to consume the centralized social URL constants. Preserve labels, order, targets, and styling. Correct its stale “placeholder” comment because these are now verified first-party links.

Update `app/[locale]/layout.tsx` to consume centralized metadata with byte-equivalent output. Do not add entity JSON-LD in the layout: doing so would create duplicated generic entities on every child route and make page-specific graph composition harder to control.

### 6. Focused tests and scripts

Create `tests/structured-data.test.ts` using `node:test` and `node:assert/strict`, run through the already-installed `tsx` package. Add package scripts:

- `test`: run the focused TypeScript tests;
- `typecheck`: run `tsc --noEmit`.

Tests must serialize and parse the generated JSON-LD rather than only snapshot TypeScript objects. Cover at least:

1. all three homepage locales: exact canonical WebPage URL/language, stable global IDs, required entity types, and complete Organization → WebSite → WebPage → SoftwareApplication → Offer relationships;
2. Organization legal name/logo/address/NIF/contact and exact centralized `sameAs` list;
3. visible offer parity: emitted `24.99 EUR` agrees with each locale’s current `messages/{locale}.json` pricing display;
4. serializer round-trip and protection against a `</script>` payload plus U+2028/U+2029;
5. a person-authored article: stable Person ID, avatar and valid identity links retained, mailto/invalid URLs excluded, no invented Organization affiliation;
6. a `toda-team` article: Organization author reference and no Person node;
7. article WebPage/Article/Organization/WebSite relationships, locale canonical IDs, dates/image, and optional VideoObject stable ID/upload/embed behavior;
8. no direct `startOffset` on VideoObject.

Prefer relationship assertions over large brittle snapshots.

## Focus To-Do List

1. Recheck plan integrity, branch/HEAD drift, current visible pricing/social/legal facts, and the live `toda-team` author prerequisite.
2. Centralize URL/social/price facts and locale metadata without changing existing metadata or footer output.
3. Implement stable IDs, shared base nodes, homepage/article graph builders, and safe JSON-LD rendering.
4. Wire the localized homepage and article page to exactly one connected graph each, including Organization treatment for `toda-team` and conservative optional Person/Video enrichment.
5. Add deterministic parse-and-relationship tests plus `test`/`typecheck` scripts.
6. Format only touched files, run the complete verification matrix, inspect rendered de/en/es homepages and representative article HTML, then review the diff for unsupported claims or canonical/hreflang regressions.
7. Commit the coherent implementation, append the execution evidence, mark the plan Completed, and archive it according to the Focus workflow.

## Definition of Done

- `/de`, `/es`, and `/en` each render exactly one parseable JSON-LD script with one connected `@graph` containing Organization, logo ImageObject, WebSite, locale WebPage, SoftwareApplication, and Offer.
- The three home graphs reuse identical stable global IDs; locale WebPage IDs and URLs exactly match their canonical URLs.
- Organization facts and `sameAs` values come from first-party visible sources and contain no unverified additions.
- SoftwareApplication and Offer state only the verified web-app/product/price facts and point to the canonical Organization.
- Every rendered published article emits exactly one parseable graph with stable WebPage/Article/Organization/WebSite references and unchanged canonical/hreflang metadata.
- The current `Dein TODA Team` author is represented as Organization, not Person.
- The generic path for a genuine person author uses the CMS slug/avatar/public links without claiming an unsupported relationship.
- Optional video data has a stable ID and valid relationships, and VideoObject has no direct `startOffset` property.
- Structured-data script serialization safely neutralizes HTML script termination while preserving valid JSON.
- The visible homepage, footer, article, pricing, crawler behavior, and metadata output do not regress.
- Focused tests pass, TypeScript passes, lint/build pass at least at their verified baseline, touched files pass Prettier, and the full formatting check contains no new failing path beyond documented pre-existing debt.
- Final report clearly distinguishes implemented on-site semantics from remaining off-site authority work and does not imply Knowledge Card creation.

## Verification plan

Run from the repository root with the task environment available:

1. `pnpm test`
   - Expect all structured-data parse/relationship/locale/author/video/safety cases to pass.
2. `pnpm typecheck`
   - Expect zero TypeScript errors.
3. `pnpm lint`
   - Expect success; the existing header `<img>` warning and Next lint deprecation may remain, but no new warning is allowed.
4. Targeted Prettier check over every touched/new path, for example `pnpm exec prettier --check <paths...>`.
   - Expect success.
5. `pnpm format:check`
   - Run and record. It is expected to remain non-green because of the documented 31-file baseline, but no new path may appear and any touched path must disappear from the failure list.
6. `pnpm build`
   - Expect successful compilation, lint/type validation, page-data collection, and generation of all public locale/article routes.
7. Production HTML smoke check:
   - launch the built app with `pnpm exec next start -p 3100` and ensure it is terminated after inspection;
   - fetch `/de`, `/es`, `/en`, one author-assigned DE article, its EN sibling, `/robots.txt`, and `/sitemap.xml`;
   - parse every `script[type="application/ld+json"]` with a real JSON parser;
   - assert one script per tested homepage/article, unique node IDs inside each graph, expected entity types/relationships, locale-specific WebPage/article URLs, and Organization author for the current article;
   - inspect `<link rel="canonical">` and `<link rel="alternate" hreflang>` values and compare them with graph page URLs;
   - confirm robots/sitemap still use the canonical `www` origin.
8. `git diff --check`, task-focused `git diff`, and `git status --short`.
   - Expect no whitespace errors, no unrelated changes, no secrets, no raw DB payloads, and only planned files.

No isolated write data is required. Live database access is read-only through the existing public anon/RLS path for build and optional prerequisite recheck; tests must use local fixtures and never depend on network data.

## Risks and adaptation guidance

- **Schema property nuance for subscription periods:** The graph must never imply that EUR 24.99 is a one-time price. A verified schema-supported monthly UnitPriceSpecification may be used. If that property cannot be established from available types/primary documentation, omit only the machine period field while retaining visible page context, price, and currency; do not invent a custom property. This is a non-material implementation adaptation.
- **Same entity, localized descriptions:** Global Organization/WebSite/Software IDs must remain stable across locales. Localized description values and locale WebPage relationships may differ without minting duplicate global software entities.
- **Live author data can drift:** Recheck `toda-team` before execution. Additional authors do not expand scope; the generic Person path must remain correct. If the collective slug changes or the CMS gains an explicit entity-type field before implementation, adapt detection to the stronger source without changing the milestone.
- **JSON-LD parser compatibility:** Keep structures plain and explicit. Internal type organization or node order may change freely if IDs, semantics, serialization safety, and tests remain intact.
- **Next rendering placement:** The script may be rendered in the page fragment or another page-owned server component. It must remain exactly once per relevant route and must not be moved to a layout that duplicates/conflicts across pages.
- **Formatting baseline:** Do not hide the existing non-green repository check. Format touched files and prove the task adds no violation; a whole-repository sweep requires separate scope.
- **External rich-result validators are not a correctness dependency:** Local graph parsing, relationship tests, rendered HTML, and conservative Schema.org/Google-compatible properties are required. If an external validator is unavailable, do not weaken these checks.

Stop and request renewed approval if execution would require a DB migration, new dependency, public profile route, copy/price change, crawler strategy change, unsupported entity claim, material standards research, or expansion into FAQ/team/off-site authority work.

## Execution handoff

A fresh Auto-Mode agent must, before changing application code:

1. Read:
   - `/Users/harvestflow/Developer/toda/TODA-Website/CLAUDE.md`;
   - `/Users/harvestflow/.pi/agent/AGENTS.md` and `/Users/harvestflow/Developer/AGENTS.md` supplied by the harness;
   - `/Users/harvestflow/Developer/playground/mean-machine/focused-plans/README.md` (the Focus workflow requested for this plan);
   - this entire plan;
   - `lib/site.ts`, `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`, `app/[locale]/blog/[slug]/page.tsx`, `app/robots.ts`, `app/sitemap.ts`, `components/footer.tsx`, `components/team-section.tsx`, `components/pricing-section.tsx`, `components/faq-section.tsx`, `lib/blog/types.ts`, `lib/blog/queries.ts`, `components/blog/author-signature-footer.tsx`, all three message JSON files, and `app/[locale]/imprint/page.tsx`.
2. Locate the commit that introduced revision 1 of this plan and verify the plan is tracked, unchanged, `auto_mode: Awaiting-Approval`, and `execution: Not-Started`.
3. Compare current HEAD and working tree with base commit `effac142e4ff1a4efbee549371cf45b661457751`. Preserve unrelated newer work. If drift changes the structured-data surfaces, verified facts, or package/test setup materially, revise the plan and return to approval rather than forcing it.
4. Recheck the public anon author row and current visible de/en/es price, legal identity, social links, and canonical origin without exposing credentials.
5. After explicit approval, change only plan metadata to `auto_mode: Approved`, `execution: In-Progress`, and set `approved_at`; commit that approval state before implementation.
6. Execute adaptively inside the objective, exclusions, and Definition of Done. Record non-material deviations and evidence in the final archived Execution Record.

## Execution Record

Completed at `2026-08-29T00:09:44Z`.

### Delivered

- Added one pure structured-data boundary with canonical Organization, logo, WebSite, SoftwareApplication, Offer, locale WebPage, Article, Person, and VideoObject IDs plus safe script serialization.
- Added one connected six-node graph to each localized homepage. The visible EUR 24.99 monthly offer uses `UnitPriceSpecification.billingDuration: P1M`; its URL points to the locale-visible pricing section rather than adding a speculative purchase action.
- Replaced inline article JSON-LD with self-contained connected graphs. The live `toda-team` collective now resolves to the canonical Organization; generic genuine author records retain only validated public HTTP(S) identity URLs and make no affiliation claim.
- Connected optional article videos through stable IDs and removed direct VideoObject `startOffset`; a valid non-negative player offset is represented only in the embed URL.
- Centralized locale metadata, social URLs, canonical price facts, and a trailing-slash-safe site origin. Footer and Next metadata output continue to use those shared sources.
- Added the repository's first focused test/typecheck scripts and seven parse-and-relationship tests spanning all locales, legal/identity facts, price parity, serialization safety, Person/collective author behavior, and video behavior.

### Verification evidence

- `pnpm test` passed: 7 tests, 0 failures.
- `pnpm typecheck` passed with zero diagnostics.
- `pnpm lint` passed with only the pre-existing `next lint` deprecation and `components/header.tsx` `<img>` warning.
- Targeted Prettier check passed for every touched/new application and test file; `git diff --check` passed for task-owned changes.
- `pnpm build` passed, including compilation, lint/type validation, page-data collection, and generation of all 44 static pages.
- A production `next start` smoke check parsed exactly one JSON-LD graph from de/es/en homepages and all six published article translations. It verified unique IDs, locale canonicals/hreflang, graph references, EUR 24.99 Offer data, centralized footer identities, Organization authorship for every live article, and unchanged robots/sitemap `www` URLs.
- The full `pnpm format:check` still reports the pre-existing repository debt. Its failing set improved from 31 baseline paths to 30 because touched `lib/site.ts` is now formatted; no new path was added.
- A task-file secret marker scan found no credential material. The unrelated parallel `.env.example` change remained untouched and unstaged.

### Adaptations and residual limitations

- No material scope deviation occurred. The implementation omitted an onboarding `BuyAction`: the locale pricing section is the factual Offer URL, while inventing a purchase action was unnecessary for the smallest graph.
- No FAQPage, homepage team Person, Review/AggregateRating, LocalBusiness, Product, unsupported SoftwareApplication claim, profile route, DB change, or crawler rewrite was added.
- Current published posts contain no video, so the optional VideoObject branch is proven by deterministic tests rather than a live rendered article; all current article routes were still exercised end to end.
- No external rich-result validator or fresh web research was needed for correctness. Post-deployment recrawl/index inspection remains operational follow-up, not part of this implementation.
- Off-site authority remains separate: TODA should keep its official profiles legally/brand-consistent, earn relevant independent citations and links, and add third-party knowledge-source records only where eligibility and verifiable sourcing exist. This on-site graph improves entity consistency but cannot guarantee a Knowledge Panel or rich result.
