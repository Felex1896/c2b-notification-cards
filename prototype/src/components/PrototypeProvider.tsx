import { useEffect, useReducer, useState, type ReactNode } from "react"

import { PrototypeContext } from "@/hooks/use-prototype"
import { isUploadSyncing } from "@/lib/client-list"
import { prototypeReducer, startOver } from "@/lib/prototype-state"

const TICK_MS = 150

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(prototypeReducer, undefined, startOver)
  const [now, setNow] = useState(Date.now)

  // Sync is computed from each upload's start and `now`, so it survives tab
  // and brand switches. The clock only runs while something is syncing.
  const syncing = Object.values(state.brands).some(
    (brand) => brand.upload !== null && isUploadSyncing(brand.upload, now)
  )
  useEffect(() => {
    if (!syncing) {
      return
    }
    const id = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(id)
  }, [syncing])

  return (
    <PrototypeContext.Provider value={{ state, dispatch, now }}>
      {children}
    </PrototypeContext.Provider>
  )
}
