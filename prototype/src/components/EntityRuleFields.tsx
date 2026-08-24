import type { Dispatch, SetStateAction } from "react"

import { AmountField } from "@/components/AmountField"
import { CategoryBrandPicker } from "@/components/CategoryBrandPicker"
import { RuleTableCell } from "@/components/RuleTable"
import type { EntityErrors, EntityValues } from "@/lib/rules"
import {
  categoryAmountOverride,
  pruneCategoryAmounts,
  setCategoryAmount,
} from "@/lib/rules"
import { applySelection } from "@/lib/selection"

type EntityRuleFieldsProps = {
  idPrefix: string
  value: EntityValues
  onChange: Dispatch<SetStateAction<EntityValues>>
  invalid: EntityErrors
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
            categoryAmounts: pruneCategoryAmounts(
              current.categoryAmounts,
              selectedBrandIds,
              intent.heldCategoryId
            ),
          }
        })
      }
      invalid={Boolean(invalid.brands)}
      extraHeaders={[
        <AmountField
          key="default-amount"
          id={`${idPrefix}-threshold`}
          label="Min amount *"
          value={value.amount}
          onChange={(amount) => onChange((current) => ({ ...current, amount }))}
          invalid={Boolean(invalid.amount)}
        />,
      ]}
      renderExtra={(category, checked) => {
        const override = categoryAmountOverride(value, category.id)
        return (
          <RuleTableCell className="min-w-[12rem] align-top">
            <AmountField
              id={`${idPrefix}-amount-${category.id}`}
              value={override ?? ""}
              placeholder={value.amount || "e.g. 10000"}
              disabled={!checked}
              onChange={(next) =>
                onChange((current) => ({
                  ...current,
                  categoryAmounts: setCategoryAmount(
                    current.categoryAmounts,
                    category.id,
                    next
                  ),
                }))
              }
              onReset={
                override != null
                  ? () =>
                      onChange((current) => ({
                        ...current,
                        categoryAmounts: setCategoryAmount(
                          current.categoryAmounts,
                          category.id,
                          ""
                        ),
                      }))
                  : undefined
              }
            />
          </RuleTableCell>
        )
      }}
    />
  )
}
