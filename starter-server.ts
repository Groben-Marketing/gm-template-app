// ─── Hono API Starter ────────────────────────────────────
// Copy this into server/index.ts and customize for your app.
// Run: tsx server/index.ts (or npm start)
//
// In production, this server does TWO jobs:
// 1. Serves the Vite-built SPA from dist/
// 2. Handles /api/* and /webhook/* routes
//
// Global Caddy on r7net routes traffic to this container.
// This server does NOT handle TLS — Caddy does that.

import { Hono } from 'hono';
import type { Context, Next } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic } from '@hono/node-server/serve-static';
import { serve } from '@hono/node-server';
import { createClient } from '@supabase/supabase-js';

// ─── Config ──────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

// Service-role client — for server-side operations that bypass RLS
const sbAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Per-user authz cache (Auth-Performance Standard) ────
// After local JWT verification, the only per-request DB work in authMiddleware is
// the profile/role read. It changes rarely, so cache it per user for a short
// window — bursty navigation then skips that round-trip. A change applies within
// AUTHZ_TTL_MS; Postgres RLS remains the hard boundary on every data query.
// See docs/auth-performance-standard.md.
const AUTHZ_TTL_MS = 20_000;
const authzCache = new Map<string, { profile: { id: string; role: string; name: string } | null; isAdmin: boolean; exp: number }>();

// ─── External-Call Guard (Fault-Isolation Standard) ──────
// Every outbound call to a third-party (Resend, Frame.io, Anthropic, …) MUST be
// time-boxed so a hung dependency can't pin a request open or exhaust the event
// loop. Idempotent GETs retry with backoff; a failing call returns a handled
// error to the caller — it never cascades into a process crash.
// See docs/fault-isolation-standard.md. Usage:
//   const res = await callExternal('https://api.resend.com/emails',
//       { method: 'POST', headers: {...}, body: JSON.stringify(payload) });
export async function callExternal(
    url: string,
    init: RequestInit & { timeoutMs?: number; retries?: number } = {},
): Promise<Response> {
    const method = (init.method ?? 'GET').toUpperCase();
    const { timeoutMs = 8000, retries = method === 'GET' ? 2 : 0, ...rest } = init;
    let lastErr: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
            const res = await fetch(url, { ...rest, signal: ctrl.signal });
            if (!res.ok && res.status >= 500 && attempt < retries) {
                lastErr = new Error(`upstream ${res.status} from ${url}`);
                await new Promise((r) => setTimeout(r, 300 * 2 ** attempt));
                continue;
            }
            return res;
        } catch (err) {
            lastErr = err;
            if (attempt < retries) {
                await new Promise((r) => setTimeout(r, 300 * 2 ** attempt));
                continue;
            }
        } finally {
            clearTimeout(timer);
        }
    }
    throw lastErr instanceof Error ? lastErr : new Error(`external call failed: ${url}`);
}

// ─── App Setup ───────────────────────────────────────────
const app = new Hono();

app.use('*', logger());
app.use('*', cors({
    origin: process.env.CORS_ORIGIN || '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Auth Middleware ─────────────────────────────────────
// Validates Supabase JWT from Authorization header.
// Attaches authenticated user to c.get('user') and a
// user-scoped Supabase client to c.get('sbUser').
//
// Usage: app.use('/api/*', authMiddleware);
async function authMiddleware(c: Context, next: Next) {
    const header = c.req.header('Authorization');
    if (!header?.startsWith('Bearer ')) {
        return c.json({ error: 'Missing or invalid Authorization header' }, 401);
    }

    const token = header.slice(7);

    // Create a client scoped to this user's JWT — respects RLS
    const sbUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        // Server, request-scoped: never persist or auto-refresh a session.
        auth: { persistSession: false, autoRefreshToken: false },
    });

    // Verify the JWT LOCALLY. Supabase signs access tokens with asymmetric keys
    // (ES256), so getClaims() verifies against a module-global cached JWKS — one
    // fetch on cold start, then sub-millisecond per request. DO NOT use
    // auth.getUser() here: it makes a network round-trip to the Supabase Auth
    // server on EVERY request (a ~1–2s per-request latency floor). getClaims()
    // still rejects expired/tampered tokens. See docs/auth-performance-standard.md.
    const { data: claimsData, error } = await sbUser.auth.getClaims(token);
    const claims = claimsData?.claims;
    if (error || !claims?.sub) {
        return c.json({ error: 'Invalid or expired token' }, 401);
    }
    const user = {
        id: claims.sub,
        email: claims.email ?? '',
        app_metadata: claims.app_metadata ?? {},
        user_metadata: claims.user_metadata ?? {},
    } as unknown as { id: string; email: string };

    // Profile/role for access control — cached per user (short TTL) so repeat
    // requests skip this round-trip.
    const now = Date.now();
    let entry = authzCache.get(user.id);
    if (!entry || entry.exp <= now) {
        const { data: profile } = await sbAdmin
            .from('profiles')
            .select('id, role, name')
            .eq('id', user.id)
            .single();
        entry = {
            profile: (profile as { id: string; role: string; name: string } | null) ?? null,
            isAdmin: profile?.role === 'owner' || profile?.role === 'admin',
            exp: now + AUTHZ_TTL_MS,
        };
        if (authzCache.size > 1000) authzCache.clear();
        authzCache.set(user.id, entry);
    }

    c.set('user', user);
    c.set('profile', entry.profile);
    c.set('sbUser', sbUser); // RLS-scoped client for this request
    c.set('isAdmin', entry.isAdmin);
    await next();
}

// ─── PIN Auth Middleware (alternative) ───────────────────
// For internal tools that use a shared PIN instead of Supabase Auth.
// Set APP_PIN in .env. SPA sends it as x-app-pin header.
//
// Usage: app.use('/api/*', pinAuthMiddleware);
async function pinAuthMiddleware(c: Context, next: Next) {
    const pin = c.req.header('x-app-pin');
    if (!pin || pin !== process.env.APP_PIN) {
        return c.json({ error: 'Invalid PIN' }, 401);
    }
    await next();
}

// ─── Health Check ────────────────────────────────────────
app.get('/health', (c) => c.json({
    status: 'ok',
    app: 'app-name',  // ← Change to your app name
    timestamp: new Date().toISOString(),
}));

// ─── Protected API Routes ────────────────────────────────
// Pick one auth middleware and apply it:
app.use('/api/*', authMiddleware);
// app.use('/api/*', pinAuthMiddleware);   // Shared PIN (internal tools)

// Example: List items
app.get('/api/items', async (c) => {
    const { data, error } = await sbAdmin
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
});

// Example: Create item
app.post('/api/items', async (c) => {
    const body = await c.req.json();
    const { data, error } = await sbAdmin
        .from('items')
        .insert(body)
        .select()
        .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data, 201);
});

// Example: Update item
app.put('/api/items/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { data, error } = await sbAdmin
        .from('items')
        .update(body)
        .eq('id', id)
        .select()
        .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
});

// Example: Delete item
app.delete('/api/items/:id', async (c) => {
    const id = c.req.param('id');
    const { error } = await sbAdmin
        .from('items')
        .delete()
        .eq('id', id);

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ deleted: true });
});

// ─── Webhook Endpoints ──────────────────────────────────
// External services can POST to /webhook/* routes.
//
// app.post('/webhook/bounce', async (c) => {
//     const event = await c.req.json();
//     if (event.type === 'email.bounced') {
//         await sbAdmin.from('email_events').insert({
//             email: event.data.to,
//             event_type: 'bounce',
//             payload: event,
//         });
//     }
//     return c.json({ ok: true });
// });

// ─── Scheduled Jobs (bulkheaded) ────────────────────────
// npm install node-cron
//
// Fault-Isolation Standard: a throw in a background job must NOT take the server
// down. Every cron body is wrapped in try/catch so the job "fails by itself" —
// it logs and the next tick runs clean. Use callExternal() for any outbound call.
//
// import cron from 'node-cron';
//
// cron.schedule('0 17 * * 5', async () => {  // Every Friday at 5pm
//     try {
//         const res = await callExternal('https://api.example.com/run', { method: 'POST' });
//         if (!res.ok) throw new Error(`run failed: ${res.status}`);
//     } catch (err) {
//         console.error('[cron] Friday job failed (isolated, server still up):', (err as Error).message);
//     }
// });

// ─── Error Handler ───────────────────────────────────────
app.onError((err, c) => {
    console.error(`[error] ${c.req.method} ${c.req.path}:`, err.message);
    return c.json({ error: 'Internal server error' }, 500);
});

// ─── Static Files (Vite build) ───────────────────────────
// In production, Hono serves the built SPA from dist/.
// Caddy's handle_path strips the app's path prefix (e.g., /porkchop/),
// so Hono receives clean paths (e.g., /assets/index.js).
app.use('/assets/*', serveStatic({ root: './dist' }));

// SPA fallback — any non-API, non-asset request gets index.html
// This enables client-side hash routing (#/home, #/settings, etc.)
app.get('*', serveStatic({ root: './dist', path: 'index.html' }));

app.notFound((c) => c.json({ error: 'Not found' }, 404));

// ─── Start Server ────────────────────────────────────────
const server = serve({ fetch: app.fetch, port: PORT }, () => {
    console.log(`[hono] API server running on port ${PORT}`);
});

// ─── Graceful Shutdown ──────────────────────────────────
function shutdown(signal: string) {
    console.log(`[hono] ${signal} received, shutting down gracefully...`);
    server.close(() => {
        console.log('[hono] Server closed.');
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ─── Process-level fault isolation (bulkhead) ────────────
// A rejected promise that nobody awaited (a fire-and-forget background task)
// must not crash the server. Log it and keep serving — the failed task fails by
// itself. (A truly broken-state uncaughtException is left to crash so the
// orchestrator restarts the container cleanly — don't swallow those.)
process.on('unhandledRejection', (reason) => {
    console.error('[unhandledRejection] background task failed (server still up):', reason);
});
