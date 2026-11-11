---
type: Spec
title: C2B whole flow
description: The path around Notifications — empty brand, sample CSV, sync, Client list, channel connection, prototype toolbar.
tags: [c2b, spec]
status: draft
---

# C2B whole flow

The longer path the Notifications page sits inside. Card behaviour, page channel block, and rule validation: [target-flow.md](./target-flow.md). Live product: [current-product.md](../current-product.md). Live screenshots: [whole-flow/citron-refs/](./whole-flow/citron-refs/) — content reference, not chrome to copy.

## Path

```text
Empty brand → explainer + sample file → sync (Client list visible, metric cells loading)
→ Client list → Notifications tab → connect channels → set up rules
Re-upload: Client list → Upload wallets → confirm replace → sync again
```

Each brand walks this path on its own.

## Shell

- Top bar, left to right: logo, **Citron AI**, product switch **C2B Analytics** (current) | **B2B Analytics**. Right: brand switcher, account menu.
- Narrow window (below 1024 px): Citron AI and the product switch fold into an outline icon button (burger) left of the logo. The **Brand** caption hides; the switcher stays. The account control keeps only the profile icon — the plan label hides. Client search collapses to an outline magnifying-glass button that opens the field.
- **Clients** | **Notifications** | **Overview** appear only after that brand has a file. Until then the landing is the only page. With a file, the tabs share one row with the page's controls at the right end: client search and **Upload wallets**, or **Set up channels**. No notifications title. The table and the rule cards start under that row.
- Not built: Citron AI, B2B Analytics, Overview, Profile, Log out, Manage brands and wallets. A click shows a tooltip “Not in this prototype” and does nothing else. The logo does nothing.
- Brand switcher: brand avatar (initial), caption **Brand**, brand name. Fixed width; a longer name is cut with an ellipsis, the full name shows on hover. Opens a list, one row per brand: avatar, name, a check mark (not a checkbox) on the selected one. Always exactly one brand selected — a click moves the check; no `All brands`. Below the list: “Data is shown for the selected brand” and **Manage brands and wallets**.
- Account menu: one control, profile icon plus plan label **Basic**. Menu in two groups: Profile, Theme, Language | Log out. Theme and Language rows show the current choice — the Theme icon is the current theme, its name sits on the right — and open a submenu: Light, Dark, System; English, Русский. System follows the device and changes with it. The menu stays open after a theme or language change.
- Two brands, both start empty. Names are placeholders: `Northbet`, `Lumen Casino`.
- A brand owns its CSV, its clients, and its four rules with their chats. Switching brand switches all of them.
- Channel **connections** are account-wide: connected once, available in every brand.
- First load opens **Clients**. A brand switch keeps the current tab.
- Tab or brand switches lose nothing: open cards, their drafts, and sync progress stay as they were.
- State lives in memory. A browser reload is the same as **Start over**.

Overview content is not in this slice; the tab is shown, not built. Reminder: live C2B opens on Overview; building it is a later decision. When built, totals cover this brand's table only, not the B2B market.

## Empty brand

One screen, shown while the selected brand has no file.

- Three wallet roles in plain language: **deposit** (client tops up here), **central** (company hub, not a client row), **withdrawal** (company desk that pays out). Flow: many deposits → central → payouts.
- Example table with addresses shortened as `0x5b1e…17c3`; the template file keeps them full. Columns shown: Client id, Address, Role (`central` / `deposit` / `withdrawal`), Chain. UI says **Address**, the file keeps the shipped header.
- **Download template**.
- **Upload wallets** button under the title, next to **Download template**. Layout: [visual-pass.md](./visual-pass.md) Pages. It opens the same dialog as [Replace](#replace), without the replace warning: two sample-file buttons (placeholder names `wallets-a.csv`, `wallets-b.csv`) and **Close**. Picking a file starts the upload. No dropzone, no OS file dialog, no Continue.
- Copy: upload **your** company addresses, not an exchange hot wallet.

Notifications opens only after the file is in. Switching to a brand with no file returns to the landing.

## Sync

- Starts on the sample-file click. Lands on Client list at once.
- Banner above the table (“Reading wallets…”). Not a modal, not a lock. Notifications stays usable.
- The banner carries the one next action **Set alerts** (opens the Notifications tab). Rules may be saved before sync finishes.
- Sync keeps running when the user switches tab or brand.
- Client ID is filled from the file immediately. Every other cell is a skeleton (shimmering rectangle) until its value arrives.
- Skeletons clear the way chain data would arrive — per cell, not per column, not top to bottom:
  - Inside a row, current-state reads come first: Balance, Currency, Main wallet. History scans next: Activity, Annual turnover, Turnover w/ us. Top entity last (needs counterparties labeled).
  - Each row runs on its own clock. Rows with more wallets or more history finish later. Timing has jitter but is seeded, so every run looks the same.
  - First cells clear within about 1 s; the last within about 10 s.
- While sync runs, rows stay in file order. When the last cell resolves, the list takes its sort once (default Balance, descending).
- After the last cell resolves the banner goes away.

## Client list

- Columns as live: Client ID, Balance, Annual turnover, Turnover w/ us, Activity, Currency, Main wallet, Top entity.
- Pagination 20 per page. Sort on every column; default Balance, descending (as live). Search by Client ID. No column filters.
- The whole page scrolls. What stays at the top: the prototype toolbar, the app header, and the one row of tabs plus search and **Upload wallets** (or **Set up channels** on Notifications). The table's column header sticks under that row. The Client ID column sticks on the left when the table scrolls sideways; a thin horizontal scrollbar sticks to the bottom of the window while the table is on screen.
- While sync runs, sort controls are disabled. Pagination and search still work.
- Sort: click a column header to sort by it, click again to flip. First click sorts amounts descending, text ascending; Activity sorts by its start hour. A sort or search change returns to page 1.
- Search matches Client IDs that contain the typed text. No match: “No clients match “…”.”
- Search, sort, and page are kept per brand across tab and brand switches.
- Amounts are formatted as on the rule cards (`€1,234`).
- Activity is a time-of-day icon plus the hour range (`06–12`). The column header is “Activity, CET”. Night 00–06, morning 06–12, day 12–18, evening 18–24, each its own colour.
- Currency shows its coin icon in a circle, then the ticker.
- Main wallet, and Top entity when the value is an address: hover shows a copy button. Click copies the full address; the icon becomes a check and the tooltip “Address copied” shows, then the icon returns to copy. A named top entity (Uniswap) has no copy button.
- Row hover: a translucent background, and a soft accent glow that runs to the right edge of the visible table. The arrow sits on that glow with a blurred background, no plate of its own. Its tooltip is “Client details”. Click shows “Not in this prototype” — there is no client page.
- One row per client; several wallets collapse into it. `central` is not a row. A client with no chain activity keeps its row with zeros / dashes.
- **Upload wallets** button → replace flow. It works during sync too.

### Replace

- One dialog: warning that the file replaces the whole table for this brand, the same two sample-file buttons, **Close**. Picking a file is the confirmation. Either file may be picked in either brand.
- New file's Client IDs appear at once; metric columns go back to skeletons; banner returns. Old rows do not linger. A replace during sync restarts it.
- Replace clears search and returns to page 1. Sort is kept.
- Rules, their chats, and connections survive a replace.

## Sample data

- Two files, 50 clients each, disjoint Client IDs. Deterministic: same rows on every run.
- Plausible, not real: balances spread over orders of magnitude, some at 0 (swept to hub), some clients with several wallets, Top entity mixes brands from [catalog.md](../catalog.md) with unresolved `0x…`, a few clients with no activity.
- Activity values are CET hour ranges (`00–06 CET`, `06–12 CET`, `12–18 CET`, `18–24 CET`).
- Amounts in EUR.

## Channel connection

Mock. No request leaves the prototype, nothing is checked against Slack, Telegram, or a mailbox. Field validation only: required fields and format.

One dialog, **Notification channels**, with three tabs: Slack, Telegram, Email (this order).

- Opened by **Channels** at the top right of Notifications — on the Slack tab.
- Opened by **Connect …** at the bottom of a card's chat picker — on that messenger's tab, already running its connect steps. Done chooses the new item on that card (first checked, in list order, for Slack); other cards stay as they were.
- A tab with nothing connected shows its connect steps directly. A tab with items shows [Manage](#manage).
- Card pickers list connected items only: [target-flow.md](./target-flow.md) Card (collapsed).

### Slack

1. **Add to Slack**.
2. Mock permission screen inside the dialog: workspace `Acme Ops`, list of permissions, **Allow**. **Close** under the plate leaves the dialog.
3. Pick channels (checkboxes): `#c2b-alerts`, `#ops`, `#payments`, only those not yet connected. At least one required. Nothing left → “Every channel in Acme Ops is connected.”
4. Done → chosen channels appear in Slack pickers. The first checked, in list order, is chosen on the card that asked, if any.

### Telegram

1. Add bot `@CitronAlertsBot` to your group — **Copy**.
2. Send `/connect 4821` in that group — **Copy**.
3. **I've sent it** → short wait (~1.5 s) → “Found: Risk team” → Done. A later connect finds the next group not yet connected: Risk team, C2B Alerts, Night on-call. None left → “No new group found.”

### Email

1. Email field — required (“Required field”), format checked (“Enter a valid email”).
2. **Send code** → “We sent a code to …”, 6-digit field. Any 6 digits verify; anything else is a field error (“Enter the 6-digit code”).
3. Verified → address appears in Email pickers. An address already connected is chosen, not added twice.

### Manage

- The tab's body: list of connected items for that channel. **Add another** runs the connect steps again, then returns to the list. The new item only joins the pickers; no card's choice changes.
- **Remove** on an item in use: confirm “Used in N places. Alerts there will stop going to it.” A place is a card that has the item chosen, in either brand. After remove those pickers are empty; a card left with no chat turns off ([target-flow.md](./target-flow.md) Card).
- The confirm sits inside the tab (Remove / Cancel), not a second dialog.
- Remove on an unused item: no confirm.
- Removing the last item of a channel returns the tab to its connect steps; the dialog stays open.

## Prototype toolbar

Prototype chrome above the app header, not product.

- **Start over** — both brands empty, no connections, no rules.
- **Clients loaded** — selected brand only: sample file A loaded, sync finished. Acts as a replace (search cleared, page 1, sort kept; rules and channels stay). Opens **Clients**.
- **Alerts set up** — selected brand only: clients loaded, one Slack / Telegram / Email item (`#c2b-alerts`, `C2B Alerts`, `alerts@example.com`) connected and chosen on every card, four rules applied, complete and on. Overwrites that brand's rules and chats: cards collapsed, open drafts dropped. Adds connections only if missing. Opens **Notifications**.

## Not in this slice

- Overview content.
- CSV errors: wrong type, columns, empty file, bad address, unknown role or chain, duplicate address. When added, an error names the row.
- Real file pick (dropzone, OS dialog).
- Display currency other than EUR (live copy hints at it; unconfirmed).

## Open

- Empty-brand copy (draft in the prototype; the human edits it).

Settled 2026-10-31: brand names `Northbet`, `Lumen Casino` and sample files `wallets-a.csv`, `wallets-b.csv` stay; generated sample rows accepted.

## Acceptance

- A stranger walks empty brand → sample file → clients visible while syncing → Notifications without opening Profile.
- Switching brand shows that brand's own clients, rules, and chats.
- Sync never hides Clients or Notifications.
- Each channel can be connected, chosen, and removed without real credentials.
