import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react"

import {
  hasHorizontalOverflow,
  scrollbarThumb,
  scrollLimit,
  syncedScrollLeft,
} from "@/lib/table-scroll"

type Pane = { contentWidth: number; paneWidth: number }

type Nodes = {
  header: HTMLDivElement | null
  body: HTMLDivElement | null
  bar: HTMLDivElement | null
}

const EMPTY: Pane = { contentWidth: 0, paneWidth: 0 }

/**
 * The header cannot live inside the rows' horizontal scroller: `sticky` `top`
 * would then stick to that scroller instead of the window. This hook keeps
 * the header, the rows and the bottom bar on one scrollLeft.
 */
export function useSyncedScroll() {
  const nodes = useRef<Nodes>({ header: null, body: null, bar: null })
  const [pane, setPane] = useState<Pane>(EMPTY)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [link, setLink] = useState(0)
  const paneRef = useRef(pane)
  const scrollLeftRef = useRef(0)

  useLayoutEffect(() => {
    paneRef.current = pane
  }, [pane])

  const attach = useCallback(
    (key: keyof Nodes, node: HTMLDivElement | null) => {
      if (nodes.current[key] === node) {
        return
      }
      nodes.current[key] = node
      setLink((count) => count + 1)
    },
    []
  )

  const headerRef = useCallback(
    (node: HTMLDivElement | null) => attach("header", node),
    [attach]
  )
  const bodyRef = useCallback(
    (node: HTMLDivElement | null) => attach("body", node),
    [attach]
  )
  const barRef = useCallback(
    (node: HTMLDivElement | null) => attach("bar", node),
    [attach]
  )

  useLayoutEffect(() => {
    const { header, body, bar } = nodes.current
    if (!body) {
      return undefined
    }

    let lock = false
    const publish = (from: HTMLElement) => {
      if (lock) {
        return
      }
      const next = syncedScrollLeft(
        from.scrollLeft,
        scrollLimit(body.scrollWidth, body.clientWidth)
      )
      lock = true
      for (const node of [header, body, bar]) {
        if (node && node !== from && node.scrollLeft !== next) {
          node.scrollLeft = next
        }
      }
      lock = false
      scrollLeftRef.current = next
      setScrollLeft((current) => (current === next ? current : next))
    }

    const onScroll = (event: Event) => {
      if (event.currentTarget instanceof HTMLElement) {
        publish(event.currentTarget)
      }
    }

    const onHeaderWheel = (event: WheelEvent) => {
      const delta =
        event.deltaX !== 0 ? event.deltaX : event.shiftKey ? event.deltaY : 0
      if (delta === 0) {
        return
      }
      body.scrollLeft += delta
    }

    const measure = () => {
      const contentWidth = body.scrollWidth
      const paneWidth = body.clientWidth
      setPane((current) =>
        current.contentWidth === contentWidth && current.paneWidth === paneWidth
          ? current
          : { contentWidth, paneWidth }
      )
      publish(body)
    }

    // The Client ID label sits beside the scroller; the wheel still moves the rows.
    const wheelTarget = header?.parentElement ?? header
    body.addEventListener("scroll", onScroll, { passive: true })
    bar?.addEventListener("scroll", onScroll, { passive: true })
    wheelTarget?.addEventListener("wheel", onHeaderWheel, { passive: true })

    // Layout, not only the observer: the bar's width has to be right before paint.
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(body)
    const table = body.querySelector("table")
    if (table) {
      observer.observe(table)
    }

    return () => {
      body.removeEventListener("scroll", onScroll)
      bar?.removeEventListener("scroll", onScroll)
      wheelTarget?.removeEventListener("wheel", onHeaderWheel)
      observer.disconnect()
    }
  }, [link])

  const onThumbPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return
      }
      event.preventDefault()
      const handle = event.currentTarget
      handle.setPointerCapture(event.pointerId)
      const startX = event.clientX
      const startLeft = scrollLeftRef.current
      const { contentWidth, paneWidth } = paneRef.current
      const thumb = scrollbarThumb(contentWidth, paneWidth, startLeft)
      const limit = scrollLimit(contentWidth, paneWidth)
      const travel = Math.max(1, paneWidth - (thumb?.width ?? 0))

      const onMove = (ev: PointerEvent) => {
        const body = nodes.current.body
        if (!body) {
          return
        }
        body.scrollLeft = syncedScrollLeft(
          startLeft + ((ev.clientX - startX) / travel) * limit,
          limit
        )
      }
      const onUp = () => {
        handle.removeEventListener("pointermove", onMove)
        handle.removeEventListener("pointerup", onUp)
      }
      handle.addEventListener("pointermove", onMove)
      handle.addEventListener("pointerup", onUp)
    },
    []
  )

  return {
    headerRef,
    bodyRef,
    barRef,
    contentWidth: pane.contentWidth,
    paneWidth: pane.paneWidth,
    scrollLeft,
    overflow: hasHorizontalOverflow(pane.contentWidth, pane.paneWidth),
    onThumbPointerDown,
  }
}
