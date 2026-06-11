# Spec Writing Guide
### How to write feature specs that Haiku can actually build

> Used by: Project owner + Cursor/Sonnet when writing the roadmap. Read this before writing any `vX.Y.0` entry.

---

## The One Rule

**If a sentence in your spec can be interpreted two ways, Haiku will pick the wrong one.**

Haiku is not dumb. It's precise. It will execute exactly what you wrote. If what you wrote was ambiguous, you'll get confident, well-structured code that does the wrong thing. The cost isn't Haiku failing — it's Sonnet having to diagnose why something that looks right is actually wrong.

Every minute spent tightening a spec saves three minutes of Sonnet review.

---

## What "Complete" Actually Means

A spec is complete when a developer who has never seen this codebase could implement the feature using only the spec and the files it references. No guessing. No "figure out how it fits."

Run this test: *Could you hand this spec to a capable contractor on their first day and get the right code back?* If no, it's not done.

---

## The Five Fields — and Why Each One Matters

### 1. Files

**Wrong**: "Update the items component and the API."

**Right**: `src/views/Items.tsx`, `server/routes/items.ts`

Why it matters: Haiku will create new files if you don't name existing ones. It will create `src/components/ItemList.tsx` when you meant `src/views/Items.tsx`. Name every file. If a file needs to be created, say so explicitly and name it.

---

### 2. Pattern

**Wrong**: "Follow the existing component pattern."

**Right**: "Follow the pattern in `src/components/Badge.tsx` — same props structure, same conditional render, same Tailwind class approach."

Why it matters: This codebase has multiple patterns. Haiku will pick one. Without guidance it may pick an older or inconsistent one. Naming the file and what specifically to copy removes all guesswork.

When there's no existing pattern to follow, say so: *"No existing pattern — create from scratch using these requirements."* That's honest and prevents Haiku from searching for something that doesn't exist.

---

### 3. Data

**Wrong**: "Display the user's items with their status."

**Right**: "Query `items` table, columns: `id`, `name`, `status` (values: `'active'` | `'archived'`), `created_at`. Filter: `user_id = auth.uid()` via RLS — use direct Supabase client, not Hono."

Why it matters: Haiku cannot read your database schema. If you don't give it column names and types, it will invent them. You will then spend Sonnet passes fixing column mismatches.

Include:
- Table name
- Column names and types
- Enum values (especially string enums)
- Whether it goes direct to Supabase or through Hono (see `docs/architecture-patterns.md` for the rule)
- Any foreign key joins that matter

---

### 4. Behavior

**Wrong**: "When the user clicks Save, save the form data."

**Right**:
1. User fills form (fields: `name` required, `notes` optional)
2. User clicks Save → button shows loading state
3. POST to `/api/items` with `{ name, notes }`
4. On success → Toast "Item saved", form resets, list refreshes
5. On error → Toast "Failed to save — [error message from API]", form stays filled

Why it matters: Haiku will implement what it thinks a typical save flow looks like. That might be close, but it won't know about your loading state pattern, your toast style, or whether the list refreshes vs navigates. Every state transition that matters to you needs to be written out.

If there's a loading state, say so. If a component should NOT have a loading state, say that too.

---

### 5. Do NOT

This field prevents the most expensive class of Haiku errors: technically correct code that violates your architectural decisions.

Examples of useful guard rails for this stack:

- "Do NOT add a new Supabase client — import from `src/lib/supabase.ts`"
- "Do NOT use `useEffect` to load data — this view uses the pattern from `src/views/Home.tsx`"
- "Do NOT add the JWT auth middleware to this route — it uses PIN auth, see `server/middleware/auth.ts`"
- "Do NOT create a new route file — add to `server/routes/items.ts`"
- "Do NOT use `window.location` — use the router from `src/index.tsx`"

Think of this as: what would a developer who just learned this codebase do wrong? Write those things down.

---

## Common Failure Modes

### Haiku invents a file
**Cause**: You said "the items component" and there were two candidate files.
**Prevention**: Always use the full path.

### Haiku uses the wrong Supabase client
**Cause**: Spec said "save to the database" without specifying direct or via Hono.
**Prevention**: Explicitly state which approach using the architecture rule from `docs/architecture-patterns.md`.

### Haiku uses the wrong auth pattern
**Cause**: Spec didn't mention auth at all.
**Prevention**: Every route needs an explicit auth note. "No auth — public route." or "PIN auth via `x-app-pin` header." or "JWT via `Authorization: Bearer`."

### Haiku adds a new component instead of using an existing one
**Cause**: Spec didn't reference `src/components/Toast.tsx` or similar.
**Prevention**: In the Pattern field, name every shared component to use. `Toast`, `EmptyState`, `Badge`, `ConfirmDialog`, `LoadingSkeleton` — these exist, Haiku should use them, but it won't unless you say so.

### Haiku's code works but breaks something else
**Cause**: The feature touched a shared file and Haiku didn't know what else depended on it.
**Prevention**: If a file is shared (like `server/routes/items.ts` or `src/lib/api.ts`), say: "This file is shared — only add, do not remove or rename anything existing."

### Haiku implements it correctly but incompletely
**Cause**: The Haiku Checklist was missing a step that seemed obvious.
**Prevention**: Nothing is obvious to a model reading a spec cold. If it needs to happen, write it down.

---

## Good vs. Bad Spec — Side by Side

### Bad spec

```
#### Implementation Brief
- **Files**: Items view and API route
- **Pattern**: Follow existing patterns
- **Data**: Items from the database with status
- **Behavior**: User can archive an item by clicking the archive button
- **Do NOT**: Don't break existing functionality
```

### Good spec

```
#### Implementation Brief
- **Files**: `src/views/Items.tsx` (modify), `server/routes/items.ts` (modify)
- **Pattern**: Archive button follows pattern in `src/views/Items.tsx` existing delete button —
  same ConfirmDialog usage, same loading state, same error toast
- **Data**: `items` table, column `status` VARCHAR — set to `'archived'` (was `'active'`).
  Use Hono: PATCH `/api/items/:id` with body `{ status: 'archived' }`.
  Route handler uses `sbAdmin` (service role) — not user-scoped client.
- **Behavior**:
  1. User clicks "Archive" button on an item row
  2. ConfirmDialog opens: "Archive this item? It will be hidden from the main list."
  3. User confirms → button loading state → PATCH /api/items/:id
  4. On success → ConfirmDialog closes, item disappears from list (filter: status = 'active'), Toast "Item archived"
  5. On error → ConfirmDialog stays open, Toast "Failed to archive — [error]"
- **Do NOT**: Do not filter archived items in the Supabase query — filter in the component
  (archived items may be needed later). Do not add a new route file — add PATCH to the
  existing `/api/items` handler in `server/routes/items.ts`.
```

The good spec takes 5 more minutes to write. It saves 30 minutes of Sonnet review.

---

## Writing the Verify Sections

Every roadmap entry ends with two verify sections (see `docs/roadmap.md` for the format). The split matters — get an item in the wrong section and either an agent guesses at taste or a human burns time finding mechanical defects:

- **Agent Verify (binary, automated)** — the standard `/qa` checks from `docs/agent-verification.md` plus feature-specific assertions. Every item must be mechanically checkable by an agent in a browser or terminal: "POST `/api/items` without `name` → 400 with error body", "archived item disappears from list without reload". If an agent can detect it, it goes here.
- **Human Verify (judgment only)** — copy quality, design taste, business-logic correctness: "the empty-state copy reads like us", "the archive flow matches how the operator actually thinks about retiring an item". If reasonable people could disagree, it goes here.

The litmus test: *could `/qa` fail this item?* If yes → Agent Verify. If the answer requires an opinion → Human Verify. "Works in browser or doesn't" is the agents' job now, not the human's.

---

## The Pre-Handoff Checklist

Run this before marking a spec ready for Haiku:

- [ ] Every file is named by full path
- [ ] Every pattern reference is a file path, not a description
- [ ] Table names and column names are spelled out
- [ ] Auth approach is stated explicitly (direct Supabase / Hono + JWT / Hono + PIN / none)
- [ ] Every UI state is described: loading, success, error, empty
- [ ] Shared components are named (`Toast`, `EmptyState`, `Badge`, `ConfirmDialog`, `LoadingSkeleton`)
- [ ] "Do NOT" covers the most likely wrong turns for this specific feature
- [ ] The Haiku Checklist items are concrete things to build, not goals ("add PATCH handler to `server/routes/items.ts`" not "implement archiving")
- [ ] Agent Verify lists only mechanically checkable assertions; Human Verify lists only judgment calls (see *Writing the Verify Sections*)
- [ ] Read it out loud: does any sentence have two valid interpretations?

---

## Calibrating Over Time

The first few features will show you where your specs have gaps. When Haiku gets something wrong, ask: *was this in the spec?* If no → add it to the spec format. If yes → it was ambiguous.

Keep a running note in `docs/decisions.md` under a "Spec Lessons" section:

```
## Spec Lessons
- Always name which Supabase client (direct vs sbAdmin via Hono) — Haiku will guess
- Always name the Toast component explicitly — Haiku creates its own otherwise
- Status enums must include all allowed values — Haiku will invent new ones
```

After 10 features you'll have a list of 8–10 standing rules that apply to every spec in this codebase. At that point, Haiku's first-pass success rate will be high enough that Sonnet is genuinely just reviewing, not fixing.

---

## When the Spec Can't Be Written Yet

If you can't fill out the Data or Behavior fields completely, the feature isn't ready for Haiku. Options:

1. **Spike with Sonnet first** — have Sonnet explore the problem, make the decisions, then write the spec
2. **Move to Unsolved in the roadmap** — if there's a design question without an answer
3. **Break it into two features** — the first feature resolves the ambiguity, the second implements it

Sending an underspecified feature to Haiku costs more compute than waiting to write a complete spec.
