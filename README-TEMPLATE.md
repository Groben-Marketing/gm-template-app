# [App Name]

> [One-line description]

## Stack

**Language**: TypeScript (strict mode)
**Frontend**: Preact + TSX · Vite · Tailwind CSS
**Backend**: Hono API (via tsx) · Supabase (Postgres + Auth + RLS)
**Deploy**: Docker container · Global Caddy handles TLS + routing

## Quick Start

### Prerequisites

- Node.js 22+
- Docker + Docker Compose (for deployment)

### Development

```bash
# Install dependencies
npm install

# Copy environment template and fill in credentials
cp .env.example .env

# Start Hono API server (port 3000)
npm run dev

# In another terminal: start Vite dev server (port 5173, hot reload)
npm run dev:client

# Type-check without emitting
npm run typecheck
```

Vite proxies `/api/*` and `/webhook/*` to Hono during development. Edit any `.tsx` file and the browser updates instantly via HMR.

### Production

```bash
# Build the SPA
npm run build

# Build and start the container
docker compose up -d --build
```

The container runs Hono on port 3000, serving both the built SPA (`dist/`) and API routes. Global Caddy on the host routes traffic to the container by path prefix (e.g., `handle_path /appname/*`).

> Replace `your-domain.com` throughout with your actual domain.

**There is no per-app Caddyfile.** TLS, routing, and path-prefix stripping are handled by the global Caddy instance on the server.

### Deployment Pattern

```
Browser → your-domain.com/appname/ → Global Caddy (strips /appname/) → container:3000
                                                                  ├── /assets/*  → dist/ (Vite build)
                                                                  ├── /api/*     → Hono routes
                                                                  ├── /health    → health check
                                                                  └── /*         → dist/index.html (SPA fallback)
```

Key: set `VITE_BASE_PATH=/appname/` in `.env` so Vite generates correct asset URLs that work with Caddy's path stripping.

> The deployment pattern assumes a global Caddy instance on the host. Adjust for your own reverse proxy setup.

## Docs


| Doc                             | Purpose                                      | Syncs? |
| ------------------------------- | -------------------------------------------- | ------ |
| `PROJECT_PROTOCOL.md`           | Operating rules for Claude Code              | Yes    |
| `docs/architecture-patterns.md` | Hono + SPA patterns, conventions             | Yes    |
| `docs/branching.md`             | Git workflow                                 | Yes    |
| `docs/versioning.md`            | Semantic versioning rules                    | Yes    |
| `CLAUDE.md`                     | App-specific context (schema, APIs, gotchas) | No     |
| `docs/overview.md`              | Architecture and stack decisions             | No     |
| `docs/decisions.md`             | Lessons learned                              | No     |
| `docs/roadmap.md`               | Feature tracking                             | No     |
| `docs/secrets.md`               | Secret management and rotation               | No     |


## Template Sync

Files marked "Syncs" are automatically pushed to downstream repos via GitHub Action when updated here. The action opens a PR in each repo for review.

**Config**: `.github/sync-config.json` — lists target repos and synced files.

**Requires**: A GitHub PAT stored as `REPO_SYNC_TOKEN` secret with repo access to all target repos.

## Structure

See `REPO-STRUCTURE-GUIDE.md` for the full folder convention.
