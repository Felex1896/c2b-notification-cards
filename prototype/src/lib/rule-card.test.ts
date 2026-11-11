import { describe, expect, it } from "vitest"

import {
  applyRuleCard,
  cancelRuleCard,
  emptyRuleCard,
  openRuleCard,
  ruleCardStatus,
  setRuleCardChannels,
  setRuleCardDraft,
  toggleRuleCardSending,
  type RuleCardKind,
} from "@/lib/rule-card"
import { emptyChannels, type Channels } from "@/lib/rules"

type Value = { amount: string }

const kind: RuleCardKind<Value> = {
  createEmpty: () => ({ amount: "" }),
  commit: (value) => ({ ...value }),
  isComplete: (draft) => draft.amount !== "",
}

const chat: Channels = {
  slackChatId: "slack-c2b",
  telegramChatId: null,
  emailId: null,
}

const emailToo: Channels = {
  slackChatId: "slack-c2b",
  telegramChatId: null,
  emailId: "ops@acme.io",
}

function filled(amount = "100") {
  return setRuleCardDraft(openRuleCard(emptyRuleCard(kind), kind), { amount })
}

function sending() {
  return toggleRuleCardSending(
    setRuleCardChannels(applyRuleCard(filled(), kind), chat),
    kind,
    true
  )
}

describe("a rule card", () => {
  it("starts closed, empty, not sending and without errors or chats", () => {
    expect(emptyRuleCard(kind)).toEqual({
      expanded: false,
      sending: false,
      applied: null,
      draft: { amount: "" },
      showErrors: false,
      channels: emptyChannels(),
    })
  })

  it("opening a card that was never applied only expands it", () => {
    const card = emptyRuleCard(kind)
    expect(openRuleCard(card, kind)).toEqual({ ...card, expanded: true })
    expect(openRuleCard(card, kind).showErrors).toBe(false)
  })

  it("opening a card that is already open changes nothing", () => {
    const card = filled()
    expect(openRuleCard(card, kind)).toBe(card)
  })

  it("a draft change can be an updater that sees the current draft", () => {
    const card = setRuleCardDraft(filled("5"), (current) => ({
      amount: current.amount + "0",
    }))
    expect(card.draft).toEqual({ amount: "50" })
  })

  it("two draft updaters in a row compose", () => {
    let card = filled("1")
    card = setRuleCardDraft(card, (c) => ({ amount: c.amount + "2" }))
    card = setRuleCardDraft(card, (c) => ({ amount: c.amount + "3" }))
    expect(card.draft).toEqual({ amount: "123" })
  })

  it("the first Apply leaves sending off", () => {
    const card = applyRuleCard(setRuleCardChannels(filled(), chat), kind)
    expect(card.sending).toBe(false)
    expect(card.applied).toEqual({ amount: "100" })
    expect(card.draft).toEqual({ amount: "100" })
    expect(card.expanded).toBe(false)
    expect(card.showErrors).toBe(false)
    expect(card.channels).toEqual(chat)
  })

  it("Apply of an incomplete draft closes the card and leaves sending off", () => {
    const card = applyRuleCard(
      setRuleCardChannels(openRuleCard(emptyRuleCard(kind), kind), chat),
      kind
    )
    expect(card.expanded).toBe(false)
    expect(card.showErrors).toBe(false)
    expect(card.applied).toEqual({ amount: "" })
    expect(card.sending).toBe(false)
    expect(ruleCardStatus(card, kind).complete).toBe(false)
  })

  it("reopening an incomplete rule shows errors", () => {
    const applied = applyRuleCard(openRuleCard(emptyRuleCard(kind), kind), kind)
    const reopened = openRuleCard(applied, kind)
    expect(reopened.expanded).toBe(true)
    expect(reopened.showErrors).toBe(true)
  })

  it("opening a complete rule shows no errors", () => {
    const applied = applyRuleCard(filled(), kind)
    expect(openRuleCard(applied, kind).showErrors).toBe(false)
  })

  it("a later Apply keeps sending on when the rule stays complete and a chat is chosen", () => {
    const again = applyRuleCard(
      setRuleCardDraft(sending(), { amount: "7" }),
      kind
    )
    expect(again.sending).toBe(true)
    expect(again.applied).toEqual({ amount: "7" })
  })

  it("a later Apply keeps sending off when it was off", () => {
    const applied = setRuleCardChannels(applyRuleCard(filled(), kind), chat)
    const again = applyRuleCard(
      setRuleCardDraft(applied, { amount: "7" }),
      kind
    )
    expect(again.sending).toBe(false)
  })

  it("a later Apply turns sending off when the rule is no longer complete", () => {
    const again = applyRuleCard(
      setRuleCardDraft(sending(), { amount: "" }),
      kind
    )
    expect(again.sending).toBe(false)
    expect(again.expanded).toBe(false)
    expect(again.applied).toEqual({ amount: "" })
  })

  it("the sending toggle does nothing before the first Apply", () => {
    const card = setRuleCardChannels(emptyRuleCard(kind), chat)
    expect(toggleRuleCardSending(card, kind, true)).toBe(card)
  })

  it("the sending toggle cannot turn on while the rule is incomplete", () => {
    const applied = setRuleCardChannels(
      applyRuleCard(openRuleCard(emptyRuleCard(kind), kind), kind),
      chat
    )
    expect(ruleCardStatus(applied, kind).blockedReason).toBe("setUpFirst")
    expect(toggleRuleCardSending(applied, kind, true)).toBe(applied)
  })

  it("the sending toggle cannot turn on while the card has no chat", () => {
    const applied = applyRuleCard(filled(), kind)
    expect(ruleCardStatus(applied, kind)).toEqual({
      complete: true,
      sendable: false,
      blockedReason: "chooseChat",
    })
    expect(toggleRuleCardSending(applied, kind, true)).toBe(applied)
  })

  it("an incomplete rule with no chat says set up first", () => {
    const applied = applyRuleCard(openRuleCard(emptyRuleCard(kind), kind), kind)
    expect(ruleCardStatus(applied, kind)).toEqual({
      complete: false,
      sendable: false,
      blockedReason: "setUpFirst",
    })
  })

  it("the sending toggle turns sending on once the rule is complete and a chat is chosen", () => {
    const ready = setRuleCardChannels(applyRuleCard(filled(), kind), chat)
    expect(ruleCardStatus(ready, kind)).toEqual({
      complete: true,
      sendable: true,
      blockedReason: null,
    })
    expect(toggleRuleCardSending(ready, kind, true).sending).toBe(true)
  })

  it("the sending toggle turns sending off when the rule is sendable", () => {
    expect(toggleRuleCardSending(sending(), kind, false).sending).toBe(false)
  })

  it("choosing a chat does not turn sending on", () => {
    const applied = applyRuleCard(filled(), kind)
    expect(setRuleCardChannels(applied, chat).sending).toBe(false)
  })

  it("clearing the last chat turns sending off", () => {
    const cleared = setRuleCardChannels(sending(), emptyChannels())
    expect(cleared.sending).toBe(false)
    expect(ruleCardStatus(cleared, kind).blockedReason).toBe("chooseChat")
  })

  it("clearing one chat while another remains leaves sending on", () => {
    const both = setRuleCardChannels(sending(), emailToo)
    expect(both.sending).toBe(true)
    const slackGone = setRuleCardChannels(both, {
      ...emailToo,
      slackChatId: null,
    })
    expect(slackGone.sending).toBe(true)
    expect(slackGone.channels.emailId).toBe("ops@acme.io")
  })

  it("a complete draft does not count as set up until Apply", () => {
    const card = setRuleCardChannels(filled(), chat)
    expect(ruleCardStatus(card, kind)).toEqual({
      complete: false,
      sendable: false,
      blockedReason: "setUpFirst",
    })
  })

  it("Cancel restores the last applied values and closes the card", () => {
    const applied = applyRuleCard(filled("100"), kind)
    const edited = setRuleCardDraft(openRuleCard(applied, kind), {
      amount: "999",
    })
    const cancelled = cancelRuleCard(edited, kind)
    expect(cancelled.draft).toEqual({ amount: "100" })
    expect(cancelled.expanded).toBe(false)
    expect(cancelled.applied).toEqual({ amount: "100" })
    expect(cancelled.showErrors).toBe(false)
  })

  it("Cancel on a never-applied card closes it empty", () => {
    const cancelled = cancelRuleCard(filled("42"), kind)
    expect(cancelled.draft).toEqual({ amount: "" })
    expect(cancelled.expanded).toBe(false)
    expect(cancelled.applied).toBeNull()
  })

  it("Cancel hides the errors", () => {
    const reopened = openRuleCard(
      applyRuleCard(openRuleCard(emptyRuleCard(kind), kind), kind),
      kind
    )
    expect(reopened.showErrors).toBe(true)
    expect(cancelRuleCard(reopened, kind).showErrors).toBe(false)
  })

  it("Cancel keeps the card's chats", () => {
    const card = setRuleCardChannels(filled(), chat)
    expect(cancelRuleCard(card, kind).channels).toEqual(chat)
  })

  it("Apply hides the errors", () => {
    const reopened = openRuleCard(
      applyRuleCard(openRuleCard(emptyRuleCard(kind), kind), kind),
      kind
    )
    const fixed = applyRuleCard(
      setRuleCardDraft(reopened, { amount: "1" }),
      kind
    )
    expect(fixed.showErrors).toBe(false)
    expect(fixed.expanded).toBe(false)
    expect(fixed.applied).toEqual({ amount: "1" })
  })
})
