import { XIcon, type LucideIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { RuleHeader } from "@/components/RuleHeader"
import {
  MotionCard,
  RULE_MOTION,
  ruleFrameClass,
} from "@/components/rule-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CardDescription, CardFooter, CardTitle } from "@/components/ui/card"

type RuleModalProps = {
  open: boolean
  layoutId: string
  icon: LucideIcon
  title: string
  meaning: string
  sending: boolean
  onCancel: () => void
  onApply: () => void
  /** Left of the buttons. Null hides it. */
  applyError?: string | null
  onReturnFocus: () => void
  pinned?: ReactNode
  children: ReactNode
}

/**
 * The open rule. Lives inside the card's Dialog root. Motion keeps it mounted
 * through the exit, still showing what it showed at the moment of closing.
 */
export function RuleModal({
  open,
  layoutId,
  icon,
  title,
  meaning,
  sending,
  onCancel,
  onApply,
  applyError,
  onReturnFocus,
  pinned,
  children,
}: RuleModalProps) {
  const { t } = useTranslation()
  const { frame, fade } = RULE_MOTION
  const afterFade = { ...fade, delay: fade.duration }
  const formRef = useRef<HTMLDivElement>(null)
  const scrolledNonce = useRef(0)
  const [scrollNonce, setScrollNonce] = useState(0)

  function handleApply() {
    onApply()
    setScrollNonce((nonce) => nonce + 1)
  }

  useLayoutEffect(() => {
    if (scrollNonce === scrolledNonce.current) {
      return
    }
    scrolledNonce.current = scrollNonce
    const root = formRef.current
    if (!open || !root) {
      return
    }
    scrollToFirstError(root)
  }, [scrollNonce, open])

  return (
    <AnimatePresence>
      {open ? (
        <DialogPrimitive.Portal key="rule-modal" forceMount>
          <DialogPrimitive.Overlay forceMount asChild>
            <motion.div
              className="fixed inset-0 isolate z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: fade }}
              exit={{ opacity: 0, transition: afterFade }}
            />
          </DialogPrimitive.Overlay>
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <DialogPrimitive.Content
              forceMount
              asChild
              onInteractOutside={(event) => event.preventDefault()}
              onCloseAutoFocus={(event) => {
                event.preventDefault()
                onReturnFocus()
              }}
            >
              <MotionCard
                layoutId={layoutId}
                layoutDependency="modal"
                transition={{ layout: frame }}
                data-rule-card=""
                style={{ borderRadius: "var(--table-radius)" }}
                className={cn(
                  "pointer-events-auto flex max-h-full w-full max-w-[560px] min-w-0 flex-col overflow-hidden outline-none",
                  ruleFrameClass()
                )}
              >
                <div ref={formRef} className="flex min-h-0 flex-1 flex-col">
                  <RuleHeader
                    layoutId={layoutId}
                    layoutDependency="modal"
                    transition={{ layout: frame }}
                    icon={icon}
                    lit={sending}
                    pinned={pinned}
                    className={cn(
                      "shrink-0 px-6 pt-6",
                      pinned ? "pb-2" : "pb-6"
                    )}
                    title={
                      <DialogPrimitive.Title asChild>
                        <CardTitle>{title}</CardTitle>
                      </DialogPrimitive.Title>
                    }
                    meaning={
                      <DialogPrimitive.Description asChild>
                        <CardDescription>{meaning}</CardDescription>
                      </DialogPrimitive.Description>
                    }
                    end={
                      <motion.div
                        className="ml-auto shrink-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: fade }}
                        exit={{ opacity: 0, transition: afterFade }}
                      >
                        <DialogPrimitive.Close asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-10"
                          >
                            <XIcon className="size-6" />
                            <span className="sr-only">{t("common.close")}</span>
                          </Button>
                        </DialogPrimitive.Close>
                      </motion.div>
                    }
                  />
                  <motion.div
                    className="flex min-h-0 flex-1 flex-col px-2 pb-2"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { ...fade, delay: frame.visualDuration },
                    }}
                    exit={{ opacity: 0, transition: fade }}
                  >
                    {children}
                  </motion.div>
                </div>
                <CardFooter className="flex-wrap justify-end gap-2 border-t-0 bg-transparent">
                  {applyError ? (
                    <p className="mr-auto min-w-0 text-left text-sm text-destructive">
                      {applyError}
                    </p>
                  ) : null}
                  <Button type="button" onClick={handleApply}>
                    {t("common.apply")}
                  </Button>
                  <Button type="button" variant="ghost" onClick={onCancel}>
                    {t("common.close")}
                  </Button>
                </CardFooter>
              </MotionCard>
            </DialogPrimitive.Content>
          </div>
        </DialogPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  )
}

/** Bring the topmost marked control to the top of the form scroller. */
function scrollToFirstError(root: HTMLElement) {
  const target = root.querySelector<HTMLElement>("[data-field-error]")
  if (!target) {
    return
  }
  const scroller = scrollParent(root, target)
  if (!scroller) {
    const fallback = root.querySelector<HTMLElement>("[data-form-scroll]")
    if (fallback) {
      fallback.scrollTop = 0
    }
    return
  }
  const top =
    target.getBoundingClientRect().top -
    scroller.getBoundingClientRect().top +
    scroller.scrollTop
  scroller.scrollTo({ top: Math.max(0, top - 12), behavior: "smooth" })
}

function scrollParent(
  root: HTMLElement,
  target: HTMLElement
): HTMLElement | null {
  let node = target.parentElement
  while (node && node !== root) {
    const overflow = getComputedStyle(node).overflowY
    if (overflow === "auto" || overflow === "scroll") {
      return node
    }
    node = node.parentElement
  }
  return null
}
