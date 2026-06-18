# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [Unreleased]
### Added
- **`scripts/compliance-scan.sh` + `docs/compliance-scorecard.md`** — the measurement layer behind the "process + audit" enforcement choice, so "are the apps getting better" is observable instead of asserted. A read-only bash scan emits a per-repo PASS/WARN/FAIL/REVIEW scorecard against the v1.7.0 standards (rules adoption, fault-isolation primitives present + wired, efficiency signals, brief core-loop filled). It is advisory — never blocks a build, edits code, or fails CI. Honesty rule: only high-confidence mechanical signals are auto-graded; judgment items (is the core loop honest? is that `select('*')` on a growing table?) are printed as `[REVIEW]` prompts rather than fake-graded. Feeds the Cheetah audit: baseline before Phase 2 adoption, confirm after, post the summary to the umbrella tracking issue. Both files synced downstream.
### Changed
### Fixed
### Removed

## [1.7.0] - 2026-06-18
### Added
- **`docs/self-evident-ui.md`** — the Self-Evident UI Standard. Bakes one principle into the template core: an app's screens must mirror its core loop, or the app stops being self-evident and starts requiring human training. Enforceable rules, not prose: §1 a mandatory one-sentence core-loop definition; §2 the UI-to-loop alignment rule (every screen advances exactly one loop step), anchored to Norman's gulfs of execution/evaluation + Nielsen heuristic #2; §3 the named UI principles (self-evidence/Krug, IA/Rosenfeld-Morville, progressive disclosure, empty-states-as-teaching, contextual help, FRE, coachmarks, "one app or two?") each with a one-line definition and build-order rank; §4 the "self-evident before explained" hard build order (structure → contextual help → tour → docs) with a fidelity caveat that later tiers are complements, not disposable. Sits one layer above the Nav & Orientation Standard (which it cross-references, not duplicates). Synced downstream.
- **Phase 0 hard gates** (`PROJECT_PROTOCOL.md` + `docs/project-brief.md`) — a brief now cannot be approved without (a) the core loop stated in exactly one sentence and (b) an owner-confirmed "one app or two?" test that flags multi-loop products for a possible split. New `Core loop` and `One app or two?` fields added to the project-brief template and to its approval gate.
- **Phase 1.5: Wireframe** (`PROJECT_PROTOCOL.md`) — a new stage between Map (1) and Issue (2): when work adds or reworks screens, every screen is mapped to its core-loop step in lo-fi before any production UI, so UI-to-loop alignment is verified cheaply. Sign-off phrase "Wireframes are aligned." Backend/refactor-only work skips it.
- **`docs/fault-isolation-standard.md` + shipped primitives** — the "fail by itself" clause of Separation of Concerns, elevated from a design principle into enforced runtime rules so a failure in one part can't chain-react into breaking the rest. Ships the primitives that satisfy it: `src/components/ErrorBoundary.tsx` (wraps the shell + each routed view so a view crash degrades to a recoverable fallback instead of blanking the SPA); a time-boxed, GET-retrying `src/lib/api.ts` (10s `AbortController`, backoff on idempotent reads, no auto-retry on writes, typed `ApiError`); a `callExternal()` guard in `starter-server.ts` for third-party calls (timeout + backoff); and bulkheading (try/catch cron pattern + `unhandledRejection` guard so a background task fails by itself, server stays up). Synced downstream.
- **`docs/efficiency-standard.md`** — efficiency made a rule instead of a byproduct: no N+1 queries, select only needed columns (no `select('*')` on growing tables), every list paginates (default page size 50), index hot/RLS/WHERE/JOIN/ORDER-BY columns, lean payloads, no refetch-on-every-render, debounce inputs, respect outbound provider rate limits, protect public inbound endpoints. The `CLAUDE.md` scale-expectation field is now the explicit efficiency budget. Synced downstream.
### Changed
- **`README.md`, `docs/overview.md`, `CLAUDE.md`, `docs/spec-writing-guide.md`** — wired the new standard into the doc indexes and cross-references: README Files table + overview Related Docs list it; the CLAUDE.md Nav & Orientation Standard now points to it as the layer above ("how screens are wired" vs. "what the screens are and how they map to the loop"); the spec pre-handoff checklist gains an item requiring any screen-adding spec to name the core-loop step it advances. `.github/sync-config.json` adds `docs/self-evident-ui.md` to the synced `files`.
- **Efficiency + fault-isolation wired into the gates** — `PROJECT_PROTOCOL.md` Phase 2 now requires naming each new piece's failure boundary and checking efficiency at scale (pagination/indexing/rate-limit), and the Separation of Concerns section spells out the runtime obligations of "fail by itself"; `CLAUDE.md` Defensive Defaults add Fault-isolation + Efficiency entries and point error-handling at the `ErrorBoundary` primitive; `docs/architecture-patterns.md` cross-references both standards from the SPA/route patterns; `docs/spec-writing-guide.md` adds fault-isolation + efficiency pre-handoff checklist items; the README canonical-components table lists `ErrorBoundary`. `.github/sync-config.json` adds both new standards to the synced `files`.

## [1.6.1] - 2026-06-12
### Fixed
- **`scripts/verify.sh` port discovery** — the health probe now reads `PORT` from the repo's `.env` when the environment doesn't set it (env → `.env` → 3000 default). Without this, an unrelated app on `:3000` makes the probe a false positive and smoke runs against the wrong server — observed in the wild adopting the hook in `r7c-app-sturges` (API on `:3001`, foreign app answering `:3000`).

## [1.6.0] - 2026-06-11
### Added
- **Sync `remove` list** (closes [`#22`](https://github.com/Groben-Marketing/gm-template-app/issues/22)) — `.github/sync-config.json` gains a `"remove"` array; `sync-to-repos.yml` deletes each listed path from downstream repos in the same sync PRs that update files. Deprecating a protocol file is now self-enforcing: retiring it from the template sweeps it out of every downstream repo on the next sync instead of leaving stale copies that agents keep using. First entry: `AI_HANDOFF.md` (retired 2026-04 per `docs/r7c-standards.md`, but a 2026-06-11 audit found 14 repos still carrying it — two with writes as recent as 2026-06-08).

## [1.5.0] - 2026-06-11
### Added
- **`docs/agent-verification.md`** — the agent self-verification standard (closes [`#20`](https://github.com/Groben-Marketing/gm-template-app/issues/20)). Core rule: an agent may not set Status to `[human-verify]` until it has verified its own work in a browser. Required checks for UI/route changes: walk every affected view happy + unhappy paths, zero console errors / failed network requests, render check at 375px and 1440px (no overflow, no orphan words, no wrapped button labels, no computed text contrast under 4.5:1), `typecheck` + `build` + `smoke` green, and fix-and-re-verify before presenting. Backend-only variant: server-log check, mechanical gates, and direct exercise of every changed route. Human Verify remains in the pipeline — judgment calls only (copy quality, design taste, business-logic correctness), never mechanical defects. Synced downstream.
- **`.claude/commands/qa.md`** — `/qa` executes the verification standard against the current app state: scopes the change from git, detects dev server commands/ports from `package.json` (template defaults: Hono `:3000`, Vite `:5173` — downstream apps adjust only if theirs differ), walks affected views with browser tooling, checks console/network, runs the 375px/1440px render + contrast pass, runs the mechanical gates, fixes findings, and reports. Synced downstream.
- **`.claude/commands/work-issue.md`** — `/work-issue <N>` runs the full issue-to-PR loop inside existing law: PROJECT_PROTOCOL pickup sequence (issue body is scope; no issue, no scope) → approved-milestone check (stop and flag if unmapped; `needs-spec` label if the brief is missing) → dev branch per `docs/branching.md` → implement per the Implementation Brief → `/qa`, fix, re-verify → `CHANGELOG.md` per the Changelog Release Gate → roadmap Status + Pass Count → commit per Wrapping Up rules → PR with the template fully filled → summary comment on the issue. Synced downstream.
- **`scripts/verify.sh`** — mechanical verification floor: `typecheck` + `build`, plus `smoke` only when `/health` responds (otherwise prints "smoke skipped: server not running"). Exits 2 with a clear message on failure. Includes a `stop_hook_active` guard so an unfixable failure can't block forever. Synced downstream.
- **`.claude/settings.json`** — registers `scripts/verify.sh` as a Claude Code Stop hook: a session cannot end while the mechanical checks fail. Ships with the template at clone time but is deliberately **not** synced — the sync action copies files wholesale and would clobber downstream repos' own settings (permission allowlists, app-specific hooks). Existing apps add the hook manually once.
- **`.github/ISSUE_TEMPLATE/feature.md`** — feature issues now embed the roadmap spec format: Goal, Milestone reference, Implementation Brief (Files / Pattern / Data / Behavior / Do NOT), Agent Verify, Human Verify. Header rule: an issue missing Implementation Brief details gets labeled `needs-spec`, not guessed at.

### Changed
- **`docs/ai-collaboration.md`** — pipeline now includes agent self-verification: Haiku implements → Haiku runs `/qa` per `docs/agent-verification.md` → Sonnet reviews (max 5 passes, unchanged) → Sonnet runs `/qa` → Human verifies judgment items only → Done. Pipeline diagram updated; Sonnet pass rules now require a clean `/qa` before Status moves to `[human-verify]`; embedded roadmap task format gained the Agent Verify / Human Verify split. **Now synced downstream** (was template-only — apps' copies would have kept describing the old pipeline).
- **`docs/spec-writing-guide.md`** — new *Writing the Verify Sections* section (the Agent-vs-Human litmus test: could `/qa` fail this item?) and a pre-handoff checklist item enforcing the split. **Now synced downstream.**
- **`docs/roadmap.md`** — template entries split `#### Human Verify` into `#### Agent Verify (binary, automated)` (populated from `docs/agent-verification.md` checks plus feature-specific assertions) and `#### Human Verify (judgment only)`.
- **`CLAUDE.md`** — Defensive Defaults gains one pointer line: agents self-verify per `docs/agent-verification.md` before presenting work.
- **`.github/sync-config.json`** — added `docs/agent-verification.md`, `docs/ai-collaboration.md`, `docs/spec-writing-guide.md`, `.claude/commands/qa.md`, `.claude/commands/work-issue.md`, `scripts/verify.sh` to the synced files list. Placeholder repos replaced with the real 16-repo downstream inventory (11 `r7c-app-*`/`yg-app-*`, 4 `nixie-app-*`, `limelight-app-newsreel`, `gm-app-prospect-factory`) — placeholders had been in place since the v1.2.0 public-release scrub, so syncs were no-ops.
- **`.github/workflows/sync-to-repos.yml`** — all newly synced files added to the push-path triggers, plus `docs/r7c-standards.md`, which was in `sync-config.json` but missing from the triggers (pre-existing drift — edits to it would not have fired the sync).
- **`README.md`** — Files table updated (new files + sync flags), AI workflow diagram shows the two `/qa` steps and judgment-only human verify, setup steps gain the `needs-spec` label creation.
- **`README-TEMPLATE.md`** — docs table gains `agent-verification.md`, `ai-collaboration.md`, and `spec-writing-guide.md` with sync flags.
- **`docs/decisions.md`** — new entry: agents verify their own work before humans see it; rule going forward recorded.

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
