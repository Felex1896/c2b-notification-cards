/**
 * When each cell of the Client list gets its value, in ms from upload start.
 * Seeded by Client ID, so the same file looks the same on every run.
 */

export type SyncColumn =
  | "balance"
  | "currency"
  | "mainWallet"
  | "activity"
  | "annualTurnover"
  | "turnoverWithUs"
  | "topEntity"

export type SyncRowInput = {
  clientId: string
  walletCount: number
  historySize: number
}

const MAX_WALLETS = 5
const MAX_HISTORY = 10

/** A number in [0, 1) that depends only on the client and the column. */
function unit(clientId: string, column: SyncColumn): number {
  let hash = 2166136261
  for (const char of `${clientId}:${column}`) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  }
  hash ^= hash >>> 15
  hash = Math.imul(hash, 2246822507)
  hash ^= hash >>> 13
  hash = Math.imul(hash, 3266489909)
  hash ^= hash >>> 16
  return (hash >>> 0) / 4294967296
}

/** Every cell of a row, ms from upload start. */
export function rowCellTimes(row: SyncRowInput): Record<SyncColumn, number> {
  const wallets = Math.min(Math.max(row.walletCount, 1), MAX_WALLETS)
  const history = Math.min(Math.max(row.historySize, 0), MAX_HISTORY)
  const jitter = (column: SyncColumn, span: number) =>
    unit(row.clientId, column) * span

  // Current state: one read per wallet.
  const balance = 120 + wallets * 110 + jitter("balance", 200)
  const currency = balance + 30 + jitter("currency", 100)
  const mainWallet = currency + 30 + jitter("mainWallet", 100)
  // History scans: the longer the history and the more wallets, the later.
  const activity =
    mainWallet + 200 + history * 500 + wallets * 100 + jitter("activity", 300)
  const annualTurnover = activity + 50 + jitter("annualTurnover", 250)
  const turnoverWithUs = annualTurnover + 50 + jitter("turnoverWithUs", 250)
  // Needs counterparties labelled, so it waits for everything else.
  const topEntity =
    turnoverWithUs + 400 + history * 100 + jitter("topEntity", 600)

  return {
    balance,
    currency,
    mainWallet,
    activity,
    annualTurnover,
    turnoverWithUs,
    topEntity,
  }
}

export function cellReadyAt(row: SyncRowInput, column: SyncColumn): number {
  return rowCellTimes(row)[column]
}

/** When the last cell of this row arrives. */
export function rowReadyAt(row: SyncRowInput): number {
  return rowCellTimes(row).topEntity
}

/** `elapsed` is ms since the upload started. */
export function isCellReady(
  row: SyncRowInput,
  column: SyncColumn,
  elapsed: number
): boolean {
  return elapsed >= cellReadyAt(row, column)
}

/** When the last cell of the last row arrives; 0 for an empty file. */
export function syncFinishedAt(rows: SyncRowInput[]): number {
  return rows.reduce((latest, row) => Math.max(latest, rowReadyAt(row)), 0)
}

export function isSyncFinished(rows: SyncRowInput[], elapsed: number): boolean {
  return elapsed >= syncFinishedAt(rows)
}
