#!/usr/bin/env node
/**
 * Fail on a literal colour or font family in src/components and src/lib.
 * Count override rules in src/styles/brand.overrides.css; warn past 3 / 12, do not fail.
 *
 * Run from prototype/: node scripts/check-skin.mjs
 */
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const SCAN_DIRS = ["src/components", "src/lib"]
const OVERRIDES_REL = "src/styles/brand.overrides.css"
const COMPONENT_WARN = 3
const FILE_WARN = 12

const LITERALS = [
  {
    kind: "colour",
    // The lookahead keeps identifiers out: `#c2b-alerts` is a Slack channel, not a colour.
    re: /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![0-9a-zA-Z_-])/g,
  },
  {
    kind: "colour",
    re: /(?:oklch|rgba?|hsla?|hwb)\s*\(/gi,
  },
  {
    kind: "font",
    re: /font-\[['"'][^'"']+['"']\]/g,
  },
  {
    kind: "font",
    re: /\bfont(?:Family|-family)\s*[:=]\s*(['"])(?!(?:inherit|unset|initial|revert)\1)[^'"]+\1/gi,
  },
]

function lineStarts(content) {
  const starts = [0]
  for (let i = 0; i < content.length; i++) {
    if (content[i] === "\n") starts.push(i + 1)
  }
  return starts
}

function lineAt(starts, index) {
  let lo = 0
  let hi = starts.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (starts[mid] <= index) lo = mid + 1
    else hi = mid - 1
  }
  return hi + 1
}

function findLiterals(content) {
  const starts = lineStarts(content)
  const hits = []
  for (const { kind, re } of LITERALS) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(content))) {
      hits.push({
        kind,
        text: m[0].replace(/\s+/g, " ").slice(0, 80),
        line: lineAt(starts, m.index),
      })
    }
  }
  hits.sort((a, b) => a.line - b.line || a.text.localeCompare(b.text))
  return hits
}

async function listSourceFiles() {
  const files = []
  for (const rel of SCAN_DIRS) {
    const dir = path.join(ROOT, rel)
    let entries
    try {
      entries = await readdir(dir, { recursive: true })
    } catch (err) {
      if (err && err.code === "ENOENT") continue
      throw err
    }
    for (const entry of entries) {
      if (entry.endsWith(".d.ts")) continue
      // Tests hold fixtures, never markup. Nothing they contain reaches a screen.
      if (entry.endsWith(".test.ts") || entry.endsWith(".test.tsx")) continue
      if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
        files.push(path.join(dir, entry))
      }
    }
  }
  files.sort()
  return files
}

function stripCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "")
}

function matchingBrace(text, openAt) {
  let depth = 0
  for (let i = openAt; i < text.length; i++) {
    if (text[i] === "{") depth++
    else if (text[i] === "}") {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

function nextChunk(text, from) {
  let i = from
  const n = text.length
  while (i < n && /\s/.test(text[i])) i++
  if (i >= n) return null
  let j = i
  let parens = 0
  while (j < n) {
    const c = text[j]
    if (c === "(") parens++
    else if (c === ")" && parens) parens--
    else if (parens === 0 && (c === "{" || c === ";")) {
      return { kind: c === "{" ? "block" : "decl", start: i, mark: j }
    }
    j++
  }
  return null
}

function hasOwnDeclarations(body) {
  let i = 0
  while (i < body.length) {
    const chunk = nextChunk(body, i)
    if (!chunk) {
      return /[A-Za-z-]\s*:/.test(body.slice(i))
    }
    if (chunk.kind === "decl") return true
    const close = matchingBrace(body, chunk.mark)
    if (close < 0) return false
    i = close + 1
  }
  return false
}

function collectRules(text, parentSel, rules) {
  let i = 0
  while (i < text.length) {
    const chunk = nextChunk(text, i)
    if (!chunk) break
    if (chunk.kind === "decl") {
      i = chunk.mark + 1
      continue
    }
    const selector = text.slice(chunk.start, chunk.mark).trim()
    const close = matchingBrace(text, chunk.mark)
    if (close < 0) break
    const body = text.slice(chunk.mark + 1, close)
    const isAt = selector.startsWith("@")
    const combined = isAt
      ? parentSel
      : [parentSel, selector].filter(Boolean).join(" ")
    if (!isAt && hasOwnDeclarations(body)) {
      rules.push({ selector: combined })
    }
    collectRules(body, combined, rules)
    i = close + 1
  }
}

function componentKeys(selector) {
  const stems = []
  const seen = new Set()
  for (const m of selector.matchAll(
    /\[data-slot=(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_-]+))/g,
  )) {
    const stem = (m[1] || m[2] || m[3]).split("-")[0]
    if (!seen.has(stem)) {
      seen.add(stem)
      stems.push(stem)
    }
  }
  if (stems.length) return stems
  const classes = [...selector.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((m) => m[1])
  if (classes.length) return [classes[classes.length - 1]]
  return ["(other)"]
}

function countOverrides(css) {
  const rules = []
  collectRules(stripCssComments(css), "", rules)
  const byComponent = new Map()
  for (const rule of rules) {
    for (const key of componentKeys(rule.selector)) {
      byComponent.set(key, (byComponent.get(key) || 0) + 1)
    }
  }
  return { total: rules.length, byComponent }
}

async function readOverrides() {
  const abs = path.join(ROOT, OVERRIDES_REL)
  try {
    const css = await readFile(abs, "utf8")
    if (!stripCssComments(css).trim()) {
      return { total: 0, byComponent: new Map(), note: "empty" }
    }
    return { ...countOverrides(css), note: null }
  } catch (err) {
    if (err && err.code === "ENOENT") {
      return { total: 0, byComponent: new Map(), note: "missing" }
    }
    throw err
  }
}

const files = await listSourceFiles()
const findings = []
for (const abs of files) {
  const content = await readFile(abs, "utf8")
  const rel = path.relative(ROOT, abs)
  for (const hit of findLiterals(content)) {
    findings.push({ file: rel, ...hit })
  }
}

for (const hit of findings) {
  console.log(`${hit.file}:${hit.line}: ${hit.kind} ${hit.text}`)
}

if (findings.length) {
  console.log(`check-skin: ${findings.length} colour/font literal(s)`)
} else {
  console.log("check-skin: no colour/font literals")
}

const overrides = await readOverrides()
const note = overrides.note ? ` (${overrides.note})` : ""
console.log(`check-skin: override rules: ${overrides.total}${note}`)

for (const [name, count] of [...overrides.byComponent.entries()].sort()) {
  if (count >= COMPONENT_WARN) {
    console.error(
      `check-skin: warning: component "${name}" has ${count} override rules (threshold ${COMPONENT_WARN})`,
    )
  }
}
if (overrides.total >= FILE_WARN) {
  console.error(
    `check-skin: warning: ${OVERRIDES_REL} has ${overrides.total} override rules (threshold ${FILE_WARN})`,
  )
}

process.exit(findings.length ? 1 : 0)
