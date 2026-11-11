import type { LucideIcon } from "lucide-react"
import { motion, type Transition } from "motion/react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * The card's top and the modal's header. One component so the icon and title
 * sit at the same offsets from the frame's top-left in both. The meaning fills
 * the frame's width. `layout` lets Motion undo the frame's scale, so glyphs
 * do not stretch mid-morph. Icon and text share a layout id: the copy that is
 * leaving rides with the frame instead of staying behind while it fades.
 */
export function RuleHeader({
  layoutId,
  layoutDependency,
  transition,
  icon: Icon,
  title,
  meaning,
  lit,
  end,
  pinned,
  glow,
  className,
}: {
  layoutId: string
  layoutDependency: unknown
  /** The frame's own, so the group keeps pace with it. */
  transition: Transition
  icon: LucideIcon
  /** Toggle on: accent tile, black icon. */
  lit: boolean
  title: ReactNode
  meaning: ReactNode
  end?: ReactNode
  /** Stays in the header, above the scroll, full width of the frame. */
  pinned?: ReactNode
  /** Open modal: the glow stays on the title block, not the whole frame. */
  glow?: boolean
  className?: string
}) {
  return (
    <motion.div
      layout
      layoutDependency={layoutDependency}
      transition={transition}
      data-rule-glow={glow ? "" : undefined}
      data-sending={glow && lit ? "on" : undefined}
      className={cn("flex w-full flex-col", className)}
    >
      <motion.div
        layoutId={`${layoutId}-heading`}
        layoutDependency={layoutDependency}
        transition={transition}
        className="flex w-full min-w-0 flex-col gap-3"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              lit
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground ring-1 ring-foreground/10"
            )}
          >
            <Icon className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">{title}</div>
          {end}
        </div>
        {meaning}
      </motion.div>
      {pinned ? <div className="mt-6">{pinned}</div> : null}
    </motion.div>
  )
}
