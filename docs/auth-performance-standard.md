# Auth-Performance Standard

Two auth patterns that, done the obvious-but-wrong way, put a multi-second floor
under **every** page load. Reference implementation + measured wins:
`gm-app-prospect-factory` issue #122 (`/api/me` 1974–7375 ms → ~300 ms;
bootstrap 3× → 1×).

The tell that you have this problem: the DB query is sub-millisecond and indexes
/ RLS are fine, but every endpoint still takes 1–2 s. The cost is round-trips,
not queries. (Note: the Supabase MCP / service-role runs *bypass* RLS and the
auth path, so they hide this — measure in the browser via the Resource Timing
API, not via `execute_sql`.)

---

## 1. Verify the JWT locally — never `auth.getUser()` per request

**Wrong** (a network round-trip to the Supabase Auth server on *every* request —
the ~1–2 s floor, with multi-second outliers):

```ts
const { data: { user }, error } = await sbUser.auth.getUser(token);
```

**Right** — Supabase signs access tokens with **asymmetric keys (ES256)**, so
`getClaims()` verifies the signature against a **module-global cached JWKS** (one
fetch on cold start, then sub-millisecond local verification per request). It
still rejects expired and tampered tokens.

```ts
const { data: claimsData, error } = await sbUser.auth.getClaims(token);
const claims = claimsData?.claims;
if (error || !claims?.sub) return c.json({ error: 'Invalid or expired token' }, 401);
const user = { id: claims.sub, email: claims.email ?? '' };
```

Requires `@supabase/supabase-js` ≥ ~2.50 (any recent 2.x). Confirm the project
uses asymmetric signing — `GET https://<ref>.supabase.co/auth/v1/.well-known/jwks.json`
should return a key with `"alg":"ES256"`. (All current R7 projects do. If a
project is still on a legacy HS256 shared secret, either enable asymmetric
signing keys — recommended — or verify locally with the JWT secret; do **not**
fall back to the network `getUser()`.)

## 2. Parallelize + cache the remaining middleware reads

After local verification, the only per-request DB work left is loading
memberships / profile / `is_platform_admin`. Two rules:

- **Run independent reads concurrently** (`Promise.all`), never serially.
- **Cache them per user for a short TTL** (≈20 s) in a module-level `Map`, so
  bursty navigation skips the round-trip. A membership/role change applies
  within the TTL; **Postgres RLS remains the hard boundary** on every data query
  — the cache only feeds the app-level access gate, never RLS.

## 3. Hydrate the SPA once per token (bootstrap dedupe)

`onAuthStateChange` fires `INITIAL_SESSION` immediately on subscribe, and
supabase-js often emits **both** `INITIAL_SESSION` and `SIGNED_IN` for the same
token on load. A common `AuthContext` also calls `getSession().then(hydrate)`
separately and re-hydrates on every silent `TOKEN_REFRESHED`. Result: `/api/me`
and `/api/orgs` fire 3× on every load.

**Right:**

- Drop the standalone `getSession().then(hydrate)` — rely on `INITIAL_SESSION`.
- De-dupe by access token: run the boot fetch **once per unique token**.
- On `TOKEN_REFRESHED` / `USER_UPDATED` (or any same-token event), just swap the
  session JWT — do **not** re-fetch memberships/orgs.

## 4. Don't re-fetch on every navigation — stale-while-revalidate

For read-heavy navigation targets (lists, boards), wrap GETs in a small SWR
cache: return the last-known data instantly, revalidate in the background, update
only if it changed, and de-dupe in-flight requests. Invalidate the relevant
prefix after a mutation so there's no stale flash. Keep active *work* surfaces
(e.g. a "Today" coding loop) on live fetches. Reference: PF `src/lib/swr.ts`.

## 5. Don't ship the whole table to dedupe/scan

If a route loads an entire table to compute something (dedup, counts), keep the
lightweight index pass server-side but **paginate the heavy payload** and drop
embedded joins from the full scan — batch-fetch the joined data for only the rows
you return. Reference: PF `GET /scrubbing` (774 KB / 1.4 s → 154 KB / 0.55 s).
