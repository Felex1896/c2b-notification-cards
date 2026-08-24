---
type: Note
title: Handoff — C2B design system review
description: Pickup note — first document run is written; next session audits it, does not restyle the prototype.
tags: [c2b, design-system]
status: deprecated
---

# Handoff — C2B design system review

Deprecated. Docs exist and the brand skin is applied. Visual system: [design-system/index.md](../design-system/index.md). Pickup: [2026-08-23-code-gates.md](./2026-08-23-code-gates.md). Do not execute.

## Goal for the next session

Audit the take-home visual system that this chat documented. Confirm the files match the design-system shape already in this folder's docs, and the grilled answers below. Report drift in the docs themselves (wrong names, values in markdown, missing `$description`, contrast that does not match the JSON). Do not apply tokens to `prototype/` unless the human asks in that session.

Map: [design-system/index.md](../design-system/index.md).

## Settled (do not re-open)

Document mode, one layer per round, prototype untouched. Human is the designer; gaps the landing does not show were invented with them.

Grilled:

1. Source: marketing landing [ctrn.pro](https://ctrn.pro/) only. Login, cabinet, Processing docs, prototype greys/Geist — not sources. Missing controls invented.
2. Two modes. Dark default (`tokens.json`). Light in `tokens.light.json`.
3. Palette: visible landing + greys / citron / destructive. No phone-input cyan, no sidebar tokens.
4. Light neutrals = channel-invert of measured RGB. Citron stays.
5. Semantic names follow shadcn roles on the axis `category.concept.role.state`.
6. Light `text.muted` is not a pure invert — extra primitive `color.neutral.41`.
7. Catalog: Button, Input, Card, Badge (landing) plus Switch, Checkbox, Select, Field error (invented).
8. Light `action.destructive` uses extra primitive `color.red.700`.

Values in oklch. Measured 2026-08-21 at 1613×907, DPR 2. Inter, citron ≈ landing `--primary: 63 100% 50%`. Accent = primary. Popover = card. Citron is fill (and dark metric text); never body copy; never text on light. Badge on light is citron fill, not citron text. Switch/checkbox on = citron.

Card control and Notifications behaviour stay in [target-flow.md](../specs/target-flow.md). Do not re-grill them.

Layout pickup for the prototype (not this review): [2026-08-20-c2b-cards-layout.md](./2026-08-20-c2b-cards-layout.md).

## Open

Accepted leftovers, not new grilling unless the human re-opens them:

- `text.muted` on `surface.muted` fails AA both modes — do not stack.
- Filled destructive + `destructive-foreground` fails AA on dark. No destructive button in the catalog.
- Hairline border fails 3:1 (decoration).
- Primary hover has no extra swatch.
- Applying the system to the prototype. Take-home deliverable form (Figma vs code).

`design-system` *check* vs `prototype/` will show expected drift (neutral Geist sandbox). Run it only if the human wants that list.

## Suggested skills

`design-system` — read it before judging the folder. Do not invoke `grilling` on Q1–Q8. `handoff` at session end.

## Do not

- Do not restyle `prototype/` or swap Geist for Inter without an explicit apply ask.
- Do not treat login or the live cabinet as sources.
- Do not re-extract a full `:root` dump (sidebar, cyan).
- Do not copy values into markdown. Contrast stays in `tokens.md`; swatches stay in JSON.
- Do not add `components.json` (no consumer).
- Do not re-open the card state machine, `border` as a product word, or Setup/Profile chrome.
- Do not put take-home material in `portfolio/`. Do not commit or push without an ask.
