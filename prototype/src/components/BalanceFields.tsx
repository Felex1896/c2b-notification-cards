import type { Dispatch, SetStateAction } from "react"
import { useTranslation } from "react-i18next"

import { AmountField } from "@/components/AmountField"
import { FormPlate, FormRow, FormStack } from "@/components/FormGrid"
import { OverflowText } from "@/components/OverflowText"
import type { BalanceErrorKey, BalanceValues, FieldErrors } from "@/lib/rules"

type BalanceFieldsProps = {
  value: BalanceValues
  onChange: Dispatch<SetStateAction<BalanceValues>>
  invalid: FieldErrors<BalanceErrorKey>
}

export function BalanceFields({
  value,
  onChange,
  invalid,
}: BalanceFieldsProps) {
  const { t } = useTranslation()

  return (
    <FormStack>
      <FormPlate>
        <AmountRow
          id="balance-increase"
          label={t("balance.increase")}
          value={value.increaseAmount}
          invalid={Boolean(invalid.increaseAmount)}
          onChange={(increaseAmount) =>
            onChange((current) => ({ ...current, increaseAmount }))
          }
        />
        <AmountRow
          id="balance-decrease"
          label={t("balance.decrease")}
          value={value.decreaseAmount}
          invalid={Boolean(invalid.decreaseAmount)}
          onChange={(decreaseAmount) =>
            onChange((current) => ({ ...current, decreaseAmount }))
          }
        />
      </FormPlate>
    </FormStack>
  )
}

function AmountRow({
  id,
  label,
  value,
  invalid,
  onChange,
}: {
  id: string
  label: string
  value: string
  invalid: boolean
  onChange: (value: string) => void
}) {
  return (
    <FormRow
      label={
        <label htmlFor={id} className="min-w-0">
          <OverflowText text={label} />
        </label>
      }
    >
      <AmountField
        id={id}
        value={value}
        onChange={onChange}
        invalid={invalid}
        errorSlot
      />
    </FormRow>
  )
}
