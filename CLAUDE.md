# CLAUDE.md — App Context for Claude Code

> This file gives Claude Code the app-specific context it needs to work effectively. Updated per-project. Read when picking up work, alongside PROJECT_PROTOCOL.md and docs/overview.md.
>
> **Standards inheritance**: This repo inherits ecosystem rules from `r7c-context/standards/`. This file holds *app-specific* context only — never override ecosystem standards here. See `docs/r7c-standards.md` for the standards index and rule hierarchy.
>
> **Multi-model work**: See `docs/ai-collaboration.md` for the Haiku → Sonnet → Opus pipeline. State that lets a fresh agent pick up cold comes from `git log`, this file, and the open issues — there is no per-repo handoff file.

---

## App Name

[Your app name here]

## One-Liner

[What this app does in one sentence]

---

## Migration Status

> Fill this section when migrating this app to the new stack. Remove after v2.0.0 ships.

| Field | Value |
|-------|-------|
| **Migration wave** | [e.g., Wave 1 / Wave 2 / Wave 3 / Wave 4 / Wave 5 / Wave 6] |
| **Server** | [e.g., your-server-one / your-server-two] |
| **Target state** | TypeScript + Preact+TSX+Vite + Hono API (tsx) + Supabase/Postgres |
| **Frontend work** | [e.g., "Vanilla JS → Preact+TSX+Vite" / "Already React+Vite, no change"] |
| **Backend work** | [e.g., "Express → Hono (TS)" / "Add Hono (no backend yet)" / "4 n8n workflows → Hono routes"] |
| **Risk level** | [Low / Medium / High — and why] |
| **Blocked by** | [e.g., "Atom Bomb must migrate first (owns profiles table)" / "Nothing"] |

### Workflows to replace (if applicable)

| Workflow ID | Name | Trigger | Hono Route | Status |
|-------------|------|---------|------------|--------|
| [ID] | [Name] | [Cron / Webhook] | [POST /api/...] | [Pending / Done] |

### Key migration decisions for this app

- [e.g., "PIN auth — this is an internal tool"]
- [e.g., "Portal at your-domain.com root served from this repo — must keep working during migration"]

Follow `docs/migration-checklist.md` for step-by-step process. Dev branch: `dev/v2.0`.

---

## Database Schema

**Supabase project**: [project name or URL]
**Schema**: `[schema_name]`

### Key Tables

| Table | Purpose | Key columns |
|-------|---------|-------------|
| [table_name] | [What it stores] | [Important columns] |

### RLS Notes

- [e.g., "Users can only read their own org's data"]
- [e.g., "Service role key used only in Hono server (.env), never in the SPA"]

---

## Hono API Routes

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| [e.g., /api/items] | GET | [List items] | [JWT / PIN / none] |
| [e.g., /api/items] | POST | [Create item] | [JWT / PIN] |

---

## Auth Flow

[How does auth work in this specific app? Supabase JWT? PIN? Authelia forward auth?]

---

## Environment & URLs

| Environment | URL | Notes |
|-------------|-----|-------|
| Production | [e.g., app.your-domain.com] | Caddy reverse proxy |
| Dev | [e.g., localhost:5173] | Vite dev server (proxies /api/* to :3001) |

---

## App-Specific Conventions

[Anything unique to this app that differs from the standard stack.]

---

## Known Gotchas

- [e.g., "The status field uses 'Active'/'Inactive' strings, not booleans"]
- [e.g., "Don't touch the legacy_users table — it's synced from an external system"]

---

## Defensive Defaults

These apply to every feature unless explicitly overridden:

- **Error handling**: Never show a blank screen or raw error. Every failed fetch, timeout, and edge case gets a user-facing message. Use Toast for transient errors, EmptyState for "no data" states, and a fallback UI for unexpected crashes.
- **Data protection**: Row-level security on every table. Service-role credentials stay in the Hono server (`.env`) — never in the SPA. Never log emails, tokens, or payment info. See `docs/secrets.md` for rotation procedures.
- **Scale expectation**: [State it — e.g., "10-50 internal users" or "500+ public signups".]
- **Separation of concerns**: Every component, route, and integration must function by itself, stand by itself, and fail by itself.

---

## Related Apps

| App | Relationship |
|-----|-------------|
| [e.g., The Switchboard] | [e.g., "Shares auth system, nav shell"] |

---

## Roadmap

The project roadmap lives at `docs/roadmap.md`. Keep it organized in this order:

1. **Up Next** — Versioned features queued for development, in priority order
2. **Bug Fixes** — Known bugs to investigate/fix
3. **Unsolved** — Problems without a solution yet
4. **Backlog** — Lower-priority items with ownership tags (`[ME]`, `[CLAUDE]`, `[TOGETHER]`)
5. **Completed** — Shipped versions, newest first

Rules:
- When a version ships, move it from "Up Next" to the top of "Completed" and check off all items.
- New features go in "Up Next" with the next available version number.
- Bug reports go in "Bug Fixes" unless they're tied to a specific version.
- If the user describes a problem they don't know how to solve, put it in "Unsolved" — not "Up Next".
- Keep "Up Next" in priority order. Don't renumber versions unless the user asks.

---

## Version Release Checklist

**MANDATORY: When the user approves/signs off on a version, perform ALL of these steps before moving on to the next feature:**

1. Update the version constant in `package.json` and any in-app version display
2. Update `CHANGELOG.md` with the new version entry (date, what was added/changed/fixed)
3. Update `docs/roadmap.md` — move the version from "Up Next" to "Completed" with `[x]` checkboxes
4. `npm run build` — verify build succeeds
5. Commit all changes together in one commit
6. Push to GitHub
7. Deploy to production if applicable

**Do NOT move on to the next feature until all steps are done. This is non-negotiable.**
