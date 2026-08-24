---
type: Note
title: Handoff — Prototype code audit
description: Code audit of the prototype plus the agreed fix plan — cleanup, picker rewritten to intents, pure-rule tests.
tags: [c2b, prototype, audit, refactor]
status: deprecated
---

# Handoff — Prototype code audit

**All four stages are done and click-checked.** Kept for the findings and the reasoning behind them. The stage table below is history — do not execute it. Current state: [2026-08-23-code-gates.md](./2026-08-23-code-gates.md).

## Goal for the next session

Stages 1–2 are done and click-checked. Remaining work lives in [2026-08-22-prototype-tests-lint.md](./2026-08-22-prototype-tests-lint.md). Nothing here changes what the prototype does — the visual result and every behaviour in [target-flow.md](../specs/target-flow.md) stay exactly as they are. One deviation from the spec is fixed (single-entity rows, Finding A1); everything else is the same product with clearer code.

The audit that produced the findings happened in chat and does not need repeating. Code was read, not run through a reviewer: `npm run typecheck` and `npm run check:skin` were green, `npm run lint` had 6 errors, no tests existed.

## Settled (do not re-open)

Decided with the human this session:

- The code is read by a stranger, not only clicked. `npm run lint` green is part of the deliverable.
- The picker is rewritten in its **full** form: components emit selection intents, the selection logic becomes pure functions in `src/lib/`. Not the minimal functional-update patch.
- Tests: `vitest` on pure functions only. No jsdom, no testing-library, no browser-scenario tests.
- The two `react-refresh` complaints inside `src/components/ui/**` are silenced by an eslint override for that folder, not by restructuring shadcn's files. Our own file is fixed properly.
- Work lands in two passes with a human click-through between them: safe cleanup first, picker second.
- Out of scope this round, on purpose: the four near-identical blocks in `NotificationsPage`, the size of `theme-provider.tsx`, the canvas measurement in `FitEntityNames`, the skin/theme persistence asymmetry. They are real and listed under Open.

## Findings

Line numbers are from the tree at the time of writing.

### A. Safe cleanup — no behaviour depends on it

**A1. Single-entity rows render a dropdown when unchecked.** `EntitySelect.tsx:118` returns the trigger button for `disabled && !open` **before** the `singleBrand` branch at `:122`. Four categories have exactly one entity — Asset Management, Mixer, Lending, Mining pool. The spec wants the name as plain text with no dropdown; today an unchecked such row shows a disabled dropdown with a chevron and a checked one shows text. Fix: test `singleBrand` first. Then the `brands.length === 1` branch of `entityLabel` is unreachable — drop it, and stop exporting `entityLabel` (that export is also one of the lint errors).

**A2. Dead code.** `effectiveChannels` (`rules.ts:171`) has no caller — the spec's "effective destination resolved at render" is never displayed. `hasChannel` (`rules.ts:167`) is a byte-identical alias of `isOverride` with a different intended meaning. `RuleTable`'s `footer` prop is never passed. Delete all three. Keep one honest predicate — `hasAnyChat(channels)` — and let the call site's variable name carry whether that means "page has a chat" or "this card overrides".

**A3. `hasErrors` is a trap.** `Object.values(errors).some(Boolean)` treats an empty array as an error, so it reports `{ categories: undefined, subRules: [] }` as invalid. That is why `isFirstDepositValid` avoids it while `NotificationsPage:49` uses it for balance. Delete it and add `isBalanceValid(values)` next to `isEntityValid` and `isFirstDepositValid` — three rules, three predicates of the same shape.

**A4. `clone` is not a clone.** `useRuleCard`'s `clone` option normalises: `cloneEntity` commits amount strings and prunes overrides, `cloneFirstDeposit` drops sub-rules with no brands. Rename the option and the four functions to `commit*`, and state the contract in one line: returns a fresh object, idempotent, safe to call on both Apply and Cancel.

### B. The picker — the reason this audit happened

`CategoryBrandPicker` receives the selection as a prop and reports a fully computed new list upward. That breaks on "Select all" inside the entity popover, where one gesture means up to 173 changes: `EntitySelect` reports them one at a time, so the picker keeps a mirror in `selectedRef` and edits it by hand. `openCategoryIdRef` is written **during render** (`CategoryBrandPicker.tsx:41`, `EntitySelect.tsx:73-74`), which React 19 rejects — four of the six lint errors are this. `EntitySelect.tsx:84-91` then closes its own popover from an effect, which is the fifth.

It works today. It fails quietly later: a lost checkbox, not a crash.

Target shape:

- New `src/lib/selection.ts`, pure, no React: `toggleBrand`, `toggleCategory`, `setBrands` (the visible subset behind Select all), `selectAllCategories`, `clearAll`. Input and output are plain id lists. The tri-state helpers already in `rules.ts` stay there.
- `CategoryBrandPicker` reports an **intent**, not a result — a discriminated union carrying what the user did plus the currently held category id. Owners apply it with a functional state update, so no mirror and no ref writes during render.
- The held category stays the picker's own React state (it is genuine UI state: the spec keeps a category checked while its popover is open). It stops being an exception patched into three places — the checkbox reads one derived value, and the intent payload carries the held id for owners that must retain per-category extras (`pruneCategoryAmounts`, `syncSubRules`).
- `EntitySelect` loses both refs and the closing effect. Derive `open` so a disabled row cannot be open; release the held category from the handler that unchecks it, which the picker already does at `CategoryBrandPicker.tsx:107`.
- Write the `selection.ts` tests in the same pass, before the components are wired to it.

Invariants that must survive, from [target-flow.md](../specs/target-flow.md):

1. Unchecking every brand inside the popover neither closes it nor unchecks the category.
2. Closing the popover with nothing selected turns the category off and drops that row's extras.
3. Select all applies to currently visible rows only and is tri-state when some are selected.
4. Checking a category selects all its brands. Empty never means all.
5. Trigger labels stay `All` / `Selected: N` / `Select`. Search clears when the popover closes.

### C. First deposit errors are addressed by position

`FirstDepositFields` finds a row's errors with `findIndex` over `subRules` (`:62`, `:70`) against the array built in `firstDepositErrors`. Alignment holds only because both lists are built in the same order. Key `subRules` errors by sub-rule id instead.

Second half of the same problem: `isFirstDepositValid` filters out brand-less sub-rules before validating, while the errors shown on screen are computed from the unfiltered list. Two answers to "which rows count". Extract one `countedSubRules(values)` and use it for both.

### D. Left alone deliberately

`AmountField`'s cursor restore through `requestAnimationFrame` looks wrong and is not — it keeps the caret in place while the value is sanitised. `FitEntityNames` measures text on a canvas because the spec asks for "as many names as fit one line, then +N". `theme-provider.tsx` is prototype chrome, not product. Do not touch any of them this round.

## Stages

Order is linear. Nobody commits or pushes without the human asking.

| Stage | Who | Writes | Verify |
| --- | --- | --- | --- |
| 1. Safe cleanup — Findings A1–A4 | subagent | `EntitySelect.tsx`, `rules.ts`, `use-rule-card.ts`, `RuleTable.tsx`, `NotificationsPage.tsx`, `AmountField.tsx` if a rename reaches it | `npm run typecheck`; `npm run check:skin`; human clicks a short pass |
| 2. Picker to intents — Findings B and C | main chat, Opus 5 high | `src/lib/selection.ts` + its test, `CategoryBrandPicker.tsx`, `EntitySelect.tsx`, `EntityRuleFields.tsx`, `FirstDepositFields.tsx`, `rules.ts`, `NotificationsPage.tsx` | `npm run typecheck`; `npm run lint` clean of ref/effect errors; the click list below |
| 3. Tests for the rest of the pure layer | subagent | `vite.config.ts` test block, `package.json`, `src/lib/*.test.ts` | `npm test` green; no jsdom in the tree |
| 4. Lint config | main chat | `eslint.config.js` | `npm run lint` fully green |

Stage 1 is mechanical and explicit — good subagent work, and it keeps twenty small edits out of the main chat's context. Stage 2 is one judgement call spread over five files that must agree; splitting it invites two agents writing the same file. Stage 3 is isolated: the subagent gets the function list and the spec lines and writes only test files. Stage 4 is two lines.

Optional stage 5: a fresh subagent that writes nothing, reads `git diff`, and reports against this note.

### Test scope for stage 3

`sanitizeAmountInput`, `commitAmountInput`, `isPositiveAmount`, `formatEur`, `balanceErrors` / `isBalanceValid`, `entityErrors`, `firstDepositErrors` / `isFirstDepositValid` / `countedSubRules`, `categoryTriState`, `headerTriState`, `pruneCategoryAmounts`, `setCategoryAmount`, `effectiveCategoryAmount`, `channelPairs`, and the three summary-row builders. Expectations come from [target-flow.md](../specs/target-flow.md), not from what the code currently returns. A failing test is a question for the human, never a reason to edit the assertion.

## Manual check after stage 2

The human clicks. Both skins, at least one theme.

- Check a category → every entity selected, Entity reads `All`.
- Open the entity popover, uncheck everything → popover stays open, category stays checked. Close it → category turns off and its extras disappear.
- Type in search, hit Select all → only visible rows change; partial selection shows the middle state.
- Asset Management, Mixer, Lending, Mining pool → plain text in the Entity column, checked and unchecked alike.
- Header all-categories checkbox: on, off, and the middle state after a partial selection.
- Entity withdrawal / deposit: per-category override, reset icon returns it to the placeholder, unchecking the category drops the override.
- First deposit: turnover and balance toggles, the period select, unchecking a category drops its sub-rule.
- Apply with a required field empty → the error appears under the right row; Cancel restores the last applied values.
- Four skin × theme combinations still render.

## Models and traps

The session runs on Grok 4.6 high. That is fine for stages 1, 3 and 4 — mechanical edits, explicit file lists, test bodies derived from quoted spec lines.

**Stage 2 runs on Claude Opus 5 with high reasoning**, whatever model carries the rest of the session. It is a state-machine refactor where three subtle behaviours must survive untouched, and the cheapest failure is a model that simplifies one of them into something more "logical". Either switch the chat's model for that stage — preferred, because the judgement belongs in the main chat — or hand the **whole** stage to a single subagent pinned to `claude-opus-5-thinking-high`. Never split stage 2 across subagents. Whoever runs it treats the five invariants in Finding B as acceptance criteria and re-reads them before declaring the stage done.

Ways any model drifts here, all seen in this codebase's neighbourhood:

1. "Simplifying" the held category — closing the popover on the last uncheck, or unchecking the category with it. Both are explicitly wrong.
2. Reintroducing a mirror: a ref, or a `useEffect` that copies props into state, to make batched selection work. The intent shape exists precisely to remove that.
3. Turning the `selected` prop into local state inside the picker or `EntitySelect`. One home for the selection: the card's draft.
4. Proposing a form library (`react-hook-form`, `zod`) because validation looks hand-rolled. Out of scope; the pure functions are the deliverable's readable part.
5. Adding jsdom or testing-library despite the settled decision, usually while "making the tests better".
6. Creating `tailwind.config.js`. This is Tailwind v4 — the theme lives in `@theme inline` in `index.css`.
7. Volunteering a fix for the light-brand citron contrast. Decided and forbidden in [2026-08-22-dual-skin-apply.md](./2026-08-22-dual-skin-apply.md).
8. Rewriting `AmountField`'s caret handling or `FitEntityNames`' measurement because they look odd. Finding D.
9. Collapsing the four cards in `NotificationsPage` into a config array. Tempting, deliberately not now.

## Open

- The four near-identical card blocks in `NotificationsPage.tsx`. Worth revisiting only if a fifth rule appears.
- `theme-provider.tsx` is 313 lines of prototype chrome — keyboard shortcut, cross-tab sync, transition suppression. A stranger reading the repo meets it early.
- Theme persists in `localStorage`, skin only in the URL, so "sandbox defaults to light" holds only for a visitor who never changed the theme by hand.
- `FitEntityNames` is the most fragile code in the tree. Only the spec keeps it.

## Do not

- Do not change any behaviour except Finding A1. This round is about the shape of the code.
- Do not re-grill the card control, the table method, or anything in [2026-08-22-card-summary-table.md](./2026-08-22-card-summary-table.md).
- Do not touch `src/components/ui/**` beyond the eslint override, and do not hand-edit `brand.generated.css`.
- Do not let `prototype/` import from `work/`. The deliverable stays self-contained.
- Do not commit or push without an explicit ask.
