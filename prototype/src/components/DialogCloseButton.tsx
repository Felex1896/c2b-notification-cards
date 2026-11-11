import { XIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { DialogClose } from "@/components/ui/dialog"

/** The corner cross of `DialogContent`, with a translated label. */
export function DialogCloseButton({ inline = false }: { inline?: boolean }) {
  const { t } = useTranslation()

  return (
    <DialogClose asChild>
      <Button
        variant="ghost"
        size="icon"
        className={inline ? "size-10 shrink-0" : "absolute size-10"}
      >
        <XIcon className="size-6" />
        <span className="sr-only">{t("common.close")}</span>
      </Button>
    </DialogClose>
  )
}
