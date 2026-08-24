---
type: AgentGuide
title: AGENTS — C2B Analytics
description: How to work inside the C2B Analytics take-home.
tags: [c2b, harness]
---

# AGENTS — C2B Analytics

Delta for this take-home. This copy is the assignment folder on its own — the category and repository harness files are not in this tree. The brief is the authority. The clickable prototype is `prototype/`; research, spec, and session notes are `work/`.

## What this is

A take-home for a prospective employer. Understand live C2B (wallets, CSV, alerts), then propose a clearer admin setup. Map: [index.md](./index.md).

## Where things are

| Need | File |
| --- | --- |
| What to build and how it behaves | [work/specs/target-flow.md](./work/specs/target-flow.md) — the canon |
| How the live product works today | [work/current-product.md](./work/current-product.md) |
| Categories and entities in the picker | [work/catalog.md](./work/catalog.md) |
| Where the last session stopped | [work/handoffs/](./work/handoffs/index.md) — only the non-deprecated row is pickup |
| Visual system | [work/design-system/](./work/design-system/index.md) |

## Spec is the canon

Behaviour lives in [work/specs/target-flow.md](./work/specs/target-flow.md) before it lives in code. A change to what the product does starts with a line there, agreed with the human, and only then reaches `prototype/`. Visual work, copy, and refactors that keep behaviour identical skip this — the spec is not a changelog.

Split the spec when it passes roughly 400 lines, or when a surface can be worked on independently: the longer flow the notifications page sits inside becomes its own file in `work/specs/`. Cross-cutting decisions stay in one file and are read every time. Do not pre-split into a tree of leaves — mute vs Apply, channel inherit, and empty ≠ all are invariants that live on every card; an agent that reads an index and opens the wrong leaf can break one of them with nobody watching. 400 is a first guess, same as the code-line cap.

## Prototype

`prototype/` is the deliverable: Vite + React + TypeScript, shadcn/ui on Radix and Tailwind v4. Run with `cd prototype && npm run dev`.

How code is written there — layers, gates, tests, what to ask before writing — is [prototype/AGENTS.md](./prototype/AGENTS.md) and only there. It loads when an agent touches that folder, and the reviewer reads it next to the code.

Keep it self-contained — it is meant to be published on its own later. Nothing in `prototype/` links to or imports from files outside it (the token generator writes inward instead), and its README carries no frontmatter, because GitHub renders that as a broken table. The pointer from prototype to spec lives here instead.

Field-error layout rule: [prototype/README.md](./prototype/README.md).

## Skins

Two skins in one tree, so both stages of the work stay reachable in the running app: `sandbox` (shadcn defaults, Geist) and `brand` (the documented system, Inter). `data-skin` sits on `<html>` next to `.light` / `.dark`; all four combinations are real. Default skin is brand and default brand theme is dark; sandbox defaults to light. `?skin=` is the shareable URL.

The skin and theme toolbar above `NotificationsPage` in `App.tsx` is prototype chrome, not product — keep it out of [work/specs/target-flow.md](./work/specs/target-flow.md).

### Pipeline

| Need | Where |
| --- | --- |
| Brand values, both modes | [work/design-system/tokens.json](./work/design-system/tokens.json), [tokens.light.json](./work/design-system/tokens.light.json) |
| Generator, and the map from system roles to shadcn names | [work/design-system/to-css.mjs](./work/design-system/to-css.mjs) — `node work/design-system/to-css.mjs` from this assignment folder |
| Generated brand variables | `prototype/src/styles/brand.generated.css` — regenerate, never hand-edit |
| Hand-written brand anatomy | `prototype/src/styles/brand.overrides.css` |
| Colour/font literals and override count | `cd prototype && npm run check:skin` |

The generator stays outside `prototype/`: a script inside the deliverable reading `../../work/` is a link outward that breaks when the prototype is published alone. Its role map is where the accent decision physically lives — shadcn's `--accent` is a neutral hover filled from `surface.muted`, not from the system's citron `accent` role.

### Where a value goes

- **Named token** — colour, font and radius roles, plus input padding, card radius, `--field-prefix-width` and font family. Edit `tokens*.json`, regenerate.
- **Override rule** — anything else the brand skin needs different, hand-written in `brand.overrides.css`.
- **JSX** — at most one `skin` fork per component, and only to add or remove an element or change text. Colour and spacing go through a token or an override, never a fork.

Leave a value inline when it is fused with a state selector (`has-…:`, `group-…:`, `data-…:`, `dark:`, `focus-visible:`) — porting those rewrites settled behaviour by hand — or when it is not a design decision (`pb-16` clears the sticky footer, `translate-x-[…]` is switch geometry, `w-full` / `max-w-md` are page layout). Naming those asserts intent that does not exist.

### Promotion counter

Three override rules on one component → move that component's anatomy into the named tokens now. Twelve rules in the file → stop and promote across the file. `check:skin` prints the counts and warns past them; it does not fail the build. The thresholds are a first guess and may be retuned.

### Light brand

Ships with its known failures: the Apply fill, switch on-state, checked checkbox and focus ring all sit on citron, ~1.02:1 against canvas. Leave that contrast alone — the human reviews the whole visual before sending. Design-system docs hold measurements and application rules, not ship gates; do not re-add gate clauses to them.

## Showing this to the reviewer

The prospective employer sees this folder, as a copy, `work/` included — handoffs are the evidence that the process exists, not an embarrassment. The rest of the repository is private and stays out.

The copy is where the links break: this file's first line, and several handoffs, point above this folder. Before sending, in the copy and never in the original, resolve those upward links — inline the sentence they carried or drop it — and confirm `prototype/` still imports and links nothing outside itself.

Snapshot shape, grilled: private GitHub, invite-only; one commit; frozen after the link is sent (keep working here); live prototype URL with no login; README on the copy states it is intermediate (visual pass and the longer flow still open). Commit here first, then copy — do not leave the sent tree ahead of this one.

## Do not

- Do not copy live cabinet chrome (layout, copy, Setup machines), and do not read login or the cabinet as design sources. The brand reference is the marketing landing.
- Do not put take-home material into `portfolio/`, and do not treat this work as a Case.
- Do not put Citron terms in a glossary above this folder. If they need a home, it is a `CONTEXT.md` here.
- Do not re-grill the card control or the table method (edit and collapsed). Both are settled in the spec.
