# Decisions & Lessons Learned

> This is the institutional memory of this project. Every time we burn hours on something and finally crack it, it goes here. Claude Code reads this when picking up work so we never repeat the same mistakes.

---

## How to Write an Entry

```
### [Short title of what happened]
**Date**: YYYY-MM-DD
**Problem**: What went wrong or what we were trying to solve.
**What didn't work**: Approaches that failed and why.
**What fixed it**: The actual solution.
**Why**: The underlying reason — not just the fix, but the lesson.
**Rule going forward**: One sentence. What we always do (or never do) from now on.
```

---

## Log

### Agents verify their own work before humans see it
**Date**: 2026-06-11
**Problem**: The pipeline ended with "Human → verify in browser," which made the human the first person to ever load the app after a change. Humans were burning verification time on mechanical defects — console errors, broken layouts at mobile widths, failed requests, unreadable contrast — that an agent could have caught and fixed before handoff.
**What didn't work**: Treating typecheck/build as "verified." Code that compiles is not code that works — the gap between green builds and a working browser session was exactly where the human-found defects lived.
**What fixed it**: `docs/agent-verification.md` (the standard: no `[human-verify]` status until the agent has browser-verified its own work — views walked happy + unhappy, zero console errors/failed requests, 375px/1440px render + 4.5:1 contrast, typecheck/build/smoke green, findings fixed and re-verified), `/qa` (`.claude/commands/qa.md`) to execute it, `scripts/verify.sh` as a Stop hook so a session can't end with failing mechanical checks, and the roadmap's verify section split into *Agent Verify (binary, automated)* vs *Human Verify (judgment only)*.
**Why**: Human attention is the scarcest resource in the pipeline. Spending it on defects a machine can detect is waste; reserving it for judgment (copy quality, design taste, business-logic correctness) is the point of having the pipeline at all.
**Rule going forward**: An agent never presents work it hasn't watched working in a browser — mechanical defects are the agent's to find and fix; humans verify judgment only.

---

### Standardized on Preact+JSX+Vite+Tailwind + Hono API + Supabase/Postgres
**Date**: 2026-03-25
**Problem**: Needed a consistent, modern stack across all 12 apps on two servers. Apps had diverged — different frontend patterns, backend approaches, deployment methods.
**What we chose**:
- **Frontend**: Preact + JSX + Vite + Tailwind CSS. Preact is the default (3KB, React-compatible). Swap to React when an app needs the broader ecosystem. Vite for builds — fast dev server, HMR, optimized production bundles.
- **Backend**: Hono API server. Lightweight (~14KB), Web Standards API, built-in CORS/logger middleware. Handles CRUD, webhooks, cron jobs, external API integrations.
- **Database**: Supabase (managed Postgres). RLS enforced. Anon key in SPA for direct reads, service role key in Hono only.
- **Deploy**: Docker Compose — Caddy serves built SPA + reverse proxies to Hono container.
**Why**: One stack means one set of patterns to learn, one template to maintain, one migration checklist to follow. Each app becomes a v2.0 on the new template.
**Rule going forward**: All new apps and all migrations use this stack. See `docs/migration-waves.md` for the rollout order.

---

<!-- Add new entries above this line, newest first -->
