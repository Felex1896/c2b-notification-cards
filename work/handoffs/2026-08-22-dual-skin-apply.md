---
type: Note
title: Handoff — Dual-skin apply
description: The dual-skin plan was reviewed, cut down, and decided. This note is the contract for executing it.
tags: [c2b, prototype, design-system]
status: deprecated
---

# Handoff — Dual-skin apply

Deprecated. Stages executed. Durable skin rules: [AGENTS.md](../../AGENTS.md). Pickup: [2026-08-23-code-gates.md](./2026-08-23-code-gates.md). Do not execute the stage table.

## Goal for the next session

Execute the apply. Everything below under Settled is decided — the review that produced it happened in [2026-08-22-dual-skin-plan-review.md](./2026-08-22-dual-skin-plan-review.md) (now deprecated) and does not need repeating. Work through the stages at the end of this note. No separate spec file is written: the durable rules land in [AGENTS.md](../../AGENTS.md) and in the header of the overrides CSS. The apply-ban is lifted — the `AGENTS.md` row that carries it is rewritten as part of stage 6.

Two intents behind the shape, because they explain choices that otherwise look arbitrary. The prototype is kept as a case-study exhibit of staged work: logic and UX first, brand last, both stages reachable in the running app. And the human never edits files — they describe intent in chat, and the procedures below decide which file an agent writes.

## Settled (do not re-open)

### Shape

- One tree. `data-skin` on `<html>` next to `.light` / `.dark`. Four combinations, all real.
- Default skin **brand**, default brand theme **dark**. Sandbox keeps today's light default. Both skins keep light and dark — the sandbox dark block already works and removing it would be extra work and a less honest exhibit.
- Sandbox values are today's `:root` / `.dark` plus Geist. Brand is Inter.
- Sandbox is a **living** view, not a frozen snapshot. A shared fix may change both skins; the honest record of the pre-styles stage is a git tag plus stills, not the running app.
- Skin toggle is visible, in a toolbar above `NotificationsPage` in `App.tsx`, next to a visible theme control. Toolbar is prototype chrome, not product — it is not in [target-flow.md](../specs/target-flow.md) and must not leak into it.
- `?skin=` is allowed and wanted: one shareable URL per stage.
- Tailwind's `@theme inline` already maps `--color-*` onto the runtime variables, which is why light/dark works today. Skins ride the same mechanism — only the `--*` values change. Nothing about `@theme` needs restructuring.

### Extraction boundary

The expensive version of this plan (pull every literal into a contract) was rejected. Measured: ~220 value-utility occurrences in `prototype/src`, ~143 distinct, ~70 fused with state selectors.

- Extract: colour, font, radius roles, plus exactly four anatomy values — input padding (catalog says 8/12, code has 4/10), card radius (12 vs 14), `--field-prefix-width` retuned for Inter, font family.
- Do not extract anything fused with a state selector (`has-…:`, `group-…:`, `data-…:`, `dark:`, `focus-visible:`). Porting those means rewriting behaviour by hand, and the behaviour they carry is the settled part of the deliverable.
- Do not name a value that is not a design decision. `pb-16` clears the sticky footer; `translate-x-[calc(100%-2px)]` is switch geometry; `w-full` / `max-w-md` are page layout. Naming them asserts intent that does not exist.
- Anything brand needs different beyond those four is a hand-written override rule, not a new named token — until the counter below fires.

### Counter for the promotion pass

- Three override rules on one component → that component's anatomy moves into the named table now.
- Twelve override rules in the file → stop and promote across the file.
- The check script prints the count and **warns**; it does not fail the build. Numbers are a first guess and may be retuned.
- Reminder lives in the header of the overrides CSS and as a line in `AGENTS.md`.

### Escape hatch

At most one `skin` fork per component in JSX, and only to add or remove an element or change text. Never for colour, never for spacing — those go through variables or overrides. The rule exists because the alternative found in review was either "impossible on the first brand badge" or "two products in one file".

### Light brand

Ships with its known failures. The human is the release gate and reviews the whole visual before sending; docs do not gate releases.

What breaks on brand light, for the record: Apply fill, switch on-state, checked checkbox, and the focus ring all sit on citron, which is 1.02:1 against canvas and 1.11:1 against card. Do not fix this pass.

Docs change **subtractively**: the ship-gate imperatives in [components.md](../design-system/components.md) (Button, Badge) and [tokens.md](../design-system/tokens.md) Open lose the "do not ship" clauses; the measured ratios stay. Left as written, an agent painting light brand is obliged by the document to refuse or revert.

New convention, worth one line in `tokens.md`: design-system docs hold measurements and application rules, not release gates.

### Values home and the pipeline

- Home of every brand value stays [tokens.json](../design-system/tokens.json) and [tokens.light.json](../design-system/tokens.light.json).
- A generator resolves DTCG references and writes the prototype's values CSS. It lives **outside** the deliverable, at `work/design-system/to-css.mjs`, because a script inside `prototype/` reading `../../work/…` is a link outward that breaks when the prototype is published alone. It has a `--check` flag that reports a stale generated file.
- The generator is not a dump: it carries a small hand-written map from system roles to shadcn variable names. That map is where the accent decision physically lives.
- Fixed paths, so stages can run in parallel: `prototype/src/styles/brand.generated.css` (generated, never hand-edited) and `prototype/src/styles/brand.overrides.css` (hand-written anatomy overrides plus the counter reminder).
- Selector shape: `[data-skin="brand"]` for light values, `[data-skin="brand"].dark` for dark. Same element carries both attributes. Sandbox blocks move to `[data-skin="sandbox"]` in `index.css`.
- A second check script lives **inside** the prototype as an npm script, because it reads only prototype files: fails on a literal colour or font family in a component, counts overrides, warns past the thresholds.

### Brand chrome the catalog does not cover

The human delegated inventing these. They go into `components.md` / `tokens.json` in stage 1, before or as they are used.

1. **`outline` button** (Cancel in every card footer). Transparent fill, `border.input` edge, `text.foreground` label, hover `surface.muted`.
2. **`link` button** ("Use a different chat", "Use page default"). `text.foreground` with underline on hover — **not** citron. This is inventing a control the catalog never had, not a contrast fix: citron-as-text is already forbidden on light, and these two links are the only entrance to the channel override.
3. **Control fill role.** The prototype uses `--input` as a fill (switch off track, dark field fill, disabled fill) but the system only has the `border.input` hairline. Add a semantic surface role for it.
4. **Accent mapping.** The skin fills shadcn's `--accent` / `--accent-foreground` with `surface.muted` / `text.foreground`, **not** with the `accent` role. `components.md` requires the highlighted Select row to be "not citron", and shadcn's `--accent` is a neutral hover, while the system's `accent` is brand highlight. Same word, different job. State this in prose in `tokens.md` so it does not read as a transfer error.

Three value changes that are not inventions: input padding, card radius, prefix width.

### Still true from earlier sessions

- Card control and Notifications behaviour: [target-flow.md](../specs/target-flow.md). Do not re-grill.
- Landing is the brand reference. Login and the live cabinet are not sources, and their chrome is not copied.
- `prototype/` stays self-contained and must not import from `work/`.

## Open

- Toolbar and toggle copy. Placeholders now; the human names the stages during visual polish. This is the framing of the whole artifact, so it is worth a deliberate pass.
- Figma may join the loop later. The generator makes that cheap: `tokens.json` is already the exchange format and stays current.
- Whether 3 / 12 are the right counter thresholds. Retune after contact.
- Sketches stage has no artifact in the repo (only Vite and React icons). The human owns that.

## Execution stages

Speed is not the goal; not exhausting one chat's context is. The main chat keeps judgment and hands mechanical work to subagents. Each subagent gets this note's path, an explicit list of files it may write, an explicit do-not-touch list, and no permission to commit. Never let two subagents write the same file.

| Stage | Who | Writes | Verify |
| --- | --- | --- | --- |
| 1. Design-system docs | subagent | `components.md`, `tokens.md`, `tokens.json`, `tokens.light.json` | `python3 work/verify.py` |
| 2. Generator | subagent | `work/design-system/to-css.mjs`, generated CSS | runs; second run leaves no diff; `--check` catches a stale file |
| 3. Prototype plumbing | subagent | `index.css`, `main.tsx`, `App.tsx`, `theme-provider.tsx`, `package.json`, overrides CSS skeleton | `npm run typecheck`, dev server boots, four combinations render |
| 4. Extraction | main chat | the four anatomy values in `ui/` and `lib/field-chrome.ts` | prefix alignment on EUR / Slack / Telegram still holds |
| 5. Check script | subagent | prototype npm script | passes clean; fails on a planted literal colour |
| 6. Rules | main chat, Opus 5 high | `AGENTS.md` row, overrides CSS header | `python3 work/verify.py` |
| 7. Review | fresh subagent | nothing | stills of all four combinations, report against this note |

Stages 1 and 5 are independent and can run together. Stage 3 needs only the fixed paths above, so it can run alongside 1 and 2. Stage 4 follows 3. Stage 4 is small on purpose — the judgment is picking the edits, which the main chat does from a grep, and there are under a dozen.

Stage 6 runs on **Opus 5 with high reasoning**, whatever model carries the rest of the session. What it writes into `AGENTS.md` governs every later session on this take-home, and a loose formulation there is more expensive than loose CSS. Either switch the chat's model for that stage, or delegate it to a subagent pinned to `claude-opus-5-thinking-high` with this note as its input. Two failure modes to watch for in any model running the other stages, both visible in the first minutes: reaching for a `tailwind.config.js` that must not exist (this is Tailwind v4 — the theme lives in `@theme inline` in `index.css`), and volunteering a fix for the light-mode citron contrast, which is decided and forbidden above.

## Suggested skills

`design-system` in **document** mode for stage 1 only, and not as a gate before anything else. `handoff` at session end. Do not invoke `to-spec` — the decision was explicitly no spec file. `grilling` only if a new hard-to-reverse choice appears that is not in Settled.

## Do not

- Do not re-grill anything under Settled, and do not treat the deprecated review note's open list as open.
- Do not do the full extraction, and do not port state-fused utilities into hand-written CSS.
- Do not fix light-mode contrast, and do not re-add ship gates to the design-system docs.
- Do not hand-edit the generated CSS. Do not move the generator inside `prototype/`.
- Do not let the toolbar reach `target-flow.md` — it is prototype chrome, not product.
- Do not copy live cabinet chrome.
- Do not put take-home material in `portfolio/`. Reusing it for a case is a separate ask.
- Do not commit or push.
