# Agent Verification Standard

> Read this before setting any roadmap entry's `**Status**` to `[human-verify]`. Synced to downstream repos — this is template law, level 2 of the rule hierarchy (see `docs/r7c-standards.md`).

---

## The Core Rule

> **An agent may not set Status to `[human-verify]` until it has verified its own work in a browser.**

Not "until typecheck passes." Not "until the code looks right." Until the agent has loaded the app, walked the affected views the way a user would, and watched its own change work.

This standard inserts an **agent verification step** into the `docs/ai-collaboration.md` pipeline. Human Verify remains in the pipeline — but only for **judgment calls**: copy quality, design taste, business-logic correctness. Never for mechanical defects an agent can detect. A console error, an overflowing layout, a failing route, an unreadable contrast ratio — if a human finds one of those, the agent pipeline failed.

The `/qa` command (`.claude/commands/qa.md`) executes this standard. Run it; don't reimplement it ad hoc.

---

## Required Checks — UI or Route Changes

After **any change affecting UI or routes**, all five:

1. **Walk every affected view as a user.** Dev server running; exercise the happy path AND the unhappy paths (bad input, empty data, failed request, unauthorized access). Click the buttons. Submit the forms. Don't just load the page.
2. **Zero console errors, zero failed network requests.** Open the console and the network panel while walking the views. Warnings get judgment; errors and failed requests get fixed.
3. **Render check at 375px and 1440px.** At both widths: no horizontal overflow, no orphan words in headings or labels, no wrapped button labels, and no element whose computed text color is under **4.5:1 contrast** against its computed background.
4. **`npm run typecheck`, `npm run build`, `npm run smoke` all pass.**
5. **Anything found gets fixed and re-verified before presenting.** A finding is not a report item — it's a work item. Fix it, then re-run the checks it touched. Only unresolvable findings (genuine judgment calls, missing decisions) get surfaced instead of fixed.

## Required Checks — Backend-Only Changes

For changes with no UI surface:

- Item 2, applied to **server logs** — zero errors/stack traces while exercising the change.
- Item 4 — `typecheck`, `build`, `smoke` all pass.
- **Exercise every changed route** directly (curl/fetch): happy path, invalid input, auth failure where applicable. Confirm response shapes and status codes match the spec.
- Item 5 — fix and re-verify before presenting.

---

## Where This Sits in the Pipeline

```
Haiku implements → Haiku runs /qa → Sonnet reviews → Sonnet runs /qa → Human verifies (judgment only) → Done
```

- **The implementing agent** runs `/qa` before handing off — `[haiku]` → `[sonnet-review]` requires a clean run.
- **The reviewing agent** runs `/qa` before handing to the human — `[sonnet-review]` → `[human-verify]` requires a clean run.
- **The human** verifies only the roadmap entry's *Human Verify (judgment only)* items.

The roadmap entry's *Agent Verify (binary, automated)* section is this standard's checks plus feature-specific assertions — see `docs/roadmap.md` for the format and `docs/spec-writing-guide.md` for how to write the assertions.

## Relationship to `scripts/verify.sh`

`scripts/verify.sh` is the mechanical floor (typecheck + build + smoke), registered as a Stop hook in `.claude/settings.json` so a session cannot end while those checks fail. It is **not** a substitute for this standard — the browser walk, console/network check, and render check only happen through `/qa`.
