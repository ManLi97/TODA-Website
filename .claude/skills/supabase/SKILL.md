---
name: supabase
description: How to work with the SHARED, production Supabase DB (znocynswpsfckyfumema) from this repo — inspect/read, apply migrations, and DML writes. Use whenever a task touches Supabase here: adding or altering a table, RLS, a migration, a data write, or verifying DB state. The DB is co-owned by toda-company (schema authority), toda-website (this repo) and toda-productivity; getting the write path or the toda-company mirror wrong confuses the other repos' agents. NOT for the blog CMS content pipeline (that is /blog-article).
---

# /supabase — working with the shared toda-company database

Supabase project **`znocynswpsfckyfumema`** is **shared** by three codebases and is
**production — there is no dev project.** Every write is high-stakes. This skill is the
operational guide; the **authoritative governance** lives in the `toda-company` repo and MUST
be honoured (read when in doubt — do not duplicate it here):

- `~/Desktop/toda/toda-company/docs/db-ownership.md` — ownership matrix + the migration-mirror rule.
- `~/Desktop/toda/toda-company/docs/supabase-mcp-safety.md` — the write guardrail (repo-scoped).
- `~/.claude/docs/supabase-mcp-safety.md` — Tomek's global guardrail (pre-action report format).

## 1. Non-negotiables — worauf achten

- **Repo-owned tables only.** This repo (toda-website) owns: `blog_categories`, `blog_posts`,
  `blog_post_translations`, `blog_authors`, `analytics_events`, `gsc_performance_daily`,
  `mining_runs`, `topic_signals`, `topic_classifications` (+ view `topic_cluster_scores`) + storage
  buckets `blog-covers`, `blog-authors`. **Every other table is FOREIGN → tabu**: no DDL, no DML,
  no drop/truncate, ever. Full matrix: `db-ownership.md`.
- **toda-company is the schema authority.** Its `supabase/migrations/` is the **full, byte-exact
  mirror** of the live project. A migration you apply is not "done" until it is mirrored there (§4).
- **CLI write regime (global rule since 2026-08-29 — `skill:supabase-write-regime` is canonical):**
  MCP is the read/evidence channel only (`mcp__supabase__*`, enforced read-only). Migrations are
  applied via **`supabase db push`, executed by TOMEK** (agent authors + verifies, pre-action
  report first; the agent-side `db push` denies are the feature). The former plugin-MCP write path
  (`apply_migration`) is retired.
- **Stub discipline makes `db push` safe here:** every remote version owned by another repo exists
  locally as a comment-only stub (`-- Stub: … DO NOT EDIT …`) so the CLI matches the shared remote
  history and shows only real new migrations as pending. **Before any push:** compare
  `supabase_migrations.schema_migrations` (read-only MCP) against `supabase/migrations/` and add
  missing stubs — the dry-run must list exactly your new migration. **Never** `db pull` /
  `migration repair` on this DB. (Proven end-to-end 2026-08-29: 22 stubs 016–0037 +
  `community_pulse_v2` pushed cleanly.)
- **Verify target identity before any write:** `get_project_url` + one SELECT against a repo-own
  table. IDs from docs/env are claims, not proof (fork/rebrand rule).
- **Pre-action report before every write**, even with standing authority: target (project ref, prod),
  exact op, scope (which repo-owned object), rollback. Then proceed.

## 2. Reads — freely, no approval (prefer the read-only instance)

`mcp__supabase__execute_sql` (SELECT only), `list_tables`, `list_migrations`,
`get_advisors` (security | performance), `get_project_url`. Use them to inspect state, verify
identity, and check advisors after any change.

## 3. Applying a migration (DDL)

1. **Write the DDL** at `supabase/migrations/<UTC-timestamp>_<name>.sql` (timestamp via
   `date -u +%Y%m%d%H%M%S` — with `db push` the filename IS the version).
2. **Identity check** (§1): `get_project_url` + one SELECT on a repo-own table. Then verify the
   stub coverage (§1) so the dry-run will list only your migration.
3. **Pre-action report**, then **Tomek executes** in a separate terminal (interactive gates have
   no TTY in `!`-runs): `supabase db push --dry-run --linked` (must list exactly the new file) →
   `supabase db push --linked`.
4. **Advisors:** `get_advisors` security + performance. For a new website table, the ONLY expected new
   lints are the intentional `rls_enabled_no_policy` INFO (service-role-only: RLS on, zero policies)
   and brand-new `unused_index` INFO. Any other new WARN/ERROR on your object → fix before committing.
   Pre-existing lints on foreign tables are not yours.
5. **Read back** version + canonical body + checksum for the mirror:
   ```sql
   select version,
          md5(array_to_string(statements, E';\n\n') || ';')          as body_md5,
          array_to_string(statements, E';\n\n') || ';'               as body
   from supabase_migrations.schema_migrations where name = '<name>';
   ```
6. **Mirror + docs + commit** — §4.

## 4. Docking into toda-company — so the other agent stays in sync

The load-bearing part. Per `db-ownership.md`:

1. **Mirror file** at `~/Desktop/toda/toda-company/supabase/migrations/<version>_<name>.sql`:
   - **Line 1:** `-- OWNER: toda-website · mirrored <YYYY-MM-DD> from live project znocynswpsfckyfumema (supabase_migrations.schema_migrations) · applied <YYYY-MM-DD>`
   - **Line 2:** blank.
   - **Line 3+:** the `body` from step 5 — **byte-identical** to the live entry, ending exactly as
     stored (**no trailing newline**).
   - **Prove fidelity:** `tail -n +3 <mirror> | md5` MUST equal `body_md5` from step 5. (Byte count
     may exceed Postgres `length()` — that counts chars, md5 hashes UTF-8 bytes; the md5 is the proof.)
     If it mismatches, a trailing newline crept in → `perl -i -pe 'chomp if eof' <mirror>` and re-check.
2. **Ownership matrix:** in `toda-company/docs/db-ownership.md`, add the table + version to the owner's
   row and bump the "Voll-Spiegel (N Dateien)" count.
3. **Commit in toda-company** — mirror + doc in ONE commit (Doku-Kopplung). Conventional Commits, the
   repo's `NOTE:` block, and `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Stage only your
   two files (`git add <mirror> docs/db-ownership.md`), never `-A`. **Do NOT push** (Tomek pushes).
4. **Website side:** make `supabase/migrations/<version>_<name>.sql` match the applied version (git mv
   if named early), then `/commit`. This file is a source record only; the site never db-pushes.

## 5. DML (data writes, not schema)

Repo-owned tables only, via the plugin `execute_sql`. **Precise `where` is mandatory** — never a bare
`delete`/`update` on live data (safety doc). Pre-action report first. Gotcha: a data-modifying CTE and
its sibling subqueries read the same pre-statement MVCC snapshot, so confirm the result with a SEPARATE
follow-up SELECT, not counts computed inside the same statement.

## 6. Reference run — gsc_performance_daily (2026-07-12)

Website analytics table (parallel to `analytics_events`): plugin `apply_migration` → version
`20260712103950` → advisors clean → mirrored into toda-company (commit `b0e5896`, md5
`4466fa99f1095481940476e8a209f4a5` verified byte-identical) → ownership matrix updated → website
filename reconciled (`chore(db): align gsc migration filename …`). The full, copyable trail is in the
git log of both repos.
