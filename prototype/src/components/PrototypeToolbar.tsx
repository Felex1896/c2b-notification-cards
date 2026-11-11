import { useTranslation } from "react-i18next"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { usePrototype } from "@/hooks/use-prototype"

export function PrototypeToolbar() {
  const { t } = useTranslation()
  const { skin, setSkin } = useTheme()
  const { startOver, clientsLoaded, alertsSetUp } = usePrototype()

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border bg-background px-4 py-2 text-sm text-foreground">
      <span className="text-muted-foreground">{t("toolbar.label")}</span>
      <Button type="button" variant="outline" size="sm" onClick={startOver}>
        {t("toolbar.startOver")}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={clientsLoaded}>
        {t("toolbar.clientsLoaded")}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={alertsSetUp}>
        {t("toolbar.alertsSetUp")}
      </Button>
      <label className="flex items-center gap-2">
        {t("toolbar.skin")}
        <select
          value={skin}
          onChange={(event) =>
            setSkin(event.target.value === "sandbox" ? "sandbox" : "brand")
          }
        >
          <option value="brand">{t("toolbar.skin.brand")}</option>
          <option value="sandbox">{t("toolbar.skin.sandbox")}</option>
        </select>
      </label>
    </div>
  )
}
