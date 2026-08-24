---
type: Spec
title: C2B admin target flow
description: Improved CSV → clients → four alert rules. Same product rules, not live Citron chrome. Draw from this.
tags: [c2b, spec]
---

# C2B admin target flow

What to draw. Product rules stay as in [current-product.md](../current-product.md). Do not copy that UI.

Not Site work. Not B2B. Not Processing address minting.

## Problem

Admin must (1) tell Analytics which clients own which addresses, (2) get Slack/Telegram when anyone in that table hits a rule. Live product splits this: CSV onboarding, a lying sync wall, alert settings under Profile named like an inbox, four different Setup machines, “border”, polarity-easy-to-invert copy.

## Solution

One C2B path: explain roles → CSV → client table (usable while syncing) → Notifications next to Clients. One Edit pattern for four rules. Channel connected once. A message leaves only if the rule is **on**, a **chat** is chosen, and the **event** matches.

## Decisions

- Settings live in **C2B → Notifications** (sibling of Overview / Client list), company-wide. Not Profile.
- Cabinet stays usable during sync (banner, not a full-screen lock).
- CSV UI says **Address**, not `slug`. File may still use the shipped header.
- One active rule per type; Edit replaces it. Word **threshold**, never border. UI labels: **Min withdrawal amount** (rule 2), **Min deposit amount** (rule 3). Rule 1 is not a single Min amount change box — see directions below. Amount field: **EUR** prefix, not editable yet (currency control later).
- Block **Send alerts to** sits once, between the page header and the four cards. Slack row, Telegram row. Change takes effect immediately (same as mute). No Apply on this block. At least one of Slack / Telegram on the **page** is required for inherited sending. Empty page: error under that block; inheriting rules do not send. A card with its own chats can still send.
- Card Apply does not require a channel. Optional override at the **bottom** of an open card (after the table): link **Use a different chat** reveals the same Slack/Telegram rows. **Use page default** clears both and hides them. Any filled card chat = override-both: that rule sends only those chats (empty Telegram on the card does not fall back to page Telegram). Override is draft until Apply (same as table fields). Effective destination is resolved at render: inherit reads current page state. Do not put chats in the card header.
- Slack/Telegram pickers: empty placeholder **Select**; no fake Select list item. X on a chosen chat clears it to empty.
- One input method on entity and first-deposit cards: a **headered table** (edit and collapsed). Light horizontal rules, no vertical grid. Columns differ by rule. Include-row checkbox; unchecked disables or hides the rest of that row and drops per-row extras. No category accordion, no “one row expanded at a time”, no entity tag chips. Wallet balance is not that table — two-column pair below.
- Entity column (edit): Entity dropdown (search + Select all). Sticky search, placeholder `Search entity`, filter by name, case-insensitive. **Select all** applies to currently visible rows; tri-state when some visible are selected. Uncheck Select all (or every row) does not close the popover and does not uncheck the category. Close with no brand selected → category off. Trigger labels: `All` / `Selected: N` / `Select`. Search resets when the popover closes. One brand in a category: name as text, no dropdown; category checkbox still selects/clears that brand. Header **all-categories** tri-state stays. Empty never means all. Check a category = all its brands.
- Amount inputs (every EUR threshold): digits and one decimal separator (`.` or `,`) only. Other characters dropped on type and paste. Not a positive amount (empty, `0`, trailing separator) is cleared on blur. Required amounts still error as **Required field** when empty on Apply. Do not show a format error. Collapsed EUR keeps up to 2 fraction digits.
- **Wallet balance** — two columns, vertical rule between. **Increase by** | **Decrease by**. Checkbox + label, amount under it. Checkbox on → amount enabled and required; off → amount visible, disabled, value kept. No inherit, no reset. Apply: at least one side on, each on-side has a valid amount. Both off → checkboxes invalid, error under the pair (`Select at least 1 option`). Meaning under the title: two directions, one mute.
- **Entity withdrawal / deposit** table — Category | Entity | Min amount. All 15 categories as rows. Column header **Min amount \*** is the rule default (EUR prefix). Row empty = inherit (placeholder = current default). Override → suffix icon-button, tooltip `Reset unique value`; click returns to placeholder. Uncheck drops the override. Row amount never shows a field error. Apply: header amount required; at least one category checked. A leftover non-positive override is dropped (inherit).
- **First deposit** table — Category | Entity | Turnover | Balance. No card-level amount. No Add/Delete. A category is at most one clause (sub-rule). Filter cell: **toggle**; off → hide field/select, filter off; on → show controls, amount required. Turnover on: amount + period (`day` / `week` / `month` / `year`, default month). Balance on: amount only — no period. Uncheck category drops that sub-rule (filters included). Mute is the card toggle only — no per-category off switch. Zero checked on Apply: error under the table (“Add at least one category”). Extra filters are per checked category and optional; do not claim AND unless both are required.
- Rule 1 = large **balance change**, two directions, one mute (not receive-only). Rule 2 = client withdrew **from** a platform. Rule 3 = deposited **to** a platform. Rule 4 = **first deposit into** a category.
- Company withdrawal-desk outflow is not rule 2.
- Re-upload v1: **replace** the table (confirm). No merge UI unless added later.
- No in-app inbox. Optional: last few sent alerts on the settings list.
- After first accepted CSV: one next action **Set alerts**. Rules may be saved before sync hits 100%.
- Each rule has its own **Apply** / **Cancel** (not one page-level commit).
- After a valid Apply, collapsed card shows the **same layout** as edit (no checkboxes, no inputs), included rows/sides only, plus a footer **Edit**. No pencil, no chevron. Sending-off does **not** prefix `Muted ·`; values stay; mute dims the block; off is the switch. Click the table (or the wallet-balance pair) to open the form. Entity names: as many as fit one line, then `+N` (`All` if every brand in that category is selected). Min amount: effective EUR; inherited muted, override foreground. First deposit filter off = `—`; turnover on includes period (`€1,000 / month`). Channel pairs under the table only if this card overrides (headerless Slack | chat, Telegram | chat). Inherit does not repeat page chats. Empty card: title + one-sentence meaning + footer **Set up**, no table, toggle disabled. Meaning stays under the title in both collapsed and expanded.
- Card titles (list): Wallet balance change, Entity withdrawal, Entity deposit, First deposit. One-sentence meaning keeps polarity from this spec, not live Citron chrome.
- Toggle is **mute/unmute only** and takes effect immediately. It does not open the form. Hit target is the switch only. Form opens via footer **Set up** / **Edit** or click on title/table (not the toggle). While expanded, header clicks do **not** collapse — only **Cancel** (discard) or **Apply** (commit). The footer then is Apply / Cancel, not Set up / Edit.
- Edit while off is allowed: Apply writes fields, sending stays off. First Apply (card was never applied) enables the toggle and leaves it **on**. Later Apply keeps the current on/off.
- Toggle **off** stops sending immediately; applied fields stay. Several cards may be expanded at once.
- Empty/never-applied card: toggle **disabled**. Hover tooltip: set up the rule first. Open the form with footer **Set up** or the header, same as after Apply (then the footer says **Edit**).

## Objects

- **Client** — table person (`1003`); several wallets allowed.
- **Wallet role** — deposit / central / withdrawal (central is not a client row).
- **CSV** — who, address, role, chain.
- **Rule** — one of four; whole table.
- **Sub-rule** — one First deposit clause: one checked category + brands + optional filters on that category. Several checked categories as rows on the same table, not Add-category rows. Not a fifth rule type.
- **Channel** — Slack or Telegram. Set on the page (live). Optional override on a card: that rule sends only the card chats.
- **Alert** — one outbound message.

## End-to-end

```text
First C2B → Welcome (roles) → Upload CSV
  invalid → stay on upload with row-level error
  valid → Overview/Clients with sync banner (not a wall)
→ Notifications: connect chat, edit rule, turn on
→ watch all client wallets → match → Slack/Telegram
```

Re-upload: Client list → Upload wallets (skip Welcome if already done).

## CSV (screens)

**W1 Welcome** (first visit) — three roles in plain language + many deposits → central → payouts. CTA upload. No form.

**W2 Upload** — example with **full** addresses, Download template, dropzone, Back, Continue **disabled** until a file is accepted. After drop: name, row count, or error; replace file ok.

**W3 Sync** — banner on Overview/Clients (“Reading wallets…” / stale numbers possible). Notifications remains open.

**W4 Client list** — ids and metrics; empty cells while that column is still syncing. Upload wallets.

**W5 Overview** — totals for **this** table, not B2B market brands.

CSV columns to show: Client id, Address, Role (`central` / `deposit` / `withdrawal`), Chain.

### CSV states

- Template download.
- Continue dead without a file.
- Wrong type / columns / empty file / bad address / unknown role or chain — show row.
- Duplicate same address — reject or merge; pick one and show it.
- Replace confirm on re-upload; sync restarts; banner says numbers may be stale.
- Two deposits, one client → one list row, several addresses inside.
- Client with no chain activity → row exists, zeros/dashes.
- Copy: upload **your** company addresses, not an exchange hot wallet (slow sync, polluted turnover).

## Notifications (screens)

**A List** — page block **Send alerts to** (live; no Apply), then four cards. Collapsed after Apply: toggle (live) + title + meaning + read-only table (or wallet-balance pair) + footer **Edit**. Empty: title + meaning + footer **Set up**, toggle disabled, tooltip to set up first. Off: table without a `Muted ·` prefix (block dimmed).

**B Edit** — expand in place via footer **Set up** / **Edit** or title/table click. Toggle is not in that hit area. Shared: one-sentence meaning under the title (same as collapsed), **Apply** / **Cancel**. While expanded, header clicks do not collapse the card.

- Shared first: the rule body (table or wallet-balance pair below). Channel is not at the top.
- (1) Two columns: Increase by | Decrease by. Amount stays visible when off (disabled, value kept).
- (2) Category | Entity | Min amount. Header **Min amount \*** is the default; row inherit + reset.
- (3) Same table as (2).
- (4) Category | Entity | Turnover | Balance. No card-level amount. Filter cells are toggles.
- Shared last: optional **Use a different chat** → Slack/Telegram rows; **Use page default** clears and hides.

Toggle never opens the form. Sending = valid Apply **and** toggle on **and** a chat (page inherit or this card’s override). First Apply turns the toggle on. Apply with empty `*` shows “Required field”. Rule 1 both directions off: “Select at least 1 option” under the pair. First deposit with no checked category: “Add at least one category” under the table. Empty page chats: error under the page block (does not block card Apply). Cancel restores last applied values if any, else closes the empty card. Prototype channel pickers assume Slack/Telegram already connected.

**C Channels** — page **Send alerts to** is the control. Manage/connect is out of this control. Prototype pickers list already-connected Slack/Telegram chats. Card override uses the same rows.

**D Optional** — last sent / “Nothing sent yet”.

No clients yet: page still opens — “Alerts start after you upload wallets.”

### Notification states

Happy: set page chat → Set up → fill `*` → Apply → collapsed read-only, toggle on, footer **Edit** → event for 1003 → Slack/Telegram (page chats, or card chats if override).

Blocked: Apply with empty `*` → stay expanded. Toggle disabled until the first Apply; hover explains to set up first. Page chats both empty → error under the block; inheriting rules do not send.

Stop: toggle off → sending stops now; read-only values remain (no `Muted ·`). Header while off → Apply updates values, still mute. Close the form only via Cancel or Apply.

Several wallets, one client → one client in the message. Central is not a client. Several cards may be open at once.

## Message card

Always: client id, rule type, amount EUR, time. Platform rules: category + brand. First deposit: first time + category. Link to that client in C2B.

## Out of scope

B2B, Citron AI, in-app inbox, per-client rules, email/webhooks, staff roles, minting addresses, Site/Case packaging.

Not in this slice: Send test, discard confirm on Cancel, several cards of the same type, threshold chips.

## Acceptance (for drawing, not code)

- A stranger can walk Welcome → file in → clients visible while syncing → Notifications without opening Profile.
- The four rules cannot be misread as the opposite money direction.
- Incomplete setup is visible, not silent: empty page chats error under Send alerts to; missing threshold or categories stay on the card (empty collapsed values / Apply errors).
- CSV errors name the problem; Continue does not submit an empty dropzone.
- Sync never hides Overview, Clients, or Notifications.
