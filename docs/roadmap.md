# Roadmap

> Last updated: YYYY-MM-DD
> Current version: `v0.1.0`
>
> **This file contains only approved, implementation-ready features.**
> New ideas, scope expansion, and product-level decisions go to `docs/project-brief.md` → `docs/milestones.md` first. Phase 0 in `PROJECT_PROTOCOL.md` prohibits adding entries here until the brief is approved and the feature belongs to an approved milestone.
>
> Each `vX.Y.0` entry below must reference a milestone (`M1`, `M2`, ...) defined in `docs/milestones.md`.

---

## Up Next

Versioned features queued for development, in priority order. Keep 15 features planned ahead.
See `docs/ai-collaboration.md` for the Haiku → Sonnet → Human pipeline these feed into.

---

### vX.Y.0 — [Feature Name]

**Milestone**: `M1` (see `docs/milestones.md`)
**Lead**: `[Haiku]` / `[Sonnet]` / `[Opus]` / `[Me]` / `[Together]`
**Goal**: [One sentence — what ships and what it enables for the user]
**Risk**: Low / Medium / High — [reason]
**Status**: `[pending]`
**Pass Count**: 0

#### Implementation Brief
*Haiku implements the entire feature in one pass. All decisions must be resolved here before Haiku starts.*

- **Files**: `src/path/to/file.tsx`, `src/lib/api.ts`
- **Pattern**: follow `src/components/Example.tsx` — [what specifically to copy]
- **Data**: [field names, API response shape, DB columns touched]
- **Behavior**: [step-by-step — what renders, what API returns, what saves]
- **Do NOT**: [guard rails — common wrong turns based on the patterns]

#### Haiku Checklist
*Haiku works through this list in one pass — these are not separate handoffs.*

- [ ] [Thing to build]
- [ ] [Thing to build]
- [ ] [Thing to build]

#### Sonnet Review Checklist
*Sonnet patches and refines — does not rewrite. If rewriting, the brief was underspecified.*

- [ ] [Specific thing to verify]
- [ ] [Edge case to test]
- [ ] Error handling: [what happens when X fails]

#### Human Verify
- [ ] [Action in browser] → [expected result]
- [ ] [Action in browser] → [expected result]

---

### vX.Z.0 — [Feature Name]

**Milestone**: `M1` (see `docs/milestones.md`)
**Lead**: `[Haiku]`
**Goal**: [One sentence]
**Risk**: Low / Medium / High — [reason]
**Status**: `[pending]`
**Pass Count**: 0

#### Implementation Brief
- **Files**: `src/path/to/file.tsx`
- **Pattern**: follow `src/components/Example.tsx`
- **Behavior**: [exact behavior]
- **Do NOT**: [guard rail]

#### Haiku Checklist
- [ ] [Thing to build]

#### Sonnet Review Checklist
- [ ] [Check]

#### Human Verify
- [ ] [Action] → [result]

---

## Bug Fixes

Known bugs to investigate and fix. Use `vX.Y.Z` (Z > 0) versioning. These typically go straight to Sonnet — skip Haiku unless it's a clear code change.

- `vX.Y.1` — [Description of bug, how to reproduce, impact]

### Standard: Bug Report Button Placement
All apps must follow the LoopBack pattern: version text on left, "Report a Bug" text link on right. Placed in the app's footer area (sidebar footer for desktop-first apps, bottom tab bar footer for mobile-first apps). No floating FAB buttons. Modal must be closeable on mobile (explicit close button + backdrop tap).

---

## Unsolved

Problems without a clear solution yet. Describe the problem, not a feature spec. Include possible angles if any.

- **[Problem]** — [Context. What's broken or unclear. Possible angles: ...]

---

## Backlog

Lower-priority items not yet scheduled into a version.

- [Feature or idea] `[Me]`
- [Feature or idea] `[Haiku]`
- [Feature or idea] `[Sonnet]`
- [Feature or idea] `[Together]`

---

## Completed

Shipped versions, newest first.

### v0.1.0 — [Version Name] (YYYY-MM-DD)

- [x] [What shipped]
- [x] [What shipped]
