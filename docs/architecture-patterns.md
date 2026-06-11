# Architecture Patterns

> Shared patterns across all R7/Wayfinder apps. Synced from repo-template.

---

## Hono API Backend

Hono is the API server for all apps. It handles CRUD, webhooks, scheduled jobs, and external API integrations.

### When to use Hono vs. direct SPA-to-Supabase

| Use Case | Approach |
|----------|----------|
| Read data with RLS (user's own rows) | SPA → Supabase direct (`sb.from().select()`) |
| Write data with RLS (user creates/edits own rows) | SPA → Supabase direct |
| Admin operations (bypass RLS, service role) | SPA → Hono API → Supabase (service role client) |
| External API calls (Resend, Frame.io, Anthropic) | SPA → Hono API → external service |
| Webhook receivers (bounces, callbacks) | External → Hono webhook route |
| Scheduled jobs (cron) | `node-cron` in Hono server |
| Multi-step transactions (query + update atomically) | SPA → Hono API → PG function or multiple queries |

**Rule**: If the SPA can do it safely with the anon key + RLS, skip Hono. If it needs a service role key, an external API key, or server-side logic, go through Hono.

### Project structure

```
server/
├── index.ts          — Hono app setup, middleware, server start
├── routes/
│   ├── items.ts      — /api/items CRUD routes
│   ├── webhooks.ts   — /webhook/* receivers
│   └── admin.ts      — /api/admin/* protected routes
├── middleware/
│   └── auth.ts       — Supabase JWT or PIN auth middleware
├── jobs/
│   └── cron.ts       — node-cron scheduled jobs
└── lib/
    └── supabase.ts   — Supabase client initialization (admin + user-scoped)
```

### Auth patterns

**Supabase JWT** (for apps with user login):
```
SPA gets JWT from Supabase Auth → sends as Bearer token → Hono validates with getUser() → creates user-scoped Supabase client → RLS applies
```

**PIN auth** (for internal tools):
```
SPA sends PIN as x-app-pin header → Hono checks against APP_PIN env var → sbAdmin (service role) used for all queries
```

### Middleware stack

Applied in order for all `/api/*` routes:

1. **CORS** — `cors()` from `hono/cors` (allow SPA origin)
2. **Logger** — `logger()` from `hono/logger` (request logging)
3. **Auth** — Custom middleware (JWT validation or PIN check)

### Error handling

- Route handlers catch Supabase errors and return `{ error: message }` with appropriate status code
- `app.onError()` catches uncaught exceptions, logs them, returns 500
- `app.notFound()` returns 404 for unknown routes
- Never expose stack traces or internal details in error responses

### Response format

All API responses are JSON. Arrays for list endpoints, objects for single-item endpoints.

```typescript
GET  /api/items       → [{ id, name, ... }, ...]    // Array (even if empty)
POST /api/items       → { id, name, ... }            // Created object
PUT  /api/items/:id   → { id, name, ... }            // Updated object
DELETE /api/items/:id → { deleted: true }
```

### Caddy configuration

Caddy serves the built SPA and reverse-proxies API requests to Hono:

```
your-app.example.com {
    handle /api/* {
        reverse_proxy api:3001
    }
    handle /webhook/* {
        reverse_proxy api:3001
    }
    handle /health {
        reverse_proxy api:3001
    }
    handle {
        root * /srv/dist
        file_server
        try_files {path} /index.html
    }
}
```

---

## PG Functions for Complex Logic

When business logic is too complex for a route handler but needs to run atomically, use a PostgreSQL function.

### When to use

- Multi-step calculations that depend on current DB state
- Operations that need to query + update in one transaction
- Logic that would require multiple sequential queries

### Example

```sql
CREATE FUNCTION calculate_send_after(p_customer_id UUID, p_requested_time TIMESTAMPTZ)
RETURNS TIMESTAMPTZ AS $$
    -- Weekend skip, per-customer stacking, rate limiting
    -- All in one atomic function call
$$ LANGUAGE plpgsql;
```

Called from Hono: `await sbAdmin.rpc('calculate_send_after', { p_customer_id: id, p_requested_time: now })`

---

## SPA Architecture

### Stack

TypeScript + Preact + TSX + Vite + Tailwind CSS. Built and served as static files by Caddy. Swap Preact for React when an app needs the broader React ecosystem.

### File structure

```
src/
├── index.tsx          — Entry point, mounts App to #app
├── index.css          — @import "tailwindcss"
├── components/
│   └── [Component].tsx — Reusable UI components (typed props interfaces)
├── views/
│   └── [View].tsx     — Page-level views (one per route)
└── lib/
    ├── supabase.ts    — Supabase client + auth helpers
    └── api.ts         — Typed fetch wrapper for /api/* calls
```

### State management

- Global state lives in the root App component (session, shared data)
- View state lives in each view component
- Persistence: `localStorage` for session, route, and view preferences
- No state library — `useState` and prop passing is sufficient for most apps

---

## Role Views & Cognitive Scoping

Multi-role apps scope each role's UI to what that role needs to act — distinct from RLS/security, which governs what a role *may* access. Security is enforced server-side per the auth patterns above; cognitive scoping is composed in the view layer and is never a substitute for RLS.

The full doctrine — scoping vs. security, how to scope a role, the required admin "view-as" toggle, acceptance checks — lives in `docs/cognitive-scoping-doctrine.md`. Discovery-stage guidance (role views, the focus queue, the objective/subjective split) lives in `docs/discovery-principles.md`.

---

## Separation of Concerns

Every component, module, or route must answer YES to:

1. **Can it function by itself?**
2. **Can it stand by itself?** (no hidden dependencies)
3. **Can it fail by itself?** (failure doesn't cascade)

### In practice

- **Views**: Each view loads its own data and manages its own state
- **Components**: Receive all data via props, never call APIs directly
- **Hono routes**: One route file per resource, self-contained
- **Shared logic**: Extracted to `lib/` (SPA) or `server/lib/` (API)
