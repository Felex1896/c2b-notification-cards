import type { Dispatch, SetStateAction } from "react"

import { AmountField } from "@/components/AmountField"
import { CategoryBrandPicker } from "@/components/CategoryBrandPicker"
import { RuleTableCell } from "@/components/RuleTable"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CATEGORIES } from "@/data/catalog"
import {
  subRuleForCategory,
  type FirstDepositErrors,
  type FirstDepositSubRule,
  type FirstDepositValues,
  type Period,
} from "@/lib/rules"
import { applySelection } from "@/lib/selection"

type FirstDepositFieldsProps = {
  value: FirstDepositValues
  onChange: Dispatch<SetStateAction<FirstDepositValues>>
  invalid: Partial<FirstDepositErrors>
}

/** The picker speaks brand ids; this card stores them per sub-rule. */
function selectedBrandIds(values: FirstDepositValues): string[] {
  return values.subRules.flatMap((row) => row.brandIds)
}

export function FirstDepositFields({
  value,
  onChange,
  invalid,
}: FirstDepositFieldsProps) {
  const subRuleFor = (categoryId: string) =>
    value.subRules.find((row) => row.categoryId === categoryId)

  const patchSubRule = (id: string, patch: Partial<FirstDepositSubRule>) => {
    onChange((current) => ({
      ...current,
      subRules: current.subRules.map((row) =>
        row.id === id ? { ...row, ...patch } : row
      ),
    }))
  }

  return (
    <CategoryBrandPicker
      selectedBrandIds={selectedBrandIds(value)}
      onSelect={(intent) =>
        onChange((current) => ({
          ...current,
          subRules: syncSubRules(
            current.subRules,
            applySelection(selectedBrandIds(current), intent),
            intent.heldCategoryId
          ),
        }))
      }
      extraHeaders={[
        <span key="turnover" className="inline-flex h-8 items-center">
          Turnover
        </span>,
        <span key="balance" className="inline-flex h-8 items-center">
          Balance
        </span>,
      ]}
      rowEntityInvalid={(categoryId) => {
        const subRule = subRuleFor(categoryId)
        return Boolean(subRule && invalid.subRules?.[subRule.id]?.brands)
      }}
      footerError={invalid.categories ?? null}
      renderExtra={(category, checked) => {
        const subRule = subRuleFor(category.id)
        if (!checked || !subRule) {
          return (
            <>
              <RuleTableCell />
              <RuleTableCell />
            </>
          )
        }
        const rowErrors = invalid.subRules?.[subRule.id] ?? {}

        return (
          <>
            <FilterCell
              id={`first-turnover-${subRule.id}`}
              enabled={subRule.turnoverEnabled}
              onEnabled={(turnoverEnabled) =>
                patchSubRule(subRule.id, { turnoverEnabled })
              }
              amount={subRule.turnoverMin}
              onAmount={(turnoverMin) =>
                patchSubRule(subRule.id, { turnoverMin })
              }
              invalid={Boolean(rowErrors.turnover)}
              ariaLabel="Turnover filter"
              period={subRule.turnoverPeriod}
              onPeriod={(turnoverPeriod) =>
                patchSubRule(subRule.id, { turnoverPeriod })
              }
            />
            <FilterCell
              id={`first-balance-${subRule.id}`}
              enabled={subRule.balanceEnabled}
              onEnabled={(balanceEnabled) =>
                patchSubRule(subRule.id, { balanceEnabled })
              }
              amount={subRule.balanceMin}
              onAmount={(balanceMin) =>
                patchSubRule(subRule.id, { balanceMin })
              }
              invalid={Boolean(rowErrors.balance)}
              ariaLabel="Balance filter"
            />
          </>
        )
      }}
    />
  )
}

function FilterCell({
  id,
  enabled,
  onEnabled,
  amount,
  onAmount,
  invalid,
  ariaLabel,
  period,
  onPeriod,
}: {
  id: string
  enabled: boolean
  onEnabled: (enabled: boolean) => void
  amount: string
  onAmount: (amount: string) => void
  invalid: boolean
  ariaLabel: string
  period?: Period
  onPeriod?: (period: Period) => void
}) {
  return (
    <RuleTableCell className="min-w-[10rem] align-top">
      <div className="flex flex-col gap-2">
        <Switch
          size="sm"
          className="mt-1.5"
          checked={enabled}
          onCheckedChange={(checked) => onEnabled(checked === true)}
          aria-label={ariaLabel}
        />
        {enabled ? (
          <>
            <AmountField
              id={id}
              value={amount}
              onChange={onAmount}
              invalid={invalid}
              errorSlot
            />
            {onPeriod && period ? (
              <Field>
                <FieldLabel className="sr-only">Turnover period</FieldLabel>
                <Select
                  value={period}
                  onValueChange={(next) => onPeriod(next as Period)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            ) : null}
          </>
        ) : null}
      </div>
    </RuleTableCell>
  )
}

function syncSubRules(
  prev: FirstDepositSubRule[],
  selectedBrandIds: string[],
  retainCategoryId?: string | null
): FirstDepositSubRule[] {
  const selected = new Set(selectedBrandIds)
  const byCategory = new Map(prev.map((row) => [row.categoryId, row]))
  const next: FirstDepositSubRule[] = []

  for (const category of CATEGORIES) {
    const brandIds = category.brands
      .map((brand) => brand.id)
      .filter((id) => selected.has(id))
    if (brandIds.length === 0) {
      if (retainCategoryId === category.id) {
        const existing = byCategory.get(category.id)
        if (existing) {
          next.push({ ...existing, brandIds: [] })
        }
      }
      continue
    }
    const existing = byCategory.get(category.id)
    if (existing) {
      next.push({ ...existing, brandIds })
    } else {
      next.push({ ...subRuleForCategory(category.id), brandIds })
    }
  }

  return next
}
