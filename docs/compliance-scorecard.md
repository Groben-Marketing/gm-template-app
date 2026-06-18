# Compliance Scorecard

> Shared standard across all R7/Wayfinder apps. Synced from the template.
>
> **What this governs:** that "are the apps actually getting better" is **measured, not asserted.** The scorecard is the observable signal behind the Cheetah audit — it turns the v1.7.0 standards (self-evident-ui, efficiency, fault-isolation) into a per-repo PASS/WARN/FAIL/REVIEW report you can re-run and diff over time.

It is a **reporting** instrument, not a gate. It never blocks a build, never edits code, never fails CI — that's the deliberate trade behind the "process + audit, no mechanical teeth" enforcement choice. Its job is visibility: run it, see where a repo stands, file the gaps as work.

---

## The instrument

`scripts/compliance-scan.sh` — a read-only bash scan of one repo. Run it in the repo, or point it at a checkout:

```
bash scripts/compliance-scan.sh            # current repo
bash scripts/compliance-scan.sh /path/repo # a checkout elsewhere
```

It prints four sections (Rules Adoption, Fault Isolation, Efficiency, Self-Evident UI) and a summary line.

## Auto-graded vs. REVIEW — the honesty rule

The scan **only auto-grades high-confidence mechanical signals.** Anything that needs judgment is printed as a `[REVIEW]` prompt for a human/Cheetah — the script does not pretend to grade it, because **a false PASS is worse than no score** (it would let the scorecard lie about "better").

| Section | Auto-graded (mechanical) | REVIEW (human judgment) |
|---------|--------------------------|--------------------------|
| **Rules adoption** | `PROJECT_PROTOCOL.md` is v1.7.0+ (has Phase 1.5); the three standard docs are present | — |
| **Fault isolation** | `ErrorBoundary.tsx` present + wired; `api.ts` time-boxed; server outbound calls guarded | Is the degraded mode actually sensible per integration? |
| **Efficiency** | — | `select('*')` occurrences (is it on a growing table?); absence of `.limit()` (any unbounded lists?) |
| **Self-evident UI** | Brief Core-loop field filled vs. still-placeholder | Is the core loop one *honest* sentence? Do screens map to its steps? Did "one app or two?" get a real answer? |

The REVIEW rows are the point, not a weakness: the highest-leverage items (is the core loop honest? is this query a time bomb?) are judgment calls, and the scorecard surfaces them for a person instead of faking a grade.

## How it plugs into the rollout

1. **Baseline** — run the scan on each repo at the start of its Phase 2 adoption. The FAILs/WARNs are the adoption issue's checklist.
2. **Confirm** — re-run after adoption. Every mechanical FAIL should be PASS; the REVIEW rows get a human sign-off recorded on the issue.
3. **Audit cadence** — Cheetah runs the scan (or has a coding agent run it) per repo on a recurring audit and posts the summary to the umbrella tracking issue. A repo's row in that issue is its latest scorecard summary — that's the ecosystem-wide "are we getting better" view.
4. **Drift** — a PASS that later flips to WARN/FAIL on a re-scan is drift; it becomes a new audit issue.

## What it deliberately does NOT do

- It does not block builds or PRs (no mechanical teeth — by design).
- It does not catch everything: it checks signals, not correctness. A repo can be all-PASS and still have a subtle N+1 or a dishonest core loop — that's what the REVIEW rows and human audit are for.
- It does not grade judgment items. If you want a number for those, a human assigns it; the script won't.

---

## Related

- `docs/self-evident-ui.md`, `docs/efficiency-standard.md`, `docs/fault-isolation-standard.md` — the standards being scored.
- `docs/agent-verification.md` / `.claude/commands/qa.md` — per-change self-verification (the scorecard is per-*repo*, `/qa` is per-*change*).
- `PROJECT_PROTOCOL.md` — the phase gates the scorecard reports adoption of.
