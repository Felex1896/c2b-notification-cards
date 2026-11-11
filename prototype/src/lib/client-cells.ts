import type { ActivityRange } from "@/data/wallet-types"

export type TimeOfDay = "night" | "morning" | "day" | "evening"

const TIME_OF_DAY: Record<ActivityRange, TimeOfDay> = {
  "00–06 CET": "night",
  "06–12 CET": "morning",
  "12–18 CET": "day",
  "18–24 CET": "evening",
}

/** Base58, 34 characters, the shape of a Tron address in the sample files. */
const TRON_ADDRESS = /^T[1-9A-HJ-NP-Za-km-z]{33}$/

/** Time-of-day kind and the hour range without the timezone. */
export function activityLabel(range: ActivityRange): {
  kind: TimeOfDay
  hours: string
} {
  return { kind: TIME_OF_DAY[range], hours: range.slice(0, -4) }
}

/**
 * An address the user can copy: an `0x` value, or a Tron `T…` address.
 * A main wallet is always an address. A named top entity is not.
 */
export function isCopyableAddress(value: string): boolean {
  return value.startsWith("0x") || TRON_ADDRESS.test(value)
}
