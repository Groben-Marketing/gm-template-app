# n8n → Hono Migration Checklist

> Step-by-step guide for migrating an app from n8n webhooks to a Hono API server. Apply once per app during its migration wave.

---

## Before Starting

- [ ] Read current `CLAUDE.md` and `docs/overview.md`
- [ ] Audit git history for secrets: `git log --all -p -- '*.env' '*.json' '*.js' | grep -iE 'key|secret|token|password' | head -50`
- [ ] List all n8n workflows that serve this app (ID, trigger type, purpose)
- [ ] Create dev branch: `dev/v2.0`

---

## Frontend Migration

> Skip if the app already uses TypeScript + Preact + TSX + Vite.

- [ ] `npm init -y` and install: `vite @preact/preset-vite tailwindcss typescript tsx`
- [ ] Create `tsconfig.json` and `vite.config.ts` with Preact preset
- [ ] Create `src/` directory, move components/views from `public/` to `src/`
- [ ] Rename `.js` → `.ts` and `.jsx` → `.tsx` for all source files
- [ ] Convert htm tagged templates to TSX syntax, add prop interfaces
- [ ] Replace Tailwind CDN `<script>` with `@import "tailwindcss"` in `index.css`
- [ ] Replace ES5 patterns (`var`, `.then`) with modern TS (`const/let`, `async/await`)
- [ ] Update `index.html`: `<script type="module" src="/src/index.tsx">`
- [ ] Test: `npm run dev` — SPA loads, all views render, Supabase reads work
- [ ] Run `npm run typecheck` — no type errors

---

## Backend Migration

> For each n8n workflow, migrate one at a time. Keep n8n running in parallel until all routes are verified.

### Setup

- [ ] Create `server/` directory
- [ ] Customize `server/index.ts` (the Hono server ships in the template — no copy step), wire your routes
- [ ] Install: `npm install hono @hono/node-server @supabase/supabase-js`
- [ ] Install dev: `npm install -D typescript tsx`
- [ ] Install if needed: `npm install node-cron` (for cron workflows)
- [ ] Create `.env` from `.env.example`, fill in credentials
- [ ] Add auth middleware (Supabase JWT or PIN — pick one per app)
- [ ] Test: `tsx server/index.ts` — health check responds at `/health`

### Per-workflow migration

For each n8n workflow being replaced:

1. **Map the workflow**: Document what the n8n workflow does (trigger → nodes → response)
2. **Create Hono route**: Write the equivalent route handler in `server/index.ts` (or a route file)
3. **Test the route**: Call it with the same payload the SPA sends to n8n
4. **Switch the SPA**: Update the fetch URL from `/webhook/app/api` to `/api/...`
5. **Verify end-to-end**: Full user flow works through the new route
6. **Deactivate n8n workflow**: Don't delete — just deactivate. Keep for rollback.

### Webhook → Hono route mapping

| n8n Pattern | Hono Equivalent |
|---|---|
| Webhook node (`POST /webhook/app/api`) | `app.post('/api/items', handler)` |
| Code node (SQL builder) | Direct Supabase client call in handler |
| IF node (branching) | Standard `if/else` in handler |
| Respond to Webhook | `return c.json(data)` |
| Cron trigger | `cron.schedule('...', handler)` via `node-cron` |
| HTTP Request node (external API) | `fetch()` in handler |
| Error trigger | `app.onError()` global handler |
| Set node (reshape data) | JavaScript object spread/mapping |

### Cron workflow migration

For each n8n cron workflow:

- [ ] Note the cron schedule from n8n (translate to standard cron syntax)
- [ ] Add `cron.schedule()` call in server startup
- [ ] Test: Trigger manually, verify DB state changes
- [ ] Deactivate n8n cron workflow

---

## Docs & Security

- [ ] Rewrite `CLAUDE.md` (under 100 lines, code style rules, secrets policy)
- [ ] Rewrite `README.md` (run, deploy, structure)
- [ ] Create/update `docs/overview.md` — add Hono to core architecture
- [ ] Update `docs/decisions.md` — entry for migration
- [ ] Add `.gitignore` (node_modules, .env, dist/)
- [ ] Verify `.env.example` has all required vars (no real values)
- [ ] Move any secrets from code/docs to `.env`
- [ ] Rotate secrets found in git history (see `docs/secrets.md`)

---

## Ship

- [ ] Update `Dockerfile` for this app
- [ ] Update `docker-compose.yml` — add `api` service, update Caddy config
- [ ] Test on dev preview URL
- [ ] Merge to main, tag as `v2.0.0`
- [ ] Update `CHANGELOG.md`
- [ ] Deactivate all replaced n8n workflows
- [ ] Verify production (login, CRUD, scheduled jobs fire)
- [ ] Monitor 48 hours before starting next app

---

## Post-migration verification

1. `npm run smoke` — all API actions respond correctly
2. Dev preview URL — SPA loads, all views render
3. Production URL — end-to-end test (login, CRUD, scheduled jobs fire)
4. n8n execution log — deactivated workflows show no new executions
5. No errors in `docker compose logs api` for 24+ hours
