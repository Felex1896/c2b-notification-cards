import { XIcon, type LucideIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { Dialog as DialogPrimitive } from "radix-ui"
import type { ReactNode } from "react"
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
  onReturnFocus,
  pinned,
  children,
}: RuleModalProps) {
  const { t } = useTranslation()
  const { frame, fade } = RULE_MOTION
  const afterFade = { ...fade, delay: fade.duration }

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
                  "pointer-events-auto flex max-h-full w-[560px] max-w-full flex-col overflow-hidden outline-none",
                  ruleFrameClass()
                )}
              >
                <div className="flex min-h-0 flex-1 flex-col">
                  <RuleHeader
                    layoutId={layoutId}
                    layoutDependency="modal"
                    transition={{ layout: frame }}
                    icon={icon}
                    lit={sending}
                    glow
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
                <CardFooter className="justify-end gap-2 border-t-0 bg-transparent">
                  <Button type="button" onClick={onApply}>
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
