import { useEffect, useState, type ReactElement } from "react"
import { useTranslation } from "react-i18next"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const HIDE_AFTER_MS = 1500

/**
 * A control that is shown but not built. A click opens the prototype notice;
 * without `hoverLabel`, hover and focus do not. The click is default-prevented
 * so a menu item it wraps stays open and does not fire its select.
 * With `hoverLabel`, hover shows that label and a click switches the tooltip
 * to the notice. `data-notice` is set on the control while the notice is open.
 */
export function NotInPrototype({
  children,
  hoverLabel,
}: {
  children: ReactElement
  hoverLabel?: string
}) {
  const { t } = useTranslation()
  const [notice, setNotice] = useState(false)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    if (!notice) {
      return undefined
    }

    const timer = window.setTimeout(() => setNotice(false), HIDE_AFTER_MS)
    return () => window.clearTimeout(timer)
  }, [notice])

  const open = notice || (hoverLabel !== undefined && hover)

  return (
    <Tooltip
      open={open}
      onOpenChange={(next) => {
        if (hoverLabel === undefined) {
          if (!next) {
            setNotice(false)
          }
          return
        }
        setHover(next)
      }}
    >
      <TooltipTrigger
        asChild
        data-notice={notice ? "" : undefined}
        onClick={(event) => {
          event.preventDefault()
          setNotice(true)
        }}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>
        {notice || hoverLabel === undefined
          ? t("header.notInPrototype")
          : hoverLabel}
      </TooltipContent>
    </Tooltip>
  )
}
