import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function RuleTable({
  headers,
  children,
}: {
  headers: ReactNode[]
  children: ReactNode
}) {
  return (
    <div className="w-full min-w-0">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="border-b border-border py-2 pr-3 text-left align-bottom text-sm font-medium last:pr-0"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function RuleTableRow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <tr className={cn("border-b border-border last:border-b-0", className)}>
      {children}
    </tr>
  )
}

export function RuleTableCell({
  children,
  className,
  muted,
}: {
  children?: ReactNode
  className?: string
  muted?: boolean
}) {
  return (
    <td
      className={cn(
        "py-2 pr-3 align-middle last:pr-0",
        muted && "text-muted-foreground",
        className
      )}
    >
      {children}
    </td>
  )
}
