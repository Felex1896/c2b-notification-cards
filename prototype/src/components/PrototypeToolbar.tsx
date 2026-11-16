import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { usePrototype } from "@/hooks/use-prototype"
import { cn } from "@/lib/utils"

const DRAG_PX = 24

export function PrototypeToolbar() {
  const { t } = useTranslation()
  const { skin, setSkin } = useTheme()
  const { startOver, clientsLoaded, alertsSetUp } = usePrototype()
  const [open, setOpen] = useState(false)
  const startY = useRef<number | null>(null)
  const dragged = useRef(false)

  function choose(action: () => void) {
    action()
    setOpen(false)
  }

  function onSkin(next: string) {
    setSkin(next === "sandbox" ? "sandbox" : "brand")
    setOpen(false)
  }

  return (
    <>
      <div className="border-b border-border bg-background md:hidden">
        <button
          type="button"
          data-touch-drag=""
          aria-expanded={open}
          className="flex h-10 w-full flex-col items-center justify-center gap-1 text-sm text-muted-foreground"
          onPointerDown={(event) => {
            if (event.button !== 0) {
              return
            }
            startY.current = event.clientY
            dragged.current = false
            const onMove = (ev: PointerEvent) => {
              if (startY.current === null) {
                return
              }
              const delta = ev.clientY - startY.current
              if (Math.abs(delta) < DRAG_PX) {
                return
              }
              dragged.current = true
              setOpen(delta > 0)
            }
            const onEnd = () => {
              startY.current = null
              window.removeEventListener("pointermove", onMove)
              window.removeEventListener("pointerup", onEnd)
              window.removeEventListener("pointercancel", onEnd)
              window.setTimeout(() => {
                dragged.current = false
              }, 0)
            }
            window.addEventListener("pointermove", onMove)
            window.addEventListener("pointerup", onEnd)
            window.addEventListener("pointercancel", onEnd)
          }}
          onClick={() => {
            if (dragged.current) {
              dragged.current = false
              return
            }
            setOpen((current) => !current)
          }}
        >
          <span>{t("toolbar.settings")}</span>
          <span
            aria-hidden
            className="h-1 w-9 rounded-full bg-current opacity-60"
          />
        </button>
        <div
          className={cn(
            "overflow-hidden transition-[max-height] duration-200",
            open ? "max-h-80" : "max-h-0"
          )}
          inert={!open}
        >
          <div className="flex flex-col gap-2 px-4 pt-1 pb-3">
            <ToolbarActions
              skin={skin}
              onStartOver={() => choose(startOver)}
              onClientsLoaded={() => choose(clientsLoaded)}
              onAlertsSetUp={() => choose(alertsSetUp)}
              onSkin={onSkin}
              stacked
            />
          </div>
        </div>
      </div>
      <div className="hidden flex-wrap items-center gap-3 border-b border-border bg-background px-4 py-2 text-sm text-foreground md:flex">
        <span className="text-muted-foreground">{t("toolbar.label")}</span>
        <ToolbarActions
          skin={skin}
          onStartOver={startOver}
          onClientsLoaded={clientsLoaded}
          onAlertsSetUp={alertsSetUp}
          onSkin={(next) => setSkin(next === "sandbox" ? "sandbox" : "brand")}
        />
      </div>
    </>
  )
}

function ToolbarActions({
  skin,
  onStartOver,
  onClientsLoaded,
  onAlertsSetUp,
  onSkin,
  stacked = false,
}: {
  skin: "brand" | "sandbox"
  onStartOver: () => void
  onClientsLoaded: () => void
  onAlertsSetUp: () => void
  onSkin: (next: string) => void
  stacked?: boolean
}) {
  const { t } = useTranslation()

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(stacked && "w-full")}
        onClick={onStartOver}
      >
        {t("toolbar.startOver")}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(stacked && "w-full")}
        onClick={onClientsLoaded}
      >
        {t("toolbar.clientsLoaded")}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(stacked && "w-full")}
        onClick={onAlertsSetUp}
      >
        {t("toolbar.alertsSetUp")}
      </Button>
      <label
        className={cn("flex items-center gap-2", stacked && "w-full text-sm")}
      >
        {t("toolbar.skin")}
        <select
          value={skin}
          className={cn(stacked && "min-w-0 flex-1")}
          onChange={(event) => onSkin(event.target.value)}
        >
          <option value="brand">{t("toolbar.skin.brand")}</option>
          <option value="sandbox">{t("toolbar.skin.sandbox")}</option>
        </select>
      </label>
    </>
  )
}
