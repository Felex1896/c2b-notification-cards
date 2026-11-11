import type { Dispatch, ReactNode, SetStateAction } from "react"
import { useTranslation } from "react-i18next"

import { AmountField } from "@/components/AmountField"
import { CategoryBrandPicker } from "@/components/CategoryBrandPicker"
import { FormRow } from "@/components/FormGrid"
import { OverflowText } from "@/components/OverflowText"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { MessageKey } from "@/i18n/keys"
import {
  patchCategorySubRule,
  selectedBrandIds,
  syncSubRules,
} from "@/lib/sub-rules"
import type {
  FirstDepositErrors,
  FirstDepositValues,
  Period,
} from "@/lib/rules"
import { applySelection } from "@/lib/selection"

const PERIODS = [
  ["day", "period.day"],
  ["week", "period.week"],
  ["month", "period.month"],
  ["year", "period.year"],
] as const satisfies ReadonlyArray<readonly [Period, MessageKey]>

type FirstDepositFieldsProps = {
  value: FirstDepositValues
  onChange: Dispatch<SetStateAction<FirstDepositValues>>
  invalid: FirstDepositErrors
}

export function FirstDepositFields({
  value,
  onChange,
  invalid,
}: FirstDepositFieldsProps) {
  const patch = (
    categoryId: string,
    next: Parameters<typeof patchCategorySubRule>[2]
  ) => {
    onChange((current) => ({
      ...current,
      subRules: patchCategorySubRule(current.subRules, categoryId, next),
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
      renderSubRows={(category) => {
        const subRule = value.subRules.find(
          (row) => row.categoryId === category.id
        )
        const errors = subRule ? invalid.subRules[subRule.id] : undefined
        return (
          <>
            <FilterRow
              switchId={`first-turnover-switch-${category.id}`}
              labelKey="firstDeposit.turnoverFrom"
              ariaKey="firstDeposit.turnoverFilter"
              enabled={subRule?.turnoverEnabled ?? false}
              onEnabled={(turnoverEnabled) =>
                patch(category.id, { turnoverEnabled })
              }
            >
              {subRule?.turnoverEnabled ? (
                <div className="flex min-w-0 items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <AmountField
                      id={`first-turnover-${category.id}`}
                      value={subRule.turnoverMin}
                      onChange={(turnoverMin) =>
                        patch(category.id, { turnoverMin })
                      }
                      invalid={Boolean(errors?.turnover)}
                      errorSlot
                    />
                  </div>
                  <TurnoverPeriod
                    value={subRule.turnoverPeriod}
                    onChange={(turnoverPeriod) =>
                      patch(category.id, { turnoverPeriod })
                    }
                  />
                </div>
              ) : null}
            </FilterRow>
            <FilterRow
              switchId={`first-balance-switch-${category.id}`}
              labelKey="firstDeposit.balanceFrom"
              ariaKey="firstDeposit.balanceFilter"
              enabled={subRule?.balanceEnabled ?? false}
              onEnabled={(balanceEnabled) =>
                patch(category.id, { balanceEnabled })
              }
            >
              {subRule?.balanceEnabled ? (
                <AmountField
                  id={`first-balance-${category.id}`}
                  value={subRule.balanceMin}
                  onChange={(balanceMin) => patch(category.id, { balanceMin })}
                  invalid={Boolean(errors?.balance)}
                  errorSlot
                />
              ) : null}
            </FilterRow>
          </>
        )
      }}
    />
  )
}

function FilterRow({
  switchId,
  labelKey,
  ariaKey,
  enabled,
  onEnabled,
  children,
}: {
  switchId: string
  labelKey: MessageKey
  ariaKey: MessageKey
  enabled: boolean
  onEnabled: (enabled: boolean) => void
  children?: ReactNode
}) {
  const { t } = useTranslation()

  return (
    <FormRow
      label={
        <>
          <Switch
            id={switchId}
            size="sm"
            checked={enabled}
            onCheckedChange={(checked) => onEnabled(checked === true)}
            aria-label={t(ariaKey)}
          />
          <label htmlFor={switchId} className="min-w-0 cursor-pointer">
            <OverflowText text={t(labelKey)} />
          </label>
        </>
      }
    >
      {children}
    </FormRow>
  )
}

function TurnoverPeriod({
  value,
  onChange,
}: {
  value: Period
  onChange: (period: Period) => void
}) {
  const { t } = useTranslation()

  return (
    <Field className="w-24 shrink-0">
      <FieldLabel className="sr-only">{t("firstDeposit.period")}</FieldLabel>
      <Select
        value={value}
        onValueChange={(next) => {
          const period = PERIODS.find(([item]) => item === next)
          if (period) {
            onChange(period[0])
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map(([item, key]) => (
            <SelectItem key={item} value={item}>
              {t(key)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}
