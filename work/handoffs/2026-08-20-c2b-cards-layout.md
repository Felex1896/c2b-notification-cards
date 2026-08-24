---
type: Note
title: Handoff — C2B card layout
description: Pickup note — prototype runs; next is controls and layout, not a re-grill.
tags: [c2b, prototype, layout]
status: deprecated
---

# Handoff — C2B card layout

Deprecated. Accordion-as-settled and “next = layout” are history. Behaviour: [target-flow.md](../specs/target-flow.md). Pickup: [2026-08-23-code-gates.md](./2026-08-23-code-gates.md). Do not execute.

## Goal for the next session

Adjust **controls and element layout** on the four-card Notifications prototype. Interaction and validation already work. Human is the designer: take their layout notes, change placement/sizing/chrome, keep the state machine unless they ask to change it.

## Settled (do not re-open)

- Run: `cd prototype && npm run dev` → http://localhost:5173/
- Stack: Vite + React + TS + shadcn (Radix, Tailwind). Neutral sandbox on purpose; Citron yellow/black is a later pass, not this slice unless asked.
- Card behaviour: [target-flow.md](../specs/target-flow.md). Product facts: [current-product.md](../current-product.md). Map: [index.md](../../index.md).
- Accordion, per-card Apply/Cancel, mute-only toggle (disabled until first Apply, tooltip), header/chevron do not collapse while expanded, no pencil, empty ≠ all, Mixer/Lending = category checkbox only, several cards may be open.
- State lives in `src/lib/use-rule-card.ts` + `src/lib/rules.ts`. Layout chrome: `src/components/RuleCard.tsx`. Fields: `AmountField.tsx`, `ChannelFields.tsx` (Slack | Telegram), `CategoryBrandPicker.tsx`, `FirstDepositFields.tsx`. Page: `NotificationsPage.tsx`. Primitives: `src/components/ui/`.
- Field error slot: [prototype README](../../prototype/README.md).
- Smoke-tested: empty Apply → “Required field”; valid Apply → collapsed summary + toggle on; mute does not open; two cards open; Categories header indeterminate when Mixer only.

## Open

- Exact control placement, spacing, hierarchy — human will direct.
- Citron visual system is documented in [design-system/](../design-system/index.md). Applying it to the prototype is a separate ask — see [2026-08-21-design-system.md](./2026-08-21-design-system.md).
- Take-home deliverable form (Figma vs code vs both).
- CSV screens — out of this prototype unless asked.

## Suggested skills

None. Do not invoke `grilling` on this control. Follow layout notes; keep copy/polarity from the spec. `handoff` at session end. Do not put Citron terms in `CONTEXT.md`.

## Do not

- Re-scaffold the Vite app or put this under `portfolio/site/`.
- Re-open toggle-as-accordion, pencil, header-click-to-close, `border`, Setup drawer, Profile → Notifications.
- Build Slack/Telegram Manage/connect. Copy live Citron chrome. Name the current employer.
- Rewrite Apply/Cancel/mute logic to “fix” layout.
