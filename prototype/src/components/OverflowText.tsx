import { useLayoutEffect, useRef, useState } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCoarsePointer } from "@/hooks/use-coarse-pointer"
import { useLongPress } from "@/hooks/use-long-press"
import { cn } from "@/lib/utils"

/**
 * Ellipsis, and a tooltip only when the text does not fit.
 * The tooltip stays mounted so measuring the same node survives the check.
 */
export function OverflowText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [overflow, setOverflow] = useState(false)
  const [shown, setShown] = useState(false)
  const coarse = useCoarsePointer()
  const press = useLongPress(() => setShown(true), coarse && overflow)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    const measure = () => {
      setOverflow(el.scrollWidth - el.clientWidth > 1)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [text])

  return (
    <Tooltip
      open={overflow && shown}
      onOpenChange={(next) => {
        if (coarse) {
          if (!next) {
            setShown(false)
          }
          return
        }
        setShown(next)
      }}
    >
      <TooltipTrigger asChild>
        <span
          ref={ref}
          className={cn("block min-w-0 truncate", className)}
          onPointerDown={press.onPointerDown}
          onPointerMove={press.onPointerMove}
          onPointerUp={press.onPointerUp}
          onPointerCancel={press.onPointerCancel}
          onContextMenu={press.onContextMenu}
          onClick={(event) => {
            if (press.consumeHeld()) {
              event.preventDefault()
            }
          }}
        >
          {text}
        </span>
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  )
}
