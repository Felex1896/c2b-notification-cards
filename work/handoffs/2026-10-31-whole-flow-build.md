---
type: Note
title: Handoff — Whole-flow build
description: Execution plan for the path around Notifications — six stages, orchestrator plus Sonnet subagents, click-check and commit per stage.
tags: [c2b, prototype, whole-flow, plan, handoff]
status: deprecated
---

# Handoff — Whole-flow build

Deprecated. All six stages executed; pickup is [2026-10-31-whole-flow-review.md](./2026-10-31-whole-flow-review.md). Do not execute.

## Goal for the next session

Build [whole-flow.md](../specs/whole-flow.md) into `prototype/`, stage by stage, as the orchestrator.

- The orchestrator does not edit `prototype/` itself. Every code change is done by a subagent: `Task`, model `claude-sonnet-5-5-medium` (Sonnet 5.5). One subagent per stage, sequential — stages share files.
- The orchestrator writes the subagent brief, reviews the diff against the stage checklist, runs `npm run verify` itself, reports to the human, waits for the click-check, commits.
- A question the plan does not answer is the human's. Stop the stage, ask in chat, write the answer into the spec, then resume.
- Chat in Russian. Code, tests, spec lines in English.

## Settled (do not re-open)

- Path, brands, sync, Client list, channel connection, toolbar: [whole-flow.md](../specs/whole-flow.md).
- Card behaviour, page channel block, Email row, override-all: [target-flow.md](../specs/target-flow.md).
- Code rules, gates, test style, report shape: [prototype/AGENTS.md](../../prototype/AGENTS.md).
- Live reference: [current-product.md](../current-product.md) Re-walk 2026-10-31.
- Commit after each stage the human click-checked. Orchestrator commits, never pushes.

## Architecture

Decided in planning. Code shape only; behaviour is in the specs.

**State is lifted.** Today each card keeps state inside `NotificationsPage` (`src/hooks/use-rule-card.ts`). Tabs unmount it, brands need their own copy, and removing a channel must see every place it is chosen. So:

- `src/lib/rule-card.ts` — pure transitions of one card: `RuleCardState<T>` (`expanded`, `sending`, `applied`, `draft`, `showErrors`) plus open / setDraft / cancel / apply / toggleSending. Same behaviour as `use-rule-card.ts` today, now tested.
- `src/lib/prototype-state.ts` — whole app state and its reducer: `connections`, `brands` (per brand: uploaded file + sync start time, page channels, four cards as **named fields** — not an array), `activeBrand`, `activeTab`. Constructors `startOver`, `clientsLoaded(state, brand, now)`, `alertsSetUp(state, brand, now)`.
- `src/hooks/use-prototype.ts` — React context + `useReducer` over that reducer, selectors for components, a ticking `now` while any brand is syncing.
- `use-rule-card.ts` becomes a thin selector over the store, or goes away. Either is fine.

**Other pure files**, each with a sibling test:

- `src/lib/connections.ts` — add / remove items, usage count across brands (page choice, applied override, open draft), clear on remove, email format, 6-digit code, next mock Telegram group.
- `src/lib/sync.ts` — seeded per-cell ready time; current-state columns before history columns before Top entity; more wallets / history → later; first cell ≤ ~1 s, last ≤ ~10 s.
- `src/lib/client-list.ts` — search by Client ID, sort per column (default Balance desc), paginate 10.

**Data.** `src/data/brands.ts` (two brands), `src/data/sample-wallets-a.ts` and `-b.ts` (50 clients each, disjoint ids, static rows). Rows come from a deterministic generator script in `scripts/`; its output is committed, the script is not part of `verify`. `public/wallet_template.csv` with the shipped header `client_id,slug,address_type,chain`. Connectable mock items replace `SLACK_CHATS` / `TELEGRAM_CHATS`; keep ids `slack-c2b` → `#c2b-alerts` and `tg-c2b` → `C2B Alerts` so existing `channelPairs` expectations hold.

**UI primitives.** Add shadcn `dialog`, `tabs`, `skeleton` with the CLI. They sit on the installed `radix-ui`. If the CLI wants a new npm dependency or touches `package.json`, stop and ask.

Known CLI defect, settled with the human: the CLI writes `import { cn } from "cn"` and adds the `cn` npm package. Keep the generated file, change that one import to `@/lib/utils`, restore `package.json` and `package-lock.json`, delete `node_modules/cn`. This one line is the only allowed edit inside `src/components/ui`. If `add` wants to overwrite an existing ui file (it does for `dialog` → `button.tsx`, whose local `link` variant is intentional), take the new file's text from `npx shadcn@latest add <name> --dry-run --view src/components/ui/<name>.tsx` instead, apply the same import fix, and leave the existing file alone.

## Stage protocol

1. Brief the subagent (template below). It reads [prototype/AGENTS.md](../../prototype/AGENTS.md) and the named spec sections first.
2. Subagent implements, runs `npm run fix`, then `npm run verify`, and returns the three-item report (verify, deviations, new test names) plus the list of files changed.
3. Orchestrator reads the diff, ticks the stage checklist, re-runs `verify`. A miss → send the same subagent type a fix brief; never patch by hand.
4. Report to the human in Russian: the three items, then the click-check steps for this stage. Run command: `cd prototype && npm run dev`.
5. Human says OK → commit (rules below) → next stage. Human finds a problem → fix brief, back to 3.

Brief template:

```text
Stage N of the whole-flow build in prototype.
Read first: prototype/AGENTS.md; work/specs/whole-flow.md §<sections>; work/specs/target-flow.md §<sections>; work/handoffs/2026-10-31-whole-flow-build.md §Architecture and §Stage N.
Do: <stage scope>.
Done when: <stage checklist>.
Rules: no new dependencies; no eslint-disable / ts-ignore / skip / debt-list entries; do not edit src/components/ui except files the shadcn CLI adds; existing tests — adapt call sites and fixtures to new signatures, never expected values; a red test you cannot explain is a stop.
Stop and report instead of guessing if the spec does not answer something.
End with: npm run fix, npm run verify, then the three-item report and the changed-file list.
```

Commit rules:

- `git add` explicit paths only. Never `git add -A` / `.`. Leave `Untitled-*.excalidraw` untracked.
- The first commit also carries this planning session's docs: both specs, `current-product.md`, `whole-flow/citron-refs/`, handoffs, indexes, `AGENTS.md`.
- One plain-English sentence per message, about behaviour. No push.

## Stages

### 1. Foundation — no visible change

- Extract `ChannelOverride` from `NotificationsPage.tsx` into its own file, and `PrototypeToolbar` from `App.tsx`.
- Add `rule-card.ts`, `prototype-state.ts`, `use-prototype.ts` per Architecture; one brand rendered. `NotificationsPage` reads from the store.
- `prototype/AGENTS.md`: behaviour canon is now two documents, `target-flow.md` and `whole-flow.md`, both outside this folder. Text only, no link.

Checklist: no file over 300 lines; four cards still named, not mapped from an array; tests for every transition listed in target-flow card rules (first Apply turns on, later Apply keeps on/off, toggle ignored before first Apply, Cancel restores applied or closes empty, invalid Apply keeps the card open with errors).

Click-check: every card behaves exactly as before.

### 2. Shell and brands

- App header: product name, Brand select (two brands, no All brands), tabs Clients | Notifications. Not live cabinet chrome.
- Per-brand page channels and cards. Clients tab: temporary empty-brand placeholder.
- Toolbar: **Start over**.
- Notifications header copy: drop “Company-wide … already connected”; name the brand; no-clients hint “Alerts start after you upload wallets.”

Checklist: brand switch keeps tab; tab switch keeps open cards and drafts; Start over empties both brands; reload = Start over.

Click-check: set a card in brand 1, switch to brand 2 (empty), switch back (intact); open a card, go to Clients and back (still open, draft intact).

### 3. Clients

- Sample data and generator, template CSV.
- Empty-brand screen per spec: roles, example table with full addresses, Download template, two sample-file buttons. Draft copy; the human edits it later.
- Sync: banner with **Set alerts**, skeleton cells per `sync.ts`, Client ID immediate, banner leaves at the end, sync survives tab / brand switch.
- Client list: eight columns, default Balance desc, sort disabled during sync, search by Client ID, 10 per page, empty-search message.
- **Upload wallets** → one replace dialog (warning + two files + Cancel).

Checklist: `sync.ts` tests (order inside a row, timing bounds, deterministic, more wallets → later); `client-list.ts` tests (search, each sort key, pagination edges); replace shows new ids at once and keeps rules and channels.

Click-check: empty brand → file A → watch cells arrive → sort, search, page → replace with file B → second brand with file A.

### 4. Channels

- Email row on the page block and in card overrides; `Channels` gains an email id; `hasAnyChat` and `channelPairs` include Email; link text **Use different channels**.
- Rows: Connect when nothing connected, picker + Manage otherwise; new item chosen in the row that asked.
- Dialogs: Slack (Add to Slack → mock permission screen → channel checkboxes, ≥1), Telegram (bot + code with Copy → I've sent it → found group), Email (address → 6-digit code). Field errors only for required and format.
- Manage: list, Add another, Remove (confirm with count when used; count and clear include open drafts in both brands).

Checklist: `connections.ts` tests (usage count across brands and drafts, remove clears every place, email format, code length, Telegram rotation); existing `channelPairs` tests still pass with unchanged expected values; nothing calls a network.

Click-check: connect each channel from the page and from a card; remove a chat used in both brands and in an open draft — count matches, places empty, page error shows.

### 5. Toolbar jumps

- **Clients loaded** and **Alerts set up**, selected brand only, per spec.
- Preset for Alerts set up: Slack `#c2b-alerts`, Telegram `C2B Alerts`, one email on `example.com`, all chosen on the page; Wallet balance Increase 10000 / Decrease 10000; Entity withdrawal — Exchange, all brands, Min 5000; Entity deposit — Gambling, all brands, Min 1000; First deposit — Gambling, Turnover on, 1000 / month. All applied and on.

Checklist: tests that each constructor yields a state the reducer accepts and that the other brand is untouched.

Click-check: both jumps in each brand; Start over after them.

### 6. Wrap

- `prototype/README.md`: what the prototype now covers and what the toolbar does. No frontmatter, no outward links.
- With the human: settle whole-flow Open items or move them to the next handoff; drop `status: draft` from `whole-flow.md` when he agrees.
- Write the next handoff; deprecate this one.

## Open

- Whole-flow Open: empty-brand copy, brand and sample-file names, review of generated rows.
- From the previous pickup: the `check:skin` narrowing (hex pattern rejects identifiers, skips `*.test.ts`) is still unconfirmed by the human.
- From the previous pickup: the reviewer-copy export step has never been exercised.

## Do not

- Do not add entries to either debt list (`max-lines` in `eslint.config.js`, exceptions in `scripts/check-tests.mjs`). Both belong to the human.
- Do not run stages in parallel.
- Do not edit `prototype/` from the orchestrator.
