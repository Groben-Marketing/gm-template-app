# Role-Based Cognitive Scoping — Doctrine

> **Template-level doctrine.** This is the canonical copy, propagated to R7C app repos via `.github/sync-config.json`. Pairs with `docs/discovery-principles.md` (mechanism #2); security enforcement mechanics live in `docs/architecture-patterns.md`. App-specific role maps live in each app's `docs/project-brief.md`, never here.
>
> Example roles below (e.g., the field marketer) are illustrative only — swap in your app's roles; keep the doctrine.

---

## The principle

**Each role sees only their slice.** Not "everything they're allowed to see" — only **what they need to act.** A role's screen is scoped to the decisions that role owns, and everything else is hidden by default, even when the role technically has permission to view it.

This is the design answer to the core tension in every operations app:

> The system needs *more* detail than the old tool — to compute each person's next action and to drive automation. But more detail in front of a human is information overload. **Cognitive scoping resolves the contradiction: the system holds all the detail; each human sees only the sliver that bears on their next move.**

Without this, "capture more structured data" silently becomes "rebuild information overload in a new skin." Cognitive scoping is what lets an app be *highly detailed* and *trainable in weeks* at the same time — the two goals that otherwise pull against each other.

---

## Scoping is not security

These are two different axes, and conflating them is the most common mistake.

| | **Security (RLS / authz)** | **Cognitive scoping** |
|---|---|---|
| Question | *May this role see this?* | *Does this role need to see this to act?* |
| Enforced by | Row-level security, route guards — server-side, non-negotiable | UI/view composition — what's surfaced, defaulted, and de-emphasized |
| Failure mode | Data leak | Overload, slow training, abandonment |
| Example | A field marketer cannot read another FM's payouts | A field marketer *can* see job financials but the UI never shows them — irrelevant to their job |

A role can be *permitted* to see something (security says yes) and still *never be shown it by default* (scoping says hide). Build both. Security is the floor; scoping is the experience.

The security floor itself — RLS vs. service-role routes, auth middleware, when the SPA talks to Supabase directly vs. through Hono — is defined in `docs/architecture-patterns.md`. Cognitive scoping is composed in the view layer above that floor and is never a substitute for it.

---

## How to scope a role

For each role, answer four questions — these become the role's view spec:

1. **The one screen they live in.** Most roles have a single home surface (a queue, a dashboard, a list). Name it. If a role needs to bounce between three screens to do their job, the scoping is wrong.
2. **What they see there** — the minimum fields/records to make their next decision.
3. **What's hidden** — present in the system, relevant to others, deliberately not shown to this role.
4. **What pulls them in** — the events/notifications that route work *to* them, so they don't go hunting.

Default to hiding. Add a field to a role's view only when that role demonstrably needs it to act. The burden of proof is on inclusion, not exclusion.

### Scoping reduces toward the queue
The strongest version of cognitive scoping for an operator role is the **focus queue** (see `discovery-principles.md`): the system pre-selects the next item and frames the decision, so the role isn't even choosing what to look at. A well-scoped operator role tends toward "answer the question in front of you, advance" rather than "browse a screen and figure out what to do."

---

## The admin "view-as" toggle (required capability)

Every app implementing this doctrine ships an admin ability to **view as any role** — render the app exactly as that role sees it.

This is not a convenience; it earns its place three times over:

- **QA / design** — the only way to verify scoping. Did we over-scope (this role can't reach something they need) or under-scope (we're showing them noise)? You cannot review a role's experience you cannot see.
- **Support** — the owner/admin debugging *"I can't find X"* by looking at the user's actual screen, instead of guessing.
- **Training** — showing a new hire their world, and only their world, without exposing the rest of the operation.

Implementation notes:
- It is a *rendering* switch, not a privilege escalation: viewing-as never grants the admin write access the target role wouldn't have, and every use is logged.
- Build it alongside the role views, not after. If you can't view-as, you can't QA the scoping, which means you can't trust it.

---

## Acceptance checks

A role's scoping is right when:

- [ ] The role has one clear home screen, and can complete its core loop without leaving it.
- [ ] Every field shown passes the test *"this role needs this to make a decision they own."*
- [ ] Work routes *to* the role (queue/notification); the role doesn't hunt for it.
- [ ] An admin can view-as the role and sees exactly what the role sees.
- [ ] Removing the role's view from the app would block that role's job — and removing any *other* role's view would not. (Slices are disjoint where they should be.)
- [ ] A new hire in that role can be trained on that one screen in the target onboarding window.
