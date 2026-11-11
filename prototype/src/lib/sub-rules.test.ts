import { describe, expect, it } from "vitest"

import { CATEGORIES, type Category } from "@/data/catalog"
import {
  patchCategorySubRule,
  selectedBrandIds,
  syncSubRules,
} from "@/lib/sub-rules"

function category(id: string): Category {
  const found = CATEGORIES.find((item) => item.id === id)
  if (!found) {
    throw new Error(`Unknown category: ${id}`)
  }
  return found
}

function brandIds(id: string): string[] {
  return category(id).brands.map((brand) => brand.id)
}

const DARKNET = "darknet-market"
const MIXER = "mixer"

describe("syncSubRules", () => {
  it("selecting an entity adds one sub-rule for its category", () => {
    const [brand] = brandIds(MIXER)

    const next = syncSubRules([], [brand], null)

    expect(next).toHaveLength(1)
    expect(next[0]?.categoryId).toBe(MIXER)
    expect(next[0]?.brandIds).toEqual([brand])
    expect(next[0]?.turnoverEnabled).toBe(false)
    expect(next[0]?.balanceEnabled).toBe(false)
    expect(next[0]?.turnoverPeriod).toBe("month")
  })

  it("a second entity in the same category keeps the sub-rule and its filters", () => {
    const [first, second] = brandIds(DARKNET)
    const [created] = syncSubRules([], [first], null)
    const prev = [
      {
        ...created,
        turnoverEnabled: true,
        turnoverMin: "15",
        turnoverPeriod: "week" as const,
      },
    ]

    const next = syncSubRules(prev, [first, second], null)

    expect(next).toHaveLength(1)
    expect(next[0]?.id).toBe(created.id)
    expect(next[0]?.brandIds).toEqual([first, second])
    expect(next[0]?.turnoverEnabled).toBe(true)
    expect(next[0]?.turnoverMin).toBe("15")
    expect(next[0]?.turnoverPeriod).toBe("week")
  })

  it("clearing a category drops its sub-rule and leaves other categories alone", () => {
    const mixer = brandIds(MIXER)[0]
    const darknet = brandIds(DARKNET)[0]
    const prev = syncSubRules([], [mixer, darknet], null)
    const kept = prev.find((row) => row.categoryId === DARKNET)

    const next = syncSubRules(prev, [darknet], null)

    expect(next.map((row) => row.categoryId)).toEqual([DARKNET])
    expect(next[0]?.id).toBe(kept?.id)
    expect(next[0]?.brandIds).toEqual([darknet])
  })

  it("an open category keeps its sub-rule after its last entity is cleared", () => {
    const [brand] = brandIds(MIXER)
    const [created] = syncSubRules([], [brand], null)
    const prev = [{ ...created, turnoverMin: "40", turnoverEnabled: true }]

    const next = syncSubRules(prev, [], MIXER)

    expect(next).toHaveLength(1)
    expect(next[0]?.id).toBe(created.id)
    expect(next[0]?.brandIds).toEqual([])
    expect(next[0]?.turnoverEnabled).toBe(true)
    expect(next[0]?.turnoverMin).toBe("40")
  })

  it("closing an emptied category drops its sub-rule", () => {
    const [brand] = brandIds(MIXER)
    const prev = syncSubRules([], [brand], null)
    const emptied = syncSubRules(prev, [], MIXER)

    expect(syncSubRules(emptied, [], null)).toEqual([])
  })

  it("closing the entity list keeps a category that still has an entity selected", () => {
    const [brand] = brandIds(MIXER)
    const prev = syncSubRules([], [brand], null)

    const next = syncSubRules(prev, [brand], null)

    expect(next).toHaveLength(1)
    expect(next[0]?.brandIds).toEqual([brand])
    expect(next[0]?.id).toBe(prev[0]?.id)
  })

  it("opening a category with nothing selected does not invent a sub-rule", () => {
    expect(syncSubRules([], [], MIXER)).toEqual([])
  })
})

describe("patchCategorySubRule", () => {
  it("switching a filter off keeps the amount that was typed", () => {
    const [brand] = brandIds(MIXER)
    const [created] = syncSubRules([], [brand], null)
    const prev = [{ ...created, turnoverEnabled: true, turnoverMin: "20" }]

    const next = patchCategorySubRule(prev, MIXER, { turnoverEnabled: false })

    expect(next[0]?.turnoverEnabled).toBe(false)
    expect(next[0]?.turnoverMin).toBe("20")
    expect(next[0]?.brandIds).toEqual([brand])
  })

  it("a filter switched on with no sub-rule yet does not select every entity", () => {
    const next = patchCategorySubRule([], DARKNET, { turnoverEnabled: true })

    expect(brandIds(DARKNET).length).toBeGreaterThan(1)
    expect(next).toHaveLength(1)
    expect(next[0]?.categoryId).toBe(DARKNET)
    expect(next[0]?.brandIds).toEqual([])
    expect(next[0]?.turnoverEnabled).toBe(true)
    expect(next[0]?.turnoverPeriod).toBe("month")
    expect(next[0]?.balanceEnabled).toBe(false)
  })

  it("a new sub-rule lands in catalog order", () => {
    const [mixer] = syncSubRules([], brandIds(MIXER), null)

    const next = patchCategorySubRule([mixer], DARKNET, {
      balanceEnabled: true,
    })

    expect(next.map((row) => row.categoryId)).toEqual([DARKNET, MIXER])
    expect(next[0]?.balanceEnabled).toBe(true)
    expect(next[1]?.id).toBe(mixer.id)
  })

  it("changing one category leaves the other category's filters alone", () => {
    const prev = syncSubRules(
      [],
      [brandIds(MIXER)[0], brandIds(DARKNET)[0]],
      null
    )
    const mixer = prev.find((row) => row.categoryId === MIXER)
    const filled = prev.map((row) =>
      row.categoryId === MIXER
        ? { ...row, balanceEnabled: true, balanceMin: "5" }
        : row
    )

    const next = patchCategorySubRule(filled, DARKNET, {
      turnoverEnabled: true,
    })
    const untouched = next.find((row) => row.categoryId === MIXER)

    expect(untouched?.id).toBe(mixer?.id)
    expect(untouched?.balanceEnabled).toBe(true)
    expect(untouched?.balanceMin).toBe("5")
    expect(
      next.find((row) => row.categoryId === DARKNET)?.turnoverEnabled
    ).toBe(true)
  })
})

describe("selectedBrandIds", () => {
  it("entities chosen in several categories are all part of the selection", () => {
    const mixer = brandIds(MIXER)[0]
    const darknet = brandIds(DARKNET)[0]
    const subRules = syncSubRules([], [mixer, darknet], null)

    expect(selectedBrandIds({ subRules })).toEqual([darknet, mixer])
  })
})
