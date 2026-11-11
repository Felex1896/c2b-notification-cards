import { describe, expect, it } from "vitest"

import { SAMPLE_FILES } from "@/data/sample-files"
import {
  cellReadyAt,
  isCellReady,
  isSyncFinished,
  rowCellTimes,
  rowReadyAt,
  syncFinishedAt,
  type SyncRowInput,
} from "@/lib/sync"

const row = (
  clientId: string,
  walletCount: number,
  historySize: number
): SyncRowInput => ({ clientId, walletCount, historySize })

function sampleRows(): SyncRowInput[] {
  return Object.values(SAMPLE_FILES).flatMap((file) =>
    file.clients.map((client) =>
      row(
        client.clientId,
        file.wallets.filter((wallet) => wallet.clientId === client.clientId)
          .length,
        client.historySize
      )
    )
  )
}

const shapes: SyncRowInput[] = [
  row("1002", 1, 0),
  row("1003", 2, 3),
  row("1004", 4, 10),
  row("2010", 5, 10),
  row("2011", 1, 1),
]

describe("sync timing", () => {
  it("inside a row Balance, Currency and Main wallet come before the history cells", () => {
    for (const shape of [...shapes, ...sampleRows()]) {
      const t = rowCellTimes(shape)
      const current = Math.max(t.balance, t.currency, t.mainWallet)
      const history = Math.min(t.activity, t.annualTurnover, t.turnoverWithUs)
      expect(current).toBeLessThan(history)
    }
  })

  it("inside a row the history cells come before Top entity", () => {
    for (const shape of [...shapes, ...sampleRows()]) {
      const t = rowCellTimes(shape)
      const history = Math.max(t.activity, t.annualTurnover, t.turnoverWithUs)
      expect(history).toBeLessThan(t.topEntity)
    }
  })

  it("the first cell of every row arrives within about a second", () => {
    for (const shape of [...shapes, ...sampleRows()]) {
      const t = rowCellTimes(shape)
      expect(Math.min(...Object.values(t))).toBeLessThanOrEqual(1000)
    }
  })

  it("the last cell of every row arrives within about ten seconds", () => {
    for (const shape of [...shapes, ...sampleRows()]) {
      expect(rowReadyAt(shape)).toBeLessThanOrEqual(10000)
    }
    expect(syncFinishedAt(sampleRows())).toBeLessThanOrEqual(10000)
  })

  it("the same file gives the same times on every run", () => {
    expect(sampleRows().map(rowCellTimes)).toEqual(
      sampleRows().map(rowCellTimes)
    )
  })

  it("rows have their own clocks", () => {
    expect(rowReadyAt(row("1002", 2, 5))).not.toBe(
      rowReadyAt(row("1003", 2, 5))
    )
  })

  it("a client with more wallets finishes later", () => {
    expect(rowReadyAt(row("1003", 3, 4))).toBeGreaterThan(
      rowReadyAt(row("1003", 1, 4))
    )
  })

  it("a client with more history finishes later", () => {
    expect(rowReadyAt(row("1003", 2, 8))).toBeGreaterThan(
      rowReadyAt(row("1003", 2, 2))
    )
  })

  it("a cell is ready from its time on and not before", () => {
    const shape = row("1003", 2, 3)
    const at = cellReadyAt(shape, "activity")
    expect(isCellReady(shape, "activity", at - 1)).toBe(false)
    expect(isCellReady(shape, "activity", at)).toBe(true)
  })

  it("sync is finished only after the last cell", () => {
    const rows = [row("1002", 1, 0), row("1004", 4, 10)]
    const last = syncFinishedAt(rows)
    expect(last).toBe(rowReadyAt(rows[1]))
    expect(isSyncFinished(rows, last - 1)).toBe(false)
    expect(isSyncFinished(rows, last)).toBe(true)
  })

  it("an empty file is finished at once", () => {
    expect(isSyncFinished([], 0)).toBe(true)
  })
})
