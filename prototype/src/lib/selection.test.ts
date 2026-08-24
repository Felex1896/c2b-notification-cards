import { describe, expect, it } from "vitest"

import { ALL_BRAND_IDS, CATEGORIES, type Category } from "@/data/catalog"
import {
  applySelection,
  clearAll,
  selectAllCategories,
  setBrands,
  toggleBrand,
  toggleCategory,
} from "@/lib/selection"

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
const HOSTED = "hosted-wallet"
const MIXER = "mixer"

describe("toggleCategory", () => {
  it("checking a category selects every brand in it", () => {
    expect(toggleCategory([], DARKNET, true)).toEqual(brandIds(DARKNET))
  })

  it("unchecking a category leaves other categories alone", () => {
    const selected = [...brandIds(DARKNET), ...brandIds(HOSTED)]

    expect(toggleCategory(selected, DARKNET, false)).toEqual(brandIds(HOSTED))
  })

  it("checks and clears a single-brand category like any other", () => {
    const only = brandIds(MIXER)
    expect(only).toHaveLength(1)

    const checked = toggleCategory([], MIXER, true)
    expect(checked).toEqual(only)
    expect(toggleCategory(checked, MIXER, false)).toEqual([])
  })
})

describe("toggleBrand", () => {
  it("adds and removes one brand", () => {
    const [first, second] = brandIds(DARKNET)

    const withFirst = toggleBrand([], first, true)
    expect(withFirst).toEqual([first])

    const withBoth = toggleBrand(withFirst, second, true)
    expect(withBoth).toContain(first)
    expect(withBoth).toContain(second)

    expect(toggleBrand(withBoth, first, false)).toEqual([second])
  })

  it("is idempotent", () => {
    const [first] = brandIds(DARKNET)
    const once = toggleBrand([], first, true)

    expect(toggleBrand(once, first, true)).toEqual(once)
    expect(toggleBrand([], first, false)).toEqual([])
  })
})

describe("setBrands", () => {
  it("touches only the ids it is given", () => {
    const visible = brandIds(DARKNET).slice(0, 2)
    const untouched = brandIds(HOSTED)

    const selected = setBrands(untouched, visible, true)
    expect(selected).toEqual(
      ALL_BRAND_IDS.filter(
        (id) => visible.includes(id) || untouched.includes(id)
      )
    )

    expect(setBrands(selected, visible, false)).toEqual(untouched)
  })

  it("clearing a visible subset keeps the rest of the category", () => {
    const all = brandIds(DARKNET)
    const visible = all.slice(0, 1)

    expect(setBrands(all, visible, false)).toEqual(all.slice(1))
  })
})

describe("selectAllCategories and clearAll", () => {
  it("selects every brand in the catalog", () => {
    expect(selectAllCategories()).toEqual(ALL_BRAND_IDS)
  })

  it("clears to an empty list, which never means all", () => {
    expect(clearAll()).toEqual([])
    expect(clearAll()).not.toEqual(ALL_BRAND_IDS)
  })
})

describe("applySelection", () => {
  const held = { heldCategoryId: DARKNET }

  it("routes each action to its rule", () => {
    const [first] = brandIds(DARKNET)

    expect(
      applySelection([], {
        kind: "brand",
        brandId: first,
        checked: true,
        ...held,
      })
    ).toEqual([first])

    expect(
      applySelection([], {
        kind: "visibleBrands",
        brandIds: brandIds(DARKNET),
        checked: true,
        ...held,
      })
    ).toEqual(brandIds(DARKNET))

    expect(
      applySelection([], {
        kind: "category",
        categoryId: DARKNET,
        checked: true,
        ...held,
      })
    ).toEqual(brandIds(DARKNET))

    expect(
      applySelection([], { kind: "allCategories", checked: true, ...held })
    ).toEqual(ALL_BRAND_IDS)

    expect(
      applySelection(brandIds(DARKNET), {
        kind: "allCategories",
        checked: false,
        ...held,
      })
    ).toEqual([])
  })

  it("releasing a category leaves the selection untouched", () => {
    const selected = brandIds(DARKNET)

    expect(
      applySelection(selected, {
        kind: "releaseCategory",
        heldCategoryId: null,
      })
    ).toEqual(selected)
  })

  it("keeps the list deduped and in catalog order", () => {
    const reversed = [...brandIds(DARKNET)].reverse()

    expect(
      applySelection([...reversed, ...reversed], {
        kind: "releaseCategory",
        heldCategoryId: null,
      })
    ).toEqual(brandIds(DARKNET))
  })
})
