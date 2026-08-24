---
type: Note
title: C2B design-system sources
description: Inputs, precedence, and modes for the take-home visual system.
tags: [c2b, design-system]
sources:
  landing: https://ctrn.pro/
---

# Sources

Visual system for this take-home's prototype. Brand skin is generated from the token files here. Precedence below still holds when a value is missing or two inputs conflict.

## Inputs

| Input | Role |
| --- | --- |
| Human | Designer. Closes gaps the landing does not show. Overrides every row below. |
| Marketing landing | [ctrn.pro](https://ctrn.pro/). The visual source. |

Not sources: live login, live cabinet, Processing docs, the prototype's current greys and Geist.

Landing as captured 2026-08-21: dark-only, no theme toggle, Inter, shadcn-shaped `:root` in HSL, citron `--primary: 63 100% 50%`. Login shares those variables; it is still not a source.

## Precedence

1. Human call in session.
2. Landing.
3. Invent with the human anything the landing does not show.

## Modes

Two. Dark is the default. Light is invented — invert the landing greys, plus `color.neutral.41` and `color.red.700` so muted copy and danger text meet AA. The landing has no light theme.

Primitives stay shared. Dark semantics live in `tokens.json`. Light semantics live in `tokens.light.json`.

Colour values are stored in `oklch` (the prototype's space). Landing CSS is HSL; convert at extract.

## Open

Sources layer closed. Tokens: [tokens.md](./tokens.md).
