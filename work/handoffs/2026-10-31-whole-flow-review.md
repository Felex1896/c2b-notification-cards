---
type: Note
title: Handoff — Whole-flow review
description: Pickup after the whole-flow build — prototype covers empty brand to alerts; copy, visual pass and reviewer export remain.
tags: [c2b, prototype, whole-flow, handoff]
---

# Handoff — Whole-flow review

## Goal for the next session

The whole flow is built and committed stage by stage (six commits, `c51e2b8` … this one). Start from the human's own click-through of the running prototype in both skins and both themes. Take his edits to the empty-brand copy into `src/components/EmptyBrand.tsx`; when he agrees, drop `status: draft` from [whole-flow.md](../specs/whole-flow.md). Then ask him which comes next: the visual pass, or the reviewer copy export.

## Settled (do not re-open)

- Path, shell, brands, sync, Client list, replace, channel connection, toolbar jumps — [whole-flow.md](../specs/whole-flow.md)
- Card behaviour, page channel block, Email row, override-all — [target-flow.md](../specs/target-flow.md)
- Code rules, gates, tests, adding shadcn components (the `cn` CLI defect) — [prototype/AGENTS.md](../../prototype/AGENTS.md)
- Brand names, sample-file names, generated sample rows — [whole-flow.md](../specs/whole-flow.md) Open
- Snapshot shape and export step — [AGENTS.md](../../AGENTS.md) Showing this to the reviewer

## Open

- Empty-brand copy: draft in the prototype; the human edits it.
- [AGENTS.md](../../AGENTS.md) snapshot line says the copy's README calls “the longer flow still open”. The longer flow is now built; ask the human how the copy's README should describe the state.
- The `check:skin` narrowing (hex pattern rejects identifiers, skips `*.test.ts`) is still unconfirmed by the human.
- The reviewer-copy export step has never been exercised.

## Suggested skills

`grilling` only if the human reopens a behaviour; otherwise none. `handoff` at the end.

## Do not

- `src/lib/prototype-state.ts` sits at the 300-line lint limit. The next change there splits a piece into its own `src/lib` file with a sibling test — do not add it to the debt list.
- Do not overwrite `src/components/ui/button.tsx` from the shadcn CLI; its `link` variant is intentional.
- Do not add entries to either debt list (`max-lines` in `eslint.config.js`, exceptions in `scripts/check-tests.mjs`).
