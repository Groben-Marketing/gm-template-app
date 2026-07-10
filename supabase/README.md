# supabase/ — database schema (migrations)

This directory **is the app's database**. Its presence is part of the answer to "is this app built?" — a gm-template app is `src/` (SPA) + `server/` (Hono API) + `supabase/` (schema). If a repo has only `docs/` and design exports, the app is **not** built yet.

## Migrations

- One file per change: `NNNN_name.sql`, zero-padded 4-digit, **append-only**.
- Take the next free number **after the highest on `origin/main`** — duplicate numbers are silent collisions (repos get edited from multiple machines/agents).
- **Every table gets RLS.** The service-role key (server only) bypasses RLS; the SPA's anon key is always RLS-scoped.
- Complex atomic logic goes in a Postgres function called via `sbAdmin.rpc(...)`, not multi-statement client code.

`0001_init.sql` ships the baseline: `profiles` (the identity table the Hono auth middleware reads) + an example `items` table showing the per-table RLS shape. Replace `items` with your domain; keep `profiles`.

## Applying migrations

Pick one per app and write it down in this repo's `CLAUDE.md` → *Database Schema*:

- **Supabase CLI**: `supabase db push` (needs `supabase link` + `supabase/config.toml`).
- **Management API / MCP** (project-owned DB, no CLI): POST each file to
  `https://api.supabase.com/v1/projects/<ref>/database/query` with `{ "query": "<file contents>" }`, or apply via the Supabase MCP `apply_migration` tool. Annotate applied migrations (e.g. `-- applied via MCP <date>`).

Whichever you choose, migrations are applied **in order** and never edited after they've run in an environment — fix-forward with a new file.
