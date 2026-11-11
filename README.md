# C2B notification cards

Snapshot for review. The clickable prototype covers the whole setup: an empty brand, a sample wallet file, the client list, and the four alert rules. English and Russian. Two skins.

**Live prototype:** https://felex1896.github.io/c2b-notification-cards-demo/

## Run locally

```bash
cd prototype
npm install
npm run dev
```

Default skin is brand (Golos Text, dark). Switch with `?skin=` or the toolbar. Language follows the browser, or `?lang=en` / `?lang=ru`.

## What's here

- `prototype/` — the clickable app. Field-error layout: [prototype/README.md](./prototype/README.md).
- `work/` — spec, live-product notes, design tokens, session handoffs.

`npm run verify` in `prototype/` is the definition of done for the code.
