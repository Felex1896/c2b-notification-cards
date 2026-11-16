import { useEffect, useRef, type MouseEvent, type PointerEvent } from "react"

import { TOUCH_HOLD_MS, TOUCH_SLOP_PX } from "@/lib/touch-tap"

/**
 * A finger hold. A mouse never starts it, and a small move cancels it,
 * so a scroll does not count as a long tap.
 */
export function useLongPress(onHold: () => void, enabled: boolean) {
  const timer = useRef<number | null>(null)
  const origin = useRef<{ x: number; y: number } | null>(null)
  const host = useRef<HTMLElement | null>(null)
  const held = useRef(false)
  const onHoldRef = useRef(onHold)

  useEffect(() => {
    onHoldRef.current = onHold
  }, [onHold])

  useEffect(() => {
    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current)
      }
    }
  }, [])

  function clear() {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    origin.current = null
    host.current?.removeAttribute("data-touch-held")
    host.current = null
  }

  return {
    /** True once, after a hold that already fired. The click that follows is not a tap. */
    consumeHeld() {
      const wasHeld = held.current
      held.current = false
      return wasHeld
    },
    onPointerDown(event: PointerEvent) {
      if (!enabled || event.pointerType === "mouse") {
        return
      }
      held.current = false
      clear()
      origin.current = { x: event.clientX, y: event.clientY }
      const pressed = event.currentTarget
      timer.current = window.setTimeout(() => {
        held.current = true
        if (pressed instanceof HTMLElement) {
          host.current = pressed
          pressed.setAttribute("data-touch-held", "")
        }
        onHoldRef.current()
      }, TOUCH_HOLD_MS)
    },
    onPointerMove(event: PointerEvent) {
      const start = origin.current
      if (!start) {
        return
      }
      const dx = event.clientX - start.x
      const dy = event.clientY - start.y
      if (dx * dx + dy * dy > TOUCH_SLOP_PX * TOUCH_SLOP_PX) {
        clear()
      }
    },
    onPointerUp() {
      clear()
    },
    onPointerCancel() {
      clear()
    },
    onContextMenu(event: MouseEvent) {
      if (enabled) {
        event.preventDefault()
      }
    },
  }
}
