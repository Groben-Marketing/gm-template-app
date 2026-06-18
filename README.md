# repo-template

Opinionated full-stack app template for building internal tools and web apps with a consistent stack and an AI-assisted development workflow.

## What's included

**Stack**

| Layer | Tool |
|-------|------|
| Language | TypeScript (strict mode, frontend + backend) |
| Frontend | Preact + TSX + Vite + Tailwind CSS |
| API | Hono (Node.js via tsx) |
| Database | Supabase (Postgres + Auth + RLS) |
| Deploy | Docker + Caddy |

**AI workflow** — a Haiku → Sonnet → Human review pipeline built around Claude Code, with structured handoff docs, roadmap templates, and spec-writing guidelines that let a smaller model implement entire features from a well-written spec.

**Template sync** — a GitHub Action that propagates shared protocol files (`PROJECT_PROTOCOL.md`, `docs/branching.md`, etc.) to downstream repos via automated PRs. The config's `remove` list propagates deprecations the same way: retired files (e.g. `AI_HANDOFF.md`) are deleted from downstream repos instead of lingering in old clones.

**Ecosystem standards** — this template implements the R7 Creative ecosystem development standards (`r7c-context/standards/`). See `docs/r7c-standards.md` for the standards index and rule hierarchy.

## Local Development

This template follows the `local-first-development` standard — all development happens locally; production is for running deployed applications only.

**Prerequisites**: Node 20+, a local `.env` (copy from `.env.example`).

| Command | What it does |
|---------|--------------|
| `npm install` | Install dependencies |
| `npm run dev` | Run the Hono API with `tsx watch` (auto-reload on save) |
| `npm run dev:client` | Run the Vite dev server (HMR for the SPA) |
| `npm run build` | Production build of the SPA into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run start` | Run the API in production mode (no watch) |
| `npm run smoke` | Health check + API route smoke tests |
| `npm run typecheck` | `tsc --noEmit` — strict-mode type check across frontend + backend |

For full-stack dev, run `npm run dev` and `npm run dev:client` in separate terminals. Vite proxies `/api/*` to the Hono server on `:3000`.

## Nav & Orientation Standard

Every app built from this template ships the **R7C Nav & Orientation Standard** out of the box. The shell in `src/components/` + `src/config/app.ts` + the theme tokens in `src/index.css` implement all nine points — your job as an app author is to fill in the config, not re-implement the shell.

The nine points:

1. **Persistent sticky branded header** on every authed view — logo + app name, logo links home.
2. **Top-level nav (≤5 items) always visible** — dropdowns group sub-pages; **every routable view maps to a nav item** via its `match[]` (no orphan routes).
3. **"You are here"** — the active section is highlighted with color + underline; nav reflects the current route on every surface (desktop, dropdown, mobile).
4. **"What can I do here"** — every view opens with `PageHeading` (title + one-line description); empty states explain what will appear and how (`EmptyState`).
5. **Actionable signal** — `CountBadge` surfaces pending-work counts on nav items; `DoNowDot` marks the one most-urgent section.
6. **Account control** — avatar dropdown with name + role (from the Supabase profile), Sign Out, and the version/build tag.
7. **Cross-app orientation** — Portal Home (URL from `src/config/app.ts`), Changelog, and Reference links in the account dropdown + mobile drawer.
8. **Responsive** — desktop nav + mobile hamburger drawer, driven by the same `NAV_ITEMS` so they can't drift.
9. **Back-affordance** — nested views (detail pages, drill-downs) render `Breadcrumb` at the top.

### How to make the shell *your* app

Three places — nothing else:

1. **`src/config/app.ts`** — set `APP_NAME`, `HOME_HREF`, `PORTAL_HOME_URL` (GM apps → `https://grocrm.app`, R7C apps → `https://r7c.app`, `undefined` to hide), `CHANGELOG_HREF` / `REFERENCE_HREF`. `BUILD_TAG` is automatic — Vite bakes in `package.json` version; CI can override via `VITE_BUILD_TAG`.
2. **`NAV_ITEMS` in `src/index.tsx`** — replace the placeholder items with your app's real sections (≤5 top-level). Use `children` for grouped sub-pages and give each child a `desc` (the dropdown's "what can I do here" line). Set `badge` counts where pending work should be visible.
3. **Shell theme tokens in `src/index.css`** — the `--shell-*` CSS variables under `:root`. The shell components hardcode **no brand colors** — only fixed neutral surfaces (white dropdown panels, gray text/borders); re-brand by editing only these tokens (header bg/fg, accent, badge, danger) and `--app-font`. Don't fork the components.

### The `match[]` invariant

Active-state across the desktop nav, dropdowns, and mobile menu is driven by per-link `match` string arrays compared against the current `view`. The mechanism's load-bearing invariant:

> **`parent.match` MUST equal the union of all `parent.children[*].match`.**

When you add or remove a route from a child link, update the parent's `match` array to match. The desktop dropdown trigger, the mobile group header, and the dropdown's child rows ALL read from this — keep them in sync and every surface lights up correctly with zero per-surface logic. Nested views that have no nav entry of their own (e.g. `#detail/123`) go in their parent's `match` so the parent tab stays lit.

Example:

```tsx
import { TopNav, type NavItem } from './components/TopNav';

const NAV_ITEMS: NavItem[] = [
    {
        label: 'Accounts',
        // Union of children's match arrays — keep in sync.
        match: ['users', 'user', 'new-user', 'clients', 'client'],
        badge: pendingUsers, // optional pending-work count
        children: [
            { href: '#users',   label: 'Users',   desc: 'Manage user accounts', match: ['users', 'user', 'new-user'], badge: pendingUsers },
            { href: '#clients', label: 'Clients', desc: 'Client organizations', match: ['clients', 'client'] },
        ],
    },
    // Items without children render as a single link in desktop + mobile:
    { href: '#dashboard', label: 'Dashboard', match: ['dashboard'] },
];

<TopNav
    brand={{ wordmark: APP_NAME, homeHref: HOME_HREF }}
    navItems={NAV_ITEMS}
    view={currentRoute}
    profile={profile}            // { name, role } from your Supabase profiles row
    version={BUILD_TAG}
    portalHomeUrl={PORTAL_HOME_URL}
    changelogHref={CHANGELOG_HREF}
    referenceHref={REFERENCE_HREF}
    onBugReport={openBugReport}
    onSignOut={signOut}
/>
```

### Canonical components

The shell + orientation primitives live in `src/components/`. Consume them directly; override data via props, never fork the styling — re-brand via the theme tokens instead.

| Component | Standard point | Use |
|-----------|----------------|-----|
| `TopNav.tsx` | 1, 2, 3, 5, 6, 7, 8 | The whole header: brand, nav, dropdowns, account control, mobile drawer. Origin: `Wayfinder-Digital/r7c-app-atombomb`, generalized per [`#16`](https://github.com/Groben-Marketing/gm-template-app/issues/16), tokenized for brand-agnosticism. |
| `PageHeading.tsx` | 4, 9 | Top of EVERY routed view — title, description, optional `crumbs` + `actions`. |
| `Breadcrumb.tsx` | 9 | Back-affordance on nested views; last item is the current page. |
| `EmptyState.tsx` | 4 | Explanatory empty states — say what will appear here and how. |
| `CountBadge.tsx` | 5 | `CountBadge` (numeric chip, hidden at 0) + `DoNowDot` (pulsing urgent marker). |
| `ErrorBoundary.tsx` | — | Fault-Isolation Standard: wrap the shell + each routed view so one view's crash degrades to a recoverable fallback instead of blanking the SPA. See `docs/fault-isolation-standard.md`. |

## How to use this

1. **Clone or fork** this repo to start a new app
2. **Fill in** `CLAUDE.md` — app name, DB schema, API routes, known gotchas
3. **Fill in** `docs/overview.md` — what the app does and why
4. **Rename** `README-TEMPLATE.md` → `README.md` (replace this file)
5. **Rename** `CHANGELOG-TEMPLATE.md` → `CHANGELOG.md` (replace this file)
6. **Update** `.github/sync-config.json` with your downstream repos
7. **Set** `REPO_SYNC_TOKEN` in GitHub Actions secrets (PAT with repo write access)
8. **Create the `no-changelog-needed` label** so the changelog-check workflow can be bypassed for non-user-facing PRs:
   ```
   gh label create no-changelog-needed \
     --description "Bypasses CHANGELOG.md update check; non-user-facing PR" \
     --color CCCCCC
   ```
9. **Create the `needs-spec` label** — issues missing Implementation Brief details get this label instead of agents guessing (see `.github/ISSUE_TEMPLATE/feature.md`):
   ```
   gh label create needs-spec \
     --description "Issue lacks Implementation Brief details; not ready for an agent" \
     --color D93F0B
   ```

## Start with an AI agent

### First pass — configure the template for your app

Paste this into your AI agent (Claude Code, Cursor, etc.) when starting a new project from this template:

```
I just cloned repo-template to build a new app. Before writing any code, help me
configure the template for this project.

Here is what I'm building:
[describe your app — what it does, who uses it, what problem it solves]

Please do the following:
1. Read CLAUDE.md, PROJECT_PROTOCOL.md, and docs/overview.md so you understand
   the template structure.
2. Fill in CLAUDE.md completely — app name, one-liner, database schema (ask me
   for table names and columns), API routes, auth flow, environment URLs, and
   any known gotchas I mention.
3. Fill in docs/overview.md — what the app does, why it exists, and the core
   architecture decisions.
4. Fill in docs/roadmap.md — add the first 3–5 features to "Up Next" using the
   roadmap template format, based on what I describe.
5. Rename README-TEMPLATE.md to README.md (replacing the repo-template README).
6. Commit everything as "Initial app configuration".

Ask me for any information you need to fill in these files accurately. Do not
invent schema, routes, or features — ask first.
```

### Every time you pick up work after that

Your agent reads `PROJECT_PROTOCOL.md` automatically (it's in `CLAUDE.md` at the top). The pickup sequence tells it to read the active issue → recent git log → open GitHub issues → `CLAUDE.md` → `docs/overview.md` → roadmap entry before touching anything. No prompt needed — the protocol handles it.

If you're using Cursor, add `PROJECT_PROTOCOL.md` as a [Cursor Rule](https://docs.cursor.com/context/rules-for-ai) so it's always in context.

## Files

| File | Purpose | Syncs to apps? |
|------|---------|----------------|
| `PROJECT_PROTOCOL.md` | Operating rules for Claude Code (pickup, phase gates, scope discipline) | Yes |
| `docs/r7c-standards.md` | Index of R7C ecosystem standards inherited by this template + current divergences | Yes |
| `CLAUDE.md` | App-specific context — fill in per project | No |
| `README-TEMPLATE.md` | README starter for app repos | No |
| `CHANGELOG-TEMPLATE.md` | Changelog starter for app repos | No |
| `docs/overview.md` | App architecture and stack decisions | No |
| `docs/ai-collaboration.md` | Multi-model AI pipeline (Haiku → Sonnet → Opus) | Yes |
| `docs/agent-verification.md` | Agent self-verification standard — browser-verify before `[human-verify]` | Yes |
| `docs/architecture-patterns.md` | Hono + SPA coding patterns | Yes |
| `docs/branching.md` | Git workflow | Yes |
| `docs/versioning.md` | Semantic versioning rules + changelog format | Yes |
| `docs/roadmap.md` | Feature tracking template | No |
| `docs/spec-writing-guide.md` | How to write Haiku-ready feature specs | Yes |
| `docs/self-evident-ui.md` | UI-to-core-loop alignment standard — core-loop definition gate, screen-to-loop rule, named UI principles + build order | Yes |
| `docs/efficiency-standard.md` | Efficiency doctrine — query/index/pagination/caching/rate-limit rules + the scale-expectation gate | Yes |
| `docs/fault-isolation-standard.md` | Fault-isolation doctrine — "fail by itself" as runtime rules; error boundary, outbound timeouts/retry, bulkheaded jobs | Yes |
| `docs/compliance-scorecard.md` | The rubric behind `scripts/compliance-scan.sh` — per-repo PASS/WARN/FAIL/REVIEW against the standards; makes "better apps" measurable | Yes |
| `scripts/compliance-scan.sh` | Read-only scan emitting a repo's compliance scorecard (advisory, never blocks) | Yes |
| `docs/secrets.md` | Secret management and rotation procedures | Yes |
| `docs/migration-waves.md` | n8n → Hono migration planning template | No |
| `.claude/commands/qa.md` | `/qa` — runs the agent-verification standard against the app | Yes |
| `.claude/commands/work-issue.md` | `/work-issue <N>` — full issue-to-PR loop inside repo law | Yes |
| `.claude/settings.json` | Registers `scripts/verify.sh` as a Stop hook | No — ships at clone, never synced (would clobber downstream settings) |
| `scripts/verify.sh` | Mechanical gate: typecheck + build (+ smoke if server up) | Yes |
| `.github/ISSUE_TEMPLATE/feature.md` | Feature issue template — roadmap spec format | No |
| `.env.example` | Environment variable template | No |
| `.github/sync-config.json` | Sync targets — update with your repos | No |

## AI workflow overview

```
Human + AI (any)  →  write feature spec (roadmap entry)
        ↓
  Claude Haiku    →  implement entire feature in one pass
        ↓
  Claude Haiku    →  /qa — self-verify in browser per docs/agent-verification.md
        ↓
 Claude Sonnet    →  review, patch, iterate with human (max 5 passes)
        ↓
 Claude Sonnet    →  /qa — clean run required before human handoff
        ↓
      Human       →  verify judgment items only (copy, taste, business logic)
        ↓
      Done        →  Haiku picks up next feature
```

The spec-writing step is flexible — use Cursor + Sonnet for standard features, Opus for complex architecture, or write it yourself for simple work. The output is what matters: a complete, unambiguous spec in `docs/roadmap.md` that Haiku can execute without asking questions.

See `docs/ai-collaboration.md` for the full pipeline, escalation rules, and a guide on choosing the right tool for each situation.

## Stack decisions

| Decision | Rationale |
|----------|-----------|
| TypeScript everywhere | Strict mode. Catches bugs at build time. Hono, Preact, and Supabase all ship excellent types. |
| tsx for server runtime | Runs `.ts` files directly — no compile step needed. Fast startup, `--watch` for dev. |
| Preact over React | 3KB vs 40KB+. Same TSX API. Swap to React if the app needs the broader ecosystem. |
| Hono over Express | Lightweight, Web Standards API, built-in middleware, first-class TypeScript. |
| Vite | Fast dev server, instant HMR, native TypeScript support, optimized production builds. |
| Hash routing | No server config needed for SPAs. |
| Supabase direct reads | RLS enforces access. Anon key + JWT is sufficient for user-scoped reads. |
| Hono for writes/admin | Service-role key stays server-side. External API calls go through Hono, never SPA. |
