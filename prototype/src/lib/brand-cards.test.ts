import { describe, expect, it } from "vitest"

import { CATEGORIES } from "@/data/catalog"
import {
  cardsAfter,
  emptyCards,
  type BrandCards,
  type CardAction,
} from "@/lib/brand-cards"
import {
  balanceErrors,
  emptyChannels,
  entityErrors,
  isEntityComplete,
  REQUIRED,
  type Channels,
} from "@/lib/rules"

const MIXER = "mixer"

function brandIds(categoryId: string): string[] {
  return (
    CATEGORIES.find((item) => item.id === categoryId)?.brands.map(
      (brand) => brand.id
    ) ?? []
  )
}

function apply(cards: BrandCards, action: CardAction): BrandCards {
  return cardsAfter(cards, action)
}

const slack: Channels = {
  slackChatId: "slack-c2b",
  telegramChatId: null,
  emailId: null,
}

describe("card operations", () => {
  it("Apply with no selected entity closes the modal and the rule stays incomplete", () => {
    const opened = apply(emptyCards(), {
      type: "card",
      brand: "a",
      card: "withdrawal",
      op: { kind: "open" },
    })
    const applied = apply(opened, {
      type: "card",
      brand: "a",
      card: "withdrawal",
      op: { kind: "apply" },
    })
    const card = applied.withdrawal

    expect(card.expanded).toBe(false)
    expect(card.showErrors).toBe(false)
    expect(card.sending).toBe(false)
    expect(card.applied?.selectedBrandIds).toEqual([])
    expect(card.applied && isEntityComplete(card.applied)).toBe(false)
    expect(opened.deposit).toBe(applied.deposit)
  })

  it("reopening an incomplete withdrawal shows errors and highlights nothing", () => {
    const applied = apply(emptyCards(), {
      type: "card",
      brand: "a",
      card: "withdrawal",
      op: { kind: "apply" },
    })
    const reopened = apply(applied, {
      type: "card",
      brand: "a",
      card: "withdrawal",
      op: { kind: "open" },
    })

    expect(reopened.withdrawal.expanded).toBe(true)
    expect(reopened.withdrawal.showErrors).toBe(true)
    expect(entityErrors(reopened.withdrawal.draft)).toEqual({ categories: {} })
  })

  it("reopening an applied balance with both amounts empty marks both required", () => {
    const applied = apply(emptyCards(), {
      type: "card",
      brand: "a",
      card: "balance",
      op: { kind: "apply" },
    })
    const reopened = apply(applied, {
      type: "card",
      brand: "a",
      card: "balance",
      op: { kind: "open" },
    })
    const errors = balanceErrors(reopened.balance.draft)

    expect(reopened.balance.showErrors).toBe(true)
    expect(errors.increaseAmount).toBe(REQUIRED)
    expect(errors.decreaseAmount).toBe(REQUIRED)
  })

  it("the sending toggle cannot turn on while the rule is incomplete", () => {
    const withChat = apply(emptyCards(), {
      type: "card",
      brand: "a",
      card: "balance",
      op: { kind: "setChannels", channels: slack },
    })
    const applied = apply(withChat, {
      type: "card",
      brand: "a",
      card: "balance",
      op: { kind: "apply" },
    })
    const toggled = apply(applied, {
      type: "card",
      brand: "a",
      card: "balance",
      op: { kind: "toggleSending", on: true },
    })

    expect(toggled.balance.sending).toBe(false)
    expect(toggled.balance).toBe(applied.balance)
  })

  it("the sending toggle cannot turn on while the card has no chat", () => {
    const drafted = apply(emptyCards(), {
      type: "card",
      brand: "a",
      card: "balance",
      op: {
        kind: "setDraft",
        next: { increaseAmount: "10", decreaseAmount: "" },
      },
    })
    const applied = apply(drafted, {
      type: "card",
      brand: "a",
      card: "balance",
      op: { kind: "apply" },
    })
    const toggled = apply(applied, {
      type: "card",
      brand: "a",
      card: "balance",
      op: { kind: "toggleSending", on: true },
    })

    expect(applied.balance.applied).toEqual({
      increaseAmount: "10",
      decreaseAmount: "",
    })
    expect(toggled.balance.sending).toBe(false)
    expect(toggled.balance.channels).toEqual(emptyChannels())
  })

  it("setting chats on one card leaves the other cards alone", () => {
    const before = emptyCards()
    const after = apply(before, {
      type: "card",
      brand: "a",
      card: "deposit",
      op: { kind: "setChannels", channels: slack },
    })

    expect(after.deposit.channels).toEqual(slack)
    expect(after.balance).toBe(before.balance)
    expect(after.withdrawal).toBe(before.withdrawal)
    expect(after.firstDeposit).toBe(before.firstDeposit)
  })

  it("Apply drops an own amount that is off", () => {
    const drafted = apply(emptyCards(), {
      type: "card",
      brand: "a",
      card: "deposit",
      op: {
        kind: "setDraft",
        next: {
          selectedBrandIds: brandIds(MIXER),
          amount: "10",
          categoryOverrides: {
            [MIXER]: { enabled: false, amount: "50" },
          },
        },
      },
    })
    const applied = apply(drafted, {
      type: "card",
      brand: "a",
      card: "deposit",
      op: { kind: "apply" },
    })

    expect(applied.deposit.expanded).toBe(false)
    expect(applied.deposit.applied?.categoryOverrides[MIXER]).toBeUndefined()
    expect(applied.deposit.applied?.amount).toBe("10")
    expect(applied.deposit.sending).toBe(false)
  })
})
