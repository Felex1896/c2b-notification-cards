---
type: Spec
title: C2B admin target flow
description: Notifications — four alert rule cards, their forms and their chats. Same product rules, not live Citron chrome. Draw from this.
tags: [c2b, spec]
---

# C2B admin target flow

What to draw. Product rules stay as in [current-product.md](../current-product.md). Do not copy that UI. The path around this page — empty brand, CSV, sync, Client list, channel connection: [whole-flow.md](./whole-flow.md).

Not Site work. Not B2B. Not Processing address minting.

## Problem

Admin must (1) tell Analytics which clients own which addresses, (2) get Slack/Telegram/Email when anyone in that table hits a rule. Live product splits this: CSV onboarding, a lying sync wall, alert settings under Profile named like an inbox, four different Setup machines, “border”, polarity-easy-to-invert copy.

## Solution

One C2B path: explain roles → CSV → client table (usable while syncing) → Notifications next to Clients. One Edit pattern for four rules. Channels connected once. A message leaves only if the rule is **complete**, its toggle is **on**, the card has a **chat**, and the **event** matches.

## Decisions

### Page

- Settings live in **C2B → Notifications** (tab next to Clients), for the brand selected in the header. Not Profile.
- No page-level channel block. Each card chooses its own chats; nothing is inherited.
- Button **Channels** at the right end of the tab row (where **Upload wallets** sits on Clients) opens the channels dialog — [whole-flow.md](./whole-flow.md) Channel connection. The row is the tabs; there is no page title.
- Cards in a grid, min card width 360 px: four in a row when they fit, else two, else one. Never three in a row. All cards in the grid have the same height; spare height sits under the meaning.

### Card (collapsed)

- Vertical card, top to bottom: icon tile and title on one line; meaning under them; chat pickers **Slack**, **Telegram**, **Email** (this order); bottom line — **Set up** / **Edit** (outline button) on the left, label **Send notifications** and the toggle on the right.
- **Set up** until the applied rule is complete; **Edit** once it is. No summary of applied values on the card. No pencil, no chevron.
- Only **Set up** / **Edit** opens the rule modal. The rest of the card is not a click target.
- Chat pickers act immediately, no Apply. Picker: a dropdown like the brand switcher — connected items with a check on the chosen one, then a full-width button **Connect Slack** (Telegram, Email) that opens the channels dialog on that tab. Nothing connected → `Nothing connected` and the button. Placeholder **Select**; X on a chosen chat clears it. One chat per messenger per card.
- An item connected from a card's picker is chosen on that card. Other cards do not change.
- Any chosen chat → the rule sends to the card's chats only.
- Toggle is mute/unmute only and takes effect immediately. Hit target is the switch only.
- Toggle is available only when the rule is complete **and** the card has at least one chat. Otherwise disabled with a hover tooltip: incomplete → `Set up the rule first`; complete, no chat → `Choose where to send`. Incomplete wins.
- Sending never turns on by itself. Setting up and turning on are two actions: Apply never changes the toggle to on. When a card stops being sendable (Apply left it incomplete, or its last chat was cleared or disconnected) the toggle goes off and disabled; becoming sendable again leaves it off.
- Sending off: the icon tile and the toggle dim; title, meaning and button do not. No `Muted ·` prefix.

### Rule modal

- Opened from **Set up** / **Edit**. Header: the card's icon, title and meaning plus a close **X**. Body: the rule form. Footer: **Apply** / **Close**. **X**, **Close**, **Esc** discard; **Apply** commits. A click on the dimmed page does nothing. Motion and layout: [rule-modal.md](./rule-modal.md).
- Chats are not in the modal.
- **Apply is never blocked.** It commits what is there and closes. An incomplete rule stays **Set up** with the toggle disabled.
- Reopening an incomplete rule marks each empty required field: red outline and **Required field** under it. A first open shows no errors. There is no group error (no message under a block for “nothing selected”).
- One rule modal at a time. Edit while sending is off is allowed; Apply writes fields, the toggle does not move.

### Form layout

- One grid for the whole form: labels in the left column, fields in the right. Labels stay on one line; the left column is as wide as the longest label (the longest category name in the current language).
- Rows are grouped into blocks separated by a rule line. A block's header row is a label on the left and its control on the right, same as any field row.
- A field that appears under a toggle sits in the right column of the toggle's row.

### Amount inputs

- Every EUR threshold: **EUR** prefix, not editable yet (currency control later). Digits and one decimal separator (`.` or `,`) only. Other characters dropped on type and paste. Not a positive amount (empty, `0`, trailing separator) is cleared on blur. No format error.

### Entity picker

- Each category is a row: category name as the label, entity dropdown on the right. Categories in catalog order. Every category gets a dropdown, including single-entity ones.
- Dropdown: sticky search, placeholder `Search entity`, filter by name, case-insensitive. **Select all** applies to currently visible rows; tri-state when some visible are selected. Trigger labels: `All` / `Selected: N` / `Select`. Search resets when the popover closes. Single-entity category: the list is that one entity with its checkbox — no search, no **Select all**.
- Block header row: label **Entities**, checkbox **Select all** on the right — tri-state over every entity in every category.
- Empty never means all.
- Rows under a category (own amount, first-deposit filters) appear once the category has at least one selected entity, and go away when it has none. While a category's popover is open its rows stay; they go when it closes empty.

### Wallet balance change

- Two rows: **Increase by** | amount, **Decrease by** | amount. No toggles, no checkboxes.
- Complete: at least one amount filled. Both empty → both are required (marked on reopen). One filled → the other is optional.
- Meaning under the title: two directions, one mute.

### Entity withdrawal / deposit

- Block 1: one row — **Min withdrawal amount \*** (rule 2) / **Min deposit amount \*** (rule 3) | amount. The default for every selected entity. No block title.
- Block 2: header row **Entities** | **Select all**, then the category rows.
- Under a category with a selected entity: toggle **Own min amount** on the left; on → amount field on the right, required. Off → the category uses the block 1 amount.
- Toggle off keeps the typed value while the modal is open; on again shows it. Apply drops an own amount that is off. A category emptied of entities drops its own amount (toggle back off, value cleared).
- Block 1 amount is required only while some category with a selected entity has its own amount off.
- Complete: at least one entity selected, block 1 amount present when required, every own amount that is on is filled.

### First deposit

- No block 1: there is no rule-level amount. Block 2 as above.
- Under a category with a selected entity, two toggle rows: **Turnover from** | amount + period (`day` / `week` / `month` / `year`, default month); **Balance from** | amount. Off → fields hidden, filter off. On → amount required.
- A category is at most one clause (sub-rule). Emptying a category drops its sub-rule and filters. Apply clears the amount of a filter that is off.
- Complete: at least one entity selected, every filter that is on has its amount.
- Filters are per category and optional; do not claim AND unless both are on.

### Rules

- One active rule per type; Edit replaces it. Word **threshold**, never border.
- Rule 1 = large **balance change**, two directions, one mute (not receive-only). Rule 2 = client withdrew **from** a platform. Rule 3 = deposited **to** a platform. Rule 4 = **first deposit into** a category.
- Company withdrawal-desk outflow is not rule 2.
- Card titles: Wallet balance change, Entity withdrawal, Entity deposit, First deposit. One-sentence meaning keeps polarity from this spec, not live Citron chrome.
- No in-app inbox. Optional: last few sent alerts on the settings list.
- Each rule has its own **Apply** / **Close** (not one page-level commit).

## Objects

- **Client** — table person (`1003`); several wallets allowed.
- **Wallet role** — deposit / central / withdrawal (central is not a client row).
- **CSV** — who, address, role, chain.
- **Rule** — one of four; whole table.
- **Complete rule** — applied, with every required value present. Only a complete rule can be turned on.
- **Sub-rule** — one First deposit clause: one category with selected entities + optional filters on that category. Not a fifth rule type.
- **Brand** — one of the account's companies, picked in the header. Owns its CSV, clients, cards and their chats.
- **Channel** — Slack, Telegram, or Email. Connected once per account; chosen per card (live).
- **Alert** — one outbound message.

## Notifications (screens)

**A List** — page header with **Channels** on the right; four cards in the grid. Each card: icon + title, meaning, Slack / Telegram / Email pickers (live), **Set up** / **Edit**, **Send notifications** + toggle (live). Incomplete: **Set up**, toggle disabled, tooltip. No chat: toggle disabled, tooltip. Off: icon and toggle dimmed.

**B Edit** — modal from **Set up** / **Edit**. Header: icon, title, meaning, **X**. Body: the rule form (layout above). Footer: **Apply** / **Close**. Closes via **X**, **Close**, **Esc** (discard) or **Apply** (commit, always).

- (1) **Increase by** | amount, **Decrease by** | amount.
- (2) Block 1 **Min withdrawal amount \***; block 2 **Entities** with category rows and **Own min amount** toggles.
- (3) Same as (2) with **Min deposit amount \***.
- (4) Block 2 only, with **Turnover from** / **Balance from** toggles under each selected category.

Sending = complete rule **and** toggle on **and** a chat on the card. Close, **X** and **Esc** restore last applied values if any, else close the empty form.

**C Channels** — dialog from **Channels** or from a picker's **Connect …** button: [whole-flow.md](./whole-flow.md) Channel connection.

**D Optional** — last sent / “Nothing sent yet”.

No file yet: the Notifications tab is not shown. It appears with the file.

### Notification states

Happy: Set up → fill → Apply → modal closes, card shows **Edit**, toggle available but off → pick a chat on the card → turn the toggle on → event for 1003 → that card's chats.

Incomplete: Apply with nothing selected or an empty required field → modal closes, card stays **Set up**, toggle disabled with `Set up the rule first`. Reopen → empty required fields are marked.

No chat: complete rule, no chat on the card → toggle disabled with `Choose where to send`.

Stop: toggle off → sending stops now; applied values remain. Edit while off → Apply updates values, still off.

Several wallets, one client → one client in the message. Central is not a client.

## Message card

Always: client id, rule type, amount EUR, time. Platform rules: category + brand. First deposit: first time + category. Link to that client in C2B.

## Out of scope

B2B, Citron AI, in-app inbox, per-client rules, webhooks, staff roles, minting addresses, Site/Case packaging.

Not in this slice: Send test, discard confirm on Cancel, several cards of the same type, threshold chips, suggesting amounts already typed in other categories.

## Acceptance (for drawing, not code)

- The four rules cannot be misread as the opposite money direction.
- Incomplete setup is visible, not silent: an incomplete rule shows **Set up** and a disabled toggle with a reason; reopening it marks the empty required fields; a card without a chat cannot be turned on.
- Setting up a rule never turns it on.
