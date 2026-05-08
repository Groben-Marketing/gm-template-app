# R7C Ecosystem Standards

> **This repo is the default implementation of the R7C ecosystem development standards.** It does not invent its own operating model — it implements ecosystem law.
>
> Source of truth lives in `r7c-context/standards/`. Read those documents directly when in doubt.

---

## Rule Hierarchy

1. **`r7c-context/standards/*`** — ecosystem law. Governs every coding agent (Anthropic, OpenAI, Google, future) and every R7C app repo regardless of vendor.
2. **`repo-template/*`** — default repo implementation of ecosystem law. What you're reading right now.
3. **Repo-local files** — app-specific context and explicitly documented exceptions only.

A repo-local file may add context. It may not silently override an ecosystem standard. Exceptions must be documented in the repo and, when meaningful, also recorded in `r7c-context/decisions/`.

---

## Standards That Apply Here

| Standard | What it covers | Where this template implements it |
|----------|----------------|------------------------------------|
| `agent-operating-standard.md` | Universal rules every coding agent must follow | `PROJECT_PROTOCOL.md` (Boot Sequence, Phase Gates, Rules, Changelog Release Gate) |
| `repo-compliance-standard.md` | Required files, structure, and compliance checks | Required files at repo root + `docs/` (see "Compliance" below) |
| `local-first-development.md` | Develop locally, deploy intentionally | `README.md` → *Local Development* section + `package.json` scripts |
| `scope-governance-standard.md` | How feature/scope changes enter the system | `PROJECT_PROTOCOL.md` Phase 0 (Brief) and Phase 0.5 (Milestones) |
| `template-propagation-standard.md` | How template changes flow into existing repos | `.github/sync-config.json` + `.github/workflows/sync-to-repos.yml` |
| `deploy-discipline-standard.md` | Canonical deploy path, no direct-to-prod | `docs/branching.md` + dev/prod env separation |
| `audit-standard.md` | What Cheetah is expected to audit and flag | Read by Cheetah; this template ships the structure that makes audits possible |
| `architecture-standard.md` | System design rules for apps and integrations | `docs/architecture-patterns.md` |
| `approved-stack.md` | Default technical stack | `package.json` + stack table in `README.md` |

---

## Compliance — Required Files

`repo-compliance-standard.md` requires the following files in every R7C repo. This template ships them all (modulo the divergence noted below):

| Required file | Present in template |
|---------------|---------------------|
| `PROJECT_PROTOCOL.md` | Yes |
| `CLAUDE.md` | Yes |
| `CHANGELOG.md` | Yes |
| `docs/roadmap.md` | Yes |
| `docs/overview.md` | Yes |
| `AI_HANDOFF.md` | **No — see Divergences** |

### Required Capabilities

- **Local development setup documented** — `README.md` → *Local Development* section
- **Clear versioning and release process** — `docs/versioning.md` + `CHANGELOG.md` + version release checklist in `CLAUDE.md`
- **Defined environment variables** — `.env.example`

---

## Current Divergences from Standards

When this template intentionally departs from `r7c-context/standards/`, the divergence is named here so it is auditable.

### `AI_HANDOFF.md` retired (now upstream)

- **History**: This template removed `AI_HANDOFF.md` after the handoff-file pattern was retired in `agent-gracie-law` — the file accumulated into a 350KB blob no agent read end-to-end. State that lets a fresh agent pick up cold lives in `git log`, the active GitHub issue, and the roadmap entry's `**Status**` / `**Pass Count**` fields.
- **Upstream alignment**: `r7c-context/standards/repo-compliance-standard.md` and `audit-standard.md` no longer list `AI_HANDOFF.md` as a required file. `agent-operating-standard.md` no longer references "session handoff" as a destination for changelog entries. This is no longer a divergence — it's the standard.

---

## Reading Order

A new agent landing in this repo cold should read:

1. `PROJECT_PROTOCOL.md` (this repo's implementation)
2. `r7c-context/standards/agent-operating-standard.md` (the ecosystem rules behind the protocol)
3. `r7c-context/standards/scope-governance-standard.md` (why Phase 0 exists)
4. `r7c-context/standards/repo-compliance-standard.md` (what files this repo must contain)
5. `CLAUDE.md` (this app's specific context)

Reading the standards once gives durable context that doesn't need to be re-read on every pickup — but the hierarchy must be honored on every change.
