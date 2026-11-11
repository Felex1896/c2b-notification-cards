---
type: Spec
title: Rule card as a modal
description: Collapsed rule card in a grid; the card grows into a centred modal and back. Layout, motion, close paths, code shape.
tags: [c2b, spec, prototype, motion]
status: draft
---

# Rule card as a modal

What the rule does, when it sends, how its form validates and what the card holds: [target-flow.md](./target-flow.md). This file holds only the card frame, the modal and the motion between them.

## Problem

An open rule expands in place and pushes the page down. Long forms (15 categories) turn the list into a scroll, and several half-edited cards can be open at once.

## Solution

Each rule is a card in a grid. Opening it lifts that card off the page: the card frame grows into a centred modal while the page dims, and the form appears inside. The card's icon, title and meaning do not move — they become the modal's header. Closing runs the same motion back into the card's slot.

Built for the sandbox skin first. Brand gets the same structure and motion and differs only through its existing tokens.

## Decisions

### Card (collapsed)

- Content and behaviour: [target-flow.md](./target-flow.md) Card (collapsed).
- Icon tile: square with the card's hairline and control radius, rule icon centred in `muted-foreground`. Placeholder icons from Lucide (already a dependency): Wallet balance change `Wallet`, Entity withdrawal `BanknoteArrowUp`, Entity deposit `BanknoteArrowDown`, First deposit `Sparkles`. Placeholders — final icons are an open design item.
- **Set up** / **Edit** is an outline button.
- Muted (sending off): icon tile and toggle fade (the design system's disabled fade). Title, meaning and button stay full.
- Pointer and keyboard: only **Set up** / **Edit** opens the modal.

### Modal

- Width 560 px, capped at viewport width minus page padding. Centred on both axes.
- Height follows content, capped at viewport height minus a margin. Header and footer stay fixed; only the body scrolls.
- Header is the card's top: icon tile and title sit at the same offsets from the frame's top-left as in the card, at the same size. The meaning fills the modal's content width. Right side of the title row: **X** (ghost icon button).
- Body: the rule form. No chat pickers.
- Footer: **Apply**, then **Close** (ghost, no border) at the right. **Close** discards.
- Scrim: the overlay every dialog in the prototype already uses. Not darker, not a new value.
- Closing: **X**, **Close**, **Esc** discard the draft; **Apply** always commits and closes. A click on the scrim does nothing.
- **Esc** while a picker popover is open closes only that popover.
- Focus moves into the modal on open and returns to the card's button on close. Page scroll is locked while open.
- While open, the card's slot in the grid stays empty at the card's size. The grid does not move.
- One modal at a time: the scrim blocks the list.

### Motion

Open, in two phases:

1. The card frame moves from its slot to the centre and grows to the modal's full size (card width → 560 px, card height → full modal height). Icon and title ride along pinned to the frame's top-left, unmoved and unscaled. The meaning widens with the frame to the modal's content width. Chat pickers, **Set up** / **Edit** and the toggle row fade out as the frame lifts; **X** fades in. The scrim fades in over the same span.
2. Once the frame has its size, body and footer fade in.

Close is the reverse: body and footer fade out, then the frame shrinks back into the slot while the scrim fades out, **X** fades out and pickers, button and toggle row fade back in as it lands. After **Apply** the landing card already shows the new state (**Edit** if complete; the toggle never turns on by itself).

- Starts from where the card is on screen now, so a scrolled page still flies from the right place.
- Closing during the open motion reverses from the current position; no jump.
- Glyphs never scale mid-flight. The meaning's box widens to the modal's content width.
- On **Close** the leaving form keeps showing what it showed at the moment of the click. Values must not flick back to the applied ones while it fades.
- Frame morph is a spring, not a timed curve: Motion's `type: "spring"` with `visualDuration` and `bounce` (start near 0.35 s and 0.15, tune by eye; no visible overshoot of the slot on landing). Fades are short timed tweens on the brand `motion.role.color` values (150 ms, standard easing). Springs are not a design-system token; the values live in one constant next to the modal.
- Same motion in both skins and both themes.
- No reduced-motion branch: the full motion always plays.

### Code shape

- `motion` is added as an npm dependency (approved for this change). It owns the frame morph through one shared layout id per rule, from the card frame to the modal frame, and the exit animation.
- The modal is composed from the Radix Dialog primitives (`radix-ui`), which keep focus trap, **Esc** layering with popovers, nested dialogs and scroll lock. `src/components/ui/` stays untouched. The Motion Primitives *Morphing Dialog* is the reference for the pattern, not copied: it closes on any outside click (including picker popovers), owns its own open state, and its focus trap misses rows that appear later.
- State is unchanged: the card's existing open/closed flag drives the modal. No change to the prototype reducer.
- Brand: no `skin` fork in JSX for this change. Icon tile, ghost button and **X** use existing tokens.
- Removed with the collapsed summary: the summary table component, the "as many names as fit, then +N" entity cell, and in the rules library the summary-row builders and channel-pair builder with their tests. The rules file sits on the line-limit debt list; this shrinks it.
- Docs updated in the same change: the prototype guide (its `src/lib` summary-rows note and its keep-as-is note on the entity-names cell).

## Out of scope

- Discard confirmation on **X** / **Close** / **Esc**.
- Close on scrim click.
- Mute inside the modal.
- Reduced-motion variant.
- A layout below the 560 px width beyond the viewport cap.
- Final icons.

## Acceptance

- Collapsed grid: four equal-height cards, no value tables; incomplete shows **Set up** and a disabled toggle; complete shows **Edit**; muted dims only icon and toggle.
- Only **Set up** / **Edit** opens a modal; the toggle only mutes or unmutes; the chat pickers only pick.
- In the open modal the icon and title are pixel-aligned with where they were in the card relative to the frame's top-left corner. The meaning fills the modal's content width.
- A 15-category form scrolls inside the modal; **Apply** stays visible.
- **X**, **Close** and **Esc** close and discard; a scrim click does not close; **Apply** always closes.
- Closing lands the frame exactly in the empty slot; the grid never shifts during open or close.
- Opening from a scrolled page starts from the card's on-screen position.
- Opening and closing look the same in sandbox and brand, light and dark.
- `npm run verify` is green; `src/components/ui/` has no diff; the only `package.json` change is `motion`.
