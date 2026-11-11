import { Check, Copy } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const HIDE_AFTER_MS = 1500

const iconMotion = {
  initial: { opacity: 0, scale: 0.6 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.6 },
  transition: { duration: 0.15 },
}

/** Short address text. Hover or focus reveals a button that copies the full value. */
export function CopyAddress({ value, text }: { value: string; text: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!copied) {
      return undefined
    }
    const timer = window.setTimeout(() => {
      setCopied(false)
      setOpen(false)
    }, HIDE_AFTER_MS)
    return () => window.clearTimeout(timer)
  }, [copied])

  return (
    <span className="group/address inline-flex max-w-full items-center gap-1">
      <span className="min-w-0 truncate">{text}</span>
      <Tooltip
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setOpen(false)
          }
        }}
      >
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={t("clients.copyAddress")}
            className={cn(
              "opacity-0 group-hover/address:opacity-100 focus-visible:opacity-100",
              copied && "opacity-100"
            )}
            onClick={() => {
              void navigator.clipboard.writeText(value).then(
                () => {
                  setCopied(true)
                  setOpen(true)
                },
                () => undefined
              )
            }}
          >
            <span className="relative size-3.5">
              <AnimatePresence initial={false}>
                {copied ? (
                  <motion.span
                    key="check"
                    className="absolute inset-0"
                    {...iconMotion}
                  >
                    <Check className="size-3.5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    className="absolute inset-0"
                    {...iconMotion}
                  >
                    <Copy className="size-3.5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent sideOffset={6}>
          {t("clients.addressCopied")}
        </TooltipContent>
      </Tooltip>
    </span>
  )
}
