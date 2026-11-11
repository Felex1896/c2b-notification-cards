import { ArrowRight } from "lucide-react"
import { useTranslation } from "react-i18next"

import { NotInPrototype } from "@/components/NotInPrototype"
import { Button } from "@/components/ui/button"

/** Pinned to the visible right edge. Hover explains it; click says it is not built. */
export function RowDetailsButton() {
  const { t } = useTranslation()

  return (
    <NotInPrototype hoverLabel={t("clients.row.details")}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t("clients.row.details")}
        className="bg-background/30 opacity-0 shadow-none backdrop-blur-md group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-background/30 focus-visible:opacity-100 data-notice:opacity-100"
      >
        <ArrowRight />
      </Button>
    </NotInPrototype>
  )
}
