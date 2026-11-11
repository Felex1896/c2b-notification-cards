import type { Dispatch, SetStateAction } from "react"
import { useTranslation } from "react-i18next"

import { AmountField } from "@/components/AmountField"
import { CategoryBrandPicker } from "@/components/CategoryBrandPicker"
import { FormRow } from "@/components/FormGrid"
import { OverflowText } from "@/components/OverflowText"
import { Switch } from "@/components/ui/switch"
import type { MessageKey } from "@/i18n/keys"
import {
  categoryOverride,
  pruneCategoryOverrides,
  setCategoryOverride,
  type EntityErrors,
  type EntityValues,
} from "@/lib/rules"
import { applySelection } from "@/lib/selection"

const MIN_AMOUNT_LABEL = {
  withdrawal: "rule.withdrawal.minAmount",
  deposit: "rule.deposit.minAmount",
} as const satisfies Record<string, MessageKey>

type EntityRuleIdPrefix = keyof typeof MIN_AMOUNT_LABEL

type EntityRuleFieldsProps = {
  idPrefix: EntityRuleIdPrefix
  value: EntityValues
  onChange: Dispatch<SetStateAction<EntityValues>>
  invalid: EntityErrors
}

/** Min amount sits in the open header so it stays put while categories scroll. */
export function EntityMinAmount({
  idPrefix,
  value,
  onChange,
  invalid,
}: EntityRuleFieldsProps) {
  const { t } = useTranslation()
  const amountId = `${idPrefix}-amount`

  return (
    <div className="grid w-full grid-cols-[160px_minmax(0,1fr)] items-start gap-x-3">
      <label
        htmlFor={amountId}
        className="flex h-(--control-height) min-w-0 items-center"
      >
        <OverflowText text={t(MIN_AMOUNT_LABEL[idPrefix])} />
      </label>
      <AmountField
        id={amountId}
        value={value.amount}
        onChange={(amount) => onChange((current) => ({ ...current, amount }))}
        invalid={Boolean(invalid.amount)}
        errorSlot
      />
    </div>
  )
}

export function EntityRuleFields({
  idPrefix,
  value,
  onChange,
  invalid,
}: EntityRuleFieldsProps) {
  return (
    <CategoryBrandPicker
      selectedBrandIds={value.selectedBrandIds}
      onSelect={(intent) =>
        onChange((current) => {
          const selectedBrandIds = applySelection(
            current.selectedBrandIds,
            intent
          )
          return {
            ...current,
            selectedBrandIds,
            categoryOverrides: pruneCategoryOverrides(
              current.categoryOverrides,
              selectedBrandIds,
              intent.heldCategoryId
            ),
          }
        })
      }
      renderSubRows={(category) => {
        const override = categoryOverride(value, category.id)
        return (
          <OwnAmountRow
            idPrefix={idPrefix}
            categoryId={category.id}
            enabled={override?.enabled ?? false}
            amount={override?.amount ?? ""}
            placeholder={value.amount || undefined}
            invalid={Boolean(invalid.categories[category.id])}
            onEnabled={(enabled) =>
              onChange((current) => ({
                ...current,
                categoryOverrides: setCategoryOverride(
                  current.categoryOverrides,
                  category.id,
                  { enabled }
                ),
              }))
            }
            onAmount={(amount) =>
              onChange((current) => ({
                ...current,
                categoryOverrides: setCategoryOverride(
                  current.categoryOverrides,
                  category.id,
                  { amount }
                ),
              }))
            }
          />
        )
      }}
    />
  )
}

function OwnAmountRow({
  idPrefix,
  categoryId,
  enabled,
  amount,
  placeholder,
  invalid,
  onEnabled,
  onAmount,
}: {
  idPrefix: EntityRuleIdPrefix
  categoryId: string
  enabled: boolean
  amount: string
  placeholder?: string
  invalid: boolean
  onEnabled: (enabled: boolean) => void
  onAmount: (amount: string) => void
}) {
  const { t } = useTranslation()
  const switchId = `${idPrefix}-own-switch-${categoryId}`

  return (
    <FormRow
      label={
        <>
          <Switch
            id={switchId}
            size="sm"
            checked={enabled}
            onCheckedChange={(checked) => onEnabled(checked === true)}
          />
          <label htmlFor={switchId} className="min-w-0 cursor-pointer">
            <OverflowText text={t("entity.ownAmount")} />
          </label>
        </>
      }
    >
      {enabled ? (
        <AmountField
          id={`${idPrefix}-own-${categoryId}`}
          value={amount}
          placeholder={placeholder}
          onChange={onAmount}
          invalid={invalid}
          errorSlot
        />
      ) : null}
    </FormRow>
  )
}
