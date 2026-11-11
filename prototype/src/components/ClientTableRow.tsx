import {
  ActivityCell,
  AddressCell,
  CellSkeleton,
  CurrencyCell,
} from "@/components/ClientCells"
import { CLIENT_ID_HEADER_ID } from "@/components/ClientTableHeader"
import { RowDetailsButton } from "@/components/RowDetailsButton"
import { useLanguage } from "@/hooks/use-language"
import { isCopyableAddress } from "@/lib/client-cells"
import {
  COLUMNS,
  cellText,
  syncInput,
  type ClientRow,
  type SortKey,
} from "@/lib/client-list"
import { isCellReady } from "@/lib/sync"
import type { Language } from "@/lib/language"
import { cn } from "@/lib/utils"

const DIVIDER = "shadow-[inset_0_-1px_0_0_var(--border)]"
const CELL = `h-12 px-3 whitespace-nowrap ${DIVIDER}`

export function ClientTableRow({
  row,
  elapsed,
}: {
  row: ClientRow
  elapsed: number
}) {
  const { language } = useLanguage()

  return (
    <tr className="group">
      {COLUMNS.map((column) => (
        <DataCell
          key={column.key}
          row={row}
          column={column.key}
          elapsed={elapsed}
          language={language}
        />
      ))}
      <td className={`${DIVIDER} group-hover:bg-table-row-hover`} />
      <td className="sticky right-0 z-20 h-12 p-0">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-72 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(to left, var(--table-row-glow), transparent)",
          }}
        />
        <div className="relative z-10 flex h-12 items-center justify-end pr-2">
          <RowDetailsButton />
        </div>
      </td>
    </tr>
  )
}

function DataCell({
  row,
  column,
  elapsed,
  language,
}: {
  row: ClientRow
  column: SortKey
  elapsed: number
  language: Language
}) {
  const ready = cellReady(row, column, elapsed)
  const content = ready ? (
    <CellValue row={row} column={column} language={language} />
  ) : (
    <CellSkeleton />
  )

  if (column === "clientId") {
    return (
      <td
        headers={CLIENT_ID_HEADER_ID}
        className="sticky left-0 z-10 h-12 border-r border-border bg-background p-0 whitespace-nowrap"
      >
        <div className="pointer-events-none absolute inset-0 bg-table-row-hover opacity-0 group-hover:opacity-100" />
        <div className={`relative flex h-12 items-center px-3 ${DIVIDER}`}>
          {content}
        </div>
      </td>
    )
  }

  return (
    <td className={cn(CELL, "group-hover:bg-table-row-hover")}>{content}</td>
  )
}

function CellValue({
  row,
  column,
  language,
}: {
  row: ClientRow
  column: SortKey
  language: Language
}) {
  switch (column) {
    case "activity":
      return <ActivityCell range={row.activity} />
    case "currency":
      return <CurrencyCell currency={row.currency} />
    case "mainWallet":
      return (
        <AddressCell
          value={row.mainWallet}
          text={cellText(row, "mainWallet", language)}
          copyable
        />
      )
    case "topEntity":
      return (
        <AddressCell
          value={row.topEntity}
          text={cellText(row, "topEntity", language)}
          copyable={row.topEntity !== null && isCopyableAddress(row.topEntity)}
        />
      )
    default:
      return cellText(row, column, language)
  }
}

function cellReady(row: ClientRow, key: SortKey, elapsed: number): boolean {
  if (key === "clientId") {
    return true
  }
  return isCellReady(syncInput(row), key, elapsed)
}
