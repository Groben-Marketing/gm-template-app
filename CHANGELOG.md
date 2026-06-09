# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [Unreleased]
### Added
### Changed
### Fixed
### Removed

## [1.4.0] - 2026-06-09
### Added
- **R7C Nav & Orientation Standard shell** — the template now embodies the full 9-point standard out of the box: sticky branded header, ≤5 top-level nav with dropdown grouping, color + underline active state, page headings + explanatory empty states, count badges, account control with version tag, Portal Home / Changelog / Reference cross-app links, mobile drawer, and breadcrumbs on nested views. Documented in `README.md` → *Nav & Orientation Standard*; enforced for agents via `CLAUDE.md` → *Nav & Orientation Standard (non-negotiable)*. Demo app (`src/index.tsx`) renders the shell with placeholder `NAV_ITEMS` + sample views using `PageHeading` / `EmptyState` / `Breadcrumb`.
- **`src/config/app.ts`** — single config module for per-app identity: `APP_NAME`, `HOME_HREF`, `PORTAL_HOME_URL` (GM apps → `https://grocrm.app`, R7C apps → `https://r7c.app`, `undefined` to hide), `CHANGELOG_HREF`, `REFERENCE_HREF`, and `BUILD_TAG` (CI `VITE_BUILD_TAG` → baked `package.json` version → `dev`). The shell reads identity ONLY from here.
- **Shell theme tokens** in `src/index.css` — `--shell-*` CSS variables (header bg/fg/muted/hover, accent family, badge, signal, danger) + `--app-font`. The shell components hardcode no brand colors; re-branding an app = editing these tokens only. Neutral slate/indigo defaults so a fresh clone claims no brand.
- **`src/components/CountBadge.tsx`** — `CountBadge` (numeric pending-work chip, hidden at 0) + `DoNowDot` (pulsing "action required" marker), both token-driven.
- **`src/components/Breadcrumb.tsx`** — back-affordance for nested views; last crumb is the current page with `aria-current="page"`.
- **`src/components/PageHeading.tsx`** — standard view opener: title + "what you do here" description, optional `crumbs` + `actions` slots.
- **Vite version injection** — `vite.config.ts` bakes `package.json` version into the bundle as `__APP_VERSION__` so the account dropdown shows a build tag with zero env-var setup.
- **`src/components/TopNav.tsx`** — canonical application-shell navigation (closes [`#16`](https://github.com/Groben-Marketing/gm-template-app/issues/16)). Extracted from `Wayfinder-Digital/r7c-app-atombomb` and generalized: `brand` (wordmark + homeHref + optional logo), `navItems` (with optional dropdown children), `portalHomeUrl`, `view` / `profile` / `version` / `onBugReport` / `onSignOut` props. Match-array active-state mechanism preserved verbatim from origin; `NavItem` + `NavLink` + `TopNavBrand` + `TopNavProps` exported for downstream type-safe consumption. Full API + `match[]` invariant documented in `README.md`.

- **GitLab mirror workflow**: `.github/workflows/mirror-to-gitlab.yml` — push-triggered Action that mirrors all branches and tags to `gitlab.com/wayfinder-digital/$REPO` using `GITLAB_MIRROR_TOKEN`
- **`CHANGELOG-TEMPLATE.md`**: Starter changelog scaffold for new app repos created from this template
- **`docs/project-brief.md`**: Phase Zero artifact template. Captures product, constraints, in/out-of-scope boundaries, architecture sketch, smallest useful version, boundary contracts, integration risks, and isolation test plan. Must be approved before any roadmap entries, issues, or code.
- **`docs/milestones.md`**: Bridge between brief and roadmap. Each milestone groups roadmap entries (`vX.Y.0`) into a shippable user-visible slice with done criteria that reference brief boundary contracts, isolation tests, and integration risks.
- **`docs/r7c-standards.md`**: Index of R7C ecosystem standards (`r7c-context/standards/`) that this template inherits, with a mapping table from each standard to where this template implements it, and an auditable list of current divergences. Synced to downstream repos via `.github/sync-config.json`.
- **`README.md` → Local Development section**: Operationalizes `local-first-development.md` — documents prereqs and every `npm run` command with what it does and when to use it.
- **`.github/PULL_REQUEST_TEMPLATE.md`**: Required-fields PR template — Summary, Milestone reference, Changelog entry confirmation, Test plan, Closes/refs. Operationalizes the milestone discipline from `docs/milestones.md` and the Changelog Release Gate from `PROJECT_PROTOCOL.md`.
- **`.github/workflows/changelog-check.yml`**: CI gate that fails any PR which doesn't update `CHANGELOG.md` or apply the `no-changelog-needed` label. Also verifies `[Unreleased]` section exists and that `package.json` version does not regress.

### Changed
- **`TopNav.tsx` is now brand-agnostic** — the originally-extracted purple-on-`#1a1625` palette was replaced by the `--shell-*` theme tokens before first release; re-skin via `src/index.css`, never by forking the component. New capabilities: active-section underline (color + underline "you are here"), per-item `badge` counts + `doNow` dot, `changelogHref` / `referenceHref` props, logo + wordmark as a single home link, flex-column mobile drawer (footer no longer overlaps the nav list).
- **`EmptyState.tsx`**: action button now uses the shell accent tokens instead of hardcoded blue.
- **`src/views/Home.tsx` + demo views**: open with `PageHeading` per the standard.
- **README.md**: Setup steps updated to reference `CHANGELOG-TEMPLATE.md` so new repos start with a populated changelog
- **`PROJECT_PROTOCOL.md`**: Phase Zero gate restored and strengthened. Added Phase 0 (Brief) with explicit prohibition on roadmap entries, GitHub issues, source code, and architecture decisions until `docs/project-brief.md` is approved. Added Phase 0.5 (Milestones) requiring approved milestone breakdown before any roadmap entry. Phase 2 (Issue) now requires brief revision when a feature introduces a new integration risk. Migration phase gates updated to require a branched brief (`docs/project-brief-v2.md`) for v2.0 work. Boot sequence updated to read brief and milestones. Brief gate applies to new repos and existing repos starting new major scope; not retroactive for established repos.
- **`PROJECT_PROTOCOL.md`**: Added *Standards Inheritance* section near the top defining the rule hierarchy (`r7c-context/standards/` > `repo-template/` > repo-local) and naming the standards this protocol operationalizes. Added *Changelog Release Gate* under Rules, sourced verbatim from `agent-operating-standard.md` — every merged/deployed change must include a matching changelog entry; work cannot be marked done without one unless explicitly classified non-user-facing.
- **`CLAUDE.md`**: Added standards-inheritance note at the top — repo-local app context never overrides ecosystem standards.
- **`.github/sync-config.json`**: Added `docs/r7c-standards.md` to the propagation list so downstream repos inherit the standards index automatically.
- **`docs/roadmap.md`**: Header note added clarifying the file contains only approved, implementation-ready features. Each `vX.Y.0` template entry now requires a `**Milestone**` reference linking back to `docs/milestones.md`.
- **`CHANGELOG-TEMPLATE.md`**: Header note added pointing at the Changelog Release Gate. Empty `[Unreleased]` now has Added / Changed / Fixed / Removed sub-section scaffolds so new repos start with the right shape.

### Fixed
- **GitLab mirror scope**: Workflow now mirrors only local branches and tags, not remote refs, preventing duplicate-ref push failures
- **README.md**: Local-dev note said Vite proxies to `:3001`; the actual default (`starter-server.ts`, `.env.example`, `vite.config.ts` proxy) is `:3000`. Demo Home view's example-detail link now uses `--shell-accent-strong` instead of hardcoded `text-blue-600`; token-contract wording in README/`index.css` clarified to "no brand colors" (dropdown panels keep fixed neutral white/gray surfaces).

### Removed
- **`sync.sh`**: Manual cross-repo sync script retired — superseded by the GitHub Action sync workflow
- **`AI_HANDOFF.md`**: Per-repo handoff file retired. Cross-session state now lives in `git log`, GitHub issues, and the roadmap entry's `**Status**` / `**Pass Count**` fields. Pattern was retired in agent-gracie-law after the file accumulated into a 350KB blob no agent read end-to-end. References removed from `CLAUDE.md`, `PROJECT_PROTOCOL.md`, `README.md`, and `docs/ai-collaboration.md`.

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
