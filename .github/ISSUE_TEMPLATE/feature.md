---
name: Feature
about: Implementation-ready feature spec — the roadmap entry format, as an issue
title: ''
labels: ''
assignees: ''
---

> **An issue missing Implementation Brief details gets labeled `needs-spec`, not guessed at.**
> Agents do not invent files, schema, or behavior. Read `docs/spec-writing-guide.md` before filling this in — every field below has a quality bar.

## Goal

<!-- One sentence — what ships and what it enables for the user. -->

## Milestone

<!-- Per PROJECT_PROTOCOL.md Phase 0.5: every feature belongs to an approved milestone. -->

Milestone: `M_` — see `docs/milestones.md`
Roadmap entry: `vX.Y.0` — see `docs/roadmap.md`

## Implementation Brief

<!-- Everything the implementing agent needs. No ambiguity. No architecture decisions left open. -->

- **Files**: <!-- every file by full path; say explicitly which are created vs modified -->
- **Pattern**: <!-- path to the existing file to copy, and what specifically to copy from it -->
- **Data**: <!-- table + column names and types, enum values, API response shapes, direct-Supabase vs Hono -->
- **Behavior**: <!-- step-by-step: what renders, what the API returns, what saves — every state: loading, success, error, empty -->
- **Do NOT**: <!-- guard rails — the most likely wrong turns for this specific feature -->

## Agent Verify (binary, automated)

<!-- Populated from docs/agent-verification.md checks + feature-specific assertions.
     The implementing and reviewing agents each run /qa against this list. -->

- [ ] `/qa` clean: affected views walked (happy + unhappy paths), zero console errors, zero failed requests, 375px/1440px render + contrast pass, `typecheck` + `build` + `smoke` green
- [ ] <!-- feature-specific assertion, e.g. "POST /api/items with missing name → 400 with error body" -->
- [ ] <!-- feature-specific assertion -->

## Human Verify (judgment only)

<!-- Copy quality, design taste, business-logic correctness — never mechanical defects an agent can detect. -->

- [ ] <!-- judgment call → what good looks like -->
