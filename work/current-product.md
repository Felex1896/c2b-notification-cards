---
type: Note
title: C2B current product
description: Observed Citron Analytics C2B — wallets, CSV, cabinet, alert settings as they work today.
tags: [c2b, as-is]
sources:
  analytics: https://ctrn.pro/
  processing: https://docs.citrn.io/
---

# C2B current product

Facts from walking [ctrn.pro](https://ctrn.pro/) (Analytics) and [docs.citrn.io](https://docs.citrn.io/) (Processing). Not the redesign. Target screens: [target-flow.md](./specs/target-flow.md).

## Two products

**Citron Analytics** (`ctrn.pro`) — watches addresses the admin already has. Does not mint wallets.

**Citron Processing** (`docs.citrn.io`) — payment API. Deposit addresses via `/addresses/take` (linked with merchant `foreign_id`). Payouts via `/withdrawal/crypto` to an address the **client typed**. Analytics CSV only *labels* those addresses after the fact.

## Analytics modules

| Nav | What | For this take-home |
| --- | --- | --- |
| C2B Analytics | This company’s clients and wallets | Yes |
| B2B Analytics | Market (Stake, Roobet, share, volume) | No. Not “our 1003” |
| Citron AI | Not walked | No |

Plan badge in header: **Basic**. Company switcher: **My Company**.

## Who the admin is

Operator of My Company (casino / service). Job: map clients → addresses, see on-chain movement, get Slack/Telegram when a rule hits. Not the player.

## Wallet roles (CSV `address_type`)

Not online/offline. Role of the account:

- **deposit** — address shown to the client to top up. Incoming = this client funded.
- **central** — company hot hub. Sweep in, pay out. **Not** a client row (`1001` vanished from Client list).
- **withdrawal** — company cash desk that **sends** payouts. Not the client’s personal receive address. Client gives their own address; Processing pays from this desk.

Flow: client pays to **deposit** → company moves to **central** → payout leaves **withdrawal**.

Same `client_id` may appear on several rows (several wallets, same or mixed roles). Not uploaded as a duplicate-type test; first-screen diagram implies several deposits/withdrawals.

CSV is **labels for the chain**, not a client export. Without `central` / `withdrawal`, a sweep deposit→hub looks like the client sent money to a stranger (or an exchange), and a payout is not “with us”. `client_id` on `central` is leftover schema: 1001 is dropped from the list. `withdrawal` can be per-client, so it shares the file with deposits.

## CSV

Template: `wallet_template.csv`. Header as shipped: `client_id,slug,address_type,chain`. UI example truncates addresses; the file needs the **full** address in `slug`.

Example actually uploaded (public chain addresses, including Binance 14 as central — that bloated sync):

```csv
client_id,slug,address_type,chain
1001,0x28C6c06298d514Db089934071355E5743bf21d60,central,ethereum
1002,0xf30ba13e4b04ce5dc4d254ae5fa95477800f0eb0,deposit,ethereum
1003,0x4976a4a02f38326660d17bf34b431dc6e2eb2327,deposit,ethereum
1004,0x1158876b507976d80bf0508c0b08809ab4ecb846,deposit,ethereum
1002,0x9f8dc7e4451e3f6d4ca612f3667f3a123cec610f,withdrawal,ethereum
1003,0xbe7c4beb515e27381e9be913fee6d32187f6eb9b,withdrawal,ethereum
1004,0x16af9d7c7638162b56f1682a519c6dc3d7dadead,withdrawal,ethereum
```

After ingest, rows become a **Client list** (grouped by `client_id`, central omitted). Re-upload: **Upload client wallets** on that list (skips the explainer).

## Live path observed

1. First C2B: Welcome — three roles + hub diagram. CTA **Got it - upload wallets**.
2. Upload: format table, Download template, dropzone, Back, Continue (looked enabled with empty dropzone — mock or bug).
3. Toast: file accepted; analytics “would be updated”.
4. Modal **Syncing wallets...** — empty then ~full bar, no ETA. **Blocks C2B**. Profile → Notifications still opens.
5. Refresh: Overview/Client list **flash with numbers**, then modal returns. Data was ready; the lock lied. Waited overnight with Binance-as-central; CSV then **stayed** (no bounce back to upload).
6. After persist: full C2B Overview + Client list (1002, 1003, 1004). Client profile clickable but blocked — plan **Basic**, banner **Balance runs out** / Topup.

Do not copy the blocking modal.

## Cabinet (C2B)

Captured after CSV persisted. Plan **Basic**. Banner on Client list: analytics limited until topup. Drill-in to a client exists (id is a link + copy) but profile not captured — tokens gone.

**Overview** — six independent widgets. Each ranking card has its own **Top 5 / Top 10** and **Week / Month / Year** (not one page filter). Copy: “withdraws”, “Week turn over”.

| Widget | Week (as captured) |
| --- | --- |
| Total Deposits to all our companies | 80 245 001 EUR |
| Total withdraws from our companies | 2 612 417 266 EUR |
| Clients by Turnover | 1003 2.44B, 1002 114.6M, 1004 844 EUR |
| Entity by turnover with our clients | Binance 2.46B, then Kraken, Test Dmytro…, Rainbet.com, Coinbase |
| Clients by Balance | **empty** (headers only) |
| Clients by Activity | 1002 amount 16591 Afternoon; 1003 3131 Afternoon; 1004 4 Morning. Amount looks like a count, not EUR |
| Turnover with Our Companies | 1003 2.59B, 1002 105.8M. 1004 absent |

Withdraws ≫ deposits, Binance dominates entities, 1003 dwarfs 1002/1004 — expected after labeling a Binance hot wallet as **central**. 1004 is the only row that looks like a normal small address.

**Client list** — same three ids. **Upload client wallets** on the right. Columns: Client ID, Balance, Turnover, Turnover with our companies, Activity, Favourite currency, Main wallet, Top Entity. Sort/filter on most columns. Pagination 10/page.

| ID | Balance | Turnover | With our companies | Activity | Fav / Main | Top Entity |
| --- | --- | --- | --- | --- | --- | --- |
| 1002 | 0 | 0 | 15.26B | Night | — | My Company |
| 1003 | 0 | 0 | 34.72B | Afternoon | — | My Company |
| 1004 | 0 | 0 | 221 | Night | — | hex `0xf5b7…2d75` (not a brand name) |

List has **no period control**. “With our companies” here is all-time-scale vs Overview’s Week widget (2.59B vs 34.72B on 1003). List **Turnover** is 0 while Overview **Clients by Turnover** is billions. Balance 0 everywhere → Overview **Clients by Balance** empty. Activity on the list is only a time-of-day chip; Overview adds an Amount. Favourite currency / Main wallet never filled.

### Client list columns (plain)

One row = one `client_id`. Several wallets collapse. `central` is not a row.

| Column | Job |
| --- | --- |
| Client ID | Id from the CSV. Click opens the person; copy icon copies the id. |
| Balance | EUR still sitting on that client’s labeled wallets **now**. 0 = swept to hub (normal). Alert type 1 watches this jump. |
| Turnover | Volume through the client’s wallets **as a whole** — not the leftover. On our table always 0; Overview “Clients by Turnover” is billions. Either this column is “volume *elsewhere*” (not with you), or it did not compute on Basic. Do not treat list Turnover as the Overview widget. |
| Turnover with our companies | Volume that touched **your** labeled companies/addresses. No period on the list → all-time-scale. Binance-as-central inflates 1002/1003; 1004 (221 EUR) is the honest small flow. |
| Activity | Typical time-of-day bucket (Morning / Afternoon / Night), not “how busy”. Overview adds a count. |
| Favourite currency | Coin they use most. Dash here — not enough assets, not computed, or plan-capped. Profile not opened. |
| Main wallet | Which of their addresses the product treats as primary. Dash here — same unknowns. |
| Top Entity | Counterparty they touch most. 1002/1003 → **My Company** (the labeled hub). 1004 → unnamed `0x…` (brand not resolved). |

B2B Overview is a **different** page (Gambling market widgets). Easy to confuse with C2B.

## Alert settings as-built

Path: avatar → **Notifications**. Label reads as inbox; it is **settings**. Company-wide, not a feed.

Left: four types, all off by default, each **Setup**. Right: Slack / Telegram, **Manage**, per-type dropdowns **Not selected** until connected. Onboarding never says to turn these on. No in-app inbox. Marketing (Slack/Telegram/Email/API) ≠ this screen (Slack + Telegram only).

Rules apply to the **whole client table**, not one client.

### Four types (correct polarity)

1. **Client wallet balance change** — balance moved a lot (up or down), min EUR. Not “receive only”.
2. **Client entity withdrawal** — client **withdrew from** a platform (money from Binance/casino **to** the client).
3. **Client entity deposit** — client **deposited to** a platform.
4. **First deposit** — first top-up **into** a category. List copy says AND of min balance + min turnover + period. Form: required **Company category**; **Category filter** is a multi-select of *brands in that category* (mislabeled — not a second category list); optional “exclude if turnover below” + period; optional “exclude if balance below”. Filters optional; copy disagrees.

Company **withdrawal** desk outflow is **not** type 2. Admin already triggered that payout; Processing already callbacks. Type 2 is the client cashing out of a **foreign** venue.

Thresholds compared in **EUR**.

### Setup UX traps

- Four different forms behind one **Setup**.
- Saved threshold called **border**. Tooltip: one rule per type; UI is Add/Manage list + pencil/trash.
- After save, primary button can be yellow **Cancel**.
- Back, X, Save, Cancel all leave.
- Entity column: many brands → `All` dropdown (disabled until category on). One brand (Mixer → Railgun.ch, Lending → Staked USDT, …) → child checkbox. Checking Mixer checks Railgun (category = all children). Looks like two independent choices.
- Help on balance-change talks about Add/Manage while another state is a single amount field.
- Toggle, saved rule, and channel are disconnected: rule can exist while off and with no chat — nothing sends.

## What another chat should not assume

- Analytics mints deposit/withdrawal wallets. It does not.
- CSV `slug` is a short name. It is the address.
- B2B tables are the uploaded clients. They are not.
- Type 4 is “first time money arrived from a platform”. It is first deposit **to** a category.
- Type 1 is inbound only. It is any large balance change.
