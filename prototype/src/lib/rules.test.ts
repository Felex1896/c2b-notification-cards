import { describe, expect, it } from "vitest"

import { ALL_BRAND_IDS, CATEGORIES, type Category } from "@/data/catalog"
import {
  balanceErrors,
  balanceSummaryRows,
  categoryTriState,
  channelPairs,
  commitAmountInput,
  countedSubRules,
  effectiveCategoryAmount,
  emptyBalance,
  emptyEntity,
  emptyFirstDeposit,
  entityErrors,
  entitySummaryRows,
  firstDepositErrors,
  firstDepositSummaryRows,
  formatEur,
  headerTriState,
  isBalanceValid,
  isFirstDepositValid,
  isPositiveAmount,
  pruneCategoryAmounts,
  sanitizeAmountInput,
  setCategoryAmount,
  type FirstDepositSubRule,
} from "@/lib/rules"

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

function brandNames(id: string): string[] {
  return category(id).brands.map((brand) => brand.name)
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
    expect(formatEur("1000")).toBe("€1,000")
  })

  it("keeps at most 2 fraction digits", () => {
    expect(formatEur("1.23456")).not.toMatch(/\d[.,]\d{3}/)
  })

  it("treats a comma as the decimal separator", () => {
    expect(formatEur("12,5")).toBe(formatEur("12.5"))
  })
})

describe("balanceErrors and isBalanceValid", () => {
  it("rejects both sides off under the pair", () => {
    const values = emptyBalance()
    const errors = balanceErrors(values)

    expect(errors.directions).toBe("Select at least 1 option")
    expect(errors.increaseAmount).toBeUndefined()
    expect(errors.decreaseAmount).toBeUndefined()
    expect(isBalanceValid(values)).toBe(false)
  })

  it("requires a valid increase amount when that side is on", () => {
    const empty = {
      ...emptyBalance(),
      increaseEnabled: true,
      increaseAmount: "",
    }
    const zero = {
      ...emptyBalance(),
      increaseEnabled: true,
      increaseAmount: "0",
    }

    expect(balanceErrors(empty).increaseAmount).toBe("Required field")
    expect(isBalanceValid(empty)).toBe(false)
    expect(balanceErrors(zero).increaseAmount).toBe("Required field")
    expect(isBalanceValid(zero)).toBe(false)
  })

  it("requires a valid decrease amount when that side is on", () => {
    const values = {
      ...emptyBalance(),
      decreaseEnabled: true,
      decreaseAmount: "",
    }

    expect(balanceErrors(values).decreaseAmount).toBe("Required field")
    expect(isBalanceValid(values)).toBe(false)
  })

  it("does not require the off-side amount", () => {
    const emptyOff = {
      ...emptyBalance(),
      increaseEnabled: true,
      increaseAmount: "10",
      decreaseEnabled: false,
      decreaseAmount: "",
    }
    const filledOff = {
      ...emptyOff,
      decreaseAmount: "99",
    }

    expect(balanceErrors(emptyOff).decreaseAmount).toBeUndefined()
    expect(isBalanceValid(emptyOff)).toBe(true)
    expect(balanceErrors(filledOff).decreaseAmount).toBeUndefined()
    expect(isBalanceValid(filledOff)).toBe(true)
  })

  it("is valid when one side is on with a positive amount", () => {
    const values = {
      ...emptyBalance(),
      decreaseEnabled: true,
      decreaseAmount: "5",
    }

    expect(balanceErrors(values).directions).toBeUndefined()
    expect(isBalanceValid(values)).toBe(true)
  })
})

describe("entityErrors", () => {
  it("requires at least one brand", () => {
    const values = { ...emptyEntity(), amount: "10" }

    expect(entityErrors(values).brands).toBe("Required field")
  })

  it("requires a positive header amount", () => {
    const empty = {
      ...emptyEntity(),
      selectedBrandIds: brandIds(MIXER),
      amount: "",
    }
    const zero = { ...empty, amount: "0" }

    expect(entityErrors(empty).amount).toBe("Required field")
    expect(entityErrors(zero).amount).toBe("Required field")
  })

  it("is clear when a brand and a positive amount are set", () => {
    const values = {
      ...emptyEntity(),
      selectedBrandIds: brandIds(MIXER),
      amount: "10",
    }
    const errors = entityErrors(values)

    expect(errors.brands).toBeUndefined()
    expect(errors.amount).toBeUndefined()
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

describe("firstDepositErrors and isFirstDepositValid", () => {
  it("errors under the table when no counted rows exist", () => {
    const empty = emptyFirstDeposit()
    const onlyBrandLess = {
      ...emptyFirstDeposit(),
      subRules: [subRule({ id: "ghost", categoryId: MIXER, brandIds: [] })],
    }

    expect(firstDepositErrors(empty).categories).toBe(
      "Add at least one category"
    )
    expect(firstDepositErrors(empty).subRules).toEqual({})
    expect(isFirstDepositValid(empty)).toBe(false)

    expect(firstDepositErrors(onlyBrandLess).categories).toBe(
      "Add at least one category"
    )
    expect(firstDepositErrors(onlyBrandLess).subRules).toEqual({})
    expect(firstDepositErrors(onlyBrandLess).subRules.ghost).toBeUndefined()
    expect(isFirstDepositValid(onlyBrandLess)).toBe(false)
  })

  it("is valid when a counted row has brands and filters off", () => {
    const values = {
      ...emptyFirstDeposit(),
      subRules: [subRule({ id: "row-mixer", categoryId: MIXER })],
    }

    expect(firstDepositErrors(values).categories).toBeUndefined()
    expect(isFirstDepositValid(values)).toBe(true)
  })

  it("requires turnover amount on that row when turnover is on", () => {
    const values = {
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
    const errors = firstDepositErrors(values)

    expect(errors.subRules["row-mixer"]?.turnover).toBe("Required field")
    expect(isFirstDepositValid(values)).toBe(false)
  })

  it("requires balance amount on that row when balance is on", () => {
    const values = {
      ...emptyFirstDeposit(),
      subRules: [
        subRule({
          id: "row-mixer",
          categoryId: MIXER,
          balanceEnabled: true,
          balanceMin: "",
        }),
      ],
    }
    const errors = firstDepositErrors(values)

    expect(errors.subRules["row-mixer"]?.balance).toBe("Required field")
    expect(isFirstDepositValid(values)).toBe(false)
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
    expect(errors.subRules["id-alpha"]?.turnover).toBe("Required field")
    expect(errors.subRules["id-beta"]?.balance).toBe("Required field")
    expect(errors.subRules["0"]).toBeUndefined()
    expect(errors.subRules["1"]).toBeUndefined()
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

describe("pruneCategoryAmounts", () => {
  it("drops an override whose category has no selected brands", () => {
    const amounts = { [DARKNET]: "10", [MIXER]: "20" }

    expect(
      pruneCategoryAmounts(amounts, brandIds(DARKNET))[MIXER]
    ).toBeUndefined()
    expect(pruneCategoryAmounts(amounts, brandIds(DARKNET))[DARKNET]).toBe("10")
  })

  it("keeps an override for a category that still has a selected brand", () => {
    const [first] = brandIds(DARKNET)
    const amounts = { [DARKNET]: "10" }

    expect(pruneCategoryAmounts(amounts, [first])[DARKNET]).toBe("10")
  })

  it("retains the held category even with no brands selected", () => {
    const amounts = { [MIXER]: "20" }

    expect(pruneCategoryAmounts(amounts, [], MIXER)[MIXER]).toBe("20")
  })

  it("does not mutate the input object", () => {
    const amounts = { [DARKNET]: "10", [MIXER]: "20" }
    const snapshot = { ...amounts }

    const next = pruneCategoryAmounts(amounts, brandIds(DARKNET))

    expect(amounts).toEqual(snapshot)
    expect(next).not.toBe(amounts)
  })
})

describe("setCategoryAmount", () => {
  it("sets a non-empty override", () => {
    expect(setCategoryAmount({}, DARKNET, "50")[DARKNET]).toBe("50")
  })

  it("removes the key on empty or whitespace so the row inherits", () => {
    const amounts = { [DARKNET]: "50" }

    expect(setCategoryAmount(amounts, DARKNET, "")[DARKNET]).toBeUndefined()
    expect(setCategoryAmount(amounts, DARKNET, "   ")[DARKNET]).toBeUndefined()
  })

  it("does not mutate the input object", () => {
    const amounts = { [DARKNET]: "50" }
    const snapshot = { ...amounts }

    const next = setCategoryAmount(amounts, DARKNET, "")

    expect(amounts).toEqual(snapshot)
    expect(next).not.toBe(amounts)
  })
})

describe("effectiveCategoryAmount", () => {
  it("inherits the header amount when the override is missing or empty", () => {
    const values = { ...emptyEntity(), amount: "100" }

    expect(effectiveCategoryAmount(values, DARKNET)).toBe("100")
    expect(
      effectiveCategoryAmount(
        { ...values, categoryAmounts: { [DARKNET]: "" } },
        DARKNET
      )
    ).toBe("100")
  })

  it("uses the override when it is present", () => {
    const values = {
      ...emptyEntity(),
      amount: "100",
      categoryAmounts: { [DARKNET]: "50" },
    }

    expect(effectiveCategoryAmount(values, DARKNET)).toBe("50")
  })
})

describe("channelPairs", () => {
  it("returns no pairs when the card does not override chats", () => {
    expect(channelPairs({ slackChatId: null, telegramChatId: null })).toEqual(
      []
    )
  })

  it("lists Slack when only Slack is set", () => {
    expect(
      channelPairs({ slackChatId: "slack-c2b", telegramChatId: null })
    ).toEqual([{ label: "Slack", value: "#c2b-alerts" }])
  })

  it("lists Telegram when only Telegram is set", () => {
    expect(
      channelPairs({ slackChatId: null, telegramChatId: "tg-c2b" })
    ).toEqual([{ label: "Telegram", value: "C2B Alerts" }])
  })

  it("lists Slack then Telegram when both are set", () => {
    expect(
      channelPairs({ slackChatId: "slack-c2b", telegramChatId: "tg-c2b" })
    ).toEqual([
      { label: "Slack", value: "#c2b-alerts" },
      { label: "Telegram", value: "C2B Alerts" },
    ])
  })
})

describe("balanceSummaryRows", () => {
  it("shows no rows when both sides are off", () => {
    expect(balanceSummaryRows(emptyBalance())).toEqual([])
  })

  it("shows only the increase side when that side is on", () => {
    const values = {
      ...emptyBalance(),
      increaseEnabled: true,
      increaseAmount: "10",
    }

    expect(balanceSummaryRows(values)).toEqual([
      { direction: "Increase by", amount: formatEur("10") },
    ])
  })

  it("shows only the decrease side when that side is on", () => {
    const values = {
      ...emptyBalance(),
      decreaseEnabled: true,
      decreaseAmount: "20",
    }

    expect(balanceSummaryRows(values)).toEqual([
      { direction: "Decrease by", amount: formatEur("20") },
    ])
  })

  it("shows Increase then Decrease when both sides are on", () => {
    const values = {
      ...emptyBalance(),
      increaseEnabled: true,
      increaseAmount: "10",
      decreaseEnabled: true,
      decreaseAmount: "20",
    }

    expect(balanceSummaryRows(values)).toEqual([
      { direction: "Increase by", amount: formatEur("10") },
      { direction: "Decrease by", amount: formatEur("20") },
    ])
  })
})

describe("entitySummaryRows", () => {
  it("shows no rows when no brands are selected", () => {
    expect(entitySummaryRows(emptyEntity())).toEqual([])
  })

  it("shows All and an inherited header amount for a fully selected category", () => {
    const values = {
      ...emptyEntity(),
      selectedBrandIds: brandIds(DARKNET),
      amount: "1000",
    }
    const rows = entitySummaryRows(values)

    expect(rows).toHaveLength(1)
    expect(rows[0]?.categoryName).toBe(category(DARKNET).name)
    expect(rows[0]?.entity).toEqual({ kind: "all" })
    expect(rows[0]?.inherited).toBe(true)
    expect(rows[0]?.amount).toBe(formatEur("1000"))
  })

  it("lists brand names when only some of the category is selected", () => {
    const [first] = brandIds(DARKNET)
    const [firstName] = brandNames(DARKNET)
    const values = {
      ...emptyEntity(),
      selectedBrandIds: [first],
      amount: "10",
    }
    const rows = entitySummaryRows(values)

    expect(rows[0]?.entity).toEqual({ kind: "names", names: [firstName] })
  })

  it("marks an override as not inherited and formats that amount", () => {
    const values = {
      ...emptyEntity(),
      selectedBrandIds: brandIds(DARKNET),
      amount: "1000",
      categoryAmounts: { [DARKNET]: "50" },
    }
    const rows = entitySummaryRows(values)

    expect(rows[0]?.inherited).toBe(false)
    expect(rows[0]?.amount).toBe(formatEur("50"))
  })

  it("omits unchecked categories", () => {
    const values = {
      ...emptyEntity(),
      selectedBrandIds: brandIds(DARKNET),
      amount: "10",
    }
    const names = entitySummaryRows(values).map((row) => row.categoryName)

    expect(names).toEqual([category(DARKNET).name])
    expect(names).not.toContain(category(MIXER).name)
  })
})

describe("firstDepositSummaryRows", () => {
  it("shows an em dash when a filter is off", () => {
    const values = {
      ...emptyFirstDeposit(),
      subRules: [subRule({ id: "row-mixer", categoryId: MIXER })],
    }
    const [row] = firstDepositSummaryRows(values)

    expect(row?.turnover).toBe("—")
    expect(row?.balance).toBe("—")
  })

  it("includes period with the collapsed EUR when turnover is on", () => {
    const values = {
      ...emptyFirstDeposit(),
      subRules: [
        subRule({
          id: "row-mixer",
          categoryId: MIXER,
          turnoverEnabled: true,
          turnoverMin: "1000",
          turnoverPeriod: "month",
        }),
      ],
    }

    expect(firstDepositSummaryRows(values)[0]?.turnover).toBe("€1,000 / month")
  })

  it("shows a formatted amount with no period when balance is on", () => {
    const values = {
      ...emptyFirstDeposit(),
      subRules: [
        subRule({
          id: "row-mixer",
          categoryId: MIXER,
          balanceEnabled: true,
          balanceMin: "1000",
        }),
      ],
    }
    const [row] = firstDepositSummaryRows(values)

    expect(row?.balance).toBe(formatEur("1000"))
    expect(row?.balance).not.toMatch(/ \//)
  })

  it("omits brand-less sub-rules from the collapsed rows", () => {
    const counted = subRule({ id: "kept", categoryId: MIXER })
    const dropped = subRule({ id: "ghost", categoryId: LENDING, brandIds: [] })
    const rows = firstDepositSummaryRows({
      ...emptyFirstDeposit(),
      subRules: [dropped, counted],
    })

    expect(rows).toHaveLength(1)
    expect(rows[0]?.categoryName).toBe(category(MIXER).name)
  })
})
