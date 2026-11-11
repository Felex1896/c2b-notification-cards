import { describe, expect, it } from "vitest"

import { BRANDS } from "@/data/brands"
import { isUploadSyncing, sampleRows, syncInput } from "@/lib/client-list"
import { isCellReady, type SyncColumn } from "@/lib/sync"
import { presetBalance } from "@/lib/alert-presets"
import {
  alertsSetUp,
  clientsLoaded,
  brandName,
  prototypeReducer,
  startOver,
  type CardAction,
  type PrototypeAction,
  type PrototypeState,
} from "@/lib/prototype-state"

const [first, second] = BRANDS.map((brand) => brand.id)

function run(state: PrototypeState, ...actions: CardAction[]) {
  return actions.reduce(prototypeReducer, state)
}

const draftBalance = (brand: string, increaseAmount: string): CardAction => ({
  type: "card",
  brand,
  card: "balance",
  op: {
    kind: "setDraft",
    next: (current) => ({
      ...current,
      increaseAmount,
    }),
  },
})

describe("the prototype state", () => {
  it("startOver gives two empty brands with the first one active", () => {
    const state = startOver()
    expect(Object.keys(state.brands)).toEqual([first, second])
    expect(state.activeBrand).toBe(first)
    expect(state.brands[first]).toEqual(state.brands[second])
    expect(state.brands[first].cards.balance.applied).toBeNull()
    expect(Object.keys(state.brands[first])).toEqual([
      "upload",
      "list",
      "cards",
    ])
    expect(state.brands[first].cards.balance.channels).toEqual({
      slackChatId: null,
      telegramChatId: null,
      emailId: null,
    })
  })

  it("a change to one brand's card leaves the other brand untouched", () => {
    const before = startOver()
    const after = run(before, draftBalance(first, "50"))
    expect(after.brands[first].cards.balance.draft.increaseAmount).toBe("50")
    expect(after.brands[second]).toBe(before.brands[second])
  })

  it("a change to one brand's card chats leaves the other brand untouched", () => {
    const before = startOver()
    const after = prototypeReducer(before, {
      type: "card",
      brand: second,
      card: "deposit",
      op: {
        kind: "setChannels",
        channels: {
          slackChatId: "slack-c2b",
          telegramChatId: null,
          emailId: null,
        },
      },
    })
    expect(after.brands[second].cards.deposit.channels.slackChatId).toBe(
      "slack-c2b"
    )
    expect(after.brands[first]).toBe(before.brands[first])
  })

  it("two draft changes in one batch compose", () => {
    const after = run(startOver(), draftBalance(first, "50"), {
      type: "card",
      brand: first,
      card: "balance",
      op: {
        kind: "setDraft",
        next: (current) => ({ ...current, decreaseAmount: "3" }),
      },
    })
    const draft = after.brands[first].cards.balance.draft
    expect(draft.increaseAmount).toBe("50")
    expect(draft.decreaseAmount).toBe("3")
  })

  it("the first Apply leaves that card's sending off and leaves other cards alone", () => {
    const after = run(startOver(), draftBalance(first, "50"), {
      type: "card",
      brand: first,
      card: "balance",
      op: { kind: "apply" },
    })
    const cards = after.brands[first].cards
    expect(cards.balance.sending).toBe(false)
    expect(cards.balance.applied).toEqual({
      increaseAmount: "50",
      decreaseAmount: "",
    })
    expect(cards.balance.expanded).toBe(false)
    expect(cards.deposit.applied).toBeNull()
    expect(cards.deposit.sending).toBe(false)
  })

  it("Apply with no selected entity closes the modal and the rule stays incomplete", () => {
    const after = run(
      startOver(),
      { type: "card", brand: first, card: "deposit", op: { kind: "open" } },
      { type: "card", brand: first, card: "deposit", op: { kind: "apply" } }
    )
    const card = after.brands[first].cards.deposit
    expect(card.expanded).toBe(false)
    expect(card.showErrors).toBe(false)
    expect(card.sending).toBe(false)
    expect(card.applied?.selectedBrandIds).toEqual([])
  })

  it("an action naming an unknown brand changes nothing", () => {
    const before = startOver()
    expect(run(before, draftBalance("nope", "1"))).toBe(before)
  })

  it("Start over after edits gives two empty brands again", () => {
    const edited = run(startOver(), draftBalance(first, "50"))
    const after = prototypeReducer(edited, { type: "startOver" })
    expect(after).toEqual(startOver())
  })

  it("startOver opens Clients on the first brand", () => {
    const state = startOver()
    expect(state.activeTab).toBe("clients")
    expect(state.activeBrand).toBe(first)
  })

  it("switching to another brand that has a file keeps the current tab", () => {
    const onNotifications = (
      [
        { type: "upload", brand: first, file: "a", now: 0 },
        { type: "upload", brand: second, file: "b", now: 0 },
        { type: "selectTab", tab: "notifications" },
      ] as const
    ).reduce(prototypeReducer, startOver())
    const after = prototypeReducer(onNotifications, {
      type: "selectBrand",
      brand: second,
    })
    expect(after.activeBrand).toBe(second)
    expect(after.activeTab).toBe("notifications")
  })

  it("the notifications tab stays closed until the brand has a file", () => {
    const empty = prototypeReducer(startOver(), {
      type: "selectTab",
      tab: "notifications",
    })
    expect(empty.activeTab).toBe("clients")

    const loaded = prototypeReducer(startOver(), {
      type: "upload",
      brand: first,
      file: "a",
      now: 0,
    })
    const there = prototypeReducer(loaded, {
      type: "selectTab",
      tab: "notifications",
    })
    expect(there.activeTab).toBe("notifications")
  })

  it("switching to a brand with no file returns to the clients tab", () => {
    const onNotifications = (
      [
        { type: "upload", brand: first, file: "a", now: 0 },
        { type: "selectTab", tab: "notifications" },
        { type: "selectBrand", brand: second },
      ] as const
    ).reduce(prototypeReducer, startOver())
    expect(onNotifications.activeBrand).toBe(second)
    expect(onNotifications.activeTab).toBe("clients")
  })

  it("selecting an unknown brand changes nothing", () => {
    const before = startOver()
    expect(
      prototypeReducer(before, { type: "selectBrand", brand: "nope" })
    ).toBe(before)
  })

  it("switching tab keeps open cards and their drafts", () => {
    const before = prototypeReducer(
      run(
        startOver(),
        { type: "card", brand: first, card: "balance", op: { kind: "open" } },
        draftBalance(first, "50")
      ),
      { type: "upload", brand: first, file: "a", now: 0 }
    )
    const there = prototypeReducer(before, {
      type: "selectTab",
      tab: "notifications",
    })
    const back = prototypeReducer(there, { type: "selectTab", tab: "clients" })
    expect(back.brands).toBe(before.brands)
    const card = back.brands[first].cards.balance
    expect(card.expanded).toBe(true)
    expect(card.draft.increaseAmount).toBe("50")
  })

  it("a card's chats survive a tab switch", () => {
    const chosen = run(startOver(), {
      type: "card",
      brand: first,
      card: "deposit",
      op: {
        kind: "setChannels",
        channels: {
          slackChatId: "slack-c2b",
          telegramChatId: null,
          emailId: null,
        },
      },
    })
    const after = prototypeReducer(chosen, {
      type: "selectTab",
      tab: "notifications",
    })
    expect(after.brands[first].cards.deposit.channels.slackChatId).toBe(
      "slack-c2b"
    )
  })

  it("switching brand shows that brand's own cards and chats", () => {
    const edited = run(
      startOver(),
      draftBalance(first, "50"),
      draftBalance(second, "70"),
      {
        type: "card",
        brand: second,
        card: "deposit",
        op: {
          kind: "setChannels",
          channels: {
            slackChatId: "slack-c2b",
            telegramChatId: null,
            emailId: null,
          },
        },
      }
    )
    const onFirst = edited.brands[edited.activeBrand]
    const onSecond = prototypeReducer(edited, {
      type: "selectBrand",
      brand: second,
    }).brands[second]
    expect(onFirst.cards.balance.draft.increaseAmount).toBe("50")
    expect(onFirst.cards.deposit.channels.slackChatId).toBeNull()
    expect(onSecond.cards.balance.draft.increaseAmount).toBe("70")
    expect(onSecond.cards.deposit.channels.slackChatId).toBe("slack-c2b")
  })

  it("Start over returns to Clients on the first brand with both brands empty", () => {
    const edited = run(startOver(), draftBalance(second, "9"))
    const away = prototypeReducer(
      prototypeReducer(edited, { type: "selectBrand", brand: second }),
      { type: "selectTab", tab: "notifications" }
    )
    const after = prototypeReducer(away, { type: "startOver" })
    expect(after.activeTab).toBe("clients")
    expect(after.activeBrand).toBe(first)
    expect(after.brands[first]).toEqual(after.brands[second])
    expect(after.brands[second].cards.balance.applied).toBeNull()
    expect(after.brands[second].cards.balance.draft).toEqual(
      startOver().brands[second].cards.balance.draft
    )
  })

  it("a brand is shown by its name", () => {
    expect(brandName(first)).toBe(BRANDS[0].name)
  })

  it("an unknown brand id is shown as is", () => {
    expect(brandName("nope")).toBe("nope")
  })

  describe("uploads and the Client list", () => {
    const upload = (brand: string, file: "a" | "b", now: number) =>
      prototypeReducer(startOver(), { type: "upload", brand, file, now })

    it("a new brand has no upload and the default list", () => {
      const brand = startOver().brands[first]
      expect(brand.upload).toBeNull()
      expect(brand.list).toEqual({
        search: "",
        sort: { key: "balance", direction: "desc" },
        page: 1,
      })
    })

    it("uploading a file starts sync for that brand only", () => {
      const before = startOver()
      const after = prototypeReducer(before, {
        type: "upload",
        brand: first,
        file: "a",
        now: 1000,
      })
      expect(after.brands[first].upload).toEqual({ file: "a", startedAt: 1000 })
      expect(after.brands[second]).toBe(before.brands[second])
    })

    it("a replace keeps rules and the card's chats", () => {
      const edited = run(
        prototypeReducer(upload(first, "a", 0), {
          type: "card",
          brand: first,
          card: "balance",
          op: {
            kind: "setChannels",
            channels: {
              slackChatId: "slack-c2b",
              telegramChatId: null,
              emailId: null,
            },
          },
        }),
        draftBalance(first, "50"),
        { type: "card", brand: first, card: "balance", op: { kind: "apply" } }
      )
      const after = prototypeReducer(edited, {
        type: "upload",
        brand: first,
        file: "b",
        now: 9000,
      })
      expect(after.brands[first].cards).toBe(edited.brands[first].cards)
      expect(after.brands[first].cards.balance.channels.slackChatId).toBe(
        "slack-c2b"
      )
      expect(after.brands[first].upload).toEqual({ file: "b", startedAt: 9000 })
    })

    it("a replace clears the search and returns to page 1 but keeps the sort", () => {
      const browsed = [
        { type: "upload", brand: first, file: "a", now: 0 },
        {
          type: "sort",
          brand: first,
          sort: { key: "currency", direction: "asc" },
        },
        { type: "search", brand: first, text: "10" },
        { type: "page", brand: first, page: 2 },
      ] as const
      const before = browsed.reduce(prototypeReducer, startOver())
      const after = prototypeReducer(before, {
        type: "upload",
        brand: first,
        file: "b",
        now: 500,
      })
      expect(after.brands[first].list).toEqual({
        search: "",
        sort: { key: "currency", direction: "asc" },
        page: 1,
      })
    })

    it("a sort or a search change returns to page 1", () => {
      const onPage3 = prototypeReducer(upload(first, "a", 0), {
        type: "page",
        brand: first,
        page: 3,
      })
      const sorted = prototypeReducer(onPage3, {
        type: "sort",
        brand: first,
        sort: { key: "topEntity", direction: "asc" },
      })
      const searched = prototypeReducer(onPage3, {
        type: "search",
        brand: first,
        text: "1",
      })
      expect(sorted.brands[first].list.page).toBe(1)
      expect(searched.brands[first].list.page).toBe(1)
    })

    it("search, sort and page are kept per brand across tab and brand switches", () => {
      const steps = [
        { type: "upload", brand: first, file: "a", now: 0 },
        { type: "upload", brand: second, file: "b", now: 0 },
        { type: "search", brand: first, text: "10" },
        {
          type: "sort",
          brand: first,
          sort: { key: "activity", direction: "asc" },
        },
        { type: "page", brand: first, page: 2 },
        { type: "selectBrand", brand: second },
        { type: "selectTab", tab: "notifications" },
        { type: "search", brand: second, text: "20" },
        { type: "selectBrand", brand: first },
        { type: "selectTab", tab: "clients" },
      ] as const
      const state = steps.reduce(prototypeReducer, startOver())
      expect(state.brands[first].list).toEqual({
        search: "10",
        sort: { key: "activity", direction: "asc" },
        page: 2,
      })
      expect(state.brands[second].list.search).toBe("20")
      expect(state.brands[second].list.sort).toEqual({
        key: "balance",
        direction: "desc",
      })
    })

    it("an upload naming an unknown brand changes nothing", () => {
      const before = startOver()
      expect(
        prototypeReducer(before, {
          type: "upload",
          brand: "nope",
          file: "a",
          now: 0,
        })
      ).toBe(before)
    })

    it("Start over clears uploads and the list", () => {
      const browsed = [
        { type: "upload", brand: first, file: "a", now: 0 },
        { type: "upload", brand: second, file: "b", now: 0 },
        { type: "search", brand: second, text: "2" },
      ] as const
      const after = prototypeReducer(
        browsed.reduce(prototypeReducer, startOver()),
        {
          type: "startOver",
        }
      )
      expect(after.brands[first].upload).toBeNull()
      expect(after.brands[second].upload).toBeNull()
      expect(after).toEqual(startOver())
    })
  })

  it("connections are shared by both brands", () => {
    const after = prototypeReducer(startOver(), {
      type: "connect",
      kind: "slack",
      ids: ["slack-c2b"],
    })
    const other = prototypeReducer(after, {
      type: "selectBrand",
      brand: second,
    })
    expect(other.connections.slack).toEqual(["slack-c2b"])
  })

  it("Start over has no connections", () => {
    const connected = prototypeReducer(startOver(), {
      type: "connect",
      kind: "email",
      ids: ["ops@acme.io"],
    })
    const after = prototypeReducer(connected, { type: "startOver" })
    expect(after.connections).toEqual({ slack: [], telegram: [], email: [] })
  })

  it("connecting the same item twice keeps one", () => {
    const connect: PrototypeAction = {
      type: "connect",
      kind: "telegram",
      ids: ["tg-risk"],
    }
    const after = [connect, connect].reduce(prototypeReducer, startOver())
    expect(after.connections.telegram).toEqual(["tg-risk"])
  })

  describe("the toolbar jumps", () => {
    const NOW = 1_000_000
    const columns: SyncColumn[] = [
      "balance",
      "currency",
      "mainWallet",
      "activity",
      "annualTurnover",
      "turnoverWithUs",
      "topEntity",
    ]

    it("Clients loaded gives the selected brand file A with every cell ready", () => {
      const state = clientsLoaded(startOver(), first, NOW)
      const upload = state.brands[first].upload
      expect(upload?.file).toBe("a")
      if (!upload) {
        return
      }
      const elapsed = NOW - upload.startedAt
      for (const row of sampleRows("a").map(syncInput)) {
        for (const column of columns) {
          expect(isCellReady(row, column, elapsed)).toBe(true)
        }
      }
      expect(isUploadSyncing(upload, NOW)).toBe(false)
    })

    it("Clients loaded keeps that brand's rules and chats", () => {
      const set = alertsSetUp(startOver(), first, NOW)
      const after = clientsLoaded(set, first, NOW + 5)
      expect(after.brands[first].cards).toEqual(set.brands[first].cards)
      expect(after.connections).toEqual(set.connections)
    })

    it("Clients loaded clears search, goes to page 1 and keeps the sort", () => {
      const sort = { key: "clientId" as const, direction: "asc" as const }
      const before = [
        { type: "search", brand: first, text: "10" },
        { type: "sort", brand: first, sort },
        { type: "page", brand: first, page: 3 },
      ].reduce<PrototypeState>(
        (state, action) => prototypeReducer(state, action as PrototypeAction),
        startOver()
      )
      const list = clientsLoaded(before, first, NOW).brands[first].list
      expect(list).toEqual({ search: "", sort, page: 1 })
    })

    it("Alerts set up applies all four rules and turns them on", () => {
      const cards = alertsSetUp(startOver(), first, NOW).brands[first].cards
      for (const card of Object.values(cards)) {
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
      expect(cards.balance.applied).toEqual({
        increaseAmount: "10000",
        decreaseAmount: "10000",
      })
      expect(cards.withdrawal.applied?.amount).toBe("5000")
      expect(cards.deposit.applied?.amount).toBe("1000")
      expect(cards.firstDeposit.applied?.subRules).toHaveLength(1)
      expect(cards.firstDeposit.applied?.subRules[0]).toMatchObject({
        categoryId: "gambling",
        turnoverEnabled: true,
        turnoverMin: "1000",
        turnoverPeriod: "month",
        balanceEnabled: false,
      })
    })

    it("Alerts set up connects the three preset chats", () => {
      const state = alertsSetUp(startOver(), first, NOW)
      expect(state.connections).toEqual({
        slack: ["slack-c2b"],
        telegram: ["tg-c2b"],
        email: ["alerts@example.com"],
      })
    })

    it("Alerts set up adds a connection only if it is missing", () => {
      const before = [
        { type: "connect", kind: "slack", ids: ["slack-ops", "slack-c2b"] },
        { type: "connect", kind: "email", ids: ["ops@acme.io"] },
      ].reduce<PrototypeState>(
        (state, action) => prototypeReducer(state, action as PrototypeAction),
        startOver()
      )
      const once = alertsSetUp(before, first, NOW)
      const twice = alertsSetUp(once, first, NOW)
      expect(twice.connections).toEqual({
        slack: ["slack-ops", "slack-c2b"],
        telegram: ["tg-c2b"],
        email: ["ops@acme.io", "alerts@example.com"],
      })
    })

    it("both jumps leave the other brand untouched", () => {
      const start = startOver()
      expect(clientsLoaded(start, first, NOW).brands[second]).toEqual(
        start.brands[second]
      )
      expect(alertsSetUp(start, first, NOW).brands[second]).toEqual(
        start.brands[second]
      )
      const other = alertsSetUp(start, second, NOW)
      expect(other.brands[first]).toEqual(start.brands[first])
    })

    it("the reducer keeps working after a jump: a preset card toggles off, and open then cancel restores the preset", () => {
      const jumped = prototypeReducer(startOver(), {
        type: "alertsSetUp",
        brand: first,
        now: NOW,
      })
      const off = run(jumped, {
        type: "card",
        brand: first,
        card: "balance",
        op: { kind: "toggleSending", on: false },
      })
      expect(off.brands[first].cards.balance.sending).toBe(false)
      expect(off.brands[first].cards.balance.applied).toEqual(
        jumped.brands[first].cards.balance.applied
      )
      const restored = run(
        jumped,
        { type: "card", brand: first, card: "balance", op: { kind: "open" } },
        draftBalance(first, "1"),
        { type: "card", brand: first, card: "balance", op: { kind: "cancel" } }
      )
      expect(restored.brands[first].cards.balance.draft).toEqual(
        presetBalance()
      )
      expect(restored.brands[first].cards.balance.expanded).toBe(false)
    })

    it("Start over after a jump empties everything", () => {
      const jumped = alertsSetUp(startOver(), first, NOW)
      const after = prototypeReducer(jumped, { type: "startOver" })
      expect(after).toEqual(startOver())
    })

    it("each jump opens its tab", () => {
      const onNotifications = prototypeReducer(startOver(), {
        type: "selectTab",
        tab: "notifications",
      })
      expect(clientsLoaded(onNotifications, first, NOW).activeTab).toBe(
        "clients"
      )
      expect(alertsSetUp(startOver(), first, NOW).activeTab).toBe(
        "notifications"
      )
    })
  })
})
