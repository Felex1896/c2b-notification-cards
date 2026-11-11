import { SAMPLE_WALLETS_A } from "@/data/sample-wallets-a"
import { SAMPLE_WALLETS_B } from "@/data/sample-wallets-b"
import type { SampleFile, SampleFileId } from "@/data/wallet-types"

export const SAMPLE_FILES: Record<SampleFileId, SampleFile> = {
  a: SAMPLE_WALLETS_A,
  b: SAMPLE_WALLETS_B,
}

/** Placeholder names. */
export const SAMPLE_FILE_NAMES: Record<SampleFileId, string> = {
  a: "wallets-a.csv",
  b: "wallets-b.csv",
}

export const SAMPLE_FILE_IDS: SampleFileId[] = ["a", "b"]

/** A few made-up rows for the empty-brand screen. Not in either sample file. */
export const EXAMPLE_ROWS = [
  {
    clientId: "3001",
    address: "0x5b1e83c07f2a94d6e0b3718c4fa92d605e8b17c3",
    role: "central",
    chain: "ethereum",
  },
  {
    clientId: "3002",
    address: "0x9a40d2e6b7135c8f0e24a96b1d3c75f80b2e4a61",
    role: "deposit",
    chain: "ethereum",
  },
  {
    clientId: "3002",
    address: "TQn7x2Vd9RkLw4YfH8aBpCz3MeUj6sGt5N",
    role: "deposit",
    chain: "tron",
  },
  {
    clientId: "3003",
    address: "0xe27c0b95a418d6f3720c8e1b49a5d3f6807b2c94",
    role: "withdrawal",
    chain: "bsc",
  },
]
