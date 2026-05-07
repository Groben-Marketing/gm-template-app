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

**Template sync** — a GitHub Action that propagates shared protocol files (`PROJECT_PROTOCOL.md`, `docs/branching.md`, etc.) to downstream repos via automated PRs.

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

For full-stack dev, run `npm run dev` and `npm run dev:client` in separate terminals. Vite proxies `/api/*` to the Hono server on `:3001`.

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

## Start with an AI agent

### First session — configure the template for your app

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

### Every session after that

Your agent reads `PROJECT_PROTOCOL.md` automatically (it's in `CLAUDE.md` at the top). The boot sequence tells it to read recent git log → open GitHub issues → `CLAUDE.md` → `docs/overview.md` → roadmap entry before touching anything. No prompt needed — the protocol handles it.

If you're using Cursor, add `PROJECT_PROTOCOL.md` as a [Cursor Rule](https://docs.cursor.com/context/rules-for-ai) so it's always in context.

## Files

| File | Purpose | Syncs to apps? |
|------|---------|----------------|
| `PROJECT_PROTOCOL.md` | Claude Code session rules and phase gates | Yes |
| `docs/r7c-standards.md` | Index of R7C ecosystem standards inherited by this template + current divergences | Yes |
| `CLAUDE.md` | App-specific context — fill in per project | No |
| `README-TEMPLATE.md` | README starter for app repos | No |
| `CHANGELOG-TEMPLATE.md` | Changelog starter for app repos | No |
| `docs/overview.md` | App architecture and stack decisions | No |
| `docs/ai-collaboration.md` | Multi-model AI pipeline (Haiku → Sonnet → Opus) | No |
| `docs/architecture-patterns.md` | Hono + SPA coding patterns | Yes |
| `docs/branching.md` | Git workflow | Yes |
| `docs/versioning.md` | Semantic versioning rules + changelog format | Yes |
| `docs/roadmap.md` | Feature tracking template | No |
| `docs/spec-writing-guide.md` | How to write Haiku-ready feature specs | No |
| `docs/secrets.md` | Secret management and rotation procedures | Yes |
| `docs/migration-waves.md` | n8n → Hono migration planning template | No |
| `.env.example` | Environment variable template | No |
| `.github/sync-config.json` | Sync targets — update with your repos | No |

## AI workflow overview

```
Human + AI (any)  →  write feature spec (roadmap entry)
        ↓
  Claude Haiku    →  implement entire feature in one session
        ↓
 Claude Sonnet    →  review, patch, iterate with human (max 5 passes)
        ↓
      Human       →  verify in browser
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
