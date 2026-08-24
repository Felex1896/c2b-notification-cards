---
type: Note
title: Handoff — Card summary table
description: Tables shipped for edit and collapsed. Spec is the canon. Visual pass is leftover.
tags: [c2b, prototype, table, handoff]
status: deprecated
---

# Handoff — Card summary table

Deprecated. Tables live in [target-flow.md](../specs/target-flow.md) and the prototype. Visual pass remains on the project index. Pickup: [2026-08-23-code-gates.md](./2026-08-23-code-gates.md). Do not execute.

## Goal for the next session

Tables are in the prototype. Next is a **visual pass** if the human directs it (spacing, column width, compact amount chrome). Do not rewrite the spec. Do not re-grill. Canon: [target-flow.md](../specs/target-flow.md).

## Settled (do not re-open)

Now in the spec. Short copy:

Card chrome unchanged. Channels at the bottom. No chats in the header, mute not on the left, no entity tag chips. One headered table method, columns per rule. Page `max-w-2xl`. Light horizontal rules.

- **Wallet balance** — Direction | Amount.
- **Entity** — Category | Entity | Min amount. Header default; row inherit + `Reset unique value`. `categoryAmounts` on `EntityValues`.
- **First deposit** — Category | Entity | Turnover | Balance. Filter cell toggle. Balance has no period.
- Collapsed: same headers, included rows, brand `+N`, inherited amount muted, FD off = `—`, override chats under the table.

Do not apply [design-system](../design-system/index.md) tokens until asked. Run: `cd prototype && npm run dev`.

## Open

Optional ADR for default+override vs live one-threshold-per-type — only if the human asks. Dual-skin still a separate thread ([2026-08-22-dual-skin-plan-review.md](./2026-08-22-dual-skin-plan-review.md)).

## Suggested skills

None. Do **not** invoke `grilling` on tables, accordion, or amount inherit. Layout notes from the human; keep behaviour from the spec.

## Do not

- Re-open mute-as-accordion, pencil, header-click-to-close, `border`, Setup, Profile → Notifications.
- Copy live cabinet chrome. Name the current employer. Scaffold under `portfolio/site/`.
- Invent a period on First deposit balance.
- Put chats in the card header. Re-introduce the category accordion or `·` summary paragraphs.
