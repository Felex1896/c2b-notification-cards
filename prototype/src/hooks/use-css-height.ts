import { useLayoutEffect, useRef } from "react"

/** Writes this element's height onto `<html>` so sticky siblings can sit below it. */
export function useCssHeight(name: "--chrome-height" | "--band-height") {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) {
      return
    }

    const apply = () => {
      document.documentElement.style.setProperty(name, `${node.offsetHeight}px`)
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(node)
    return () => {
      observer.disconnect()
      document.documentElement.style.setProperty(name, "0px")
    }
  }, [name])

  return ref
}
