---
type: Spec
title: C2B design tokens
description: Roles, application rules, and contrast for the take-home visual system. Values in the JSON.
tags: [c2b, design-system]
status: draft
sources:
  landing: https://ctrn.pro/
---

# Tokens

Values live in [tokens.json](./tokens.json) (dark, default) and [tokens.light.json](./tokens.light.json). This file has no swatches.

Design-system docs hold measurements and application rules, not release gates.

Measured from the landing at 1613×907, DPR 2, 2026-08-21. Landing-derived values are approximate. Light greys are channel-inverts of those RGB values, except `color.neutral.41` (invented so light `text.muted` meets AA). `color.red.700` is invented so light `action.destructive` meets AA. No component tier yet.

## Color

Primitive: `color.neutral.*` (lightness steps), `color.citron.500`, `color.red.600`, plus invented `color.neutral.41` and `color.red.700`. Sidebar and phone-input cyan stayed out.

Semantic roles follow shadcn names under `color.surface.*`, `color.text.*`, `color.action.*`, `color.border.*`. `accent` is the same citron as `primary`. `popover` is the same as `card`. `surface.control` is a fill; `border.input` is the matching hairline.

**Apply**

- Citron is a fill (and, on dark only, a metric). Never body copy.
- On light, citron-as-text fails. Citron fill and `border.ring` against canvas or card also fail 3:1 — fill is not a pass.
- Brand skin fills shadcn `--accent` / `--accent-foreground` with `surface.muted` / `text.foreground`, not with the system's `accent` role. shadcn `--accent` is a neutral hover (Select highlighted row). System `accent` is brand highlight. Same word, different job.
- `text.muted` sits on `surface.background` or `surface.card`, not on `surface.muted`. Same for `action.destructive` — not on `surface.muted`.
- Destructive on the landing is warning text, not a filled button.
- Hairline borders are decorative. Do not treat them as a contrast pair.

### Contrast — dark

| Pair | Ratio | AA | AAA |
| --- | --- | --- | --- |
| text.foreground on surface.background | 17.36:1 | pass | pass |
| text.foreground on surface.card | 16.01:1 | pass | pass |
| text.secondary on surface.background | 12.10:1 | pass | pass |
| text.muted on surface.background | 4.92:1 | pass | fail |
| text.muted on surface.card | 4.54:1 | pass | fail |
| text.muted on surface.muted | 4.08:1 | fail | fail |
| action.primary-foreground on action.primary | 17.66:1 | pass | pass |
| action.primary as text on surface.background | 17.66:1 | pass | pass |
| action.primary as text on surface.card | 16.29:1 | pass | pass |
| action.destructive as text on surface.background | 5.14:1 | pass | fail |
| action.destructive as text on surface.card | 4.74:1 | pass | fail |
| action.destructive as text on surface.muted | 4.26:1 | fail | fail |
| action.destructive-foreground on action.destructive | 3.62:1 | fail | fail |
| border.default on surface.background | 1.28:1 | fail 3:1 (UI) | — |

Hero / display / metric on dark all pass large-text AA and AAA.

### Contrast — light

| Pair | Ratio | AA | AAA |
| --- | --- | --- | --- |
| text.foreground on surface.background | 17.36:1 | pass | pass |
| text.foreground on surface.card | 15.86:1 | pass | pass |
| text.secondary on surface.background | 11.29:1 | pass | pass |
| text.muted on surface.background | 4.98:1 | pass | fail |
| text.muted on surface.card | 4.55:1 | pass | fail |
| text.muted on surface.muted | 4.14:1 | fail | fail |
| action.primary-foreground on action.primary | 17.66:1 | pass | pass |
| action.primary as text on surface.background | 1.02:1 | fail | fail |
| action.primary as text on surface.card | 1.11:1 | fail | fail |
| action.primary as fill on surface.background | 1.02:1 | fail 3:1 (UI) | — |
| action.destructive as text on surface.background | 5.04:1 | pass | fail |
| action.destructive as text on surface.card | 4.61:1 | pass | fail |
| action.destructive as text on surface.muted | 4.20:1 | fail | fail |
| action.destructive-foreground on action.destructive | 5.41:1 | pass | fail |
| border.default on surface.background | 1.26:1 | fail 3:1 (UI) | — |
| border.ring on surface.background | 1.02:1 | fail 3:1 (UI) | — |
| border.ring on surface.card | 1.11:1 | fail 3:1 (UI) | — |

WCAG luminance is not symmetric: the landing 50% grey that passes on dark fails on light, so light `text.muted` uses `color.neutral.41`. Same for danger: light `action.destructive` uses `color.red.700`.

## Typography

One family: Inter. Roles: `hero` and `display` are marketing; prototype uses `title`, `body`, `ui`, `label`, `caption`. `metric` is a scanned number, citron on dark only.

`typography.role.title` is the card/panel title and uses `typography.size.base` (semibold). `typography.size.xl` is a landing step with no role — do not read it as the title role. Weights: `regular`, `medium`, `semibold`, `bold`.

## Spacing

Scale is `spacing.scale.*` (`spacing.scale.6` sits off the even steps). Semantic gaps: tight, default, relaxed, section. Slack / Telegram split prefix uses `spacing.field.prefix`. Amount prefix is 64px.

## Radius

Cards `radius.box.default`. Buttons and fields `radius.control.default` (tighter). Badges `radius.control.pill`.

## Shadow

One token: citron bloom on a hero CTA. Alpha lives on the shadow token (DTCG has no alpha-on-reference); the colour is `color.citron.500`. Admin cards: none.

## Motion

Colour hover: fast + standard easing. Movement: default + the same easing.

## Open

- Light citron-as-text fails — application rule already forbids it.
- Light citron fill vs canvas (1.02:1) and vs card (1.11:1) fails 3:1. Same pair as citron-as-text: primary button, badge-as-fill.
- Light `border.ring` vs canvas (1.02:1) and vs card (1.11:1) fails 3:1. Catalog still names that token; do not treat light focus as passing.
- `text.muted` on `surface.muted` fails AA in both modes — do not stack them.
- `action.destructive` on `surface.muted` fails AA in both modes — do not stack them.
- Filled destructive + `destructive-foreground` fails AA on dark (landing red). Light fill with `red.700` passes; still no destructive button in the catalog.
- Hairline border fails 3:1 both modes (left as decoration).
- Hover / focus fills were not distinct colours on the landing.

Catalog: [components.md](./components.md).
