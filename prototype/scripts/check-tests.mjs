#!/usr/bin/env node
/**
 * Fail when a src/lib/*.ts file has no sibling <name>.test.ts.
 *
 * Only the human adds entries to the exception list, never an agent.
 *
 * Run from prototype/: node scripts/check-tests.mjs
 */
import { readdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const LIB_REL = "src/lib"

/** Files in src/lib that are not required to have a sibling test. */
const EXCEPTIONS = {
  "utils.ts": "shadcn boilerplate, not ours",
  "field-chrome.ts": "class-name strings, no logic",
}

const libDir = path.join(ROOT, LIB_REL)
const entries = await readdir(libDir, { recursive: true })
const present = new Set(entries)
const sources = entries
  .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"))
  .filter((name) => !(path.basename(name) in EXCEPTIONS))
  .sort()

const missing = []
for (const name of sources) {
  const testName = name.replace(/\.ts$/, ".test.ts")
  if (!present.has(testName)) {
    missing.push(path.join(LIB_REL, name))
  }
}

if (missing.length) {
  console.log("check-tests: no sibling test for")
  for (const file of missing) {
    console.log(`  ${file}`)
  }
  process.exit(1)
}

console.log("check-tests: every src/lib file has a sibling test")
process.exit(0)
