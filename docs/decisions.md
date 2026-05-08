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
