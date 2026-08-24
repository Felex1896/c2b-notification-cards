---
type: Note
title: Handoff — Dual-skin plan review
description: Adversarial review of an unbuilt dual-skin plan. Do not implement. Do not defend the plan.
tags: [c2b, prototype, review]
status: deprecated
---

# Handoff — Dual-skin plan review

The review happened and the plan was cut down. Every claim and open question below is settled in [2026-08-22-dual-skin-apply.md](./2026-08-22-dual-skin-apply.md) — read that instead; this note is kept for the reasoning trail.

## Goal for the next session

Review the dual-skin plan. Another model wrote it after grilling; this session attacks the **logic of the accepted answers and the interpolations stacked on them**. Report what is incoherent, underspecified, or too expensive for a take-home. Prefer a smaller plan if the current one does not survive. Do not implement. Do not patch holes to save the plan. The previous agent recommended most options — treat those recommendations as bias, not evidence.

Plan file (not in git, not canon): `.cursor/plans/prototype_dual_skin_2769d393.plan.md`. Claims below are the payload if that file is missing.

Human ask that started it: keep a UX/sandbox view, also see brand, do not maintain two projects that diverge, can styles be pluggable, industry options. Then grilling.

## Settled (do not re-open)

Not under review here. From [2026-08-21-design-system.md](./2026-08-21-design-system.md) and [AGENTS.md](../../AGENTS.md):

- Visual system is documented, not applied. [design-system/](../design-system/index.md). Prototype greys/Geist are not sources. Landing only. Do not copy live cabinet chrome.
- Card control and Notifications behaviour: [target-flow.md](../specs/target-flow.md). Do not re-grill.
- Prototype is the deliverable, self-contained. Tokens live under `work/design-system/`. `prototype/` must not import `work/`.
- [AGENTS.md](../../AGENTS.md) still says: do not apply tokens until asked. Nothing has been applied. This plan is that ask, still unconfirmed.

## Open

The dual-skin decisions are **claims**. Re-open any of them. Human answers are quoted; unmarked bullets are agent interpolations.

### Human answers (grilling)

1. View: **toggle**, not split.
2. Depth: sandbox = logic, functions, corner cases. All visual work in styles mode — anatomy, spacing, alignment may change there.
3. Where visual lives: **contract** (CSS variables + slots). Rejected overlay (keep Tailwind on components, brand CSS on top).
4. Default URL: **brand**.
5. Colour: sandbox stays default React/shadcn look (theme switcher optional, or light-only). Brand: dark default, light switcher at the top.
6. Entering sandbox: **visible toggle** in the top bar, next to brand light/dark.

### Plan interpolations (human did not say these)

- Sandbox is **light-only**; `d` only on brand.
- No `?skin=` query.
- No JSON→CSS generator; copy values into `prototype/src/styles/brand.css`.
- Alignment that is not a number = `[data-skin="brand"] [data-slot="…"]` selectors, **no `if (skin)` in JSX**.
- Retarget only controls the screen uses; unused shadcn sizes stay hardcoded.
- Brand light ships with known contrast failures; do not fix this pass.
- Toolbar is prototype chrome in `App.tsx`, above `NotificationsPage`.
- Fold `dark:` overlays (`dark:bg-input/30`) into skin variables.

### Plan shape (what implementation would do)

One tree. `data-skin` + `.light`/`.dark`. Sandbox values = current `:root`. Brand values mapped from `tokens.json` / `tokens.light.json` onto the same shadcn role names. Extract `h-8`, `px-2.5`, gaps, radius into the contract. Inter on brand, Geist on sandbox. Lift the AGENTS ban; `design-system check` would compare brand.css only.

### Attack these tensions

Do not steelman. If two answers cannot both be true, say so.

- **Default brand vs sandbox-for-logic.** Daily UX work starts on the branded screen and requires a switch. Coherent with the opening ask?
- **Visible sandbox toggle on a take-home that opens as brand.** Reviewer sees a second, unstyled product. Coherent with “this is the proposal”?
- **Contract vs “default React components”.** After extracting Tailwind into variables, sandbox is no longer stock shadcn — it is a retargeted kit filled with old values. Upstream shadcn updates and “looks like defaults” both weaken.
- **Alignment/anatomy in CSS only.** Theming is cheap until structure diverges. The human asked for alignment changes. The plan forbids JSX forks. What happens on the first change CSS cannot express?
- **Take-home cost.** White-label contract + dual skin is production architecture. Time-boxed assignment. Cheaper paths not grilled as first-class: apply brand once and use git as the old view; overlay CSS and accept discipline; skip sandbox entirely.
- **Two homes for brand values.** JSON in `work/`, copy in `prototype/`. Repo rule is one home. Check-mode as the sync story — is that real or a wish?
- **Brand light.** Catalog and `tokens.md` say do not ship several light pairs. Plan still puts a light switcher on the demo.
- **Self-contained prototype vs source-of-truth tokens.** Copy vs generate vs tokens inside `prototype/`. Plan picked copy without grilling it.
- **Apply vs dual-skin.** [AGENTS.md](../../AGENTS.md) forbids apply until asked. Dual-skin is a particular apply. Is the right apply “switchable skins”, or “restyle to brand and stop”?
- **Deliverable form still open** on the previous handoff (Figma vs code). This plan assumes the code prototype is where brand is shown.

Industry options raised in chat (for checking whether the plan picked the wrong one): CSS-variable theme (shadcn/Polaris/MUI), overlay/`data-slot` CSS, CVA-per-skin, two presentation layers on shared hooks, Storybook modes, split pane. Overlay was explicitly rejected. The others were not.

## Suggested skills

None first. Read this note, the plan file, [design-system/index.md](../design-system/index.md), [AGENTS.md](../../AGENTS.md), then the prototype as it is (`prototype/src/index.css`, `theme-provider.tsx`, `ui/button.tsx`, `lib/field-chrome.ts`). Invoke `grilling` only if the review ends on a question the human must answer — not to relitigate taste already in the design-system docs. Do not invoke `design-system` document or check. Do not invoke `to-spec` until a plan actually survives.

## Do not

- Do not implement, restyle, or lift the AGENTS apply-ban.
- Do not defend, complete, or “fix” the dual-skin plan so it looks consistent.
- Do not treat grilled answers as canon; they are one session’s picks plus agent recommendations.
- Do not re-grill the card control, Notifications behaviour, or design-system Q1–Q8.
- Do not copy cabinet chrome. Do not put take-home material in `portfolio/`.
- Do not write an ADR or edit `CONTEXT.md` unless the human asks after the review.
- Do not commit or push.
