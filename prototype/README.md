# C2B notification cards

Clickable prototype of four C2B alert cards: balance, entity withdrawal, entity deposit, first deposit. Vite + React + TypeScript, shadcn/ui on Radix and Tailwind. Two skins in one tree: `brand` (default, Inter, dark) and `sandbox` (shadcn defaults, Geist, light). Switch with `?skin=` or the toolbar.

```bash
npm install
npm run dev
```

## Field errors

If a control can fail validation, always render `FieldError` under it. Pass the message or `null` — do not mount the hint only when invalid.

`FieldError` is a fixed one-line slot (`h-5`). The hint fills that slot; it must not grow the form.

Skip the slot when the control cannot show an error (Period, filter checkboxes, entity row amount). Row override is never required: empty inherits the header. The only amount error elsewhere is empty required (`Required field`).

Amount inputs keep digits and one decimal separator (`.` or `,`). Other characters are dropped on type and paste. A value that is not a positive amount is cleared on blur.

Trade-off: calm state is taller by one line per validatable control. Apply does not shift fields or the footer. Letters do not appear in amount fields.
