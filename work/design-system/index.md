---
type: Index
title: C2B design system
description: Visual system for the C2B Analytics take-home prototype.
tags: [c2b, design-system]
---

# Design system

Read [sources.md](./sources.md) first — precedence and modes live there. These files are the source of the brand skin; the generator is [to-css.mjs](./to-css.mjs). Do not hand-edit `prototype/src/styles/brand.generated.css`.

| Path | Contains | Triggers |
| --- | --- | --- |
| [sources.md](./sources.md) | Inputs, precedence, two modes, dark default | sources, landing, modes, theme |
| [tokens.md](./tokens.md) | Roles, application rules, contrast, open list | tokens, contrast, palette, Golos Text |
| [tokens.json](./tokens.json) | Primitive values and dark semantics | tokens.json, oklch, dark |
| [tokens.light.json](./tokens.light.json) | Light semantic colours | light theme, invert |
| [components.md](./components.md) | Button, Input, Card, Badge, Switch, Checkbox, Select, Field error | components, button, switch, checkbox |
