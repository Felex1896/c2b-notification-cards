#!/usr/bin/env node
/**
 * Resolves DTCG tokens and writes brand-skin CSS variables.
 * Paths are fixed relative to this file; cwd does not matter.
 *
 * The ROLE_TO_VAR table is the skin contract — not a dump.
 * Accent decision lives here: shadcn --accent is a neutral hover
 * (surface.muted), not the system's citron accent role.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DARK_TOKENS_PATH = path.join(HERE, "tokens.json");
const LIGHT_TOKENS_PATH = path.join(HERE, "tokens.light.json");
const OUT_PATH = path.join(HERE, "../../prototype/src/styles/brand.generated.css");

const HEADER =
  "/* generated, never hand-edit; run `node work/design-system/to-css.mjs` from repo root */\n";

/** Hand-written map: system role → shadcn CSS variable. */
const ROLE_TO_VAR = [
  ["--background", "color.surface.background"],
  ["--foreground", "color.text.foreground"],
  ["--card", "color.surface.card"],
  ["--card-foreground", "color.text.card"],
  ["--popover", "color.surface.popover"],
  ["--popover-foreground", "color.text.popover"],
  ["--primary", "color.action.primary"],
  ["--primary-foreground", "color.action.primary-foreground"],
  ["--secondary", "color.surface.secondary"],
  ["--secondary-foreground", "color.text.foreground"],
  ["--muted", "color.surface.muted"],
  ["--muted-foreground", "color.text.muted"],
  ["--accent", "color.surface.muted"],
  ["--accent-foreground", "color.text.foreground"],
  ["--destructive", "color.action.destructive"],
  ["--destructive-foreground", "color.action.destructive-foreground"],
  ["--border", "color.border.default"],
  ["--input", "color.surface.control"],
  ["--ring", "color.border.ring"],
  ["--sidebar", "color.surface.card"],
  ["--sidebar-foreground", "color.text.card"],
  ["--sidebar-primary", "color.action.primary"],
  ["--sidebar-primary-foreground", "color.action.primary-foreground"],
  ["--sidebar-accent", "color.surface.muted"],
  ["--sidebar-accent-foreground", "color.text.foreground"],
  ["--sidebar-border", "color.border.default"],
  ["--sidebar-ring", "color.border.ring"],
  ["--chart-1", "color.neutral.80"],
  ["--chart-2", "color.neutral.50"],
  ["--chart-3", "color.neutral.41"],
  ["--chart-4", "color.neutral.20"],
  ["--chart-5", "color.neutral.15"],
];

/** Anatomy the brand skin owns. Same in light and dark. */
const ANATOMY_TO_VAR = [
  ["--font-family-sans", "typography.family.sans"],
  ["--radius", "radius.control.default"],
  ["--card-radius", "radius.box.default"],
  ["--field-prefix-width", "spacing.field.prefix"],
  ["--input-padding-y", "spacing.scale.8"],
  ["--input-padding-x", "spacing.scale.12"],
];

function deepMerge(base, overlay) {
  if (overlay === null || overlay === undefined) return base;
  if (typeof overlay !== "object" || Array.isArray(overlay)) return overlay;
  if (typeof base !== "object" || base === null || Array.isArray(base)) {
    return overlay;
  }
  const out = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    out[key] = key in out ? deepMerge(out[key], value) : value;
  }
  return out;
}

function getByPath(tree, tokenPath) {
  let node = tree;
  for (const key of tokenPath.split(".")) {
    if (node == null || typeof node !== "object") return undefined;
    node = node[key];
  }
  return node;
}

function resolveValue(value, tree, seen = new Set()) {
  if (typeof value === "string") {
    const whole = value.match(/^\{([^{}]+)\}$/);
    if (whole) {
      return resolveRef(whole[1], tree, seen);
    }
    if (!value.includes("{")) return value;
    return value.replace(/\{([^{}]+)\}/g, (_, refPath) => {
      const resolved = resolveRef(refPath, tree, seen);
      if (typeof resolved !== "string" && typeof resolved !== "number") {
        throw new Error(`cannot interpolate {${refPath}} into a string`);
      }
      return String(resolved);
    });
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveValue(item, tree, seen));
  }
  if (value && typeof value === "object") {
    if ("value" in value && "unit" in value) {
      return `${value.value}${value.unit}`;
    }
    const out = {};
    for (const [key, inner] of Object.entries(value)) {
      out[key] = resolveValue(inner, tree, seen);
    }
    return out;
  }
  return value;
}

function resolveRef(tokenPath, tree, seen) {
  if (seen.has(tokenPath)) {
    throw new Error(`cycle at {${tokenPath}}`);
  }
  seen.add(tokenPath);
  const node = getByPath(tree, tokenPath);
  if (node === undefined) {
    throw new Error(`unresolved {${tokenPath}}`);
  }
  const inner = node && typeof node === "object" && "$value" in node ? node.$value : node;
  return resolveValue(inner, tree, seen);
}

function cssValue(resolved) {
  if (Array.isArray(resolved)) {
    return resolved
      .map((name) => {
        if (typeof name !== "string") return String(name);
        if (/^[a-z][a-z0-9-]*$/i.test(name)) return name;
        return `"${name.replaceAll('"', '\\"')}"`;
      })
      .join(", ");
  }
  if (typeof resolved === "number") return String(resolved);
  if (typeof resolved === "string") return resolved;
  throw new Error(`cannot emit CSS for ${JSON.stringify(resolved)}`);
}

function resolveRole(tree, tokenPath) {
  const node = getByPath(tree, tokenPath);
  if (node === undefined) {
    throw new Error(`missing token ${tokenPath}`);
  }
  const inner = node && typeof node === "object" && "$value" in node ? node.$value : node;
  return cssValue(resolveValue(inner, tree));
}

function emitBlock(selector, pairs) {
  const body = pairs.map(([name, value]) => `  ${name}: ${value};`).join("\n");
  return `${selector} {\n${body}\n}`;
}

function mapRoles(tree, table) {
  return table.map(([cssVar, tokenPath]) => [cssVar, resolveRole(tree, tokenPath)]);
}

function generateCss(darkTree, lightTree) {
  const lightVars = [...mapRoles(lightTree, ANATOMY_TO_VAR), ...mapRoles(lightTree, ROLE_TO_VAR)];
  const darkVars = mapRoles(darkTree, ROLE_TO_VAR);
  return [
    HEADER,
    emitBlock('[data-skin="brand"]', lightVars),
    "",
    emitBlock('[data-skin="brand"].dark', darkVars),
    "",
  ].join("\n");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function main() {
  const check = process.argv.includes("--check");
  const darkTree = readJson(DARK_TOKENS_PATH);
  const lightTree = deepMerge(structuredClone(darkTree), readJson(LIGHT_TOKENS_PATH));
  const css = generateCss(darkTree, lightTree);

  if (check) {
    if (!fs.existsSync(OUT_PATH)) {
      console.error(`missing ${path.relative(process.cwd(), OUT_PATH)}`);
      process.exit(1);
    }
    const current = fs.readFileSync(OUT_PATH, "utf8");
    if (current !== css) {
      console.error(`stale ${path.relative(process.cwd(), OUT_PATH)}; run node work/design-system/to-css.mjs`);
      process.exit(1);
    }
    process.exit(0);
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, css, "utf8");
  process.stdout.write(`${path.relative(process.cwd(), OUT_PATH)}\n`);
}

main();
