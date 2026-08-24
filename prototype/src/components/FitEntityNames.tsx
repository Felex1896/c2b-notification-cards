import { useLayoutEffect, useRef, useState } from "react"

import type { EntityFitCell } from "@/lib/rules"

let measureCtx: CanvasRenderingContext2D | null = null

function textWidth(text: string, font: string): number {
  if (!measureCtx) {
    measureCtx = document.createElement("canvas").getContext("2d")
  }
  if (!measureCtx) {
    return text.length * 8
  }
  measureCtx.font = font
  return measureCtx.measureText(text).width
}

export function FitEntityNames({ cell }: { cell: EntityFitCell }) {
  if (cell.kind === "all") {
    return <>All</>
  }
  if (cell.names.length === 0) {
    return null
  }
  return <FitNames names={cell.names} />
}

function FitNames({ names }: { names: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(names.length)
  const joined = names.join("\0")

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    const measure = () => {
      const width = el.clientWidth
      if (width === 0) {
        return
      }
      const font = getComputedStyle(el).font
      let used = 0
      let fit = 0
      for (let i = 0; i < names.length; i += 1) {
        const piece = i === 0 ? names[i] : `, ${names[i]}`
        const remaining = names.length - (i + 1)
        const plus = remaining > 0 ? textWidth(` +${remaining}`, font) : 0
        const next = used + textWidth(piece, font)
        if (next + plus <= width || (fit === 0 && remaining === 0)) {
          used = next
          fit = i + 1
        } else if (fit === 0) {
          fit = 1
          break
        } else {
          break
        }
      }
      setCount(fit)
    }

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    measure()
    return () => observer.disconnect()
  }, [joined, names])

  const shown = names.slice(0, count)
  const rest = names.length - shown.length

  return (
    <div
      ref={ref}
      className="flex min-w-0 items-baseline overflow-hidden whitespace-nowrap"
    >
      <span className="min-w-0 truncate">{shown.join(", ")}</span>
      {rest > 0 ? <span className="shrink-0">&nbsp;+{rest}</span> : null}
    </div>
  )
}
