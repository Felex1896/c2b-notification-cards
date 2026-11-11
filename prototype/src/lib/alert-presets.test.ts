import { describe, expect, it } from "vitest"

import { CATEGORIES } from "@/data/catalog"
import {
  presetBalance,
  presetCards,
  presetDeposit,
  presetFirstDeposit,
  presetWithdrawal,
  withPresetItems,
} from "@/lib/alert-presets"
import { emptyConnections } from "@/lib/connections"
import {
  isBalanceComplete,
  isEntityComplete,
  isFirstDepositComplete,
} from "@/lib/rules"

const brandIds = (categoryId: string) =>
  CATEGORIES.find((item) => item.id === categoryId)?.brands.map(
    (brand) => brand.id
  )

describe("the alert presets", () => {
  it("each preset rule is complete", () => {
    expect(isBalanceComplete(presetBalance())).toBe(true)
    expect(isEntityComplete(presetWithdrawal())).toBe(true)
    expect(isEntityComplete(presetDeposit())).toBe(true)
    expect(isFirstDepositComplete(presetFirstDeposit())).toBe(true)
  })

  it("the withdrawal and deposit presets cover every brand of their category", () => {
    expect(presetWithdrawal().selectedBrandIds).toEqual(brandIds("exchange"))
    expect(presetDeposit().selectedBrandIds).toEqual(brandIds("gambling"))
    expect(presetFirstDeposit().subRules[0].brandIds).toEqual(
      brandIds("gambling")
    )
  })

  it("the four preset cards are applied, sending, collapsed, and each has the three preset chats", () => {
    for (const card of Object.values(presetCards())) {
      expect(card.applied).not.toBeNull()
      expect(card.sending).toBe(true)
      expect(card.expanded).toBe(false)
      expect(card.showErrors).toBe(false)
      expect(card.draft).toEqual(card.applied)
      expect(card.channels).toEqual({
        slackChatId: "slack-c2b",
        telegramChatId: "tg-c2b",
        emailId: "alerts@example.com",
      })
    }
  })

  it("preset items are added once and other items stay", () => {
    const start = { ...emptyConnections(), slack: ["slack-ops", "slack-c2b"] }
    const after = withPresetItems(withPresetItems(start))
    expect(after.slack).toEqual(["slack-ops", "slack-c2b"])
    expect(after.telegram).toEqual(["tg-c2b"])
    expect(after.email).toEqual(["alerts@example.com"])
  })
})
