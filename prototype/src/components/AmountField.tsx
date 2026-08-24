import { RotateCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { amountPrefixClassName } from "@/lib/field-chrome"
import {
  commitAmountInput,
  REQUIRED,
  RESET_UNIQUE,
  sanitizeAmountInput,
} from "@/lib/rules"
import { cn } from "@/lib/utils"

type AmountFieldProps = {
  id: string
  label?: string
  value: string
  onChange: (value: string) => void
  invalid?: boolean
  placeholder?: string
  disabled?: boolean
  onReset?: () => void
  errorSlot?: boolean
}

export function AmountField({
  id,
  label,
  value,
  onChange,
  invalid = false,
  placeholder = "e.g. 10000",
  disabled = false,
  onReset,
  errorSlot,
}: AmountFieldProps) {
  const showReset = Boolean(onReset) && !disabled
  const showErrorSlot = errorSlot ?? label != null

  return (
    <Field data-invalid={invalid || undefined} className="min-w-0 gap-1.5">
      {label ? <FieldLabel htmlFor={id}>{label}</FieldLabel> : null}
      <div className="flex min-w-0">
        <span className={cn(amountPrefixClassName, disabled && "opacity-50")}>
          EUR
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
          placeholder={placeholder}
          disabled={disabled}
          className={cn("rounded-l-none", showReset && "rounded-r-none")}
        />
        {showReset ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-l-none border-l-0"
                onClick={onReset}
                aria-label={RESET_UNIQUE}
              >
                <RotateCcwIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{RESET_UNIQUE}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      {showErrorSlot ? (
        <FieldError>{invalid ? REQUIRED : null}</FieldError>
      ) : null}
    </Field>
  )
}
