# Efficiency Standard

> Shared standard across all R7/Wayfinder apps. Synced from the template.
>
> **What this governs:** that an app stays fast and cheap **by rule, not by accident**. The stack (Preact, Hono, Vite, Supabase) gives efficient defaults; this standard names the rules an agent is actually held to, so efficiency is enforced instead of being a byproduct.

These are enforceable rules, not advice. Most are cheap to follow at build time and expensive to retrofit once an app is slow under real data.

---

## §1 — Query efficiency

- **No N+1 queries.** Never loop a query per row. Fetch the set in one round-trip — a join, an `.in('id', ids)`, or a single PG function. If you wrote a query inside a `.map()`/`for`, that's the smell.
- **Select only the columns you use.** `select('id, name, status')`, not `select('*')` on wide or large tables. `*` ships columns the client throws away and defeats covering indexes.
- **Bound every list.** No unbounded `select()` on a table that grows. Every list query has a `.limit()` and an `.order()`; default page size **50** unless the brief states otherwise.
- **Push work to the database** when it's set-shaped — filter, sort, aggregate, and paginate in SQL/PostgREST, not in JS after over-fetching. Multi-step atomic logic goes in a PG function (`docs/architecture-patterns.md`).

## §2 — Indexing

- **Index every column used in a hot predicate**: RLS policy predicates, `WHERE` filters, `JOIN` keys, and `ORDER BY` columns on any table expected to exceed a few hundred rows.
- **RLS predicates are queries too** — an unindexed `auth.uid() = user_id` policy runs a seq scan on every request. Index the column the policy filters on.
- A migration that adds a frequently-filtered column adds its index in the same migration.

## §3 — Payloads & pagination

- **List endpoints paginate** — return a bounded page (limit + offset/cursor), never the whole table. The SPA requests more on demand (load-more / infinite scroll / pages).
- **Keep responses lean** — don't embed deep nested joins the view doesn't render. Shape the response to the screen.
- **Stream or chunk large exports** rather than building a giant in-memory array.

## §4 — Caching & redundant work

- **Don't refetch on every render.** Load data in an effect keyed to its inputs, cache in component/app state, and reuse. Components receive data via props and never fetch (`docs/architecture-patterns.md`) — this prevents duplicate fetch storms.
- **Debounce** search/filter inputs before they hit the API (≥250ms).
- **Cache static and rarely-changing reads** with appropriate headers; version/cache-bust mutable docs (the changelog pattern in `docs/versioning.md`). The `api` GET retry must not turn into a retry storm — that's why writes don't retry and GETs back off.
- **Lazy-load heavy/rare views** (charts, editors) so they don't weigh the initial bundle.

## §5 — Rate limiting

- **Respect provider outbound limits.** External APIs have quotas (e.g. Resend, Postiz). Throttle/queue outbound calls to stay under them — bursting past the limit gets the whole app throttled. Server-side stacking/rate-limit logic belongs in a PG function or the job layer, not ad hoc per call site.
- **Protect public inbound endpoints.** Any unauthenticated route (webhooks, public form intake) needs a basic rate limit / abuse guard so one caller can't exhaust the backend.

## §6 — Frontend weight

- **Stay on the light stack** — Preact (not React) unless an app needs the broader ecosystem; lean on Vite tree-shaking and Tailwind's production purge. Don't add a heavy dependency for something the platform already does.
- **Render what's visible** — virtualize or paginate long lists rather than mounting thousands of rows.

## §7 — The scale-expectation gate

`CLAUDE.md` → Defensive Defaults requires every app to **state its scale** ("10–50 internal users" vs "500+ public signups"). That number is the budget: it decides whether a list needs pagination now, whether a column needs an index now, and whether an endpoint needs a rate limit now. **A blank scale expectation is an incomplete brief** — you can't size efficiency against an unknown load.

---

## §8 — Enforcement

| Where | Gate |
|-------|------|
| **Brief (Phase 0)** | Scale expectation stated (§7) — it sets the efficiency budget for the whole app. |
| **Phase 2 (Issue) / spec** | A feature that lists data states its pagination + the columns selected; a feature that adds a filtered/sorted column states its index; a feature that calls an external API states how it stays under the provider's rate limit (`docs/spec-writing-guide.md`). |
| **`/qa` / review** | No `select('*')` on growing tables, no query-in-a-loop, no unbounded list, no refetch-on-every-render. Mechanically checkable items go in Agent Verify (`docs/agent-verification.md`). |

The litmus test for any data-touching change: **"what does this do at 100× the current row count?"** If the answer is "gets slow" or "gets expensive," it's not done.

---

## Sources / background

- Supabase performance & indexing guidance · [Supabase docs — Query Performance](https://supabase.com/docs/guides/database/query-optimization)
- N+1 query problem · [overview](https://en.wikipedia.org/wiki/N%2B1_query_problem)
- Pagination patterns (keyset vs offset) · [Supabase — Pagination](https://supabase.com/docs/reference/javascript/range)
- Web performance budgets · [web.dev — Performance budgets](https://web.dev/articles/performance-budgets-101)
