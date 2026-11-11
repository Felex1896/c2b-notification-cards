---
type: Spec
title: Visual pass — one style for the brand skin
description: Every component brought to the rule card and its modal — sizes, radii, button set, dialogs, menus, empty brand. Brand skin only.
tags: [c2b, spec, prototype, design-system]
status: draft
---

# Visual pass

Grilled 2026-11-10. Behaviour does not change; this file is the look. What the rule card and modal do: [rule-modal.md](./rule-modal.md). Empty-brand content: [whole-flow.md](./whole-flow.md) Empty brand.

## Reference

The rule card and its open modal, as they are in code. Everything else is brought to them.

## Skins

- **Brand** gets everything below.
- **Sandbox** returns to stock shadcn look: filled cards, shadcn radii and heights, no glass, no glow. It keeps the same layout and the same card-to-modal motion. It must stay readable — a transparent frame with no fill is a defect.

## Values

| Role | Value | Applies to |
| --- | --- | --- |
| Frame radius | 16, the table shell | Open modal, every dialog, the rule card |
| Plate radius | 16 | Inner plates, client table shell, menus, popovers, select lists, sync banner, tab list |
| Control radius | 12 | Buttons, inputs, select triggers, tab track, menu rows |
| Round | full | Switch, avatar only |
| Control height | 40 | Every text button, input, select trigger, entity picker trigger, channel picker (trigger and prefix), amount prefix, tab track, header controls (brand menu, account menu), search |
| Overline | 11px, medium, wide tracking, uppercase, muted | Every all-caps caption ("Send notifications", "Brand" in the brand menu) |

Nested corners stay concentric: inner = outer − inset (tab track 12, inset 4, pill 8; table shell 16, header inset 8, header 8).

**Collapsed rule card** uses the table pair: shell 16, inner layer 8 (the table header), inset 8 so the corners stay concentric. Its channel pickers do take the 40 height; the grid grows with them.

**Exceptions to the height:** icon buttons inside table cells (copy address, row details) keep their size — they sit in a line of text. Switch keeps its two sizes (card `default`, form rows `sm`).

## Buttons

| Kind | Use |
| --- | --- |
| Primary (citron fill) | One per block. Commits |
| Outline | Every other text button, full width when it is the commit inside a dialog plate: Add, Allow, Send code, Done, Upload, Copy, account |
| Ghost | Icon-only buttons (close cross, burger, row delete) and the text **Close** under a plate |
| Link | Inside running text only |

Gone: small button size, destructive tint (Remove is outline; the confirm text carries the risk), secondary-filled menu rows ("Connect Slack", "Add brand" become ordinary menu rows with a Plus icon), citron-bordered round header buttons, ghost text buttons.

## Switchers

One tab track holds Citron AI, C2B and B2B. The divider sits inside the track, after Citron AI. Citron AI is an inverse pill (light fill and dark text on the dark theme, the reverse on light), with no citron border. B2B and Overview stay not-in-prototype stubs and take the same pill padding. Every tab track is 40px tall with button radius; every pill is 32px with button radius minus 4px. Same track for Clients / Notifications and Slack / Telegram / Email.

## Forms

Label left, 160px column, on the rule modal. Email connect is one control: the amount-field prefix chrome, the word **Email** in the prefix, no row border. Slack's channel checkboxes stay a checklist on a plate.

## Dialogs

- Frame 40. Content on plates (16). Every dialog's max width is 560px.
- The commit inside a plate is an outline button stretched to the plate's width (Add, Allow, Send code, Done). **Close** is a ghost text button immediately under the plate, right-aligned. There is no Cancel on these steps. Remove confirm stays inside the item's row (Remove / Cancel).
- The rule modal footer, below the plate: **Apply** (citron) then **Close** (ghost, discards). The corner **X** stays.
- Telegram's bot name and command look like read-only inputs (40), Copy is an outline button (40).

## Menus and popovers

Plate radius (16) and the plate's hairline border. Fill stays solid popover colour — no glass over the glass modal.

## Tables

Client table shell 16, header 8.

## Pages

Client list and Notifications start at the same left edge, 16px in from the content column. The column is at most 1600px and centred. The page tabs sit on that same inset. Empty brand is a centred landing inside the same column; its role frame hugs the plates.

**Empty brand**, centred, one landing screen, top to bottom (revised 2026-11-10 — replaces the two-column version):

- Hero: title, intro, **Download template** (outline) and **Upload wallets** (primary) under them.
- Roles: one framed section — heading, three plates, flow line. Each plate is at most 400px wide: icon tile (placeholders: deposit `ArrowDownToLine`, central `Landmark`, withdrawal `ArrowUpFromLine`), role name, meaning. Plates sit in a row from 1024px and stack below; arrows between them show the money path.
- Example file: heading, then the table in the Client list's style — same shell, pill header and row height. Addresses shortened as `0x5b1e…17c3`.
- Existing copy only.

## Code home

- Numbers are named tokens in `tokens.json` → generator → `brand.generated.css`: frame, plate and control radius, control height, overline size.
- What a number cannot say (glass, tab glow, switch geometry, dialog anatomy) is a rule in `brand.overrides.css`, scoped to brand.
- The hand-written reference rules now in `index.css` move under brand. `index.css` keeps only what both skins share (theme mapping, sandbox variables, layout helpers).
- `check:skin` thresholds rise to the real counts after the move; the new numbers are written where the old ones were.
- Design-system docs (`tokens.md`, `components.md`) describe these values and this button set.

## Out of scope

Prototype toolbar. Light-brand contrast (known failures stay). Copy. Behaviour.

## Acceptance

- Brand, both themes: one control height across every screen except the listed exceptions; four radii only.
- No small, destructive, secondary-filled or citron-bordered buttons remain.
- All switchers look the same.
- Every dialog is at most 560px wide. Close sits under the plate; the rule modal keeps Apply beside it.
- Empty brand matches the layout above and does not scroll at 1440×900.
- Sandbox: stock shadcn look, same layout and motion, readable in both themes.
- `npm run verify` green; `src/components/ui/` has no diff; no new dependency.
