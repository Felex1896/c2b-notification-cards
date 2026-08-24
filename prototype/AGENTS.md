# AGENTS — prototype

How code is written in this folder and how a change is proven. What the product does is a separate document, `target-flow.md`, kept with the project notes outside this folder; it is the canon for behaviour and this file never restates it.

The code here is written by AI agents and reviewed by a designer who does not read code. Every claim about a change therefore has to be either machine-checked or readable as plain English. That single constraint shapes everything below.

## Gates

`npm run verify` runs typecheck, tests, lint, the test-presence check and the skin check, stopping at the first failure. It is the only definition of done in this folder.

Exception: if the human invoked `/quick-fix` this turn, do not run `verify` or `fix`. Done is values written into existing slots, or a stop message if no slot exists.

Run `npm run fix` before it — `eslint --fix` plus prettier — so the gate never fails on formatting.

Run the gate once, at the end of a piece of work. Not after every edit.

Never make a check pass by silencing it. `eslint-disable`, `@ts-ignore`, `it.skip`, a widened `any`, a new name in a debt list — each needs the human to agree first. A rule firing on code you believe is legitimate is a finding to report, not an obstacle to route around.

## Layers

| Folder | Holds | Rule |
| --- | --- | --- |
| `src/lib` | Pure functions — validation, selection, formatting, summary rows | No React. Every file has a sibling `*.test.ts`. Both enforced by `verify` |
| `src/hooks` | React state glue | — |
| `src/components` | Rendering and user intent | Logic expressible without React belongs in `src/lib` |
| `src/components/ui` | shadcn, as generated | Do not edit. Restyle through CSS variables |
| `src/data` | Category and brand catalog | Data, no logic |
| `src/styles` | Brand values | `brand.generated.css` is written by a generator outside this folder — never hand-edit it |

Components report what the user did; the owner decides what it means. The picker emits a `SelectionIntent`, the card applies it through a functional state update. Do not reintroduce a mirror of the selection — a ref, or an effect copying props into state — to make a batched change work. The intent shape exists to remove exactly that.

`max-lines` is 300. Two files are over it today and sit in a debt list in `eslint.config.js`. That list only shrinks, and only the human adds to it. A hard cap would force a split of files that already work; the debt list exists so the rewrite is a human call, not a gate surprise. 300 is a first guess and may be retuned.

## Tests

Vitest on pure functions. No jsdom, no testing-library, no browser-scenario tests — the human clicks the prototype himself, and a test he cannot read is worth nothing to him. Every `src/lib` file has a sibling test so new logic cannot land unproven; the test name is the part he can actually review.

A test name is a sentence about behaviour, lifted from the spec: `unchecking a category leaves other categories alone`. Not a description of the implementation.

A failing test is a question for the human. Never edit the assertion, and never adjust the function, to turn red green on a guess.

## Before writing code

If a change needs a line in the behaviour spec, it is a behaviour change: ask first. Numbered questions, one decision each, a recommendation with its trade-off, then wait for an answer. Visual work, copy, and refactors that keep behaviour identical do not need this — do them and show the result.

## After writing code

If `/quick-fix` ran this turn: which files changed, what to look at on screen, that `verify` was skipped. Stop there.

Otherwise three items, in the language of the chat, nothing more:

- `verify` — green, or red with the reason.
- Deviations from the plan — where you did something other than agreed, or left something undone. Usually none.
- Names of new tests, one per line. Omit when behaviour did not change.

Deviations is the only one the human cannot get anywhere else. The other two are a machine result and a list he can read himself.

## Do not

- Do not add a dependency unasked. No form library in particular: the hand-written predicates in `src/lib/rules.ts` are the readable part of this deliverable.
- Do not create `tailwind.config.js`. This is Tailwind v4 — the theme is `@theme inline` in `src/index.css`.
- Do not collapse the four rule cards in `NotificationsPage` into a config array. They are near-identical on purpose until a fifth rule exists.
- Do not rewrite the caret handling in `AmountField` or the canvas measurement in `FitEntityNames`. Both look wrong and are not: one holds the cursor in place while the value is sanitised, the other implements "as many names as fit one line, then +N".
- Do not import from outside this folder. The prototype is published on its own.
- Do not commit or push. Ask.
