# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [Unreleased]
### Added
- **GitLab mirror workflow**: `.github/workflows/mirror-to-gitlab.yml` — push-triggered Action that mirrors all branches and tags to `gitlab.com/wayfinder-digital/$REPO` using `GITLAB_MIRROR_TOKEN`
- **`CHANGELOG-TEMPLATE.md`**: Starter changelog scaffold for new app repos created from this template

### Changed
- **README.md**: Setup steps updated to reference `CHANGELOG-TEMPLATE.md` so new repos start with a populated changelog

### Fixed
- **GitLab mirror scope**: Workflow now mirrors only local branches and tags, not remote refs, preventing duplicate-ref push failures

### Removed
- **`sync.sh`**: Manual cross-repo sync script retired — superseded by the GitHub Action sync workflow

## [1.3.0] - 2026-04-07
### Changed
- **TypeScript everywhere**: All source files converted from JavaScript/JSX to TypeScript/TSX (strict mode). Frontend (`src/`), server (`starter-server.ts`), and scripts (`scripts/smoke-test.ts`) are all TypeScript.
- **tsx runtime**: Server runs via `tsx` instead of `node` — executes `.ts` files directly with no compile step. Dev uses `tsx watch` for auto-reload.
- **tsconfig.json**: Added with strict mode, Preact JSX support, bundler module resolution
- **Typed components**: All Preact components have explicit prop interfaces
- **Typed API client**: `src/lib/api.ts` uses generics for type-safe API calls
- **Typed Supabase client**: `src/lib/supabase.ts` imports Supabase auth types
- **Dockerfile**: Updated to install `tsx` in production stage and run server via `npx tsx`
- **package.json**: Added `typescript`, `tsx` dev dependencies; new `typecheck` script; all scripts reference `.ts` files
- **All documentation**: Updated file references from `.js`/`.jsx` to `.ts`/`.tsx` across README, REPO-STRUCTURE-GUIDE, architecture-patterns, migration-checklist, spec-writing-guide, ai-collaboration, roadmap, versioning, and AI_HANDOFF

## [1.2.0] - 2026-04-01
### Added
- **AI collaboration framework**: Multi-model pipeline (Haiku → Sonnet → Opus) with git-based handoffs via `AI_HANDOFF.md`, so models pick up context cold without human-written notes
- **Spec writing guide**: `docs/spec-writing-guide.md` — how to write Haiku-ready feature specs that can be implemented in one session without questions
- **Lead assignment tags**: Every roadmap feature gets a `[Haiku]` / `[Sonnet]` / `[Opus]` / `[Me]` / `[Together]` ownership tag
- **Roadmap template**: Updated with Haiku Checklist, Sonnet Review Checklist, and Human Verify sections
- **Proper README**: Repo-level README explaining the template, how to use it, file inventory, and AI workflow overview
- **AI agent setup prompt**: Copyable first-session prompt in README for configuring the template for a new app

### Changed
- **Pipeline spec-writing step**: Generalized from "Cursor + Sonnet" to "Human + AI tool of choice" — Sonnet for standard features, Opus for architecture, human alone for simple work
- **Docs scrubbed for public release**: All personal usernames, org names, internal hostnames, and project-specific identifiers replaced with generic placeholders throughout docs and config
- **sync-config.json**: Real downstream repo inventory replaced with placeholder examples
- **`docs/migration-waves.md`**: Fully genericized — all internal app/server names replaced with `App-A` / `your-server-one` style placeholders

## [1.1.0] - 2026-03-26
### Fixed
- **Production deploy pattern**: Hono container now serves both the built SPA (`dist/`) and API routes directly. Removed separate Caddy static-file container. `VITE_*` env vars passed as Docker build args so they're baked into the SPA bundle at build time.

## [1.0.0] - 2026-03-25
### Added
- **Frontend stack**: Preact + JSX + Vite + Tailwind CSS with full component library (Badge, ConfirmDialog, EmptyState, InfoCard, LoadingSkeleton, Toast)
- **Backend stack**: Hono API starter with JWT + PIN auth middleware, CRUD examples, webhook/cron/email/transaction patterns, graceful shutdown
- **Infrastructure**: Dockerfile (multi-stage Vite build + Hono), docker-compose.yml (Caddy + API), Caddyfile (static dist + reverse proxy), .env.example
- **Vite config**: Preact preset, Tailwind plugin, dev proxy to Hono API
- **SPA lib**: Supabase client + auth helpers (`src/lib/supabase.js`), API fetch wrapper (`src/lib/api.js`)
- **Smoke test**: `scripts/smoke-test.js` — health check + API route validation
- **Migration docs**: `docs/migration-waves.md` (6 waves, dependency graph, n8n sunset timeline), `docs/migration-checklist.md` (per-app step-by-step)
- **Secret management**: `docs/secrets.md` — where secrets live, key types, rotation procedures
- **Migration session rules**: `PROJECT_PROTOCOL.md` updated with boot sequence for migration sessions, one-workflow-at-a-time constraint, 48-hour bake rule
- **CLAUDE.md migration fields**: Wave number, target state, workflow mapping table, blocker tracking
- Synced `docs/secrets.md` to all 10 downstream repos via GitHub Action

### Changed
- **Stack standardized**: Preact+JSX+Vite+Tailwind (built) + Hono API + Supabase/Postgres is now the single standard
- **REPO-STRUCTURE-GUIDE.md**: Rewritten for `src/` (Vite JSX) + `server/` (Hono) structure, Preact-to-React swap guide, API-only mode for mobile
- **architecture-patterns.md**: Rewritten — Hono as API backend (when to use, auth patterns, middleware, response format, Caddy config), PG functions, SPA architecture, separation of concerns
- **decisions.md**: New entry documenting stack standardization rationale
- **overview.md**: Core architecture updated to Hono + Vite + Docker
- **README.md**: Stack, quick start (dev + production), full doc table
- **package.json**: v1.0.0, `type: module`, scripts (dev, dev:client, build, preview, start, smoke), all dependencies

### Removed
- `starter-index.html` — replaced by proper Vite project files (`index.html`, `src/index.jsx`, `src/index.css`)
- All references to no-build pattern, CDN loading, htm tagged templates, n8n as primary backend

## [0.3.0] - 2026-03-16
### Added
- Initial release — PROJECT_PROTOCOL.md, CLAUDE.md template, REPO-STRUCTURE-GUIDE, docs suite
- Preact + htm + Tailwind CDN starter (starter-index.html)
- GitHub Action sync workflow + sync.sh for distributing shared files
- Architecture patterns, branching, versioning, roadmap docs
- Mandatory version release checklist in CLAUDE.md
