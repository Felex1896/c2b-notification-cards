import { useState } from "react"
import { useTranslation } from "react-i18next"

import type { ConnectStepsProps } from "@/components/ConnectionDialog"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { usePrototype } from "@/hooks/use-prototype"
import {
  INVALID_CODE,
  INVALID_EMAIL,
  isValidCode,
  isValidEmail,
} from "@/lib/connections"
import { amountPrefixClassName } from "@/lib/field-chrome"
import { REQUIRED } from "@/lib/rules"
import { cn } from "@/lib/utils"

export function EmailConnect({ onDone }: ConnectStepsProps) {
  const { t } = useTranslation()
  const { connect } = usePrototype()
  const [address, setAddress] = useState("")
  const [code, setCode] = useState("")
  const [sent, setSent] = useState(false)
  const [showError, setShowError] = useState(false)

  const trimmed = address.trim()
  const addressError = !trimmed
    ? REQUIRED
    : isValidEmail(trimmed)
      ? null
      : INVALID_EMAIL
  const codeError = isValidCode(code) ? null : INVALID_CODE

  const submit = () => {
    if (!sent) {
      if (addressError) {
        setShowError(true)
        return
      }
      setShowError(false)
      setSent(true)
      return
    }
    if (codeError) {
      setShowError(true)
      return
    }
    connect("email", [trimmed])
    onDone(trimmed)
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <div className="flex flex-col">
        <div className="flex flex-col gap-3 p-4">
          <Field
            data-invalid={(!sent && showError && !!addressError) || undefined}
          >
            <div className="flex min-w-0">
              <span
                className={cn(
                  amountPrefixClassName,
                  "w-auto",
                  sent && "opacity-50"
                )}
              >
                {t("email.address")}
              </span>
              <Input
                id="connect-email-address"
                type="email"
                value={address}
                disabled={sent}
                aria-invalid={
                  (!sent && showError && !!addressError) || undefined
                }
                onChange={(event) => setAddress(event.target.value)}
                className="rounded-l-none"
              />
            </div>
            <FieldError>
              {!sent && showError && addressError ? t(addressError) : null}
            </FieldError>
          </Field>
          {sent ? (
            <>
              <p className="text-muted-foreground">
                {t("email.sentTo", { address: trimmed })}
              </p>
              <Field data-invalid={(showError && !!codeError) || undefined}>
                <FieldLabel htmlFor="connect-email-code">
                  {t("email.code")}
                </FieldLabel>
                <Input
                  id="connect-email-code"
                  inputMode="numeric"
                  value={code}
                  aria-invalid={(showError && !!codeError) || undefined}
                  onChange={(event) => setCode(event.target.value)}
                />
                <FieldError>
                  {showError && codeError ? t(codeError) : null}
                </FieldError>
              </Field>
            </>
          ) : null}
        </div>
        <div className="px-4 pb-4">
          <Button type="submit" variant="outline" className="w-full">
            {sent ? t("email.verify") : t("email.sendCode")}
          </Button>
        </div>
      </div>
    </form>
  )
}
