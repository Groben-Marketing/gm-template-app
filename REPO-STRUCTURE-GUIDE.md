# Repo Template — Folder Structure Guide

> Updated 2026-04-07 — TypeScript + Preact+TSX+Vite+Tailwind + Hono API + Supabase/Postgres

```
├── PROJECT_PROTOCOL.md          ← Operating rules for Claude Code (read first, always)
├── CLAUDE.md                    ← App-specific context for Claude Code (schema, APIs, conventions)
├── .env.example                 ← Template environment variables (copy to .env, fill in)
├── .gitignore                   ← node_modules, .env, dist/
├── Dockerfile                   ← Multi-stage build: Vite SPA + Hono server, runs as node user
├── docker-compose.yml           ← Single service (global Caddy handles routing)
├── package.json                 ← Dependencies + scripts (dev, build, start, typecheck)
├── tsconfig.json                ← TypeScript config (strict mode, Preact JSX)
├── vite.config.ts               ← Vite + Preact preset + Tailwind
├── index.html                   ← Vite HTML entry point
├── docs/
│   ├── overview.md              ← What this app is, why it exists, architecture
│   ├── decisions.md             ← Lessons learned, major fixes, rules going forward
│   ├── roadmap.md               ← Phases, features, versioning, pivots
│   ├── branching.md             ← How to work on branches and keep main safe
│   ├── versioning.md            ← How to number releases (MAJOR.MINOR.PATCH)
│   ├── secrets.md               ← Secret management, rotation procedures
│   ├── discovery-principles.md  ← How to discover & spec an operations app (product thesis, 10 principles, anti-patterns)
│   ├── cognitive-scoping-doctrine.md ← Role-based cognitive scoping: each role sees only their slice; admin view-as
│   ├── migration-checklist.md   ← Per-app migration steps
│   ├── migration-waves.md       ← Wave order, dependencies, blockers
│   └── handoffs/
│       ├── TEMPLATE.md          ← Copy this for each session handoff
│       └── 2026-03-16-notes.md  ← (example) Date-prefixed session notes
├── src/                         ← Frontend source (Preact + TSX + Tailwind)
│   ├── index.tsx                ← App entry point (mounts to #app)
│   ├── index.css                ← Tailwind base import
│   ├── components/
│   │   ├── Badge.tsx            ← Reusable UI components
│   │   ├── Toast.tsx
│   │   ├── DataTable.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── InfoCard.tsx
│   │   └── LoadingSkeleton.tsx
│   ├── views/                   ← One file per route/view
│   │   ├── Home.tsx
│   │   └── Settings.tsx
│   └── lib/
│       ├── supabase.ts          ← Supabase client init + auth helpers
│       └── api.ts               ← Typed fetch wrapper for Hono API calls
├── server/                      ← Hono API backend (TypeScript, run via tsx)
│   ├── index.ts                 ← App setup, middleware, server start
│   ├── routes/
│   │   ├── items.ts             ← /api/items CRUD routes (example)
│   │   ├── webhooks.ts          ← /webhook/* receivers
│   │   └── admin.ts             ← /api/admin/* protected routes
│   ├── middleware/
│   │   └── auth.ts              ← Supabase JWT or PIN auth
│   ├── jobs/
│   │   └── cron.ts              ← node-cron scheduled jobs
│   └── lib/
│       └── supabase.ts          ← Supabase client init (admin + user-scoped)
├── supabase/                    ← SQL migrations (numbered: 001_, 002_, etc.)
└── workflows/                   ← n8n workflow JSON exports (if migrating)
```

---

## Frontend Stack

| Layer | Tool | Why |
|-------|------|-----|
| Language | TypeScript (strict) | Catch bugs at build time, full IDE support |
| Framework | Preact 10.x (3KB) | React-compatible API, tiny bundle. Swap to React if needed. |
| Markup | TSX | Standard component syntax, type-safe props |
| Build | Vite | Fast dev server, instant HMR, native TS support, optimized production builds |
| Styling | Tailwind CSS | Utility-first, built by Vite plugin, tree-shaken in production |
| Data | Supabase JS v2 | Direct queries from SPA (RLS enforced) + auth |
| API calls | fetch → Hono | Service-role operations, external APIs, webhooks |

### Swapping to React

If an app needs React instead of Preact:

1. `npm install react react-dom @types/react @types/react-dom` (remove `preact`)
2. Update `vite.config.ts`: remove `@preact/preset-vite`, add `@vitejs/plugin-react`
3. Update `tsconfig.json`: change `jsxImportSource` from `preact` to `react`, remove `paths`
4. Change imports: `preact/hooks` → `react`, `preact` → `react-dom/client`
5. Everything else stays the same — TSX, Tailwind, Vite, same component structure.

### API-only (mobile apps)

If the frontend is a mobile app (React Native, etc.):

1. Remove `src/`, `index.html`, `vite.config.ts`, Caddy static file config
2. Keep `server/` — the Hono API is the entire backend
3. Caddy only reverse proxies `/api/*` and `/webhook/*` to Hono
4. Mobile app calls the same `/api/*` endpoints

---

## Backend Stack

| Layer | Tool | Why |
|-------|------|-----|
| Language | TypeScript (strict) | Same language as frontend, Hono has first-class TS types |
| API server | Hono | Lightweight (~14KB), Web Standards API, built-in middleware |
| Runtime | Node.js 22+ via tsx | Runs `.ts` directly — no compile step needed |
| Database | Supabase (Postgres) | Managed Postgres, Auth, RLS, real-time |
| Cron | node-cron | Scheduled jobs, replaces external cron services |
| Email | Resend (via API) | Transactional email from Hono routes |
| Deploy | Docker Compose | Single Hono container, global Caddy routes to it |

---

## Component Convention

Components live in `src/components/` as TSX modules. Each file exports one component with a typed props interface.

```tsx
// src/components/Badge.tsx
interface ColorDef {
    bg: string;
    text: string;
}

const COLORS: Record<string, ColorDef> = {
    Active:   { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    Inactive: { bg: 'bg-gray-100',   text: 'text-gray-500' },
};

interface BadgeProps {
    label: string;
    colorMap?: Record<string, ColorDef>;
}

export function Badge({ label, colorMap }: BadgeProps) {
    const colors = colorMap || COLORS;
    const c = colors[label] || { bg: 'bg-gray-100', text: 'text-gray-600' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${c.bg} ${c.text}`}>
            {label}
        </span>
    );
}
```

---

## View Convention

Views live in `src/views/`. Each view is a component that represents one screen/route.

```tsx
// src/views/Home.tsx
import { useState, useEffect } from 'preact/hooks';
import { Badge } from '../components/Badge';
import { supabase } from '../lib/supabase';

interface Item {
    id: string;
    name: string;
    status: string;
}

export function HomeView() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.from('items').select('*').order('name')
            .then(({ data }) => { setItems(data || []); setLoading(false); });
    }, []);

    if (loading) return <div className="animate-pulse h-8 w-48 bg-gray-200 rounded-lg" />;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            {items.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-5 mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                    <Badge label={item.status} />
                </div>
            ))}
        </div>
    );
}
```

---

## Routing

Hash-based routing in the app entry point:

```tsx
// src/index.tsx
import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { HomeView } from './views/Home';
import { SettingsView } from './views/Settings';

function App() {
    const [route, setRoute] = useState(location.hash.slice(1) || 'home');

    useEffect(() => {
        const handler = () => setRoute(location.hash.slice(1) || 'home');
        window.addEventListener('hashchange', handler);
        return () => window.removeEventListener('hashchange', handler);
    }, []);

    const [view, param] = route.includes('/')
        ? [route.split('/')[0], route.split('/')[1]]
        : [route, null];

    switch (view) {
        case 'settings': return <SettingsView />;
        default:         return <HomeView />;
    }
}

render(<App />, document.getElementById('app')!);
```

---

## Dev Workflow

```bash
# Terminal 1: Hono API server (backend on :3000)
npm run dev

# Terminal 2: Vite dev server (frontend on :5173, hot reload)
npm run dev:client

# Type-check (CI or before deploy)
npm run typecheck
```

Vite's proxy config forwards `/api/*`, `/webhook/*`, and `/health` to the Hono server automatically during development. In production, Hono serves the built SPA from `dist/` and handles API routes — global Caddy routes traffic to the container.

## Production Deploy

```bash
npm run build                     # Vite builds SPA to dist/
docker compose up -d --build      # Builds image + starts container on r7net
```

- Container runs Hono via tsx on port 3000 (serves dist/ + API)
- Global Caddy routes `your-domain.com/<appname>/*` to the container
- Caddy strips the path prefix — Hono receives `/`, not `/<appname>/`
- Set `VITE_BASE_PATH=/<appname>/` so asset URLs work through Caddy
- No per-app Caddyfile — TLS and routing are handled globally

## Role-Based Access

Admin and client views live in the same app, same URL. Auth determines what the user sees:

```
your-domain.com/appname/ → Supabase auth checks role
  → owner/admin → sees all data, admin controls, management views
  → client      → sees only their assigned data, limited views
```

Do NOT create separate `/admin/` URL paths. Use the auth middleware's `isAdmin` flag to conditionally render views and restrict API routes.

Auth decides what a role *may* see; what each role's view actually *shows* is a separate design question — see `docs/cognitive-scoping-doctrine.md` (each role sees only their slice, plus the required admin "view-as" toggle).

---

## Quick Reference

| I need to... | Go to... |
|--------------|----------|
| Pick up work in this repo | `PROJECT_PROTOCOL.md` |
| Understand what this app does | `docs/overview.md` |
| Understand the app-specific schema, APIs, conventions | `CLAUDE.md` |
| Check if we've solved this problem before | `docs/decisions.md` |
| See what's planned or track progress | `docs/roadmap.md` |
| Spec a new operations app (discovery → brief) | `docs/discovery-principles.md` |
| Reduce a role's view to what it needs to see | `docs/cognitive-scoping-doctrine.md` |
| Remember how to use branches | `docs/branching.md` |
| Know which version number to bump | `docs/versioning.md` |
| Add a new API route | `server/routes/` |
| Add a scheduled job | `server/jobs/cron.ts` |
| Add a webhook receiver | `server/routes/webhooks.ts` |
| Add a new reusable UI element | `src/components/` |
| Add a new page/screen | `src/views/` |
| Manage secrets | `docs/secrets.md` |
| Add a database migration | `supabase/` |
| Set up environment variables | `.env.example` → `.env` |
| Type-check the project | `npm run typecheck` |
