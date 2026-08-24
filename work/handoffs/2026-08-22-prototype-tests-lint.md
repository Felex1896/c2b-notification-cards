---
type: Note
title: Handoff — Prototype tests and lint
description: Stages 1–2 of the audit plan are done and click-checked. Next = remaining pure-layer tests, then the eslint override.
tags: [c2b, prototype, tests, lint]
status: deprecated
---

# Handoff — Prototype tests and lint

**Stages 3 and 4 are done.** `rules.test.ts` covers the function list, and lint is at zero errors. Do not execute the stages below. Current state: [2026-08-23-code-gates.md](./2026-08-23-code-gates.md).

## Goal for the next session

Finish the audit plan: stage 3 (tests for the rest of the pure layer) then stage 4 (eslint override). Behaviour does not change. The human has click-checked stages 1 and 2; do not re-run them.

Canon for this round: [2026-08-22-prototype-code-audit.md](./2026-08-22-prototype-code-audit.md). Spec: [target-flow.md](../specs/target-flow.md). Project rules: [AGENTS.md](../../AGENTS.md).

## Settled (do not re-open)

From the audit note, still in force:

- `npm run lint` green is part of the deliverable.
- Tests: `vitest` on pure functions only. No jsdom, no testing-library, no browser-scenario tests.
- The two `react-refresh` complaints inside `src/components/ui/**` are silenced by an eslint override for that folder, not by restructuring shadcn's files.
- Out of scope this round: the four near-identical blocks in `NotificationsPage`, the size of `theme-provider.tsx`, the canvas measurement in `FitEntityNames`, the skin/theme persistence asymmetry, the light-brand citron contrast.

Done this session, click-checked, do not reverse:

- Stage 1 — findings A1–A4. Single-entity rows are always plain text. Dead `effectiveChannels` / `hasChannel` / `RuleTable` footer gone. One predicate `hasAnyChat`. `hasErrors` replaced by `isBalanceValid`. `clone*` renamed to `commit*` (fresh object, idempotent, safe on Apply and Cancel).
- Stage 2 — findings B and C. New `src/lib/selection.ts`: picker reports a `SelectionIntent`, owners apply it with `applySelection` via a functional state update. Held category is the picker's own React state. `EntitySelect` has no refs and no closing effect. First-deposit errors keyed by sub-rule id; `countedSubRules` is the one answer to "which rows count" for both errors and validity.

Also settled in the tree, not in the original stage table:

- `vitest` is already a devDependency. `package.json` has `"test": "vitest run"`. `vite.config.ts` already has `test.include: ["src/**/*.test.ts"]` and imports `defineConfig` from `vitest/config`. Stage 3 does **not** touch those files.
- `"typecheck": "tsc -b"` — the old `tsc --noEmit` compiled zero files because the solution tsconfig has `files: []`. Do not revert.
- `src/lib/selection.test.ts` already exists (12 tests, green). Do not rewrite it unless a new test would contradict it — then ask.

Working tree at handoff: stages 1–2 plus `package-lock.json` are **uncommitted**. Leave them. Do not commit or push without an explicit ask.

## Stages left

Order is linear. Nobody commits or pushes without the human asking.

### 3. Tests for the rest of the pure layer — subagent

Writes **only** `prototype/src/lib/*.test.ts` (new files; do not edit `selection.test.ts` unless a contradiction appears). Explicit ban on every other path, including `package.json`, `vite.config.ts`, `rules.ts`, and all components.

Function list (expectations from the spec, not from current returns). A failing test is a question for the human, never a reason to edit the assertion or the production function:

`sanitizeAmountInput`, `commitAmountInput`, `isPositiveAmount`, `formatEur`, `balanceErrors` / `isBalanceValid`, `entityErrors`, `firstDepositErrors` / `isFirstDepositValid` / `countedSubRules`, `categoryTriState`, `headerTriState`, `pruneCategoryAmounts`, `setCategoryAmount`, `effectiveCategoryAmount`, `channelPairs`, and the three summary-row builders (`balanceSummaryRows`, `entitySummaryRows`, `firstDepositSummaryRows`).

Verify: `npm test` green; no jsdom in the tree (`package.json` / lockfile / vite config stay without `jsdom` or `@testing-library`).

After the subagent: stop if any test failed against the spec — ask, do not "fix" the code to match a guessed assertion.

### 4. Lint config — main chat, two lines

Writes `prototype/eslint.config.js` only. Override `src/components/ui/**` to turn off `react-refresh/only-export-components`. Do not restructure shadcn files. Do not touch `brand.generated.css`.

Today `npm run lint` has one error: `src/components/ui/button.tsx` exports `buttonVariants` next to `Button`. After the override, `npm run lint` must be fully green.

Optional stage 5 from the audit: a fresh subagent that writes nothing, reads `git diff`, and reports against the audit note. Only if the human asks.

## Open

Same as the audit note. One extra, not a task: after finding C, `rowEntityInvalid` / `subRuleErrors(...).brands` cannot fire for counted rows (`countedSubRules` already has brands). Leave the prop. Deleting it is not stage 3 or 4.

## Suggested skills

None. Mechanical tests and a two-line eslint override. Grok 4.6 high is enough; do not switch to Opus for this.

## Do not

- Do not change behaviour. Stages 1–2 are closed.
- Do not re-grill the picker, the held category, the card control, or the table method.
- Do not add jsdom, testing-library, a form library, or `tailwind.config.js`.
- Do not rewrite `AmountField` caret handling or `FitEntityNames`.
- Do not collapse the four cards in `NotificationsPage`.
- Do not touch `src/components/ui/**` beyond the eslint override.
- Do not let `prototype/` import from `work/`.
- Do not commit or push without an explicit ask.
- Do not revert `"typecheck": "tsc -b"` or the vitest install.
