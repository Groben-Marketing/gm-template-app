# Discovery Principles — Speccing Operations Software

> **Template-level doctrine.** This is the canonical copy, propagated to R7C app repos via `.github/sync-config.json`. It captures *how we discover and spec* an operations app — the durable principles, not one app's answers. App-specific findings live in each app's `docs/project-brief.md` and discovery map, never here.
>
> Any concrete examples below are illustrative only. Swap in your app's domain when applying; keep the principles.

---

## The product thesis (what we are actually selling)

> **The product is cognitive-load reduction for complex operations.** The system holds the detail and computes each person's next action, so humans spend their scarce attention on *judgment* — not on remembering, re-typing, and chasing. The payoff: **less labor, less mental fatigue, lower cost** — delivered by automating the objective work now, and assisting the subjective work with AI later.

Every operations app we build is a variation on this. The client's words will be different ("I'm the bottleneck," "I can't hand this off," "things slip"), but the disease is always the same: **a person is the integration layer.** The business runs *through someone's head* instead of *on a system*. We are moving the operating system out of the head and into software.

Say it to the client this way: *"Today, you are the operating system this business runs on — every job passes through you. We're moving that operating system into software, so the business runs on the system instead of running on you."*

The risk being managed has a name — **key-person risk** (the "bus factor") — and the method has a name: **externalizing tacit knowledge**. Use them; they give the work credibility.

---

## The three mechanisms that deliver the thesis

These are not three features. They are three faces of "reduce cognitive load." Every operations app should implement all three deliberately.

1. **The objective/subjective split.** Every unit of work is either *objective* (deterministic, rule-based — data entry, creating the next record, sending a nudge, copying a value, computing money) or *subjective* (requires human judgment — approvals, "is this truly ready," resolving a stuck case). Give all objective work to the system. Route subjective work to the right human *with the context attached*. Nothing else should demand attention.

2. **Role-based cognitive scoping.** Each role sees only their slice. This is distinct from security/RLS — it is about hiding what a role is *allowed* to see but does not *need* to. See `docs/cognitive-scoping-doctrine.md` for the full doctrine.

3. **The focus queue.** One item at a time: the thing, the context, the decision — act, advance. The queue is the literal anti-overload mechanic and is usually *the* primary UI for the operator role, not a secondary screen. Design it first, not last.

---

## Discovery principles (how to spec the thing)

### 1. Pave the cowpaths first
V1 encodes the client's *current* process exactly as it runs today — no improvements, no redesign. This is not timidity; it is sequencing. **You cannot improve a process you cannot see, and the client cannot see theirs because they are inside it.** The moment V1 runs, they see the operation from the outside for the first time and spot improvements that were invisible. That is the payoff — and it is a *second phase*. V1's only job is faithful capture.

This principle is also your scope fence: every "could it also…" idea is real, valid, and Phase 2. You are not rejecting the client's ideas; you are sequencing them.

### 2. Objective vs. subjective, tagged at every step
When walking a process, tag each step objective or subjective out loud. The objective steps are your automation backlog. The subjective steps are your routing-and-context backlog (and, much later, your AI backlog). This single discipline turns a fuzzy "how do you do this" into a buildable spec.

### 3. Knobs, not canvases
Configuration is *editable values on fixed shapes* — SLA days, recipients, checklist items, gate tiers. Never a rule builder, formula editor, or sandbox. Canvases let the client rebuild the chaos you just removed; knobs keep the spine rigid where the process is proven and let the numbers flex where judgment lives. If discovery surfaces a "we need to configure X," the right question is *"what is the fixed shape, and which values on it change?"*

### 4. Forms vs. documents
*If the client authors it, it's a form (structured, queryable fields — no extraction problem, ever). If the outside world hands it over, it's a document (stored, gated on presence + human "I verified X" confirmation).* This rule kills the PDF-data-extraction trap before it starts and decides, per artifact, whether you're capturing fields or storing files.

### 5. The spine is rigid; inside a stage is free; gates are tiered
Structure where the process is proven, freedom where judgment lives. Stage order is fixed config. Task order within a stage is the human's business. *Hard* gates only where money, legal exposure, or evidence is at stake; everything else is a *soft* gate (warn, require a one-line reason, allow, log). New gates default to soft. A repeating override is a signal the model is wrong — read the pattern, fix the config; don't blame the user.

### 6. The escape hatch is not optional
A rigid happy-path spine *will* meet the job that goes sideways — the cancellation, dispute, redo, ghosted customer, denied permit. **This is where the system breaks ~2 months after launch**, because when the system cannot represent the weird case, the operator routes it back to the person you were trying to free (a text, a call) — and the whole handoff unravels at exactly that moment. Every operations app needs an explicit **Hold / Exception state**: a job can be parked off the happy path with a reason and an owner, and explicitly un-stuck. Discover it directly: *"Walk me through the last three jobs that did NOT go to plan."*

### 7. Definition of done, written as instruction (help-as-instruction)
When capturing SOPs, capture three fields per step, not two: **trigger → responsible role → definition of done, phrased as instruction.** That third field — "what good looks like" — *becomes the in-app help text*. You are already extracting the knowledge during the walk; capture it as something a new hire can read, not as a config value. This is what makes a system trainable rather than merely enforceable: the system enforcing a step is not the same as teaching a new person how to do it.

### 8. The handoff scoreboard
If the goal is delegation, **adoption is the deliverable, not the release.** Instrument it. The clearest objective signal: *the owner stops being the actor on transitions that belong to the role being trained.* When the event log shows the new operator — not the owner — advancing the work, the handoff happened. Build that scoreboard; it is the only objective proof the project succeeded.

### 9. Separate tool adoption from operational transformation
Two adoptions, opposite risk profiles. **Tool adoption** (use the app instead of the old mess) is fast and low-risk *because V1 = the current process* — it should feel like relief, not change. **Operational transformation** (letting go, a new person running the day) is slow, iterative, never "done" — it's measured in trust. Tell the client V1 won't ask them to work differently; it asks them to work in one place. The bigger change comes gradually after. Conflating these two is how you over-promise on the release and under-deliver on the relationship.

### 10. The event log is the foundation, from day one
A timestamped from→to→who→trigger log on every state change is the single highest-leverage thing most legacy tools *structurally cannot* do. It powers the dashboard, the SLA timers, the stall analytics, the handoff scoreboard — and it is the training data for any future AI layer. It cannot be back-filled. Ship it in the very first usable version, before the automations that depend on it.

---

## The discovery method, in order

1. **Map the current state** as the existing system's data implies it (swimlanes by role × phase). Mark every manual re-entry and every "owner must decide" step — those are your automation and routing backlogs.
2. **Validate the map with the owner** by walking *real* records end to end, not by reading the map aloud. Most answers fall out of the walks.
3. **Tag every step** objective/subjective and capture trigger → role → definition-of-done.
4. **Find the escape hatches** — the jobs that went sideways.
5. **Settle the actor census first.** The system routes work to *people*; an incomplete actor list = incomplete routing = a broken core mechanic. This is usually the true blocking unknown, ahead of the schema.
6. **Write the brief, gate it (Phase 0), then design the experience** — role views, the queue, the four core screens. The system can be correct and still unusable; experience design is a separate, deliberate pass after the model is right.

---

## Anti-patterns (smells that the discovery is off)

- **"We'll make it configurable"** as an answer to a process question → you're building a canvas. Find the fixed shape.
- **More fields, more detail, more screens** with no role scoping → you're rebuilding information overload in a new skin.
- **A spec that only describes the happy path** → no escape hatch; it will break in two months.
- **SOPs captured as config but not as help text** → enforceable, not trainable.
- **Treating cutover as a release with a checklist** → adoption is organizational; instrument it or it silently fails.
- **A single point of failure that moved from a person to the app's config** that only one person understands → name who owns the config post-handoff, or you haven't delegated.
