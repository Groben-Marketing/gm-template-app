# Fault-Isolation Standard

> Shared standard across all R7/Wayfinder apps. Synced from the template.
>
> **What this governs:** that a failure in one part of an app stays in that part — it does not start a chain reaction that breaks the rest. This is the **third clause of Separation of Concerns ("Can it fail by itself?")** elevated from a design principle into enforced runtime rules and shipped primitives.

Separation of Concerns (`PROJECT_PROTOCOL.md`) already demands that every component, route, and integration *fail by itself*. That rule is real at design time but was aspirational at runtime — there was no error boundary, no outbound timeout, no bulkhead. This standard closes that gap: the rules below are gated, and the primitives that satisfy them ship in the template.

---

## §1 — The rule

**A failure must be contained to the unit that failed.** A crashed view must not blank the app. A hung third-party call must not freeze a request or the event loop. A throwing background job must not take the server down. If a single failure can cascade, it's a defect — fix the isolation before shipping.

Every unit (view, route, integration, job) must answer **all three** of the Separation-of-Concerns questions, with the third now carrying runtime obligations:

1. Can it **function** by itself?
2. Can it **stand** by itself? (no hidden dependencies)
3. Can it **fail** by itself? → **its failure is caught, degraded, and logged at its own boundary — it does not propagate.**

---

## §2 — Client: no crash blanks the app

- **Every routed view renders inside an `ErrorBoundary`** (`src/components/ErrorBoundary.tsx`). The template wraps the shell once at the root and each view keyed by route. A render/runtime error in one view degrades to a recoverable "Try again" fallback; the nav and the rest of the app keep working. **Never** ship a view that can white-screen the SPA.
- **No blank screen, ever** (the existing Defensive Default): every failed fetch, timeout, and edge case gets a user-facing message — `Toast` for transient errors, `EmptyState` for no-data, the `ErrorBoundary` fallback for unexpected crashes.
- **Errors are logged, never swallowed.** The boundary logs to console (and to `onError` if wired to a reporter); a silent `catch {}` that hides a failure is a violation.

## §3 — Outbound calls are time-boxed and degrade

- **Every call to the backend goes through `src/lib/api.ts`**, which time-boxes each request (10s `AbortController`) and retries idempotent **GETs** with backoff. **Writes never auto-retry** (a retried POST can double-submit). A caller may pass an `AbortSignal` to cancel on unmount/route-change.
- **Every server-side call to a third party goes through `callExternal()`** (`starter-server.ts`) or an equivalent guarded wrapper — timeout (8s default) + backoff retry for GETs. A hung Resend/Frame.io/Anthropic call must not pin a request open or exhaust the event loop.
- **Degrade, don't cascade.** When an external dependency fails, return a handled error and a degraded mode (queue-and-retry, cached value, "try again later") — defined per integration in the brief's **Integration Risks** table.
- **No uncontrolled third-party on the critical path** (`PROJECT_PROTOCOL.md`, Phase 2). If an integration's only fallback is "stop the world," it's flagged in the brief and reconsidered — that's a single point of total failure.

## §4 — Bulkheading: background work fails alone

- **Every cron/scheduled job body is wrapped in try/catch** so a throw logs and the next tick runs clean — the job fails by itself, the server stays up (`starter-server.ts` cron pattern).
- **Webhook handlers catch their own errors** and return a handled response; a malformed payload returns 4xx, it doesn't crash the route.
- **Process-level guard**: an unawaited rejected promise (fire-and-forget task) is logged, not fatal (`process.on('unhandledRejection')`). A genuinely broken-state `uncaughtException` is deliberately left to crash so the orchestrator restarts the container cleanly — don't swallow those.
- **`app.onError()`** catches any uncaught request exception → 500 with no internal details, containing it to that one request.

## §5 — Planning-layer gates (unchanged, still required)

- **Integration Risks table** (`docs/project-brief.md`) — for every external dependency: what fails, and the fallback. Any "stop the world" fallback must be flagged. Re-verified at milestone close (`docs/milestones.md`).
- **Isolation Test Plan** (`docs/project-brief.md`) — each component proven to work alone before integration, so its failure boundary is known and tested.

---

## §6 — Shipped primitives

| Primitive | File | Satisfies |
|-----------|------|-----------|
| `ErrorBoundary` | `src/components/ErrorBoundary.tsx` | §2 — view crash containment |
| Time-boxed/retrying API client | `src/lib/api.ts` (`api`/`get`/`post`/…, `ApiError`) | §3 — backend-call isolation |
| `callExternal()` | `starter-server.ts` | §3 — third-party-call isolation |
| Bulkheaded cron + `unhandledRejection` guard | `starter-server.ts` | §4 — background-work isolation |
| `Toast` / `EmptyState` | `src/components/` | §2 — graceful degradation surfaces |

---

## §7 — Enforcement

| Where | Gate |
|-------|------|
| **Phase 1 (Map)** | For each piece, answer the three SoC questions — the third with its §2–§4 runtime obligation, not just "it's a separate file." |
| **Phase 2 (Issue)** | "Identify what could break" must name the failure boundary: which `ErrorBoundary` catches a view crash, what the degraded mode is for each outbound call, how a job failure stays isolated. |
| **Brief (Phase 0)** | Integration Risks fallback + no-uncontrolled-third-party-on-critical-path. |
| **Spec / `/qa`** | A view-adding spec confirms the view is boundary-wrapped; a spec adding an outbound call confirms it's time-boxed (`api`/`callExternal`). Unhappy-path walk in `docs/agent-verification.md` exercises the failure, not just the happy path. |

---

## Sources / background

- Bulkhead & circuit-breaker patterns (Nygard, *Release It!*; Microsoft Azure Architecture Center) · [Bulkhead](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead) · [Circuit Breaker](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker)
- Graceful degradation / fault tolerance · [Google SRE Book — Handling Overload](https://sre.google/sre-book/handling-overload/)
- React/Preact error boundaries · [Preact docs](https://preactjs.com/) (class `getDerivedStateFromError` + `componentDidCatch`)
