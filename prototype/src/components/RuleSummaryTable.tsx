import type { ReactNode } from "react"

import { FitEntityNames } from "@/components/FitEntityNames"
import { RuleTable, RuleTableCell, RuleTableRow } from "@/components/RuleTable"
import type {
  BalanceSummaryRow,
  ChannelPair,
  EntitySummaryRow,
  FirstDepositSummaryRow,
} from "@/lib/rules"
import { cn } from "@/lib/utils"

export function AppliedRuleSummary({
  table,
  channels,
}: {
  table: ReactNode
  channels: ChannelPair[]
}) {
  return (
    <div className="flex min-w-0 flex-col">
      {table}
      {channels.length > 0 ? <ChannelSummary pairs={channels} /> : null}
    </div>
  )
}

function ChannelSummary({ pairs }: { pairs: ChannelPair[] }) {
  return (
    <table className="mt-1 w-full border-collapse text-sm">
      <tbody>
        {pairs.map((pair) => (
          <RuleTableRow key={pair.label}>
            <RuleTableCell muted>{pair.label}</RuleTableCell>
            <RuleTableCell>{pair.value}</RuleTableCell>
          </RuleTableRow>
        ))}
      </tbody>
    </table>
  )
}

export function BalanceSummaryTable({ rows }: { rows: BalanceSummaryRow[] }) {
  const pair = rows.length === 2
  return (
    <div className={cn("grid", pair && "grid-cols-2")}>
      {rows.map((row, index) => (
        <div
          key={row.direction}
          className={cn(
            "min-w-0 py-2",
            pair && index === 0 && "pr-4",
            pair && index === 1 && "border-l border-border pl-4"
          )}
        >
          <div className="text-sm font-medium">{row.direction}</div>
          <div className="text-sm">{row.amount}</div>
        </div>
      ))}
    </div>
  )
}

export function EntitySummaryTable({ rows }: { rows: EntitySummaryRow[] }) {
  return (
    <RuleTable headers={["Category", "Entity", "Min amount"]}>
      {rows.map((row) => (
        <RuleTableRow key={row.categoryName}>
          <RuleTableCell>{row.categoryName}</RuleTableCell>
          <RuleTableCell className="max-w-[14rem] min-w-0">
            <FitEntityNames cell={row.entity} />
          </RuleTableCell>
          <RuleTableCell muted={row.inherited}>{row.amount}</RuleTableCell>
        </RuleTableRow>
      ))}
    </RuleTable>
  )
}

export function FirstDepositSummaryTable({
  rows,
}: {
  rows: FirstDepositSummaryRow[]
}) {
  return (
    <RuleTable headers={["Category", "Entity", "Turnover", "Balance"]}>
      {rows.map((row) => (
        <RuleTableRow key={row.categoryName}>
          <RuleTableCell>{row.categoryName}</RuleTableCell>
          <RuleTableCell className="max-w-[12rem] min-w-0">
            <FitEntityNames cell={row.entity} />
          </RuleTableCell>
          <RuleTableCell muted={row.turnover === "—"}>
            {row.turnover}
          </RuleTableCell>
          <RuleTableCell muted={row.balance === "—"}>
            {row.balance}
          </RuleTableCell>
        </RuleTableRow>
      ))}
    </RuleTable>
  )
}
