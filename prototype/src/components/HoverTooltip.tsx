import {
  cloneElement,
  useState,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCoarsePointer } from "@/hooks/use-coarse-pointer"
import { useLongPress } from "@/hooks/use-long-press"

type TriggerProps = {
  onClick?: (event: MouseEvent) => void
  onPointerDown?: (event: PointerEvent) => void
  onPointerMove?: (event: PointerEvent) => void
  onPointerUp?: (event: PointerEvent) => void
  onPointerCancel?: (event: PointerEvent) => void
  onContextMenu?: (event: MouseEvent) => void
}

/**
 * Hover on a pointer that can hover. On a touch screen a tap opens the same
 * tip; `longPress` waits for a hold, for text that a tap would otherwise act on.
 */
export function HoverTooltip({
  content,
  children,
  longPress = false,
  sideOffset = 6,
}: {
  content: ReactNode
  children: ReactElement<TriggerProps>
  longPress?: boolean
  sideOffset?: number
}) {
  const coarse = useCoarsePointer()
  const [open, setOpen] = useState(false)
  const press = useLongPress(() => setOpen(true), coarse && longPress)

  const trigger = cloneElement(children, {
    onPointerDown: (event) => {
      children.props.onPointerDown?.(event)
      press.onPointerDown(event)
    },
    onPointerMove: (event) => {
      children.props.onPointerMove?.(event)
      press.onPointerMove(event)
    },
    onPointerUp: (event) => {
      children.props.onPointerUp?.(event)
      press.onPointerUp()
    },
    onPointerCancel: (event) => {
      children.props.onPointerCancel?.(event)
      press.onPointerCancel()
    },
    onContextMenu: (event) => {
      children.props.onContextMenu?.(event)
      press.onContextMenu(event)
    },
    onClick: (event) => {
      if (longPress && press.consumeHeld()) {
        event.preventDefault()
        return
      }
      children.props.onClick?.(event)
      if (coarse && !longPress) {
        setOpen((current) => !current)
      }
    },
  })

  return (
    <Tooltip
      open={open}
      onOpenChange={(next) => {
        if (coarse && next) {
          return
        }
        setOpen(next)
      }}
    >
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent sideOffset={sideOffset}>{content}</TooltipContent>
    </Tooltip>
  )
}
