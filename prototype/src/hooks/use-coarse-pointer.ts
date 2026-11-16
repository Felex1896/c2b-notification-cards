import { useEffect, useState } from "react"

const QUERY = "(hover: none), (pointer: coarse)"

/** The primary pointer has no hover, so a tip has to open from a tap. */
export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches
  )

  useEffect(() => {
    const query = window.matchMedia(QUERY)
    const apply = () => setCoarse(query.matches)
    apply()
    query.addEventListener("change", apply)
    return () => query.removeEventListener("change", apply)
  }, [])

  return coarse
}
