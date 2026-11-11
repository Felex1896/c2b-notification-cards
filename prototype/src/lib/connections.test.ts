import { describe, expect, it } from "vitest"

import { BRANDS } from "@/data/brands"
import {
  addItems,
  connectableSlackChannels,
  emptyConnections,
  hasConnection,
  isValidCode,
  isValidEmail,
  nextTelegramGroup,
  removeItem,
  usageCount,
} from "@/lib/connections"
import {
  prototypeReducer,
  startOver,
  type CardAction,
  type CardKey,
  type PrototypeAction,
  type PrototypeState,
} from "@/lib/prototype-state"
import { emptyChannels, type Channels } from "@/lib/rules"

const [first, second] = BRANDS.map((brand) => brand.id)

function run(state: PrototypeState, ...actions: PrototypeAction[]) {
  return actions.reduce(prototypeReducer, state)
}

function chats(
  brand: string,
  card: CardKey,
  channels: Partial<Channels>
): CardAction {
  const op = {
    kind: "setChannels" as const,
    channels: { ...emptyChannels(), ...channels },
  }
  switch (card) {
    case "balance":
      return { type: "card", brand, card, op }
    case "withdrawal":
      return { type: "card", brand, card, op }
    case "deposit":
      return { type: "card", brand, card, op }
    case "firstDeposit":
      return { type: "card", brand, card, op }
  }
}

/** A complete balance rule with only the given chats, sending on. */
function sendingBalance(
  brand: string,
  channels: Partial<Channels>
): PrototypeAction[] {
  return [
    {
      type: "card",
      brand,
      card: "balance",
      op: {
        kind: "setDraft",
        next: { increaseAmount: "10", decreaseAmount: "" },
      },
    },
    { type: "card", brand, card: "balance", op: { kind: "apply" } },
    chats(brand, "balance", channels),
    {
      type: "card",
      brand,
      card: "balance",
      op: { kind: "toggleSending", on: true },
    },
  ]
}

describe("usageCount", () => {
  it("counts a card whose chats choose the item", () => {
    const state = run(
      startOver(),
      chats(first, "balance", { slackChatId: "slack-c2b" })
    )
    expect(usageCount(state, "slack", "slack-c2b")).toBe(1)
  })

  it("counts each card that chooses the item, across both brands", () => {
    const state = run(
      startOver(),
      chats(first, "balance", { telegramChatId: "tg-c2b" }),
      chats(first, "deposit", { telegramChatId: "tg-c2b" }),
      chats(second, "withdrawal", { telegramChatId: "tg-c2b" })
    )
    expect(usageCount(state, "telegram", "tg-c2b")).toBe(3)
  })

  it("counts one card once", () => {
    const state = run(
      startOver(),
      chats(first, "balance", { slackChatId: "slack-c2b" }),
      chats(first, "deposit", { emailId: "ops@acme.io" })
    )
    expect(usageCount(state, "slack", "slack-c2b")).toBe(1)
    expect(usageCount(state, "email", "ops@acme.io")).toBe(1)
  })

  it("counts nothing for an item that is not chosen anywhere", () => {
    expect(usageCount(startOver(), "slack", "slack-ops")).toBe(0)
  })
})

describe("removeItem", () => {
  it("drops the connection", () => {
    const state = run(startOver(), {
      type: "connect",
      kind: "slack",
      ids: ["slack-c2b", "slack-ops"],
    })
    expect(removeItem(state, "slack", "slack-c2b").connections.slack).toEqual([
      "slack-ops",
    ])
  })

  it("clears the item from every card's chats in both brands", () => {
    const state = run(
      startOver(),
      chats(first, "balance", { slackChatId: "slack-c2b" }),
      chats(first, "deposit", {
        slackChatId: "slack-c2b",
        emailId: "ops@acme.io",
      }),
      chats(second, "withdrawal", { slackChatId: "slack-c2b" }),
      chats(second, "firstDeposit", { telegramChatId: "tg-c2b" })
    )
    const after = removeItem(state, "slack", "slack-c2b")
    expect(after.brands[first].cards.balance.channels.slackChatId).toBeNull()
    expect(after.brands[first].cards.deposit.channels.slackChatId).toBeNull()
    expect(after.brands[first].cards.deposit.channels.emailId).toBe(
      "ops@acme.io"
    )
    expect(
      after.brands[second].cards.withdrawal.channels.slackChatId
    ).toBeNull()
    expect(
      after.brands[second].cards.firstDeposit.channels.telegramChatId
    ).toBe("tg-c2b")
    expect(usageCount(after, "slack", "slack-c2b")).toBe(0)
  })

  it("removing a connection used by a sending card turns it off", () => {
    const state = run(
      startOver(),
      { type: "connect", kind: "slack", ids: ["slack-c2b"] },
      ...sendingBalance(first, { slackChatId: "slack-c2b" })
    )
    expect(state.brands[first].cards.balance.sending).toBe(true)
    const after = removeItem(state, "slack", "slack-c2b")
    expect(after.brands[first].cards.balance.channels.slackChatId).toBeNull()
    expect(after.brands[first].cards.balance.sending).toBe(false)
  })

  it("removing one chat leaves sending on when another chat remains", () => {
    const state = run(
      startOver(),
      { type: "connect", kind: "slack", ids: ["slack-c2b"] },
      ...sendingBalance(first, {
        slackChatId: "slack-c2b",
        emailId: "ops@acme.io",
      })
    )
    const after = removeItem(state, "slack", "slack-c2b")
    expect(after.brands[first].cards.balance.channels.emailId).toBe(
      "ops@acme.io"
    )
    expect(after.brands[first].cards.balance.sending).toBe(true)
  })

  it("leaves other items alone", () => {
    const state = run(
      startOver(),
      { type: "connect", kind: "slack", ids: ["slack-c2b", "slack-ops"] },
      chats(first, "balance", { slackChatId: "slack-c2b" }),
      chats(second, "deposit", {
        slackChatId: "slack-c2b",
        telegramChatId: "tg-c2b",
      })
    )
    const after = removeItem(state, "slack", "slack-ops")
    expect(after.connections.slack).toEqual(["slack-c2b"])
    expect(after.brands[first].cards.balance.channels.slackChatId).toBe(
      "slack-c2b"
    )
    expect(after.brands[second].cards.deposit.channels.telegramChatId).toBe(
      "tg-c2b"
    )
  })
})

describe("addItems and hasConnection", () => {
  it("adds items of one kind and leaves the others empty", () => {
    const next = addItems(emptyConnections(), "email", ["a@b.co"])
    expect(next).toEqual({ slack: [], telegram: [], email: ["a@b.co"] })
    expect(hasConnection(next, "email")).toBe(true)
    expect(hasConnection(next, "slack")).toBe(false)
  })

  it("does not add the same item twice", () => {
    const once = addItems(emptyConnections(), "slack", ["slack-c2b"])
    expect(addItems(once, "slack", ["slack-c2b", "slack-ops"]).slack).toEqual([
      "slack-c2b",
      "slack-ops",
    ])
  })
})

describe("email format", () => {
  it("accepts a normal address", () => {
    expect(isValidEmail("ops@acme.io")).toBe(true)
  })

  it("rejects an address without @", () => {
    expect(isValidEmail("ops.acme.io")).toBe(false)
  })

  it("rejects an address without a domain", () => {
    expect(isValidEmail("ops@")).toBe(false)
    expect(isValidEmail("ops@acme")).toBe(false)
  })
})

describe("verification code", () => {
  it("must be exactly six digits", () => {
    expect(isValidCode("123456")).toBe(true)
    expect(isValidCode("12345")).toBe(false)
    expect(isValidCode("1234567")).toBe(false)
    expect(isValidCode("12345a")).toBe(false)
    expect(isValidCode("")).toBe(false)
  })
})

describe("mock Telegram rotation", () => {
  it("finds Risk team first", () => {
    expect(nextTelegramGroup(emptyConnections())?.name).toBe("Risk team")
  })

  it("skips connected groups", () => {
    const connections = addItems(emptyConnections(), "telegram", [
      "tg-risk",
      "tg-c2b",
    ])
    expect(nextTelegramGroup(connections)?.name).toBe("Night on-call")
  })

  it("finds none when all are connected", () => {
    const connections = addItems(emptyConnections(), "telegram", [
      "tg-risk",
      "tg-c2b",
      "tg-night",
    ])
    expect(nextTelegramGroup(connections)).toBeNull()
  })
})

describe("Slack channels still connectable", () => {
  it("offers only channels not yet connected", () => {
    const connections = addItems(emptyConnections(), "slack", ["slack-ops"])
    expect(connectableSlackChannels(connections).map((c) => c.name)).toEqual([
      "#c2b-alerts",
      "#payments",
    ])
  })

  it("offers nothing when every channel is connected", () => {
    const connections = addItems(emptyConnections(), "slack", [
      "slack-c2b",
      "slack-ops",
      "slack-payments",
    ])
    expect(connectableSlackChannels(connections)).toEqual([])
  })
})
