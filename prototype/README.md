# C2B setup flow

Clickable prototype of the whole C2B admin setup, from an empty brand to working alerts. Vite + React + TypeScript, shadcn/ui on Radix and Tailwind. Two skins in one tree: `brand` (default, Golos Text, dark) and `sandbox` (shadcn defaults, Geist, light).

## What it covers

- A brand starts with no wallets. Pick a sample file, and the client list fills in while the wallets are read.
- The Notifications tab (also reachable from **Set alerts** on the reading banner) holds the channels and the four alert rules (balance, entity withdrawal, entity deposit, first deposit). Rules can be set up before the wallets finish reading.
- There are two brands. Each has its own file, client list, channel choice and rules.
- Slack, Telegram and Email are connected once for the whole account, through mock dialogs. Nothing leaves the browser.
- State lives in memory. A reload starts over.

## Prototype toolbar

The strip at the top is for the reviewer, not part of the product. On a phone it is a 40 px bar: **Prototype settings**, centred and muted, with a notch under the label. It opens on tap or drag and closes again when an option is chosen. A tablet shows the same row as a desktop:

- **Start over** — both brands empty, no connected channels, no rules.
- **Clients loaded** — selected brand only: sample file A, reading already finished.
- **Alerts set up** — selected brand only: clients loaded, one Slack / Telegram / Email item connected and chosen, all four rules applied and on.
- **Skin** — switch look. `?skin=brand` or `?skin=sandbox` in the URL does the same and can be shared.
- **Theme** sits in the header, immediately after the company name: sun for light, moon for dark.

## Run

```bash
npm install
npm run dev
```

Done is `npm run verify`.

## Field errors

If a control can fail validation, always render `FieldError` under it. Pass the message or `null` — do not mount the hint only when invalid.

`FieldError` is a fixed one-line slot (`h-5`). The hint fills that slot; it must not grow the form.

Skip the slot when the control cannot show a message under it (Period, toggles, entity dropdowns). Amounts keep the slot. The only message under a field is empty required (`Required field`).

Apply does not close or save until the draft is complete. A failed Apply marks the gaps and scrolls to the topmost. A first open shows no errors.

No entity selected: every entity dropdown goes red and does not render `FieldError`. The message sits in the modal footer, left of the buttons: `Select at least 1 entity`. Choosing any entity clears that message and restores the dropdowns. Amount errors stay until those amounts are valid.

Amount inputs keep digits and one decimal separator (`.` or `,`). Other characters are dropped on type and paste. A value that is not a positive amount is cleared on blur.

Trade-off: calm state is taller by one line per validatable control. Apply does not shift fields or the footer. Letters do not appear in amount fields.
