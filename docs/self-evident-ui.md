# Self-Evident UI Standard

> Shared standard across all R7/Wayfinder apps. Synced from the template.
>
> **What this governs:** whether an app's screens *mirror its core loop* — so the app is self-evident and stops requiring human training. This sits one layer **above** the Nav & Orientation Standard (`README.md` → *Nav & Orientation Standard*, `CLAUDE.md`): the Nav Standard governs *how* each screen is wired (shell, `PageHeading`, `EmptyState`, `doNow`); this standard governs *what the screens are and in what order they map to the loop*. Don't duplicate the Nav Standard here — wire to it.

The recurring failure this prevents: a UI whose information architecture doesn't mirror the app's core loop. When they're misaligned, the app stops being self-evident and starts requiring a human to be trained on it. These rules are enforceable gates, not advice.

---

## A note on the vocabulary

Three terms below are **house terms** — vivid and useful, but not textbook terms-of-art. They are kept deliberately and anchored to the established concept they rest on, so the standard is enforceable without resting on a word nobody outside can pin down:

| House term | Established anchor it rests on |
|---|---|
| **Core loop** | Game-design origin. In product terms it maps to NN/g's **"primary user flow"** and **"critical user journey."** It is *not* the "happy path" (that's the error-free *execution* path through code). |
| **UI-to-loop alignment** | Norman's **Gulf of Execution / Gulf of Evaluation** (*The Design of Everyday Things*) and Nielsen's **Heuristic #2, "Match between the system and the real world."** |
| **"One app or two?"** | The **Unix philosophy** ("make each program do one thing well," McIlroy) and **SRP** ("one reason to change," Martin), borrowed up to the product level. |

Use the house terms in conversation; cite the anchor when the rule is challenged.

---

## §1 — Core-Loop Definition Requirement (mandatory)

**Every app MUST define its core loop in exactly one sentence before any UI is built.** This sentence is recorded in `docs/project-brief.md` and is a Phase 0 hard gate (see `PROJECT_PROTOCOL.md`).

The core loop is the **primary repeating cycle the main user performs to get the app's value** — the short list of verbs that feed back into each other. Write it as one sentence in the form:

> *"The [user] [does X] → [does Y] → [does Z], and repeats."*

Worked example (a follow-up CRM):
> *"The operator opens Today → works the next due lead → logs the outcome → and the lead re-queues for its next touch."*

Rules:
- **One sentence.** If it takes two, you may have two loops — run the §3 "one app or two?" test.
- **Name the real human**, by role, not a persona.
- It must be a **cycle**, not a one-time setup task. ("Configure billing" is not a core loop.)
- This is *not* the happy path. The happy path is the error-free execution of one step; the core loop is the whole repeating task.

A brief with a blank, multi-sentence, or non-cyclic core loop **cannot be approved.**

---

## §2 — UI-to-Loop Alignment Rule

**Every screen must advance exactly one step of the core loop.** A screen that advances no loop step, or blends several, is a defect — it widens the gulf between what the user intends and what the UI affords.

Operational tests for any screen:
1. **Which loop step is this?** If you can't name one step from §1, the screen doesn't belong, or the loop is wrong.
2. **One step, not three.** A screen that asks the user to do unrelated steps at once forces them to hold the loop in their head — that's the training tax this standard exists to kill.
3. **Next step is obvious from this screen.** After finishing a step, the path to the next loop step is visible without hunting (this is where the Nav & Orientation Standard's `doNow` / `CountBadge` carry the load).
4. **Information architecture mirrors the loop order.** Navigation, labels, and grouping follow the loop's sequence, not the database's table list. (IA = the design of organization, labeling, navigation, and search — Rosenfeld & Morville.)

> **Why (anchor):** Norman's *Gulf of Execution* is the gap between a user's intention and the actions a system offers; the *Gulf of Evaluation* is the gap between the system's state and the user's understanding of it. A screen aligned to one loop step bridges both gulfs. Nielsen's Heuristic #2 ("match between the system and the real world") is the same demand: the system follows the user's real-world task order, not the system's internal model.

---

## §3 — Named UI Principles (definition + build-order rank)

Each principle below carries a **build-order rank** (see §4). Lower rank = earlier and more load-bearing; you do not skip a lower rank by doing a higher one.

| # | Principle | One-line definition | Rank |
|---|-----------|---------------------|------|
| 1 | **Self-evidence** | The UI is obvious without thought — Krug's First Law, *"Don't make me think."* When not achievable, make it at least *self-explanatory* (minimal thought). | **1 — structure** |
| 2 | **Information architecture** | The design of organization, labeling, navigation, and search so people find and manage things — ordered to mirror the core loop (§2). | **1 — structure** |
| 3 | **Progressive disclosure** | Show the options most users need most of the time first; defer advanced/rare ones to a secondary level. Not "hide things" — the first level must be sufficient for the common case. | **1 — structure** |
| 4 | **Empty states as a teaching surface** | A container with no data yet teaches what will appear and how to create the first item — it is the first screen a new user sees, so design it first ("blank slate," 37signals). Use the `EmptyState` component. | **2 — contextual help** |
| 5 | **Contextual / inline help** | Assistance at the point of need, inside the task — succinct, unintrusive, available without interfering. Help where the user is, not on a separate page. | **2 — contextual help** |
| 6 | **First-run experience (FRE)** | What the user hits the very first time. Crafted so they understand the loop and return; always skippable and revisitable. | **3 — tour** |
| 7 | **Coachmarks / product tours** | Instructional overlays pointing out features. **Used sparingly** — NN/g documents that tours are overused, skipped, shown out of context, and forgotten, and that they "do not solve the underlying problems of poorly composed interfaces." A tour is never a fix for a screen that fails §2. | **3 — tour** |
| 8 | **Single-responsibility / "one app or two?"** | One app serves one core loop. If a second, unrelated loop appears, that's a candidate for a separate app — borrowed from "do one thing well" (Unix) and SRP. See the Phase 0 test. | **0 — scope (precedes all)** |

The **"one app or two?" test** (rank 0, run in Phase 0): write the core loop in one sentence (§1). If you cannot — if it forks into two independent cycles with different primary users or different value — **flag it and ask whether this should be two apps.** Don't silently build one app around two loops; that is the original misalignment failure at its largest scale.

---

## §4 — "Self-Evident Before Explained" — the build order (hard sequence)

When making a screen understandable, you **must** work the tiers **in order**. You may not reach for a later tier to compensate for skipping an earlier one.

| Tier | Do this | Before moving on |
|------|---------|------------------|
| **1. Structure** | Make it self-evident through IA, layout, labels, progressive disclosure, and §2 loop alignment. | A screen that needs a tour to be understood has a **tier-1 defect** — fix the structure first. |
| **2. Contextual help** | Add inline help and teaching empty states **at the point of need**, for the parts that remain non-obvious after tier 1. | Help text patching a confusing layout is a tier-1 failure wearing a tier-2 costume. |
| **3. Tour / FRE** | Add a first-run experience or coachmarks **only** for genuinely novel interactions structure + contextual help can't make obvious. Always skippable. | If the tour is load-bearing — the app is unusable without it — return to tier 1. |
| **4. Docs** | External documentation as the final reference, for depth and edge cases. | Docs are reference, never the primary way a user learns the loop. |

**The hard rule:** *structure before contextual help, contextual help before tour, tour before docs.* A reviewer who sees a tour or a doc doing a structure's job sends it back.

> **Fidelity caveat (don't overclaim):** later tiers are *lower priority and later* — they are **not** disposable. NN/g is explicit that good help and documentation are *critical* for complex or nonstandard interactions. The rule is "earn the later tier by getting structure right first," not "skip help if the design is good." Tiers 2–4 are complements to tier 1, not proof it failed.

---

## §5 — How this is enforced

| Where | Gate |
|-------|------|
| **Phase 0 (Brief)** | Core loop defined in one sentence (§1) + "one app or two?" test (§3) — both are hard gates in `PROJECT_PROTOCOL.md`; recorded in `docs/project-brief.md`. A brief without them cannot be approved. |
| **Phase 1.5 (Wireframe)** | Every screen mapped to its core-loop step in lo-fi before any production UI (§2 verified cheaply). See `PROJECT_PROTOCOL.md`. |
| **Phase 2 (Issue) / spec** | A feature that adds a screen names the loop step it advances. See `docs/spec-writing-guide.md`. |
| **Nav & Orientation Standard** | Implements the per-screen primitives this standard relies on (`PageHeading` "what you do here", `EmptyState`, `doNow`/`CountBadge` for "next step obvious"). See `README.md` and `CLAUDE.md`. |

---

## Sources

- Steve Krug, *Don't Make Me Think* — First Law of Usability ("Don't make me think") · [ch.1](http://desource.uvu.edu/dgm/2740/IN/steinja/docs/krug-dont_make_me_think/ch01/krug-ch01.html)
- Don Norman, *The Design of Everyday Things* — Gulf of Execution / Gulf of Evaluation · [NN/g](https://www.nngroup.com/articles/two-ux-gulfs-evaluation-execution/)
- Jakob Nielsen — 10 Usability Heuristics, #2 *Match between system and the real world* · [NN/g](https://www.nngroup.com/articles/match-system-real-world/)
- Rosenfeld & Morville, *Information Architecture for the World Wide Web* ("polar bear book") · [overview](https://jarango.com/what-is-information-architecture/)
- Progressive disclosure · [NN/g](https://www.nngroup.com/articles/progressive-disclosure/)
- Empty states / "blank slate" · [Signal v Noise (37signals)](https://signalvnoise.com/archives/000375) · [NN/g](https://www.nngroup.com/articles/empty-state-interface-design/)
- Contextual help, onboarding, tours/coachmarks cautions · [NN/g](https://www.nngroup.com/articles/onboarding-tutorials/)
- First-run experience patterns · [Microsoft Learn](https://learn.microsoft.com/en-us/office/dev/add-ins/design/first-run-experience-patterns)
- User flows vs. user journeys · [NN/g](https://www.nngroup.com/articles/user-journeys-vs-user-flows/)
- Unix philosophy ("do one thing well," McIlroy) · [Wikipedia](https://en.wikipedia.org/wiki/Unix_philosophy) · Single-responsibility principle (Martin) · [Wikipedia](https://en.wikipedia.org/wiki/Single-responsibility_principle)
- Happy path (for contrast) · [Wikipedia](https://en.wikipedia.org/wiki/Happy_path)
