import type { ReactNode } from "react"

import { OverflowText } from "@/components/OverflowText"
import { cn } from "@/lib/utils"

/** One group of controls. No stroke: the plate behind it is the separator. */
export function FormPlate({ children }: { children: ReactNode }) {
  return (
    <div className="rule-line grid grid-cols-[160px_minmax(0,1fr)] items-start gap-x-3 gap-y-2 border-b px-4 py-3">
      {children}
    </div>
  )
}

/**
 * The open card's inner plate. Radius is the table header's: the shell is the
 * table's outer radius, and this plate sits inset the way the header does.
 * `pinned` stays put; only `children` scroll.
 */
export function FormStack({
  pinned,
  children,
}: {
  pinned?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="rule-card-layer flex max-h-full min-h-0 flex-col overflow-hidden rounded-table-header">
      {pinned ? <div className="shrink-0 [&>*]:pt-6">{pinned}</div> : null}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div
          className={cn(
            "flex flex-col [&>*:last-child]:border-b-0",
            !pinned && "[&>*:first-child]:pt-6"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Two cells of the surrounding plate grid. A fragment, so every row —
 * including rows rendered by a child — shares that one pair of columns.
 * The label column is 160px on every card; text that does not fit truncates.
 */
export function FormRow({
  label,
  children,
}: {
  label: ReactNode
  children?: ReactNode
}) {
  return (
    <>
      <div className="flex h-(--control-height) w-[160px] min-w-0 items-center gap-2 self-start overflow-hidden text-sm">
        {typeof label === "string" ? <OverflowText text={label} /> : label}
      </div>
      <div className="min-w-0 self-start">{children}</div>
    </>
  )
}
