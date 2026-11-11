import { ArrowDown, ArrowUp } from "lucide-react"
import { type Ref } from "react"
import { useTranslation } from "react-i18next"

import {
  ACTIONS_COLUMN_WIDTH,
  COLUMNS,
  nextSort,
  type ListSort,
  type SortKey,
} from "@/lib/client-list"

const TABLE =
  "h-12 w-full table-fixed border-separate border-spacing-0 text-left text-sm"

/** The Client ID header stays outside the scroller, so it is one piece of the pill. */
export const CLIENT_ID_HEADER_ID = "clients-col-client-id"

export function ClientTableColGroup() {
  return (
    <colgroup>
      {COLUMNS.map((column) => (
        <col key={column.key} style={{ width: column.width }} />
      ))}
      <col />
      <col style={{ width: ACTIONS_COLUMN_WIDTH }} />
    </colgroup>
  )
}

export function ClientTableHeader({
  scrollerRef,
  minWidth,
  sort,
  syncing,
  onSort,
}: {
  scrollerRef: Ref<HTMLDivElement>
  minWidth: number
  sort: ListSort
  syncing: boolean
  onSort: (sort: ListSort) => void
}) {
  const [idColumn, ...rest] = COLUMNS

  return (
    <div className="sticky top-[calc(var(--chrome-height)+var(--band-height))] z-30 mx-2 h-12 rounded-table-header">
      <div className="flex h-12 overflow-hidden rounded-table-header bg-table-header backdrop-blur-md">
        <div
          id={CLIENT_ID_HEADER_ID}
          role="columnheader"
          aria-sort={ariaSort(
            !syncing && sort.key === idColumn.key,
            sort.direction
          )}
          className="flex h-12 shrink-0 items-center border-r border-border px-3"
          style={{ width: idColumn.width }}
        >
          <SortButton
            column={idColumn.key}
            labelKey={idColumn.labelKey}
            sort={sort}
            syncing={syncing}
            onSort={onSort}
          />
        </div>
        <div ref={scrollerRef} className="min-w-0 flex-1 overflow-hidden">
          <table
            className={TABLE}
            style={{ minWidth: minWidth - idColumn.width }}
          >
            <colgroup>
              {rest.map((column) => (
                <col key={column.key} style={{ width: column.width }} />
              ))}
              <col />
              <col style={{ width: ACTIONS_COLUMN_WIDTH }} />
            </colgroup>
            <thead>
              <tr>
                {rest.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={ariaSort(
                      !syncing && sort.key === column.key,
                      sort.direction
                    )}
                    className="h-12 px-3 font-medium"
                  >
                    <SortButton
                      column={column.key}
                      labelKey={column.labelKey}
                      sort={sort}
                      syncing={syncing}
                      onSort={onSort}
                    />
                  </th>
                ))}
                <th className="h-12 p-0" aria-hidden />
                <th className="h-12 p-0" aria-hidden />
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>
  )
}

function SortButton({
  column,
  labelKey,
  sort,
  syncing,
  onSort,
}: {
  column: SortKey
  labelKey: (typeof COLUMNS)[number]["labelKey"]
  sort: ListSort
  syncing: boolean
  onSort: (sort: ListSort) => void
}) {
  const { t } = useTranslation()
  const active = !syncing && sort.key === column
  const Arrow = sort.direction === "asc" ? ArrowUp : ArrowDown

  return (
    <button
      type="button"
      disabled={syncing}
      onClick={() => onSort(nextSort(sort, column))}
      className="inline-flex h-12 max-w-full items-center gap-1 font-medium whitespace-nowrap text-muted-foreground enabled:hover:text-foreground disabled:cursor-default"
    >
      <span className="truncate">{t(labelKey)}</span>
      {active && <Arrow className="size-3.5 shrink-0" />}
    </button>
  )
}

function ariaSort(
  active: boolean,
  direction: ListSort["direction"]
): "ascending" | "descending" | undefined {
  if (!active) {
    return undefined
  }
  return direction === "asc" ? "ascending" : "descending"
}
