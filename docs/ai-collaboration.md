# AI Collaboration Framework

> Read this when picking up work. Governs how multiple AI models collaborate on this project without human handoff notes.

---

## Model Roster

| Model | Role | Terminal |
|-------|------|----------|
| Human + AI (any) | Roadmap planning, architecture decisions, feature spec writing | Cursor / Claude.ai / your tool |
| Claude Haiku | Full feature implementation — executes the entire feature spec | Terminal 1 |
| Claude Sonnet | Code review, fixes, iteration with human | Terminal 2 |
| Claude Opus | Escalation only — called when Sonnet cannot resolve | Terminal 3 |

**Spec-writing tools:** Use whatever gets the spec written well. Cursor + Sonnet works for most features. Opus is worth it for complex architecture. A human alone is fine for simple, well-understood work. The output — a complete, unambiguous feature spec in `docs/roadmap.md` — is what matters, not which tool produced it.

---

## Picking Up Work — Any Model

Run these in order before touching any code:

```bash
git pull origin $(git branch --show-current)
```

Then read in this order:

1. **The issue you're picking up** — its body is your scope. If you don't have an issue, you don't have scope.
2. `git log --oneline -10` — recent history. The most recent commit message is your briefing.
3. `git diff HEAD~1` — the last committed change in detail.
4. `gh issue list --state open --limit 10` — what else is in flight, what's blocked. The roadmap entry for the current feature is also linked from issues when escalation is open.
5. `docs/roadmap.md` — current feature's `**Status**` and `**Pass Count**` fields tell you the pipeline stage and how many Sonnet passes have run.
6. `CLAUDE.md` — app context (if not already read).
7. `docs/overview.md` — what this app is (if not already read).

**Do not start work until you understand what the previous model shipped and what the issue + roadmap say is next.**

---

## Wrapping Up — Any Model

Before you stop or pass to the next model:

1. Commit with a message clear enough that the next model can pick up from `git log -5` alone — what shipped, what's left, blocker if any.
2. Update the roadmap entry's `**Status**` and `**Pass Count**` fields if the feature moved through the pipeline.
3. If escalating, file or comment on a GitHub issue with the exact problem, error, and what was tried.
4. Push to branch.

The next model will not ask you what happened. It will read `git log`, the open issues, and the roadmap entry.

---

## The Pipeline

Think of this as a human dev team. Haiku is the junior developer who implements the full feature. Sonnet is the senior who reviews the PR and works with the human to get it to green. Opus is the architect you call when something is broken at a level the senior can't resolve alone.

### Normal Flow

```
Human (+ AI tool of choice) → write full feature spec (roadmap, 15 features planned ahead)
  ↓
Haiku → implements the ENTIRE feature in one pass (all tasks, all files)
  ↓
Haiku → commits with a clear message, pushes, updates roadmap entry status
  ↓
Sonnet → reviews full output, fixes what Haiku got wrong, iterates with human (max 5 passes)
  ↓
Human → verifies in browser
  ↓
Done → Haiku picks up next feature
```

**Choosing a spec-writing tool:**

| Situation | Recommended tool |
|-----------|-----------------|
| Standard feature, patterns already exist | Cursor + Sonnet (fast, cheap) |
| Complex architecture or cross-system design | Human + Opus (worth the cost) |
| Simple feature you can spec yourself | Human alone (fastest) |
| Unclear requirements that need exploration | Human + Sonnet in Cursor (iterative) |

**Haiku implements the whole feature.** The tasks listed under a feature are Haiku's internal checklist — not separate handoffs. Haiku does not hand off mid-feature unless it's genuinely stuck and cannot proceed without a decision.

**Sonnet does not re-implement.** Sonnet reviews, patches, and refines. If Sonnet finds itself rewriting large chunks from scratch, the feature spec was underspecified — flag it and fix the spec.

### Pass Rules (Sonnet Review Phase)

| Pass | Action |
|------|--------|
| 1–3 | Sonnet iterates independently, no human needed |
| 4 | Sonnet flags one specific question to human before continuing |
| 5 | If still unresolved → escalate to Opus, file an issue with the exact blocker |

Pass count is tracked in the roadmap entry's `**Pass Count**` field. Increment it on each commit during the Sonnet review phase.

### Escalation

When Sonnet hits pass 5:
1. Set the roadmap entry's `**Status**` to `[escalated]`.
2. File a GitHub issue with the exact problem, error, and what was tried. Link the roadmap entry. Label `escalation` or similar so it's findable.
3. Commit (message includes the issue number) and push.
4. Human opens Opus terminal — Opus reads `git log`, the open issues, and the roadmap entry, then picks up.

After Opus resolves (or decides it can't): human chooses to either ship the fix or defer the feature and move to the next item in the roadmap. Close the escalation issue with the resolution.

---

## Version Numbering

| Format | Meaning |
|--------|---------|
| `vX.Y.0` | Planned feature — goes through full Haiku → Sonnet → Human pipeline |
| `vX.Y.Z` (Z > 0) | Bug fix or small patch — may skip straight to Sonnet |

Roadmap should have 15 `vX.Y.0` features planned ahead at all times. Cursor + Sonnet keeps this list filled.

### Lead Assignment

Every roadmap feature gets a `**Lead**` tag. This tells which model owns the implementation.

| Tag | Model | Use for |
|-----|-------|---------|
| `[Haiku]` | Claude Haiku | New, isolated, self-contained features where scaffolding and patterns exist |
| `[Sonnet]` | Claude Sonnet | Existing file edits, multi-file integrations, wiring, code review, complex debugging |
| `[Opus]` | Claude Opus | Architectural decisions, cross-system design, when Sonnet is stuck |
| `[Me]` | Operator | Business decisions, design approvals, real-world testing, manual triggers |
| `[Together]` | Me + Sonnet | Diagnosis work, debugging requiring live system state + code changes together |

The Lead tag goes on every `vX.Y.0` entry in `docs/roadmap.md`. Bug fixes (`vX.Y.Z`, Z > 0) default to `[Sonnet]` unless noted otherwise.

---

## Haiku Rules

Haiku implements full features. The goal is to have Haiku do as much of the work as possible — that's the whole compute-saving point of this pipeline.

A feature spec is written well enough for Haiku when:

- **Every file is named explicitly** — `src/components/Foo.tsx`, not "the component"
- **Every pattern is referenced** — "follow the pattern in `src/components/Badge.tsx`", not "make it consistent"
- **Every output is described exactly** — what the user sees, what the API returns, what gets written to the DB
- **No architecture decisions are left open** — Haiku executes, it does not design. If a decision is unresolved, Cursor + Sonnet resolves it in the spec before Haiku touches code.

**When Haiku gets stuck**: if Haiku hits something that requires a judgment call not covered by the spec, it should stop, commit what it built so far with a clear message describing the blocker, file an issue with the exact question, and hand off to Sonnet. This is not a failure — it means the spec had a gap that Cursor + Sonnet needs to fill for next time.

A Haiku task that requires judgment is a poorly written spec, not a Haiku limitation.

---

## Roadmap Task Format (Haiku-Optimized)

Every `vX.Y.0` feature must be written so Haiku can implement the entire thing in one pass without needing to ask questions. That's the spec quality bar.

**Before writing a spec, read `docs/spec-writing-guide.md`.** It explains every field, shows good vs. bad examples using this stack, and has a pre-handoff checklist.

```markdown
### vX.Y.0 — Feature Name

**Lead**: `[Haiku]` / `[Sonnet]` / `[Opus]` / `[Me]` / `[Together]`
**Goal**: One sentence — what ships and what it enables for the user.
**Risk**: Low / Medium / High — reason
**Status**: `[pending]` → `[haiku]` → `[sonnet-review]` → `[human-verify]` → `[done]` / `[escalated]`
**Pass Count**: 0

#### Implementation Brief (for Haiku)
Everything Haiku needs. No ambiguity. No architecture decisions left open.

- **Files to create or modify**: list every file by path
- **Pattern to follow**: `path/to/existing/example.tsx` — [what to copy from it]
- **Data**: [what goes in, what comes out — field names, types, API response shape]
- **Behavior**: [exact UI behavior or API behavior, step by step]
- **Do NOT**: [anything Haiku might do wrong based on the pattern — guard rails]

#### Haiku Checklist
Internal checklist Haiku works through in one pass. Not separate handoffs.

- [ ] [Specific thing to build — file, function, or UI element]
- [ ] [Specific thing to build]
- [ ] [Specific thing to build]

#### Sonnet Review Checklist
What Sonnet checks after Haiku hands off. Sonnet fixes, does not rewrite.

- [ ] [Specific thing to verify]
- [ ] [Edge case or error path]
- [ ] Error handling: [what should happen when X fails]

#### Human Verify
Binary pass/fail. Works in browser or doesn't.

- [ ] [Action] → [Expected result]
- [ ] [Action] → [Expected result]
```

---

## Architecture Reference

Every project repo ships with the following docs. Haiku and Sonnet should reference these instead of inferring from code:

| File | Contains |
|------|---------|
| `CLAUDE.md` | App name, DB schema, API routes, auth flow, env URLs, known gotchas |
| `docs/overview.md` | What the app does and why |
| `docs/architecture-patterns.md` | Standard patterns — how components, API calls, and DB queries are written |
| `docs/decisions.md` | Decisions already made — don't revisit these |

If a pattern isn't in these docs, it hasn't been standardized. Escalate to Sonnet before Haiku invents something.

---

## Shared State Between Models

There is no per-repo handoff file. State that lets a fresh model pick up cold lives in three places, each with a clear job:

| Source | What it carries | Updated by |
|--------|-----------------|------------|
| GitHub issue (the one you're working) | Scope. What's being asked, acceptance criteria, dispatch packet if any. | When work is filed, refined, or escalated |
| `git log` | What shipped, what's left, what's blocked. The most recent commit message is the briefing for the next model. | Every commit |
| `docs/roadmap.md` entry | Pipeline stage (`**Status**`) and review iteration count (`**Pass Count**`) for the current feature | At each pipeline transition |

A model that needs to pick up cold reads the active issue, then `git log -10`, then `gh issue list --state open`, then the roadmap entry — in that order — and has everything it needs.

---

## Rules

- Never start work without reading the issue body, recent commits, and open issues first.
- Never stop work without a commit message that tells the next model what happened and what's next.
- Haiku does not make architecture decisions. If it needs to, stop and flag it.
- Sonnet does not escalate before pass 3 without a specific reason.
- Opus is not for normal work. If Opus is being used for routine tasks, something upstream broke down.
- The roadmap is the source of truth for what's next. Don't invent scope.
