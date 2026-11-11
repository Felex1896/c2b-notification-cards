import { describe, expect, it } from "vitest"

import { SAMPLE_FILES } from "@/data/sample-files"
import type { SampleFile, WalletRow } from "@/data/wallet-types"
import {
  ACTIONS_COLUMN_WIDTH,
  COLUMNS,
  PAGE_SIZE,
  clientListView,
  clientRows,
  finishedUpload,
  firstDirection,
  isUploadSyncing,
  nextSort,
  paginate,
  sampleRows,
  searchRows,
  shortAddress,
  sortRows,
  syncInput,
  tableMinWidth,
  cellText,
  DEFAULT_LIST,
  type ClientRow,
  type SortKey,
} from "@/lib/client-list"
import { syncFinishedAt } from "@/lib/sync"

function wallet(clientId: string, role: WalletRow["role"]): WalletRow {
  return { clientId, address: `0x${clientId}${role}`, role, chain: "ethereum" }
}

function result(clientId: string, over: Partial<ClientRow> = {}) {
  return {
    clientId,
    balance: 0,
    annualTurnover: 0,
    turnoverWithUs: 0,
    activity: null,
    currency: null,
    mainWallet: null,
    topEntity: null,
    historySize: 0,
    ...over,
  }
}

const file: SampleFile = {
  wallets: [
    wallet("1001", "central"),
    wallet("1002", "deposit"),
    wallet("1003", "deposit"),
    wallet("1003", "deposit"),
    wallet("1003", "withdrawal"),
    wallet("1004", "deposit"),
  ],
  clients: [
    result("1002", { balance: 50 }),
    result("1003", { balance: 700 }),
    result("1004"),
  ],
}

function row(clientId: string, over: Partial<ClientRow> = {}): ClientRow {
  return { ...result(clientId), walletCount: 1, ...over }
}

const ids = (rows: ClientRow[]) => rows.map((r) => r.clientId)

describe("building the client rows", () => {
  it("central wallets are not rows", () => {
    expect(ids(clientRows(file))).not.toContain("1001")
  })

  it("several wallets of one client make one row", () => {
    const rows = clientRows(file)
    expect(ids(rows)).toEqual(["1002", "1003", "1004"])
    expect(rows[1].walletCount).toBe(3)
  })

  it("a client with no chain activity keeps its row with zeros", () => {
    const quiet = clientRows(file)[2]
    expect(quiet.balance).toBe(0)
    expect(quiet.activity).toBeNull()
  })

  it("both sample files have 50 clients with disjoint ids", () => {
    const a = ids(sampleRows("a"))
    const b = ids(sampleRows("b"))
    expect(a).toHaveLength(50)
    expect(b).toHaveLength(50)
    expect(a.filter((id) => b.includes(id))).toEqual([])
  })

  it("each sample file carries one central row that is not a client", () => {
    for (const sample of Object.values(SAMPLE_FILES)) {
      expect(sample.wallets.filter((w) => w.role === "central")).toHaveLength(1)
      expect(sample.clients).toHaveLength(50)
    }
  })

  it("a client row is made from the wallets of the file", () => {
    for (const sample of Object.values(SAMPLE_FILES)) {
      const central = sample.wallets.find((w) => w.role === "central")
      expect(ids(clientRows(sample))).not.toContain(central?.clientId)
    }
  })
})

describe("searching", () => {
  const rows = [row("1002"), row("1013"), row("2102")]

  it("matches part of a Client ID", () => {
    expect(ids(searchRows(rows, "10"))).toEqual(["1002", "1013", "2102"])
    expect(ids(searchRows(rows, "101"))).toEqual(["1013"])
    expect(ids(searchRows(rows, "02"))).toEqual(["1002", "2102"])
  })

  it("an empty search keeps every row", () => {
    expect(searchRows(rows, "")).toEqual(rows)
  })

  it("a search with no match gives no rows", () => {
    expect(searchRows(rows, "999")).toEqual([])
  })
})

describe("sorting", () => {
  const rows: ClientRow[] = [
    row("1002", {
      balance: 5,
      annualTurnover: 300,
      turnoverWithUs: 20,
      activity: "12–18 CET",
      currency: "USDT",
      mainWallet: "0xbbb",
      topEntity: "Kraken",
    }),
    row("1010", {
      balance: 90,
      annualTurnover: 100,
      turnoverWithUs: 10,
      activity: "00–06 CET",
      currency: "ETH",
      mainWallet: "0xaaa",
      topEntity: "Binance",
    }),
    row("1003", {
      balance: 40,
      annualTurnover: 200,
      turnoverWithUs: 30,
      activity: "18–24 CET",
      currency: "BNB",
      mainWallet: "0xccc",
      topEntity: "Coinbase",
    }),
  ]

  const expected: Record<SortKey, string[]> = {
    clientId: ["1002", "1003", "1010"],
    balance: ["1002", "1003", "1010"],
    annualTurnover: ["1010", "1003", "1002"],
    turnoverWithUs: ["1010", "1002", "1003"],
    activity: ["1010", "1002", "1003"],
    currency: ["1003", "1010", "1002"],
    mainWallet: ["1010", "1002", "1003"],
    topEntity: ["1010", "1003", "1002"],
  }

  for (const key of Object.keys(expected) as SortKey[]) {
    it(`sorts by ${key} ascending`, () => {
      expect(ids(sortRows(rows, { key, direction: "asc" }))).toEqual(
        expected[key]
      )
    })

    it(`sorts by ${key} descending`, () => {
      expect(ids(sortRows(rows, { key, direction: "desc" }))).toEqual(
        [...expected[key]].reverse()
      )
    })
  }

  it("first click sorts amounts descending and text ascending", () => {
    const start = { key: "clientId" as SortKey, direction: "asc" as const }
    expect(nextSort(start, "balance").direction).toBe("desc")
    expect(nextSort(start, "turnoverWithUs").direction).toBe("desc")
    expect(nextSort(start, "currency").direction).toBe("asc")
    expect(nextSort(start, "activity").direction).toBe("asc")
    expect(firstDirection("topEntity")).toBe("asc")
  })

  it("a second click on the same column flips the direction", () => {
    const once = nextSort(DEFAULT_LIST.sort, "annualTurnover")
    const twice = nextSort(once, "annualTurnover")
    expect(once).toEqual({ key: "annualTurnover", direction: "desc" })
    expect(twice).toEqual({ key: "annualTurnover", direction: "asc" })
  })

  it("Activity sorts by its start hour", () => {
    const sorted = sortRows(rows, { key: "activity", direction: "asc" })
    expect(sorted.map((r) => r.activity)).toEqual([
      "00–06 CET",
      "12–18 CET",
      "18–24 CET",
    ])
  })

  it("missing values sort last in both directions", () => {
    const withGaps = [
      row("1", { topEntity: null }),
      row("2", { topEntity: "Kraken" }),
      row("3", { topEntity: "Binance" }),
    ]
    expect(
      ids(sortRows(withGaps, { key: "topEntity", direction: "asc" }))
    ).toEqual(["3", "2", "1"])
    expect(
      ids(sortRows(withGaps, { key: "topEntity", direction: "desc" }))
    ).toEqual(["2", "3", "1"])
  })

  it("Client ID sorts as a number, not as text", () => {
    const mixed = [row("90"), row("100"), row("8")]
    expect(ids(sortRows(mixed, { key: "clientId", direction: "asc" }))).toEqual(
      ["8", "90", "100"]
    )
  })
})

describe("pagination", () => {
  const items = Array.from({ length: 23 }, (_, index) => index)

  it("shows 20 per page", () => {
    expect(PAGE_SIZE).toBe(20)
    expect(paginate(items, 1).items).toHaveLength(20)
    expect(paginate(items, 1).pageCount).toBe(2)
  })

  it("the last page holds what is left", () => {
    expect(paginate(items, 2).items).toEqual([20, 21, 22])
  })

  it("a page past the end shows the last page", () => {
    const past = paginate(items, 9)
    expect(past.page).toBe(2)
    expect(past.items).toEqual([20, 21, 22])
  })

  it("no rows is one empty page", () => {
    expect(paginate([], 1)).toEqual({ items: [], page: 1, pageCount: 1 })
  })

  it("the list view searches, sorts, then pages", () => {
    const rows = sampleRows("a")
    const view = clientListView(
      rows,
      { ...DEFAULT_LIST, search: "100", page: 1 },
      false
    )
    expect(view.matches).toBe(
      ids(rows).filter((id) => id.includes("100")).length
    )
    expect(view.items.length).toBeLessThanOrEqual(PAGE_SIZE)
  })

  it("while syncing the list view keeps file order", () => {
    const rows = sampleRows("a")
    const view = clientListView(rows, DEFAULT_LIST, true)
    expect(ids(view.items)).toEqual(ids(rows.slice(0, PAGE_SIZE)))
  })

  it("after sync the list view takes the sort", () => {
    const rows = sampleRows("a")
    const view = clientListView(rows, DEFAULT_LIST, false)
    const top = Math.max(...rows.map((r) => r.balance))
    expect(view.items[0].balance).toBe(top)
  })
})

describe("showing values", () => {
  it("a short address keeps the first eight and last five characters", () => {
    expect(shortAddress("0x7d9557a1b2c3d4e5f60718293a4b5c6d7e82ef11")).toBe(
      "0x7d9557…2ef11"
    )
  })

  it("amounts are shown in euros", () => {
    expect(cellText(row("1", { balance: 1234 }), "balance", "en")).toBe(
      "€1,234"
    )
  })

  it("in Russian amounts put the euro sign after the number", () => {
    expect(cellText(row("1", { balance: 1234 }), "balance", "ru")).toBe(
      "1\u00a0234\u00a0€"
    )
  })

  it("a missing value is a dash", () => {
    const empty = row("1")
    expect(cellText(empty, "activity", "en")).toBe("—")
    expect(cellText(empty, "currency", "en")).toBe("—")
    expect(cellText(empty, "mainWallet", "en")).toBe("—")
    expect(cellText(empty, "topEntity", "en")).toBe("—")
  })

  it("an unresolved top entity is shown as a short address", () => {
    const unresolved = row("1", {
      topEntity: "0xf5b7b7aa11bb22cc33dd44ee55ff6600a1b222d75",
    })
    expect(cellText(unresolved, "topEntity", "en")).toBe("0xf5b7b7…22d75")
  })

  it("a Tron top entity is shown as a short address", () => {
    const tron = row("1", {
      topEntity: "TNEiDiboTjsCtD4q2dyNeFjZtcDzinYRkH",
    })
    expect(cellText(tron, "topEntity", "en")).toBe("TNEiDibo…nYRkH")
  })

  it("a named top entity is shown in full", () => {
    const named = row("1", { topEntity: "Uniswap" })
    expect(cellText(named, "topEntity", "en")).toBe("Uniswap")
  })
})

describe("column widths", () => {
  it("fixed columns leave the remaining width to the filler", () => {
    expect(COLUMNS.map((column) => column.width)).toEqual([
      120, 160, 160, 160, 152, 112, 200, 200,
    ])
    expect(ACTIONS_COLUMN_WIDTH).toBe(56)
    expect(tableMinWidth()).toBe(1320)
  })
})

describe("whether an upload is still syncing", () => {
  it("syncs until the last cell is in, then stops", () => {
    const rows = sampleRows("a").map(syncInput)
    const end = syncFinishedAt(rows)
    const upload = { file: "a" as const, startedAt: 5000 }
    expect(isUploadSyncing(upload, 5000)).toBe(true)
    expect(isUploadSyncing(upload, 5000 + end - 1)).toBe(true)
    expect(isUploadSyncing(upload, 5000 + end)).toBe(false)
  })
})

describe("an upload made already finished", () => {
  it("is not syncing at the moment it is made, and began before then", () => {
    const upload = finishedUpload("a", 90000)
    expect(upload.file).toBe("a")
    expect(upload.startedAt).toBeLessThan(90000)
    expect(isUploadSyncing(upload, 90000)).toBe(false)
    expect(isUploadSyncing(upload, 89999)).toBe(true)
  })
})
