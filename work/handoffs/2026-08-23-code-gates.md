---
type: Note
title: Handoff — Code gates
description: Machine gates replacing code review, where the code rules now live, and the state of the tree.
tags: [c2b, prototype, gates, lint, tests]
---

# Handoff — Code gates

The human does not read code. The gates below are what stands in for his review, so a red check is a stop, not a suggestion.

## Where the rules live

Not in this note. How prototype code is written — layers, gates, tests, what to ask before writing, the three-item report at the end of a stage — is [prototype/AGENTS.md](../../prototype/AGENTS.md). Spec-as-canon, the spec split threshold, and the export step before the folder is shown to the reviewer are in the assignment's [AGENTS.md](../../AGENTS.md).

## State of the tree

- `cd prototype && npm run verify` is green: typecheck, 77 tests, lint at zero errors, `check:tests`, `check:skin`. Around four seconds.
- All four audit stages are done and click-checked. Do not re-run them.
- `use-rule-card.ts` moved to `src/hooks/`. `src/lib/` is React-free and every file there has a sibling test; both are enforced, and both were negative-tested.
- `npm run fix` has been run once, after the gates commit, so the refactor diff stayed readable. Prettier also rewrote two shadcn files under `src/components/ui/`.

## Open

- `check:skin` was narrowed this session: its hex pattern now rejects identifiers (`#c2b-alerts` was reading as a colour) and it skips `*.test.ts`. The human has not confirmed that narrowing.
- The export step has never been exercised. Links pointing above the assignment folder break in the copy shown to the reviewer.

## Do not

- Do not add an entry to either debt list: `max-lines` in `eslint.config.js`, exceptions in `scripts/check-tests.mjs`. Both belong to the human.
- Do not make a check pass by silencing it. Report the finding instead.
