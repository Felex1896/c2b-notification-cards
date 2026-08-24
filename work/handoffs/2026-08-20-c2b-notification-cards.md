---
type: Note
title: Handoff — C2B notification cards
description: Pickup note — grilled alert-card control, next is a clickable prototype.
tags: [c2b, prototype, cards]
status: deprecated
---

# Handoff — C2B notification cards

Superseded by [2026-08-20-c2b-cards-layout.md](./2026-08-20-c2b-cards-layout.md) — the prototype described below now exists.

## Goal for the next session

Build a **clickable prototype of the four C2B alert cards** (balance / entity withdrawal / entity deposit / first deposit). Interaction is settled in [target-flow.md](../specs/target-flow.md). Product facts (polarity, live traps, CSV) live in [current-product.md](../current-product.md). Do not re-grill the card. Ask stack + folder, then implement states: empty, editing, Apply validation, collapsed read-only, mute toggle, Cancel.

## Settled (do not re-open)

- Same four Citron rules; no fifth. Polarities and First deposit = one category + brand multi-select: [target-flow.md](../specs/target-flow.md) Decisions + [current-product.md](../current-product.md) (live “Category filter” is brands, mislabeled).
- Card chrome: accordion, per-card Apply/Cancel, read-only collapsed values, chevron + title/summary to open, **no pencil**, toggle mute-only (disabled until first Apply, tooltip to set up first). Header/chevron while expanded do **not** close — only Cancel or Apply.
- Categories header tri-state; checking a category selects all brands; clearing all brands unchecks the category; empty ≠ all. At least one of Slack/Telegram. Channels mocked (no Manage). Several cards may be open.
- Settings belong in C2B Notifications, not Profile. Full admin path (CSV → sync banner → clients) is in the same spec; **this slice is the cards only**.
- Map: [index.md](../../index.md). Walkthrough screenshots: prior chat `e608af4d-c611-4cfa-9792-27c4f4192237` assets, not git.

## Open

- Prototype folder and stack (do not put this under `portfolio/site/` unless the human asks). Sensible default to propose: `prototype/`.
- Visual: Citron yellow/black from live screenshots vs a neutral sandbox. Human is the designer — ask.
- Take-home **deliverable form** (Figma vs code vs both) still unspecified.
- CSV onboarding screens are specified, not grilled this session — out of this prototype unless asked.

## Suggested skills

None to start. Read the two assignment files. Do not invoke `grilling` on this control. `handoff` only at session end. Do not put Citron terms in `CONTEXT.md`.

## Do not

- Re-open toggle-as-accordion, pencil, Add-Entity First deposit, `border`, Setup drawer, Profile → Notifications as the IA.
- Header-click to collapse an open card.
- Scaffold `portfolio/site/` for this take-home.
- Build Slack/Telegram **connect** (Manage). Mock chats in the pickers.
- Treat B2B market tables as uploaded clients. Copy live Citron chrome. Name the current employer.
