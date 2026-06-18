# Project Protocol

> "It's all in the reflexes."

## Purpose

This document governs how every coding agent operates on this repo. Read it first. Follow it always.

Work on this repo is anchored to **GitHub issues**. The current issue body (and any dispatch packet it references) is the agent's scope. Ecosystem-level coordination across R7C repos lives on a shared planning surface (issues + milestones + a GitHub Projects board on the org) — that's where work is triaged, picked up, and tracked. Don't pick up work that isn't tracked there.

---

## Standards Inheritance

This repo inherits ecosystem-wide rules from **`r7c-context/standards/`**. Those standards are the source of truth — this protocol is the default repo implementation of them, and apps built from this template inherit both.

**Rule hierarchy** (highest authority first):
1. `r7c-context/standards/*` — ecosystem law (covers all coding agents and all R7C repos)
2. `repo-template/*` — default repo implementation (this protocol, the docs, the file structure)
3. Repo-local files — app-specific context and explicitly documented exceptions

A repo-local file may add context but must not silently override an ecosystem standard. See `docs/r7c-standards.md` for the standards index, what this template implements, and the auditable list of current divergences.

The protocol below operationalizes (in particular):
- `agent-operating-standard.md` — boot, phase gates, scope discipline, changelog release gate
- `scope-governance-standard.md` — Phase 0 (Brief) and Phase 0.5 (Milestones) gates
- `repo-compliance-standard.md` — required files
- `local-first-development.md` — develop locally, deploy intentionally

---

## Picking Up Work

Before touching code, read the following in this order:

1. `PROJECT_PROTOCOL.md` (this file)
2. **The issue you're picking up** — its body is your scope. If you don't have an issue, you don't have scope.
3. `git log --oneline -10` — recent history
4. `git diff HEAD~1` — last committed change
5. `gh issue list --state open --limit 10` — what else is in flight, what's blocked, what's been filed recently
6. `CLAUDE.md` — app-specific context, schema, APIs, migration status
7. `docs/overview.md` — what this app is and why it exists
8. `docs/project-brief.md` — Phase Zero artifact. Confirms scope, boundaries, and isolation tests are locked. **If not approved, you are in Phase 0 — see Phase Gates below.**
9. `docs/milestones.md` — current milestone in flight. Maps brief scope to roadmap entries.
10. `docs/decisions.md` — lessons learned, problems solved, things that don't work
11. `docs/roadmap.md` — current feature in progress (status field tells you the pipeline stage and pass count)

**When migrating an app**, also read:
12. `docs/migration-checklist.md` — step-by-step process
13. `docs/migration-waves.md` — wave order, dependencies, blockers

State that lets a fresh agent pick up cold lives in `git log`, open GitHub issues, and the roadmap entry's `**Status**` / `**Pass Count**` fields — there is no separate handoff file.

> Multiple models may be running concurrently in separate terminals on the same branch. See `docs/ai-collaboration.md` for the full pipeline.

---

## Phase Gates

Every task moves through these phases. Do not skip phases. Do not advance without sign-off.

> **Where the gate applies**: Phase 0 (Brief) and Phase 0.5 (Milestones) are required for **new repos** created from this template, and for **existing repos starting new major scope** — a v2.0, a new milestone, a product pivot. They are *not* required retroactively for repos already past v0.1 with established roadmap entries.
>
> Once a brief and at least one milestone exist and are approved, day-to-day feature work proceeds through Phase 1 → 2 → 3 as before. The brief gate is for product-level decisions, not every commit.

### Phase 0: Brief

The Phase Zero gate exists to prevent agents from jumping into roadmap entries, GitHub issues, or code before the product, constraints, boundaries, architecture sketch, and smallest useful version are locked.

**Until `docs/project-brief.md` is approved (Status checkbox checked, dated, signed), no agent may**:

- Add or modify entries in `docs/roadmap.md`
- File or modify GitHub issues for the project
- Write or modify any source code
- Make architecture decisions outside `docs/project-brief.md`

**For new repos** created from this template:

1. Read the `docs/project-brief.md` template fields.
2. Fill it in via Phase 0 conversation with the owner — every field, every section.
3. Resolve every "Open questions" item. Unresolved questions either get answers or move to *Boundaries — OUT of scope* with a deferral reason.
4. Owner reviews; checks the **Approved** box with date and name.
5. Only then proceed to Phase 0.5.

**Two hard gates block Phase 0 approval** (in addition to the "every field filled, every question resolved" rule). Both are recorded in `docs/project-brief.md`; the rationale and definitions live in `docs/self-evident-ui.md`:

- **(a) Core loop in one sentence.** The brief's *Core loop* field must state, in exactly one sentence, the primary repeating cycle the main user performs to get the app's value. A blank, multi-sentence, or non-cyclic core loop blocks approval. This exists because the recurring failure across apps is a UI whose information architecture doesn't mirror the core loop — you cannot align to a loop you never wrote down.
- **(b) The "one app or two?" test.** The brief's *One app or two?* field must record the outcome of this test: if the product has more than one core loop (two independent cycles, different primary users, or different value), **flag it and ask the owner whether it should be split into a separate app.** Do not silently build one app around two loops. The field is answered when the owner confirms either "one loop, one app" or an explicit decision to keep/split.

Until both fields are filled and the second is owner-confirmed, the brief cannot be approved.

**For existing repos taking on new major scope** (v2.0, new milestone, pivot):

1. Branch the brief: `docs/project-brief-vN.md` (e.g., `docs/project-brief-v2.md`).
2. Same gate — fill, review, approve.
3. The original `docs/project-brief.md` stays as the historical record of the prior approved scope.

**Sign-off phrase**: "Brief is approved."

### Phase 0.5: Milestones

After brief approval, before any roadmap entries are written:

- Group brief scope into milestones in `docs/milestones.md`.
- Each milestone references the brief scope item(s) it fulfills.
- Each milestone's done criteria reference brief boundary contracts, isolation tests, and integration risks for the components it touches.
- Owner reviews and approves the milestone breakdown.

**Sign-off phrase**: "Milestones are approved."

### Phase 1: Map

- How does this fit into the existing architecture?
- What files, functions, or workflows does it touch?
- Can each piece function by itself, stand by itself, and fail by itself?

**Sign-off phrase**: "Map is clear."

### Phase 1.5: Wireframe

> Applies whenever the work introduces **new screens or materially changes a screen's layout/flow**. Pure backend, data, or refactor work skips this phase. Like Phase 0/0.5, it's a product-structure gate, not a per-commit ceremony.

Before any production UI is written, map every screen to its core-loop step in **lo-fi** — a sketch, ASCII block, markdown list of screens, or a wireframe tool. This is where UI-to-loop alignment (`docs/self-evident-ui.md` §2) is verified cheaply, before expensive production UI exists.

For each screen, the wireframe must state:

- **Which core-loop step it advances** (one step — see `docs/self-evident-ui.md` §1). A screen that maps to no loop step, or blends several, is caught and fixed here, not after it's built.
- **What the user does next** and how that next step is surfaced (ties to the Nav & Orientation Standard's `doNow` / `CountBadge`).
- **The empty state** — what teaches the user when there's no data yet.

If a screen can't be tied to a single loop step, either the screen is wrong or the core loop in the brief is wrong — resolve it before building.

**Sign-off phrase**: "Wireframes are aligned."

### Phase 2: Issue

- Write out the specific changes to be made.
- Identify what could break.
- If this feature introduces a new integration risk not in the brief's *Integration risks* table, the brief must be updated and re-approved before code starts.
- If anything on the critical path depends on a third-party API, flag it. No uncontrolled third-party APIs on the critical ingestion path.

**Sign-off phrase**: "Plan is approved."

### Phase 3: Execute

- Make the changes.
- Test before declaring done.
- If anything unexpected happens, stop and report before continuing.

**Sign-off phrase**: "Work is complete."

---

## Ownership Tags

Use these in conversation and in docs to clarify who does what:

- `[ME]` — Owner handles this
- `[CLAUDE]` — Claude Code handles this
- `[TOGETHER]` — Collaborative task, requires back-and-forth

---

## Separation of Concerns

Every component, module, or feature must answer YES to all three:

1. **Can it function by itself?**
2. **Can it stand by itself?** (no hidden dependencies)
3. **Can it fail by itself?** (failure doesn't cascade)

If the answer to any of these is NO, refactor before building further.

---

## Migration Work

> These rules apply when the current work is migrating an app from n8n to Hono (v1.x → v2.0).

### Before starting migration work

1. Read `CLAUDE.md` — the Migration Status section tells you the wave, current/target state, and what workflows to replace.
2. Read `docs/migration-checklist.md` — follow it step by step.
3. Read `docs/migration-waves.md` — understand blockers and dependencies for this wave.
4. Check that any blocking apps (listed in CLAUDE.md → "Blocked by") have already shipped their v2.0.

### Migration-specific constraints

- **One workflow at a time.** Migrate a single n8n workflow to a Hono route, test it end-to-end, then move to the next. Never migrate multiple workflows in parallel.
- **n8n stays running.** Do not stop, delete, or modify n8n workflows during migration. Only deactivate a workflow AFTER its Hono replacement is tested and verified in production.
- **Parallel testing.** During migration, both the old n8n route and the new Hono route may be live. The SPA switches to the Hono route when ready. Verify the new route before switching.
- **48-hour bake.** After all workflows for an app are migrated and verified, wait 48 hours of production monitoring before starting the next app.
- **Dev branch.** All migration work happens on `dev/v2.0`. Never commit migration changes directly to main.

### Migration phase gates

A migration to v2.0 is "new major scope" — Phase 0 (Brief) and Phase 0.5 (Milestones) apply via a branched brief (`docs/project-brief-v2.md`). The standard Phase 0–3 gates apply, with these migration-specific additions:

| Phase | Migration addition |
|-------|-------------------|
| Phase 0 (Brief) | Branch as `docs/project-brief-v2.md`. List all n8n workflows and their IDs. Audit git history for secrets. Boundary contracts must include the old n8n route and the new Hono route side by side during the parallel-testing window. |
| Phase 0.5 (Milestones) | One milestone per app or per workflow group, with done criteria including "old n8n workflow deactivated" and "48-hour bake passed". |
| Phase 1 (Map) | Map each n8n workflow to its Hono route equivalent. Document the mapping. |
| Phase 2 (Issue) | Write the route handler code. Identify what could break during switchover. |
| Phase 3 (Execute) | Migrate one workflow, test, switch SPA, verify, deactivate n8n workflow. Repeat. |

---

## Wrapping Up

Before stopping work:

1. Commit with a clear message that explains what shipped, what's left, and any blocker. Imagine the next model reading only `git log -5` — give it enough to pick up cold.
2. Update the roadmap entry's `**Status**` and `**Pass Count**` fields if the feature changed pipeline stage.
3. If escalating or handing off mid-feature, file or update a GitHub issue describing the exact blocker, what was tried, and what to try next.
4. Push to branch.

The next model — whether Haiku, Sonnet, or Opus — will read `git log`, the open issues, and the roadmap entry cold. Make those three sources sufficient.

---

## Rules

- Never modify files outside the current task scope without explicit approval.
- If you're about to make a change that touches more than 3 files, pause and confirm.
- When in doubt, ask. Don't guess.
- Write decisions and lessons learned to `docs/decisions.md` when we solve a hard problem.
- Never start work without reading the issue body, recent commits, and open issues first.
- Never stop work without a commit message that tells the next model what happened and what's next.

### Changelog Release Gate

From `r7c-context/standards/agent-operating-standard.md`:

- Every code change that will be merged or deployed must include a matching `CHANGELOG.md` update in the same branch or PR.
- Do not mark work as done, request a deploy, or confirm deploy readiness until the changelog entry exists — or the change is explicitly classified in the commit/PR as non-user-facing and no-changelog-needed.
- Changelog entries describe shipped behavior, fixes, migrations, infrastructure changes, and user-visible workflow changes in plain language.
- Never edit production changelog files directly. Production receives changelog updates only through the normal repo / build / deploy process.
