# Migration Waves — n8n → Hono

> Master reference for migration order, dependencies, and timeline. Each wave spans one or more focused work blocks.
> Replace all placeholder names (App-A, your-server-one, etc.) with your actual apps and server names.

---

## Wave Order & Dependencies

```
Wave 1 ─── App-A (1a) + App-B (1b)
  │         ↳ Validates the migration pattern
  │
Wave 2 ─── App-C (2a) + App-D (2b)
  │         ↳ Migrates identity/portal layer (profiles, clients)
  │         ↳ Blocked by: Wave 1 verified
  │
Wave 3 ─── App-E
  │         ↳ Biggest single effort (most n8n workflows)
  │         ↳ Blocked by: Wave 2 verified
  │         ↳ After this: n8n can stop on your-server-one
  │
Wave 4 ─── App-F (4a) + App-G (4b)
  │         ↳ Content pipeline apps
  │         ↳ Blocked by: Wave 3 verified
  │         ↳ App-G runs on your-server-two — coordinate with Wave 5
  │
Wave 5 ─── App-H (5a) → App-I (5b) → App-J (5c)
  │         ↳ your-server-two ecosystem
  │         ↳ 5a must complete before 5b/5c (engine becomes shared modules)
  │         ↳ After this: n8n can stop on your-server-two
  │
Wave 6 ─── App-K (6a) + App-L (6b) + App-M (6c)
            ↳ Low priority — migrate when touched for feature work
```

---

## Per-Wave Detail

### Wave 1: Validate the Pattern

| App | Repo | Server | Risk | Key Change |
|-----|------|--------|------|------------|
| **1a. App-A** | `your-org/app-a` | your-server-two | Low | Express → Hono, htm → JSX+Vite |
| **1b. App-B** | `your-org/app-b` | your-server-one | Low | ES5 → Preact+JSX+Vite, add Hono backend |

**Why first**: App-A is closest to the target (already has Express + Preact). App-B is simple and isolated. Both are low blast radius.

**Validates**: The full migration pattern — frontend conversion, Hono setup, Docker deployment, Caddy config. Every subsequent wave follows what's proven here.

### Wave 2: Identity + Portal Layer

| App | Repo | Server | Risk | Key Change |
|-----|------|--------|------|------------|
| **2a. App-C** | `your-org/app-c` | your-server-one | Medium | htm → JSX+Vite, n8n user CRUD → Hono routes |
| **2b. App-D** | `your-org/app-d` | your-server-one | Medium | Vanilla JS → Preact+JSX+Vite, Express → Hono |

**Why now**: App-C owns shared tables (e.g. `profiles`, `clients`) — every other app reads from these. Getting this right sets the pattern for all portal-connected apps.

**Critical**: App-C may serve the portal at the root domain. Must keep working during migration.

### Wave 3: Core Production App

| App | Repo | Server | Risk | Key Change |
|-----|------|--------|------|------------|
| **3. App-E** | `your-org/app-e` | your-server-one | **High** | ES5 → Preact+JSX+Vite (view-by-view), n8n workflows → Hono routes + node-cron |

**Why last on this server**: Most complex app (highest number of n8n workflows, OAuth integrations, email automation, crons). Highest risk.

**n8n workflows to replace** (fill in your own):
- workflow-001 → Hono routes
- webhook-001 → Hono route
- cron-001 → node-cron

**After Wave 3**: All your-server-one n8n workflows replaced. n8n container can be stopped on this server (~2GB RAM reclaimed).

### Wave 4: Content Pipeline Apps

| App | Repo | Server | Risk | Key Change |
|-----|------|--------|------|------------|
| **4a. App-F** | `your-org/app-f` | your-server-one | Medium | n8n pipeline → Hono async jobs |
| **4b. App-G** | `your-org/app-g` | your-server-two | Medium | htm → JSX+Vite, n8n ingest → Hono routes |

### Wave 5: Second Server Ecosystem

| App | Repo | Server | Risk | Key Change |
|-----|------|--------|------|------------|
| **5a. App-H** | `your-org/app-h` | your-server-two | Medium | n8n sub-workflows → importable JS modules |
| **5b. App-I** | `your-org/app-i` | your-server-two | Medium | n8n workflows → Hono + engine modules |
| **5c. App-J** | `your-org/app-j` | your-server-two | Low | Built on new engine modules from scratch |

**5a is the foundation**: The engine becomes a package that instances import.

**Engine modules to create** (fill in your own):
- `engine/ingest.js` — chunk + embed
- `engine/query.js` — embed query + vector search + generation
- `engine/transcribe.js` — transcription integration

**After Wave 5**: All your-server-two n8n workflows replaced. n8n container can be stopped (~2GB RAM reclaimed).

### Wave 6: Remaining Apps (Low Priority)

| App | Repo | Server | Risk | Key Change |
|-----|------|--------|------|------------|
| **6a. App-K** | `your-org/app-k` | your-server-one | None | Data collection phase — apply template when it becomes an app |
| **6b. App-L** | `your-org/app-l` | your-server-two | Low | Separate client app, migrate when convenient |
| **6c. App-M** | `your-org/app-m` | your-server-one | Low | Simple SPA, migrate when touched |

---

## n8n Sunset Timeline

| Milestone | Trigger | Action |
|-----------|---------|--------|
| During migration | Per-workflow | Deactivate n8n workflow after Hono route is verified |
| After Wave 3 | All your-server-one workflows replaced | Stop n8n container on your-server-one |
| After Wave 5 | All your-server-two workflows replaced | Stop n8n container on your-server-two |
| Final | Both servers n8n-free | Remove n8n from docker-compose.yml, reclaim ~2GB RAM per server |

---

## Deployment Patterns by Server

### your-server-one (Waves 1b, 2, 3, 4a, 6a, 6c)

- Caddy reverse proxy (static files + `/api/*` → Hono)
- Docker Compose: Caddy + Hono API
- Supabase cloud for database
- Standard `docker-compose.yml` from template

### your-server-two (Waves 1a, 4b, 5, 6b)

- Direct host deployment (or Docker)
- Shared services: Ollama, Postgres+pgvector (as applicable)
- Engine modules shared across instances
- Path: `/home/your-username/projects/your-username/`

---

## Pacing Guidance

- **One wave per focus period.** Don't try to do Wave 2 and Wave 3 in the same focus period.
- **One app at a time within a wave.** Finish 2a before starting 2b.
- **48-hour bake between apps.** Monitor production before moving to the next app.
- **Each app ships as v2.0.0.** This is a major version bump — use `dev/v2.0` branch, tag `v2.0.0` on merge.
- **Secret rotation happens per-app during migration, then cross-cutting after all apps.** See `docs/secrets.md`.
