import {
  ClientTableColGroup,
  ClientTableHeader,
} from "@/components/ClientTableHeader"
import { ClientTableRow } from "@/components/ClientTableRow"
import { useSyncedScroll } from "@/hooks/use-synced-scroll"
import { tableMinWidth, type ClientRow, type ListSort } from "@/lib/client-list"
import { scrollbarThumb } from "@/lib/table-scroll"
import { cn } from "@/lib/utils"

const TABLE =
  "w-full table-fixed border-separate border-spacing-0 text-left text-sm"

export function ClientTable({
  rows,
  sort,
  syncing,
  elapsed,
  onSort,
}: {
  rows: ClientRow[]
  sort: ListSort
  syncing: boolean
  elapsed: number
  onSort: (sort: ListSort) => void
}) {
  const {
    headerRef,
    bodyRef,
    barRef,
    contentWidth,
    paneWidth,
    scrollLeft,
    overflow,
    onThumbPointerDown,
  } = useSyncedScroll()
  const minWidth = tableMinWidth()
  const thumb = scrollbarThumb(contentWidth, paneWidth, scrollLeft)

  return (
    <div className="min-w-0 rounded-table border border-border">
      <div className="h-2" />
      <ClientTableHeader
        scrollerRef={headerRef}
        minWidth={minWidth}
        sort={sort}
        syncing={syncing}
        onSort={onSort}
      />
      <div className="h-2" />
      <div className="overflow-hidden rounded-b-table">
        <div
          ref={bodyRef}
          className="table-x-body mx-2 min-w-0 overflow-x-auto overflow-y-hidden"
        >
          <table className={TABLE} style={{ minWidth }}>
            <ClientTableColGroup />
            <tbody>
              {rows.map((row) => (
                <ClientTableRow
                  key={row.clientId}
                  row={row}
                  elapsed={elapsed}
                />
              ))}
            </tbody>
          </table>
        </div>
        <div className="h-3" />
      </div>
      <div
        className={cn(
          "relative sticky bottom-0 z-30 mx-2",
          overflow ? "-mt-3 h-3" : "h-0 overflow-hidden"
        )}
      >
        <div
          ref={barRef}
          aria-hidden
          className={cn(
            "table-x-bar h-full",
            overflow ? "overflow-x-auto overflow-y-hidden" : "overflow-hidden"
          )}
        >
          <div style={{ width: contentWidth, height: 1 }} />
        </div>
        {thumb && (
          <div
            aria-hidden
            className="absolute top-0.5 h-2 cursor-grab rounded-full bg-muted-foreground/80 active:cursor-grabbing"
            style={{ width: thumb.width, left: thumb.offset }}
            onPointerDown={onThumbPointerDown}
          />
        )}
      </div>
    </div>
  )
}
