# Project Brief

> **Phase Zero artifact.** Cannot proceed to milestones, roadmap entries, GitHub issues, or any code until this brief is approved by the owner.
>
> The brief exists to lock the product, constraints, boundaries, architecture sketch, and smallest useful version *before* implementation planning starts. Without it, agents jump from a vague product idea into roadmaps and code, which is how scope creeps, assumptions go wrong, and systems get overbuilt.

---

## Status

- [ ] Drafted
- [ ] Reviewed by owner
- [ ] **Approved** — date: `YYYY-MM-DD`, by: `[NAME]`

The brief is approved when every field is filled, every "Open questions" item is resolved, **the *Core loop* field holds exactly one sentence, the *One app or two?* test is owner-confirmed**, and the owner has checked the **Approved** box with a date and their name. Until then, no roadmap entries, no issues, no code. (See `PROJECT_PROTOCOL.md` → Phase 0 hard gates and `docs/self-evident-ui.md`.)

---

## Product

**One-liner**: [What this is, in one sentence.]

**Who uses it**: [The actual humans. Roles, not personas.]

**What problem it solves**: [The failure mode it prevents or the capability it adds. Be specific — "saves time" is not a problem statement.]

**Why now**: [The constraint or opportunity that makes this the right thing to build at this moment, not next quarter.]

---

## Core loop

> **Phase 0 hard gate.** Exactly one sentence. The brief cannot be approved without it. See `docs/self-evident-ui.md` §1.

The primary repeating cycle the main user performs to get this app's value — the verbs that feed back into each other. Write it as:

> *"The [user role] [does X] → [does Y] → [does Z], and repeats."*

**Core loop**: [One sentence. Name the real human by role. Must be a cycle, not a one-time setup task. If it takes two sentences, you may have two loops — run the test below.]

## One app or two?

> **Phase 0 hard gate.** Must be owner-confirmed. See `docs/self-evident-ui.md` §3.

Does this product have exactly one core loop, or more than one? If a second independent cycle appears (different primary user, different value, doesn't feed back into the loop above), flag it and decide with the owner whether it belongs in a separate app.

**Outcome** (owner-confirmed): [ `One loop, one app` | `Two+ loops — decided to keep as one because: [reason]` | `Two+ loops — splitting [the second loop] into a separate app` ]

---

## Constraints

| Type | Constraint |
|------|------------|
| Technical | [Stack constraints from this template, anything else fixed — e.g., "must run on existing Caddy/Docker host"] |
| Business | [Budget, ecosystem dependencies, regulatory] |
| Time | [Target ship date for v1.0 if applicable, hard deadlines] |

---

## Boundaries — IN scope

Specific capabilities. Each item is something a user can do or a system can do. If you can't write it as "the user/system does X", it doesn't belong here.

- [Capability]
- [Capability]
- [Capability]

## Boundaries — OUT of scope

Equally important. The "not this version" list. Each item should be something a reasonable observer might expect to be in scope but won't be. Include the deferral reason.

- [Excluded capability] — Deferred because: [reason]
- [Excluded capability] — Deferred because: [reason]

---

## Architecture sketch

High level only. Components, how they connect, where data flows. Detailed design lives in `CLAUDE.md` and `docs/architecture-patterns.md` — not here.

```
[Component A]  →  [Component B]  →  [Component C]
                       ↓
                 [External service]
```

[1–2 paragraphs of plain-language description. What does each component do, how do they talk to each other, where does state live.]

---

## Smallest useful version (v0.1 cut)

The minimal feature set that creates value for **one real user**. This becomes the first milestone in `docs/milestones.md`.

If the v0.1 cut still has 8 features in it, it's not the smallest useful version. Cut harder.

- [Feature]
- [Feature]

---

## Boundary contracts

For each component named in the architecture sketch, the explicit interface it exposes and what it depends on. Writing these down before code exists prevents downstream "the component does X" arguments.

| Component | Exposes (inputs / outputs) | Depends on |
|-----------|----------------------------|------------|
| [name] | [interface contract — request/response shape, event payloads, public functions] | [other components / external services / DB tables] |
| [name] | [...] | [...] |

---

## Integration risks

External APIs, webhooks, DB schemas, upstream/downstream apps in the ecosystem this app touches. For each: what could break, what the fallback is.

| Integration | Risk (what fails) | Fallback |
|-------------|-------------------|----------|
| [name] | [the failure mode] | [degraded mode, manual workaround, or "stop the world"] |

If any row's fallback is "stop the world", flag it explicitly — that's a critical-path third-party dependency and may need to be reconsidered.

---

## Isolation test plan

How each component is verified to work alone, before integration. This operationalizes the Separation of Concerns rule (function / stand / fail by itself) — without an isolation test plan, that rule is aspirational.

| Component | Isolation test |
|-----------|----------------|
| [name] | [the thing you can do that proves this component works without the others — e.g., "POST to /api/items with the service-role key returns the new row, with the SPA disconnected"] |
| [name] | [...] |

---

## Open questions

Ambiguities that must be resolved before this brief can be approved. The brief **cannot** be marked approved with any unchecked questions remaining. If a question can't be resolved, the answer goes in *Boundaries — OUT of scope* with a deferral reason.

- [ ] [Question]
- [ ] [Question]
