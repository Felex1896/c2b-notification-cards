import { useTranslation } from "react-i18next"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { amountPrefixClassName } from "@/lib/field-chrome"
import { commitAmountInput, REQUIRED, sanitizeAmountInput } from "@/lib/rules"
import { cn } from "@/lib/utils"

type AmountFieldProps = {
  id: string
  label?: string
  value: string
  onChange: (value: string) => void
  invalid?: boolean
  placeholder?: string
  disabled?: boolean
  errorSlot?: boolean
}

export function AmountField({
  id,
  label,
  value,
  onChange,
  invalid = false,
  placeholder,
  disabled = false,
  errorSlot,
}: AmountFieldProps) {
  const { t } = useTranslation()
  const showErrorSlot = errorSlot ?? label != null

  return (
    <Field data-invalid={invalid || undefined} className="min-w-0 gap-1.5">
      {label ? <FieldLabel htmlFor={id}>{label}</FieldLabel> : null}
      <div className="flex min-w-0">
        <span className={cn(amountPrefixClassName, disabled && "opacity-50")}>
          {t("amount.currency")}
        </span>
        <Input
          id={id}
          inputMode="decimal"
          value={value}
          onChange={(event) => {
            const el = event.target
            const raw = el.value
            const next = sanitizeAmountInput(raw)
            const cursor = el.selectionStart ?? raw.length
            const nextCursor = sanitizeAmountInput(raw.slice(0, cursor)).length
            onChange(next)
            requestAnimationFrame(() => {
              el.setSelectionRange(nextCursor, nextCursor)
            })
          }}
          onBlur={() => {
            const committed = commitAmountInput(value)
            if (committed !== value) {
              onChange(committed)
            }
          }}
          aria-invalid={invalid || undefined}
          placeholder={placeholder ?? t("amount.placeholder")}
          disabled={disabled}
          className="rounded-l-none"
        />
      </div>
      {showErrorSlot ? (
        <FieldError>{invalid ? t(REQUIRED) : null}</FieldError>
      ) : null}
    </Field>
  )
}
