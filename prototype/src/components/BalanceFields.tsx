import { AmountField } from "@/components/AmountField"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError } from "@/components/ui/field"
import type { BalanceErrorKey, BalanceValues, FieldErrors } from "@/lib/rules"
import { cn } from "@/lib/utils"

type BalanceFieldsProps = {
  value: BalanceValues
  onChange: (next: BalanceValues) => void
  invalid: FieldErrors<BalanceErrorKey>
}

export function BalanceFields({
  value,
  onChange,
  invalid,
}: BalanceFieldsProps) {
  const pairInvalid = Boolean(invalid.directions)

  return (
    <Field>
      <div className="grid grid-cols-2">
        <DirectionColumn
          className="pr-4"
          id="balance-increase"
          label="Increase by"
          enabled={value.increaseEnabled}
          amount={value.increaseAmount}
          amountInvalid={Boolean(invalid.increaseAmount)}
          pairInvalid={pairInvalid}
          onEnabled={(increaseEnabled) =>
            onChange({ ...value, increaseEnabled })
          }
          onAmount={(increaseAmount) => onChange({ ...value, increaseAmount })}
        />
        <DirectionColumn
          className="border-l border-border pl-4"
          id="balance-decrease"
          label="Decrease by"
          enabled={value.decreaseEnabled}
          amount={value.decreaseAmount}
          amountInvalid={Boolean(invalid.decreaseAmount)}
          pairInvalid={pairInvalid}
          onEnabled={(decreaseEnabled) =>
            onChange({ ...value, decreaseEnabled })
          }
          onAmount={(decreaseAmount) => onChange({ ...value, decreaseAmount })}
        />
      </div>
      <FieldError>{invalid.directions ?? null}</FieldError>
    </Field>
  )
}

function DirectionColumn({
  id,
  label,
  enabled,
  amount,
  amountInvalid,
  pairInvalid,
  onEnabled,
  onAmount,
  className,
}: {
  id: string
  label: string
  enabled: boolean
  amount: string
  amountInvalid: boolean
  pairInvalid: boolean
  onEnabled: (enabled: boolean) => void
  onAmount: (amount: string) => void
  className?: string
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label className="mb-1.5 flex h-8 items-center gap-2 text-sm">
        <Checkbox
          checked={enabled}
          onCheckedChange={(checked) => onEnabled(checked === true)}
          aria-invalid={pairInvalid || undefined}
          aria-label={label}
        />
        {label}
      </label>
      <AmountField
        id={id}
        value={amount}
        onChange={onAmount}
        invalid={amountInvalid}
        disabled={!enabled}
        errorSlot
      />
    </div>
  )
}
