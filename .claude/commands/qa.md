---
description: Verify the current app state against docs/agent-verification.md — browser walk, console/network, responsive render, typecheck/build/smoke — fix findings, report
---

Execute the Agent Verification Standard (`docs/agent-verification.md`) against the current state of this app. Read that file first — it is the law this command executes.

## 1. Scope the check

Determine what changed: `git status` + `git diff` (and `git diff HEAD~1` if the work is already committed). Classify:

- **UI or routes affected** → full five-check standard.
- **Backend-only** → server-log check, typecheck/build/smoke, and direct exercise of every changed route.

List the affected views/routes explicitly before checking anything — that list is your coverage contract for this run.

## 2. Detect dev server commands

Read `package.json` scripts. Template defaults (adjust ONLY if this repo's scripts differ — downstream apps: if your dev commands or ports differ from these template defaults, update this section in your repo's copy):

| What | Command | Port |
|------|---------|------|
| Hono API | `npm run dev` | `3000` (or `PORT` in `.env`) |
| Vite SPA dev server | `npm run dev:client` | `5173` (proxies `/api/*` to the API) |
| Smoke tests | `npm run smoke` | hits `/health` on the API port |

Check whether the servers are already running (`/health` on the API port; HTTP 200 on the Vite port). Start whichever is missing as a background task and confirm it's up before proceeding.

**Confirm you're about to drive the REAL app, not a mockup** (see `docs/agent-verification.md` → *Verify the real app*): the URL you walk must be served by the Vite dev server or the Hono server — never a `file://` path, an `*.dc.html`, or anything under `docs/prototype/` / `docs/mockups/`. If `server/` or `supabase/` doesn't exist, the app isn't built — stop and say so rather than verifying a design export.

## 3. Walk the affected views (UI/routes only)

Using your browser tooling, for **every** affected view:

- **Happy path**: do what the feature is for, end to end — click the buttons, submit the forms, confirm the result renders/persists.
- **Unhappy paths**: invalid input, empty data state, failed request (kill or mock the API call if needed), unauthorized access where auth applies. Confirm each shows the intended user-facing handling (Toast / EmptyState / fallback — see `CLAUDE.md` → Defensive Defaults), never a blank screen or raw error.

## 4. Console + network

While walking: read console messages and network requests for each view.

- **Zero console errors.** Warnings: note them; escalate only if they indicate a real defect.
- **Zero failed network requests** (4xx/5xx that the flow didn't intend, CORS failures, aborted fetches).

## 5. Render check — 375px and 1440px

Resize the viewport to **375px** wide, walk the affected views, then repeat at **1440px**. At each width check:

- No horizontal overflow (`document.documentElement.scrollWidth <= window.innerWidth`, plus visual scan).
- No orphan words in headings/labels, no wrapped button labels.
- No element whose computed text color is under **4.5:1 contrast** against its computed background. Check via page JS: for each visible text element, walk up the DOM to find the effective `background-color` (first non-transparent ancestor), compute WCAG relative luminance for it and the element's `color`, and flag ratios `< 4.5`. Report each flagged element with its selector, colors, and ratio.

## 6. Mechanical gates

Run all three; all must pass:

```
npm run typecheck
npm run build
npm run smoke   # API server must be running
```

## 7. Fix and re-verify

Every finding gets fixed and its checks re-run before you present anything. The only findings that survive into the report unfixed are genuine judgment calls or missing decisions — flag those explicitly.

## 8. Report

End with a verification report:

- **Scope**: views/routes checked, classification (UI vs backend-only)
- **Each check**: PASS / FAIL→FIXED (what was found, what the fix was) / FLAGGED (judgment call for the human)
- **Verdict**: clean or not. Only a clean run permits moving the roadmap entry's `**Status**` to `[human-verify]` (per `docs/agent-verification.md`).
