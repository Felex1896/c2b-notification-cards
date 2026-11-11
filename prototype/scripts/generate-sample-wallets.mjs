#!/usr/bin/env node
/**
 * Writes src/data/sample-wallets-a.ts and src/data/sample-wallets-b.ts.
 * Deterministic: a seeded generator, no Math.random, no Date. Re-running gives
 * byte-identical files. Run by hand, not part of verify.
 *
 * Run from prototype/: node scripts/generate-sample-wallets.mjs
 */
import { writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"

const OUT_DIR = fileURLToPath(new URL("../src/data/", import.meta.url))

const CLIENTS_PER_FILE = 50

const FILES = [
  { id: "a", seed: 1101, centralId: 1001, firstClientId: 1002 },
  { id: "b", seed: 2202, centralId: 2001, firstClientId: 2002 },
]

/** Names that exist in src/data/catalog.ts. */
const ENTITIES = [
  "Binance",
  "Bitfinex.com",
  "Bitget",
  "Bybit",
  "Coinbase",
  "Crypto.com",
  "Gemini.com",
  "Huobi",
  "Kraken",
  "Rollbit.com",
  "Roobet.com",
  "Stake.com",
  "Relay.link",
  "Uniswap",
]

const ACTIVITY = ["00–06 CET", "06–12 CET", "12–18 CET", "18–24 CET"]

const CURRENCIES_BY_CHAIN = {
  ethereum: ["ETH", "USDT"],
  tron: ["USDT", "TRX"],
  bsc: ["BNB", "USDT"],
}

const HEX = "0123456789abcdef"
const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeRandom(seed) {
  const next = mulberry32(seed)
  const int = (min, max) => min + Math.floor(next() * (max - min + 1))
  const pick = (list) => list[int(0, list.length - 1)]
  return { next, int, pick }
}

function address(rand, chain) {
  const pickChar = (alphabet) => alphabet[rand.int(0, alphabet.length - 1)]
  if (chain === "tron") {
    let out = "T"
    for (let i = 0; i < 33; i++) out += pickChar(BASE58)
    return out
  }
  let out = "0x"
  for (let i = 0; i < 40; i++) out += pickChar(HEX)
  return out
}

function pickChain(rand) {
  const roll = rand.next()
  if (roll < 0.55) return "ethereum"
  if (roll < 0.8) return "tron"
  return "bsc"
}

function buildFile({ seed, centralId, firstClientId }) {
  const rand = makeRandom(seed)
  const deposits = []
  const withdrawals = []
  const clients = []

  for (let i = 0; i < CLIENTS_PER_FILE; i++) {
    const clientId = String(firstClientId + i)
    const roll = rand.next()
    const walletCount = roll < 0.6 ? 1 : roll < 0.85 ? 2 : roll < 0.95 ? 3 : 4
    const owned = []
    for (let w = 0; w < walletCount; w++) {
      const chain = pickChain(rand)
      const row = { clientId, address: address(rand, chain), role: "deposit", chain }
      deposits.push(row)
      owned.push(row)
    }
    if (rand.next() < 0.3) {
      const chain = owned[0].chain
      const row = {
        clientId,
        address: address(rand, chain),
        role: "withdrawal",
        chain,
      }
      withdrawals.push(row)
    }

    const idle = rand.next() < 0.1
    if (idle) {
      clients.push({
        clientId,
        balance: 0,
        annualTurnover: 0,
        turnoverWithUs: 0,
        activity: null,
        currency: null,
        mainWallet: null,
        topEntity: null,
        historySize: 0,
      })
      continue
    }

    const swept = rand.next() < 0.12
    const balance = swept ? 0 : Math.round(10 ** (rand.next() * 7.5))
    const annualTurnover = Math.round(10 ** (1 + rand.next() * 8))
    const turnoverWithUs = Math.round(annualTurnover * rand.next() ** 2)
    const main = rand.pick(owned)
    const entityRoll = rand.next()
    let topEntity = null
    if (entityRoll < 0.5) topEntity = rand.pick(ENTITIES)
    else if (entityRoll < 0.85) topEntity = address(rand, "ethereum")

    clients.push({
      clientId,
      balance,
      annualTurnover,
      turnoverWithUs,
      activity: rand.pick(ACTIVITY),
      currency: rand.pick(CURRENCIES_BY_CHAIN[main.chain]),
      mainWallet: main.address,
      topEntity,
      historySize: 1 + Math.floor(rand.next() ** 1.5 * 10),
    })
  }

  const central = {
    clientId: String(centralId),
    address: address(rand, "ethereum"),
    role: "central",
    chain: "ethereum",
  }
  return { wallets: [central, ...deposits, ...withdrawals], clients }
}

function emit(value, indent) {
  const pad = "  ".repeat(indent)
  const inner = "  ".repeat(indent + 1)
  if (Array.isArray(value)) {
    const items = value.map((item) => `${inner}${emit(item, indent + 1)},`)
    return `[\n${items.join("\n")}\n${pad}]`
  }
  if (value !== null && typeof value === "object") {
    const lines = Object.entries(value).map(
      ([key, item]) => `${inner}${key}: ${emit(item, indent + 1)},`,
    )
    return `{\n${lines.join("\n")}\n${pad}}`
  }
  return JSON.stringify(value)
}

for (const file of FILES) {
  const data = buildFile(file)
  const name = `SAMPLE_WALLETS_${file.id.toUpperCase()}`
  const source =
    `import type { SampleFile } from "@/data/wallet-types"\n\n` +
    `// Generated by scripts/generate-sample-wallets.mjs. Do not edit by hand.\n` +
    `export const ${name}: SampleFile = ${emit(data, 0)}\n`
  await writeFile(`${OUT_DIR}sample-wallets-${file.id}.ts`, source)
}
