import { describe, expect, it } from "vitest"

import { ALL_BRAND_IDS, CATEGORIES, type Category } from "@/data/catalog"
import en from "@/i18n/en.json"
import {
  balanceErrors,
  categoryOverride,
  categoryTriState,
  commitAmountInput,
  commitBalance,
  commitEntity,
  commitFirstDeposit,
  countedSubRules,
  effectiveCategoryAmount,
  emptyBalance,
  emptyChannels,
  emptyEntity,
  emptyFirstDeposit,
  entityErrors,
  firstDepositErrors,
  formatEur,
  hasAnyChat,
  headerTriState,
  isBalanceComplete,
  isEntityComplete,
  isFirstDepositComplete,
  isPositiveAmount,
  pruneCategoryOverrides,
  REQUIRED,
  sanitizeAmountInput,
  setCategoryOverride,
  type FirstDepositSubRule,
  type RuleErrorKey,
} from "@/lib/rules"

/** What the user reads in English for an error key. */
function english(key: RuleErrorKey | undefined): string | undefined {
  return key === undefined ? undefined : en[key]
}

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

function subRule(
  overrides: Partial<FirstDepositSubRule> &
    Pick<FirstDepositSubRule, "id" | "categoryId">
): FirstDepositSubRule {
  return {
    brandIds: brandIds(overrides.categoryId),
    turnoverEnabled: false,
    turnoverMin: "",
    turnoverPeriod: "month",
    balanceEnabled: false,
    balanceMin: "",
    ...overrides,
  }
}

const DARKNET = "darknet-market"
const HOSTED = "hosted-wallet"
const MIXER = "mixer"
const LENDING = "lending"

describe("sanitizeAmountInput", () => {
  it("keeps digits", () => {
    expect(sanitizeAmountInput("1200")).toBe("1200")
  })

  it("keeps the first decimal point", () => {
    expect(sanitizeAmountInput("12.5")).toBe("12.5")
  })

  it("keeps the first decimal comma", () => {
    expect(sanitizeAmountInput("12,5")).toBe("12,5")
  })

  it("drops a second separator of either kind", () => {
    expect(sanitizeAmountInput("12.34.56")).toBe("12.3456")
    expect(sanitizeAmountInput("12,34,56")).toBe("12,3456")
    expect(sanitizeAmountInput("12.34,56")).toBe("12.3456")
    expect(sanitizeAmountInput("12,34.56")).toBe("12,3456")
  })

  it("drops letters, spaces, and symbols", () => {
    expect(sanitizeAmountInput("€12.5")).toBe("12.5")
    expect(sanitizeAmountInput("12 00")).toBe("1200")
    expect(sanitizeAmountInput("12a.5b")).toBe("12.5")
    expect(sanitizeAmountInput("abc")).toBe("")
  })

  it("leaves empty input empty", () => {
    expect(sanitizeAmountInput("")).toBe("")
  })
})

describe("commitAmountInput", () => {
  it("clears empty on blur", () => {
    expect(commitAmountInput("")).toBe("")
  })

  it("clears 0 on blur", () => {
    expect(commitAmountInput("0")).toBe("")
  })

  it("strips a trailing separator then decides", () => {
    expect(commitAmountInput("12.")).toBe("12")
    expect(commitAmountInput("12,")).toBe("12")
    expect(commitAmountInput(".")).toBe("")
    expect(commitAmountInput(",")).toBe("")
    expect(commitAmountInput("0.")).toBe("")
  })

  it("keeps a positive amount, including a comma decimal", () => {
    expect(commitAmountInput("12.5")).toBe("12.5")
    expect(commitAmountInput("12,5")).toBe("12,5")
  })
})

describe("isPositiveAmount", () => {
  it("treats empty as not a positive amount", () => {
    expect(isPositiveAmount("")).toBe(false)
  })

  it("treats 0 as not a positive amount", () => {
    expect(isPositiveAmount("0")).toBe(false)
  })

  it("accepts a clearly positive value", () => {
    expect(isPositiveAmount("12.5")).toBe(true)
  })

  it("accepts a positive comma decimal", () => {
    expect(isPositiveAmount("12,5")).toBe(true)
  })
})

describe("formatEur", () => {
  it("groups thousands with a euro sign", () => {
    expect(formatEur("1000", "en")).toBe("€1,000")
  })

  it("in Russian groups thousands with a space and puts the euro sign after", () => {
    expect(formatEur("1000", "ru")).toBe("1\u00a0000\u00a0€")
  })

  it("keeps at most 2 fraction digits", () => {
    expect(formatEur("1.23456", "en")).not.toMatch(/\d[.,]\d{3}/)
  })

  it("treats a comma as the decimal separator", () => {
    expect(formatEur("12,5", "en")).toBe(formatEur("12.5", "en"))
  })
})

describe("balanceErrors and isBalanceComplete", () => {
  it("balance with both amounts empty marks both required", () => {
    const errors = balanceErrors(emptyBalance())

    expect(english(errors.increaseAmount)).toBe("Required field")
    expect(english(errors.decreaseAmount)).toBe("Required field")
    expect(errors.increaseAmount).toBe(REQUIRED)
    expect(isBalanceComplete(emptyBalance())).toBe(false)
  })

  it("balance with both amounts zero marks both required", () => {
    const values = { increaseAmount: "0", decreaseAmount: "0" }
    const errors = balanceErrors(values)

    expect(english(errors.increaseAmount)).toBe("Required field")
    expect(english(errors.decreaseAmount)).toBe("Required field")
    expect(isBalanceComplete(values)).toBe(false)
  })

  it("balance with one side filled is complete", () => {
    const increase = { ...emptyBalance(), increaseAmount: "10" }
    const decrease = { ...emptyBalance(), decreaseAmount: "5" }

    expect(balanceErrors(increase)).toEqual({})
    expect(isBalanceComplete(increase)).toBe(true)
    expect(balanceErrors(decrease)).toEqual({})
    expect(isBalanceComplete(decrease)).toBe(true)
  })

  it("a zero on the other side does not spoil a filled side", () => {
    const values = { increaseAmount: "10", decreaseAmount: "0" }

    expect(balanceErrors(values)).toEqual({})
    expect(isBalanceComplete(values)).toBe(true)
  })

  it("committing the balance keeps a positive side and clears the other", () => {
    expect(
      commitBalance({ increaseAmount: "10.", decreaseAmount: "0" })
    ).toEqual({ increaseAmount: "10", decreaseAmount: "" })
  })
})

describe("entityErrors", () => {
  it("selecting no entity leaves the rule incomplete with nothing highlighted", () => {
    const values = { ...emptyEntity(), amount: "10" }
    const errors = entityErrors(values)

    expect(errors.amount).toBeUndefined()
    expect(errors.categories).toEqual({})
    expect(isEntityComplete(values)).toBe(false)
  })

  it("requires the common amount while a selected category has no own amount", () => {
    const empty = {
      ...emptyEntity(),
      selectedBrandIds: brandIds(MIXER),
      amount: "",
    }
    const zero = { ...empty, amount: "0" }

    expect(english(entityErrors(empty).amount)).toBe("Required field")
    expect(english(entityErrors(zero).amount)).toBe("Required field")
    expect(isEntityComplete(empty)).toBe(false)
  })

  it("is complete when a brand and a positive common amount are set", () => {
    const values = {
      ...emptyEntity(),
      selectedBrandIds: brandIds(MIXER),
      amount: "10",
    }
    const errors = entityErrors(values)

    expect(errors.amount).toBeUndefined()
    expect(errors.categories).toEqual({})
    expect(isEntityComplete(values)).toBe(true)
  })

  it("the common amount is not required when every selected category has its own amount", () => {
    const values = {
      ...emptyEntity(),
      selectedBrandIds: [...brandIds(DARKNET), ...brandIds(MIXER)],
      amount: "",
      categoryOverrides: {
        [DARKNET]: { enabled: true, amount: "10" },
        [MIXER]: { enabled: true, amount: "20" },
      },
    }

    expect(entityErrors(values).amount).toBeUndefined()
    expect(entityErrors(values).categories).toEqual({})
    expect(isEntityComplete(values)).toBe(true)
  })

  it("an own amount that is on and empty is required", () => {
    for (const amount of ["", "0"]) {
      const values = {
        ...emptyEntity(),
        selectedBrandIds: brandIds(MIXER),
        amount: "10",
        categoryOverrides: {
          [MIXER]: { enabled: true, amount },
        },
      }

      expect(english(entityErrors(values).categories[MIXER])).toBe(
        "Required field"
      )
      expect(entityErrors(values).amount).toBeUndefined()
      expect(isEntityComplete(values)).toBe(false)
    }
  })

  it("an own amount that is off does not count, so the common amount is still required", () => {
    const values = {
      ...emptyEntity(),
      selectedBrandIds: brandIds(MIXER),
      amount: "",
      categoryOverrides: {
        [MIXER]: { enabled: false, amount: "50" },
      },
    }

    expect(english(entityErrors(values).amount)).toBe("Required field")
    expect(entityErrors(values).categories).toEqual({})
  })
})

describe("countedSubRules", () => {
  it("drops rows with no brands and keeps rows that have some", () => {
    const kept = subRule({ id: "kept", categoryId: MIXER })
    const dropped = subRule({ id: "ghost", categoryId: LENDING, brandIds: [] })

    expect(
      countedSubRules({
        ...emptyFirstDeposit(),
        subRules: [dropped, kept],
      })
    ).toEqual([kept])
  })
})

describe("firstDepositErrors and isFirstDepositComplete", () => {
  it("no counted row is incomplete and highlights nothing", () => {
    const empty = emptyFirstDeposit()
    const onlyBrandLess = {
      ...emptyFirstDeposit(),
      subRules: [subRule({ id: "ghost", categoryId: MIXER, brandIds: [] })],
    }

    expect(firstDepositErrors(empty).subRules).toEqual({})
    expect(isFirstDepositComplete(empty)).toBe(false)
    expect(firstDepositErrors(onlyBrandLess).subRules).toEqual({})
    expect(firstDepositErrors(onlyBrandLess).subRules.ghost).toBeUndefined()
    expect(isFirstDepositComplete(onlyBrandLess)).toBe(false)
  })

  it("a counted row with both filters off is complete", () => {
    const values = {
      ...emptyFirstDeposit(),
      subRules: [subRule({ id: "row-mixer", categoryId: MIXER })],
    }

    expect(firstDepositErrors(values).subRules["row-mixer"]).toEqual({})
    expect(isFirstDepositComplete(values)).toBe(true)
  })

  it("a first deposit filter that is on and empty is required", () => {
    const turnover = {
      ...emptyFirstDeposit(),
      subRules: [
        subRule({
          id: "row-mixer",
          categoryId: MIXER,
          turnoverEnabled: true,
          turnoverMin: "",
        }),
      ],
    }
    const balance = {
      ...emptyFirstDeposit(),
      subRules: [
        subRule({
          id: "row-mixer",
          categoryId: MIXER,
          balanceEnabled: true,
          balanceMin: "0",
        }),
      ],
    }

    expect(
      english(firstDepositErrors(turnover).subRules["row-mixer"]?.turnover)
    ).toBe("Required field")
    expect(isFirstDepositComplete(turnover)).toBe(false)
    expect(
      english(firstDepositErrors(balance).subRules["row-mixer"]?.balance)
    ).toBe("Required field")
    expect(isFirstDepositComplete(balance)).toBe(false)
  })

  it("keys sub-rule errors by id, not by array position", () => {
    const values = {
      ...emptyFirstDeposit(),
      subRules: [
        subRule({
          id: "id-alpha",
          categoryId: MIXER,
          turnoverEnabled: true,
          turnoverMin: "",
        }),
        subRule({
          id: "id-beta",
          categoryId: LENDING,
          balanceEnabled: true,
          balanceMin: "",
        }),
      ],
    }
    const errors = firstDepositErrors(values)

    expect(Object.keys(errors.subRules)).toEqual(["id-alpha", "id-beta"])
    expect(english(errors.subRules["id-alpha"]?.turnover)).toBe(
      "Required field"
    )
    expect(english(errors.subRules["id-beta"]?.balance)).toBe("Required field")
    expect(errors.subRules["0"]).toBeUndefined()
    expect(errors.subRules["1"]).toBeUndefined()
    expect(isFirstDepositComplete(values)).toBe(false)
  })

  it("Apply drops a sub-rule with no brands and clears a filter that is off", () => {
    const committed = commitFirstDeposit({
      subRules: [
        subRule({
          id: "ghost",
          categoryId: MIXER,
          brandIds: [],
          turnoverEnabled: true,
          turnoverMin: "5",
        }),
        subRule({
          id: "row",
          categoryId: LENDING,
          turnoverEnabled: false,
          turnoverMin: "9",
          balanceEnabled: true,
          balanceMin: "12.",
        }),
      ],
    })

    expect(committed.subRules.map((row) => row.id)).toEqual(["row"])
    expect(committed.subRules[0].turnoverMin).toBe("")
    expect(committed.subRules[0].balanceMin).toBe("12")
    expect(committed.subRules[0].turnoverEnabled).toBe(false)
  })
})

describe("categoryTriState", () => {
  it("is none when no brand in the category is selected", () => {
    expect(categoryTriState(category(DARKNET), new Set())).toBe("none")
  })

  it("is some when only part of a multi-brand category is selected", () => {
    const [first] = brandIds(DARKNET)
    expect(categoryTriState(category(DARKNET), new Set([first]))).toBe("some")
  })

  it("is all when every brand in the category is selected", () => {
    expect(
      categoryTriState(category(DARKNET), new Set(brandIds(DARKNET)))
    ).toBe("all")
  })

  it("ignores brands from other categories", () => {
    const [first] = brandIds(DARKNET)
    const selected = new Set([...brandIds(HOSTED), first])

    expect(categoryTriState(category(DARKNET), selected)).toBe("some")
    expect(categoryTriState(category(HOSTED), selected)).toBe("all")
  })

  it("is all or none for a single-brand category, never some", () => {
    const only = brandIds(MIXER)
    expect(only).toHaveLength(1)

    expect(categoryTriState(category(MIXER), new Set())).toBe("none")
    expect(categoryTriState(category(MIXER), new Set(only))).toBe("all")
    expect(categoryTriState(category(MIXER), new Set(only))).not.toBe("some")
  })
})

describe("headerTriState", () => {
  it("is none when the set is empty, and empty never means all", () => {
    expect(headerTriState(new Set())).toBe("none")
    expect(headerTriState(new Set())).not.toBe("all")
  })

  it("is some when only one brand is selected", () => {
    const [first] = brandIds(DARKNET)
    expect(headerTriState(new Set([first]))).toBe("some")
  })

  it("is all when every catalog brand is selected", () => {
    expect(headerTriState(new Set(ALL_BRAND_IDS))).toBe("all")
  })
})

describe("pruneCategoryOverrides", () => {
  it("emptying a category drops its own amount", () => {
    const overrides = {
      [DARKNET]: { enabled: true, amount: "10" },
      [MIXER]: { enabled: false, amount: "20" },
    }
    const next = pruneCategoryOverrides(overrides, brandIds(DARKNET))

    expect(next[MIXER]).toBeUndefined()
    expect(next[DARKNET]).toEqual({ enabled: true, amount: "10" })
  })

  it("keeps an own amount for a category that still has a selected brand", () => {
    const [first] = brandIds(DARKNET)
    const overrides = { [DARKNET]: { enabled: true, amount: "10" } }

    expect(pruneCategoryOverrides(overrides, [first])[DARKNET]).toEqual({
      enabled: true,
      amount: "10",
    })
  })

  it("keeps the held category's own amount even with no brands selected", () => {
    const overrides = { [MIXER]: { enabled: true, amount: "20" } }

    expect(pruneCategoryOverrides(overrides, [], MIXER)[MIXER]).toEqual({
      enabled: true,
      amount: "20",
    })
  })

  it("does not mutate the input object", () => {
    const overrides = {
      [DARKNET]: { enabled: true, amount: "10" },
      [MIXER]: { enabled: false, amount: "20" },
    }
    const snapshot = { ...overrides }

    const next = pruneCategoryOverrides(overrides, brandIds(DARKNET))

    expect(overrides).toEqual(snapshot)
    expect(next).not.toBe(overrides)
  })
})

describe("setCategoryOverride", () => {
  it("turning an own amount off keeps the typed value until Apply", () => {
    const on = setCategoryOverride({}, DARKNET, {
      enabled: true,
      amount: "50",
    })
    const off = setCategoryOverride(on, DARKNET, { enabled: false })

    expect(off[DARKNET]).toEqual({ enabled: false, amount: "50" })
    expect(
      commitEntity({
        ...emptyEntity(),
        selectedBrandIds: brandIds(DARKNET),
        amount: "10",
        categoryOverrides: off,
      }).categoryOverrides[DARKNET]
    ).toBeUndefined()
  })

  it("Apply keeps an own amount that is on even when it is empty", () => {
    const committed = commitEntity({
      ...emptyEntity(),
      selectedBrandIds: brandIds(MIXER),
      amount: "10.",
      categoryOverrides: {
        [MIXER]: { enabled: true, amount: "" },
      },
    })

    expect(committed.amount).toBe("10")
    expect(committed.categoryOverrides[MIXER]).toEqual({
      enabled: true,
      amount: "",
    })
    expect(categoryOverride(committed, MIXER)?.enabled).toBe(true)
  })

  it("Apply drops an own amount that is off", () => {
    const committed = commitEntity({
      ...emptyEntity(),
      selectedBrandIds: brandIds(MIXER),
      amount: "10",
      categoryOverrides: {
        [MIXER]: { enabled: false, amount: "50" },
      },
    })

    expect(committed.categoryOverrides[MIXER]).toBeUndefined()
  })

  it("does not mutate the input object", () => {
    const overrides = { [DARKNET]: { enabled: true, amount: "50" } }
    const snapshot = { ...overrides }

    const next = setCategoryOverride(overrides, DARKNET, { enabled: false })

    expect(overrides).toEqual(snapshot)
    expect(next).not.toBe(overrides)
  })
})

describe("effectiveCategoryAmount", () => {
  it("uses the common amount when the own amount is missing or off", () => {
    const values = { ...emptyEntity(), amount: "100" }

    expect(effectiveCategoryAmount(values, DARKNET)).toBe("100")
    expect(
      effectiveCategoryAmount(
        {
          ...values,
          categoryOverrides: {
            [DARKNET]: { enabled: false, amount: "50" },
          },
        },
        DARKNET
      )
    ).toBe("100")
  })

  it("uses the own amount when that category's own amount is on", () => {
    const values = {
      ...emptyEntity(),
      amount: "100",
      categoryOverrides: {
        [DARKNET]: { enabled: true, amount: "50" },
      },
    }

    expect(effectiveCategoryAmount(values, DARKNET)).toBe("50")
  })

  it("uses an empty own amount when it is on", () => {
    const values = {
      ...emptyEntity(),
      amount: "100",
      categoryOverrides: {
        [DARKNET]: { enabled: true, amount: "" },
      },
    }

    expect(effectiveCategoryAmount(values, DARKNET)).toBe("")
  })
})

describe("hasAnyChat", () => {
  it("is false when no row is chosen", () => {
    expect(hasAnyChat(emptyChannels())).toBe(false)
  })

  it("is true when only Email is chosen", () => {
    expect(hasAnyChat({ ...emptyChannels(), emailId: "ops@acme.io" })).toBe(
      true
    )
  })
})
