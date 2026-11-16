import type { ReactNode } from "react"

import { OverflowText } from "@/components/OverflowText"
import { cn } from "@/lib/utils"

/** One group of controls. No stroke: the plate behind it is the separator. */
export function FormPlate({ children }: { children: ReactNode }) {
  return (
    <div className="rule-line flex w-full min-w-0 flex-col gap-3 border-b px-4 py-3 md:grid md:grid-cols-[minmax(0,160px)_minmax(0,1fr)] md:items-start md:gap-x-3 md:gap-y-2">
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
      <div data-form-scroll="" className="min-h-0 flex-1 overflow-y-auto">
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
 * Label and field. On a phone they stack, label then field.
 * From tablet width the wrapper disappears (`contents`) and the two cells join the
 * plate's grid: one 160px label column, shared by every row. Text that does
 * not fit truncates.
 */
export function FormRow({
  label,
  children,
}: {
  label: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 md:contents">
      <div className="flex min-w-0 items-center gap-2 overflow-hidden text-sm md:h-(--control-height) md:self-start">
        {typeof label === "string" ? <OverflowText text={label} /> : label}
      </div>
      <div className="min-w-0 md:self-start">{children}</div>
    </div>
  )
}
