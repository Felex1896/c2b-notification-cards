import { describe, expect, it } from "vitest"

import { sampleRows } from "@/lib/client-list"
import { activityLabel, isCopyableAddress } from "@/lib/client-cells"

describe("activity labels", () => {
  it("night is 00–06", () => {
    expect(activityLabel("00–06 CET")).toEqual({
      kind: "night",
      hours: "00–06",
    })
  })

  it("morning is 06–12", () => {
    expect(activityLabel("06–12 CET")).toEqual({
      kind: "morning",
      hours: "06–12",
    })
  })

  it("day is 12–18", () => {
    expect(activityLabel("12–18 CET")).toEqual({
      kind: "day",
      hours: "12–18",
    })
  })

  it("evening is 18–24", () => {
    expect(activityLabel("18–24 CET")).toEqual({
      kind: "evening",
      hours: "18–24",
    })
  })
})

describe("copying an address", () => {
  it("a named top entity cannot be copied", () => {
    expect(isCopyableAddress("Uniswap")).toBe(false)
    expect(isCopyableAddress("Stake.com")).toBe(false)
  })

  it("an unresolved top entity can be copied", () => {
    expect(
      isCopyableAddress("0xab9dc139b7c77e1a4b5cc1aceacf95942ebf77f3")
    ).toBe(true)
  })

  it("a Tron address can be copied", () => {
    expect(isCopyableAddress("TNEiDiboTjsCtD4q2dyNeFjZtcDzinYRkH")).toBe(true)
  })

  it("a short name starting with T cannot be copied", () => {
    expect(isCopyableAddress("TRX")).toBe(false)
  })

  it("every main wallet in the sample files can be copied", () => {
    for (const file of ["a", "b"] as const) {
      const wallets = sampleRows(file)
        .map((row) => row.mainWallet)
        .filter((wallet) => wallet !== null)
      expect(wallets.length).toBeGreaterThan(0)
      for (const wallet of wallets) {
        expect(isCopyableAddress(wallet)).toBe(true)
      }
    }
  })

  it("sample top entities are copied only when they are addresses", () => {
    for (const file of ["a", "b"] as const) {
      for (const row of sampleRows(file)) {
        if (!row.topEntity) {
          continue
        }
        expect(isCopyableAddress(row.topEntity)).toBe(
          row.topEntity.startsWith("0x")
        )
      }
    }
  })
})
