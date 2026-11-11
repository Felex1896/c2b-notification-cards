#!/usr/bin/env node
/**
 * Fail on interface text written in code instead of taken from the dictionaries
 * in src/i18n. Reads the TypeScript syntax tree, so it is a heuristic, not proof:
 *
 * - text between JSX tags that contains a letter;
 * - a string with a letter in a text attribute (aria-label, placeholder, title…);
 * - a string with a letter inside `{…}` placed between JSX tags;
 * - anywhere else, a string that reads like prose: a capital, then lowercase.
 *
 * Comparisons (`key === "Enter"`), imports, types and `new Error(…)` are skipped.
 * src/components/ui is shadcn's and is not scanned.
 *
 * Run from prototype/: node scripts/check-i18n.mjs
 */
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const SCAN_DIRS = ["src/components", "src/hooks", "src/lib"]
const SKIP_DIRS = ["src/components/ui"]

const TEXT_ATTRIBUTES = new Set([
  "aria-label",
  "aria-description",
  "aria-placeholder",
  "aria-valuetext",
  "alt",
  "placeholder",
  "title",
  "label",
  "meaning",
  "ariaLabel",
])

const HAS_LETTER = /\p{L}/u
const READS_LIKE_PROSE = /^\s*\p{Lu}\p{Ll}/u

const COMPARISONS = new Set([
  ts.SyntaxKind.EqualsEqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsEqualsToken,
  ts.SyntaxKind.EqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsToken,
])

function isStringNode(node) {
  return (
    ts.isStringLiteral(node) ||
    ts.isNoSubstitutionTemplateLiteral(node) ||
    ts.isTemplateExpression(node)
  )
}

function textOf(node) {
  if (ts.isTemplateExpression(node)) {
    return [node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join(" ")
  }
  return node.text
}

/** Positions where a string is code, not something a user reads. */
function isExempt(node) {
  const parent = node.parent
  if (!parent) return false
  if (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) return true
  if (ts.isLiteralTypeNode(parent)) return true
  if (ts.isBinaryExpression(parent) && COMPARISONS.has(parent.operatorToken.kind)) {
    return true
  }
  if (ts.isCaseClause(parent)) return true
  if (ts.isNewExpression(parent)) return true
  if (ts.isElementAccessExpression(parent)) return true
  if (ts.isPropertyAssignment(parent) && parent.name === node) return true
  return false
}

/** Inside `{…}` that sits between JSX tags, not inside a call or a comparison. */
function isJsxChildExpression(node) {
  let current = node.parent
  while (current) {
    if (ts.isCallExpression(current) || ts.isArrowFunction(current)) return false
    if (ts.isJsxExpression(current)) {
      const owner = current.parent
      return Boolean(owner && (ts.isJsxElement(owner) || ts.isJsxFragment(owner)))
    }
    if (ts.isJsxAttribute(current) || ts.isJsxElement(current)) return false
    current = current.parent
  }
  return false
}

function attributeName(node) {
  let current = node.parent
  while (current) {
    if (ts.isJsxAttribute(current)) return current.name.getText()
    if (ts.isCallExpression(current) || ts.isArrowFunction(current)) return null
    if (ts.isJsxElement(current) || ts.isJsxSelfClosingElement(current)) return null
    current = current.parent
  }
  return null
}

function findings(fileName, source) {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true)
  const hits = []
  const report = (node, text, why) => {
    const { line } = file.getLineAndCharacterOfPosition(node.getStart(file))
    hits.push({ line: line + 1, text: text.trim().replace(/\s+/g, " ").slice(0, 70), why })
  }

  const visit = (node) => {
    if (ts.isJsxText(node) && HAS_LETTER.test(node.text)) {
      report(node, node.text, "text between tags")
    } else if (isStringNode(node) && !isExempt(node)) {
      const text = textOf(node)
      const attribute = attributeName(node)
      if (attribute && TEXT_ATTRIBUTES.has(attribute) && HAS_LETTER.test(text)) {
        report(node, text, `"${attribute}" attribute`)
      } else if (!attribute && isJsxChildExpression(node) && HAS_LETTER.test(text)) {
        report(node, text, "string between tags")
      } else if (READS_LIKE_PROSE.test(text)) {
        report(node, text, "reads like prose")
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(file)
  return hits
}

async function listSourceFiles() {
  const files = []
  for (const rel of SCAN_DIRS) {
    const entries = await readdir(path.join(ROOT, rel), { recursive: true })
    for (const entry of entries) {
      const relPath = path.join(rel, entry)
      if (SKIP_DIRS.some((skip) => relPath.startsWith(skip + path.sep))) continue
      if (/\.test\.tsx?$/.test(entry) || entry.endsWith(".d.ts")) continue
      if (entry.endsWith(".ts") || entry.endsWith(".tsx")) files.push(relPath)
    }
  }
  return files.sort()
}

const all = []
for (const rel of await listSourceFiles()) {
  const source = await readFile(path.join(ROOT, rel), "utf8")
  for (const hit of findings(rel, source)) {
    all.push({ file: rel, ...hit })
  }
}

for (const hit of all) {
  console.log(`${hit.file}:${hit.line}: ${hit.why}: ${hit.text}`)
}

if (all.length) {
  console.log(`check-i18n: ${all.length} text(s) not taken from src/i18n`)
  process.exit(1)
}
console.log("check-i18n: every interface text comes from src/i18n")
process.exit(0)
