import { SAMPLE_FILES } from "@/data/sample-files"
import type {
  ActivityRange,
  ClientChainResult,
  Currency,
  SampleFile,
  SampleFileId,
} from "@/data/wallet-types"
import type { MessageKey } from "@/i18n/keys"
import type { Language } from "@/lib/language"
import { isCopyableAddress } from "@/lib/client-cells"
import { formatEur } from "@/lib/rules"
import {
  isSyncFinished,
  syncFinishedAt,
  type SyncColumn,
  type SyncRowInput,
} from "@/lib/sync"

export type ClientRow = {
  clientId: string
  walletCount: number
  balance: number
  annualTurnover: number
  turnoverWithUs: number
  activity: ActivityRange | null
  currency: Currency | null
  mainWallet: string | null
  topEntity: string | null
  historySize: number
}

export type SortKey = "clientId" | SyncColumn

export type SortDirection = "asc" | "desc"

export type ListSort = { key: SortKey; direction: SortDirection }

/** Search, sort and page of one brand's Client list. */
export type ListState = { search: string; sort: ListSort; page: number }

/** A sample file picked for a brand; `startedAt` is when sync began (ms). */
export type Upload = { file: SampleFileId; startedAt: number }

export const PAGE_SIZE = 20

export const DEFAULT_LIST: ListState = {
  search: "",
  sort: { key: "balance", direction: "desc" },
  page: 1,
}

/**
 * Column order of the table, as in the live product.
 * Widths are layout (px), not tokens. A filler column after these takes the rest.
 */
export const COLUMNS: { key: SortKey; labelKey: MessageKey; width: number }[] =
  [
    { key: "clientId", labelKey: "clients.column.clientId", width: 120 },
    { key: "balance", labelKey: "clients.column.balance", width: 160 },
    {
      key: "annualTurnover",
      labelKey: "clients.column.annualTurnover",
      width: 160,
    },
    {
      key: "turnoverWithUs",
      labelKey: "clients.column.turnoverWithUs",
      width: 160,
    },
    { key: "activity", labelKey: "clients.column.activity", width: 152 },
    { key: "currency", labelKey: "clients.column.currency", width: 112 },
    { key: "mainWallet", labelKey: "clients.column.mainWallet", width: 200 },
    { key: "topEntity", labelKey: "clients.column.topEntity", width: 200 },
  ]

/** The arrow column pinned to the right edge of the visible table. */
export const ACTIONS_COLUMN_WIDTH = 56

/** Width of the fixed columns before the filler absorbs the rest. */
export function tableMinWidth(): number {
  return (
    COLUMNS.reduce((sum, column) => sum + column.width, 0) +
    ACTIONS_COLUMN_WIDTH
  )
}

const AMOUNT_KEYS: SortKey[] = ["balance", "annualTurnover", "turnoverWithUs"]

/** One row per client, in order of first appearance; `central` is not a row. */
export function clientRows(file: SampleFile): ClientRow[] {
  const results = new Map<string, ClientChainResult>(
    file.clients.map((client) => [client.clientId, client])
  )
  const order: string[] = []
  const walletCounts = new Map<string, number>()
  for (const wallet of file.wallets) {
    if (wallet.role === "central") {
      continue
    }
    if (!walletCounts.has(wallet.clientId)) {
      order.push(wallet.clientId)
    }
    walletCounts.set(
      wallet.clientId,
      (walletCounts.get(wallet.clientId) ?? 0) + 1
    )
  }
  return order.map((clientId) => {
    const result = results.get(clientId)
    return {
      clientId,
      walletCount: walletCounts.get(clientId) ?? 1,
      balance: result?.balance ?? 0,
      annualTurnover: result?.annualTurnover ?? 0,
      turnoverWithUs: result?.turnoverWithUs ?? 0,
      activity: result?.activity ?? null,
      currency: result?.currency ?? null,
      mainWallet: result?.mainWallet ?? null,
      topEntity: result?.topEntity ?? null,
      historySize: result?.historySize ?? 0,
    }
  })
}

const rowCache = new Map<SampleFileId, ClientRow[]>()

/** Rows of a bundled sample file, computed once. */
export function sampleRows(file: SampleFileId): ClientRow[] {
  let rows = rowCache.get(file)
  if (!rows) {
    rows = clientRows(SAMPLE_FILES[file])
    rowCache.set(file, rows)
  }
  return rows
}

export function syncInput(row: ClientRow): SyncRowInput {
  return {
    clientId: row.clientId,
    walletCount: row.walletCount,
    historySize: row.historySize,
  }
}

/** True while some cell of this upload is still a skeleton. */
export function isUploadSyncing(upload: Upload, now: number): boolean {
  const inputs = sampleRows(upload.file).map(syncInput)
  return !isSyncFinished(inputs, now - upload.startedAt)
}

/** An upload of the file whose sync is just done at `now`. */
export function finishedUpload(file: SampleFileId, now: number): Upload {
  const inputs = sampleRows(file).map(syncInput)
  return { file, startedAt: now - syncFinishedAt(inputs) }
}

/** Client ID contains the text. */
export function searchRows(rows: ClientRow[], text: string): ClientRow[] {
  const needle = text.trim()
  if (!needle) {
    return rows
  }
  return rows.filter((row) => row.clientId.includes(needle))
}

/** Amounts first sort descending, text ascending. */
export function firstDirection(key: SortKey): SortDirection {
  return AMOUNT_KEYS.includes(key) ? "desc" : "asc"
}

/** A click on a header: the same column flips, a new one starts afresh. */
export function nextSort(current: ListSort, key: SortKey): ListSort {
  if (current.key === key) {
    return {
      key,
      direction: current.direction === "asc" ? "desc" : "asc",
    }
  }
  return { key, direction: firstDirection(key) }
}

function sortValue(row: ClientRow, key: SortKey): string | number | null {
  if (key === "activity") {
    return row.activity ? Number(row.activity.slice(0, 2)) : null
  }
  return row[key]
}

function compare(a: string | number, b: string | number): number {
  if (typeof a === "number" && typeof b === "number") {
    return a - b
  }
  return String(a).localeCompare(String(b), "en", { numeric: true })
}

/** Missing values go last in both directions; ties keep file order. */
export function sortRows(rows: ClientRow[], sort: ListSort): ClientRow[] {
  const sign = sort.direction === "asc" ? 1 : -1
  return rows
    .map((row, index) => ({ row, index, value: sortValue(row, sort.key) }))
    .sort((a, b) => {
      if (a.value === null || b.value === null) {
        if (a.value === b.value) {
          return a.index - b.index
        }
        return a.value === null ? 1 : -1
      }
      return sign * compare(a.value, b.value) || a.index - b.index
    })
    .map((entry) => entry.row)
}

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE))
}

/** A page past the end shows the last page; below 1 shows the first. */
export function paginate<T>(
  items: T[],
  page: number
): { items: T[]; page: number; pageCount: number } {
  const count = pageCount(items.length)
  const current = Math.min(Math.max(page, 1), count)
  const start = (current - 1) * PAGE_SIZE
  return {
    items: items.slice(start, start + PAGE_SIZE),
    page: current,
    pageCount: count,
  }
}

export type ClientListView = {
  items: ClientRow[]
  page: number
  pageCount: number
  /** Rows matching the search. */
  matches: number
}

/** While syncing rows stay in file order; afterwards they take the sort. */
export function clientListView(
  rows: ClientRow[],
  list: ListState,
  syncing: boolean
): ClientListView {
  const found = searchRows(rows, list.search)
  const ordered = syncing ? found : sortRows(found, list.sort)
  const pageOf = paginate(ordered, list.page)
  return {
    items: pageOf.items,
    page: pageOf.page,
    pageCount: pageOf.pageCount,
    matches: found.length,
  }
}

export const DASH = "—"

export function formatAmount(amount: number, language: Language): string {
  return formatEur(String(amount), language)
}

/** `0x7d9557…2ef11`: first eight characters, last five. */
export function shortAddress(address: string): string {
  if (address.length <= 14) {
    return address
  }
  return `${address.slice(0, 8)}…${address.slice(-5)}`
}

/** Text of a cell once its value has arrived. */
export function cellText(
  row: ClientRow,
  key: SortKey,
  language: Language
): string {
  switch (key) {
    case "clientId":
      return row.clientId
    case "balance":
    case "annualTurnover":
    case "turnoverWithUs":
      return formatAmount(row[key], language)
    case "activity":
    case "currency":
      return row[key] ?? DASH
    case "mainWallet":
      return row.mainWallet ? shortAddress(row.mainWallet) : DASH
    case "topEntity":
      // An unresolved counterparty is an address; a named one is shown whole.
      return row.topEntity
        ? isCopyableAddress(row.topEntity)
          ? shortAddress(row.topEntity)
          : row.topEntity
        : DASH
  }
}
