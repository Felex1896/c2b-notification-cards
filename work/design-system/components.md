---
type: Spec
title: C2B design-system components
description: Catalog for the take-home prototype. Landing recipes plus invented admin controls.
tags: [c2b, design-system]
status: draft
sources:
  landing: https://ctrn.pro/
---

# Components

Tokens: [tokens.md](./tokens.md). The prototype consumes these recipes through the token generator. No `components.json` — that file appears only for an MCP or Storybook consumer.

Landing-measured: Button, Input, Card, Badge. Invented to sit next to them: Switch, Checkbox, Select, Field error. Hover fills were not distinct on the landing; focus uses `color.border.ring` and `motion.role.color` (light ring fails 3:1 — see tokens Open). Disabled: fade, do not recolor.

Do not document product composites (the four alert cards). Those are the spec, not this catalog.

## Button

**Identity.** Commits an action. Citron fill is the only loud control.

**Variants.** `primary` — `color.action.primary` fill, `color.action.primary-foreground` label, `radius.control.default`. `ghost` — no fill; nav uses `color.text.muted` and `typography.ui`, a stronger ghost (Log In) uses `color.text.foreground` and `typography.label`. `outline` — transparent fill, `color.border.input` edge, `color.text.foreground` label, hover `color.surface.muted`. `link` — `color.text.foreground`, underline on hover; not citron.

**Sizes.** `default` — compact, as Sign Up / Send Message (`typography.label`). `large` — marketing CTA only (`typography.title`). Prototype uses `default`.

**States.** Default, hover (colour shift via `motion.role.color`, no extra swatch), focus (`color.border.ring`), disabled (fade), active.

**When to use.** One primary per cluster. Ghost for nav and secondary actions. `outline` for Cancel in a card footer. `link` for in-copy actions that are not a commit ("Use a different chat", "Use page default").

**When not to use.** Do not use `primary` for mute, cancel, or row chrome. On light, `primary` fill fails 3:1 against canvas and card. No destructive-filled button — that pair fails AA on dark; danger is Field error text.

## Input

**Identity.** Single-line text. Landing contact fields: canvas fill, hairline edge.

**Variants.** One. Select trigger shares this chrome.

**Sizes.** One: `typography.ui`, `radius.control.default`, `spacing.scale.8` / `spacing.scale.12` padding.

**States.** Default — `color.surface.background`, `color.border.input`, `color.text.foreground`, placeholder `color.text.muted`. Focus — `color.border.ring`. Invalid — edge follows Field error (see open). Disabled — fade.

**When to use.** Typed values (amount, chat name, message).

**When not to use.** Picking from a list — Select. On/off — Switch. Multi-select brands — Checkbox.

## Card

**Identity.** Raised panel. `color.surface.card`, `color.text.card`, `radius.box.default`. No shadow (`shadow.glow.brand` is marketing CTA bloom).

**Variants.** One surface. Title `typography.title`, supporting copy `typography.body` or `typography.ui` in `color.text.muted`.

**Sizes.** One. Inset `spacing.gap.default` or `spacing.gap.relaxed`.

**States.** Resting. Not a control — no hover fill.

**When to use.** A contained block on the canvas (alert card, form group).

**When not to use.** Overlay menus — `color.surface.popover` on Select. Page background — `color.surface.background`.

## Badge

**Identity.** Status chip. `radius.control.pill`, `typography.caption`.

**Variants.** `brand` — on dark, `color.action.primary` as text (landing “High Value”, “Live”). On light, citron-as-text fails; citron fill vs canvas also fails 3:1.

**Sizes.** One.

**States.** Resting. Not interactive.

**When to use.** A short status next to a title or metric.

**When not to use.** Actions — Button. Section labels — `typography.label` without a pill.

## Switch

**Identity.** Invented. Immediate on/off (mute). Not a form submit.

**Variants.** One.

**Sizes.** `default` and `sm` (prototype hit-targets). Track `radius.control.pill`.

**States.** Off — `color.surface.control` track, thumb `color.text.foreground`. On — `color.action.primary` track, thumb `color.action.primary-foreground`. Focus — `color.border.ring`. Disabled — fade.

**When to use.** A single binary that takes effect now.

**When not to use.** Multi-select — Checkbox. Opening a form — not this control (card footer **Set up** / **Edit**).

## Checkbox

**Identity.** Invented. Include / exclude one item. Category header may be indeterminate.

**Variants.** One.

**Sizes.** One box, `radius.scale.4`.

**States.** Unchecked — `color.border.input`. Checked and indeterminate — `color.action.primary` fill, icon `color.action.primary-foreground` (check vs minus). Focus — `color.border.ring`. Disabled — fade.

**When to use.** Independent picks, including “all in this category”.

**When not to use.** One-of-many — Select. Instant mute — Switch.

## Select

**Identity.** Invented. Pick one from a list. Trigger chrome = Input.

**Variants.** One.

**Sizes.** Trigger matches Input. Menu `color.surface.popover`, `color.text.popover`, `radius.box.default`, no brand glow.

**States.** Trigger: same as Input, placeholder `color.text.muted`. Open: list. Highlighted row `color.surface.muted` (not citron). Chosen row may tick; label stays `color.text.foreground`. Focus — `color.border.ring`. Disabled — fade.

**When to use.** One value from a known list.

**When not to use.** Several brands at once — Checkbox. Free text — Input.

## Field error

**Identity.** Invented. One-line hint under a validatable control. Layout slot is the prototype rule (always mounted, does not grow). This entry is the colour and type only.

**Variants.** One.

**Sizes.** `typography.ui`, one line, truncate.

**States.** Empty slot (no message). Invalid — `color.action.destructive` text. Passes AA on canvas and card in both modes.

**When to use.** Under every control that can fail. Skip on controls that cannot (period, filter checkboxes).

**When not to use.** Page-level banners. Inline on the control instead of the slot.

## Open

- Primary hover has no extra swatch.
- Invalid Input/Select edge is a destructive hairline — decorative, not a text pair.
- Light primary fill, badge fill, and focus ring fail 3:1 — see tokens Open. Catalog still names the landing tokens.
