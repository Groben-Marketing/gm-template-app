---
description: Work a GitHub issue end-to-end inside repo law — protocol pickup, milestone check, dev branch, implement, /qa, changelog, roadmap, PR, issue comment
argument-hint: <issue-number>
---

Work issue **#$ARGUMENTS** through the full loop, inside existing law. `PROJECT_PROTOCOL.md`, `docs/branching.md`, `docs/ai-collaboration.md`, and `docs/agent-verification.md` all bind every step below — this command sequences them, it does not replace them.

## 1. Pickup (per PROJECT_PROTOCOL.md)

Run the protocol's pickup sequence. **The issue body is your scope. No issue, no scope** — if `gh issue view $ARGUMENTS` fails or the issue is closed, stop.

1. `gh issue view $ARGUMENTS` — read the full body and comments
2. `git log --oneline -10` and `git diff HEAD~1`
3. `gh issue list --state open --limit 10`
4. `CLAUDE.md`, `docs/overview.md`, `docs/decisions.md`
5. The roadmap entry this issue maps to — its `**Status**` and `**Pass Count**`

## 2. Scope gate

Confirm the issue maps to an **approved milestone** (`docs/milestones.md`) and/or an existing `docs/roadmap.md` entry. If it maps to neither, **stop and flag** — comment on the issue that it needs a milestone/roadmap home per PROJECT_PROTOCOL.md Phase 0.5, and end there. Do not invent scope.

If the issue lacks Implementation Brief details (Files / Pattern / Data / Behavior / Do NOT), label it `needs-spec` and stop — do not guess.

## 3. Branch (per docs/branching.md)

Work happens on the repo's dev branch (`dev/<shortname>`) or a `feature/`/`fix/` branch off it — **never `main`**. `git pull` first. If you're on `main`, switch before touching anything.

## 4. Implement

Execute the roadmap entry's **Implementation Brief** exactly — files, pattern, data, behavior, Do NOT guard rails. Decisions the brief doesn't cover are not yours to make: stop, comment on the issue, hand off per `docs/ai-collaboration.md`.

## 5. Verify

Run `/qa`. Fix every finding and re-verify until clean (per `docs/agent-verification.md`, a dirty run cannot advance the pipeline).

## 6. Changelog (Release Gate)

Update `CHANGELOG.md` → `[Unreleased]` describing the shipped behavior in plain language — or explicitly classify the change as non-user-facing / `no-changelog-needed` in the PR. Work is not done without this.

## 7. Roadmap

Update the roadmap entry's `**Status**` (e.g., `[haiku]` → `[sonnet-review]`, or → `[human-verify]` after a clean reviewing-agent `/qa`) and `**Pass Count**`.

## 8. Commit + push (per Wrapping Up rules)

Commit message tells the next model what shipped, what's left, and any blocker — readable cold from `git log -5`. Push the branch.

## 9. Pull request

Open a PR with `.github/PULL_REQUEST_TEMPLATE.md` **fully filled**: Summary, Milestone reference, Changelog checkbox, Test plan (include the `/qa` report verdict), and `Closes #$ARGUMENTS`.

## 10. Close the loop

Comment a summary on issue #$ARGUMENTS: what shipped, the PR link, the `/qa` verdict, and anything left for Human Verify (judgment items only).
