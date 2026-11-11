import { useTranslation } from "react-i18next"

import { DialogCloseButton } from "@/components/DialogCloseButton"
import { SampleFileButtons } from "@/components/SampleFileButtons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { SampleFileId } from "@/data/wallet-types"
import { usePrototype } from "@/hooks/use-prototype"

export function UploadDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const { activeBrandName, upload, uploadSample } = usePrototype()

  const pick = (file: SampleFileId) => {
    onOpenChange(false)
    uploadSample(file)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full sm:max-w-[560px]"
      >
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle>{t("upload.title")}</DialogTitle>
            <DialogCloseButton inline />
          </div>
          <DialogDescription>
            {upload
              ? t("upload.replace", { brand: activeBrandName })
              : t("upload.first")}
          </DialogDescription>
        </DialogHeader>
        <div className="rule-card-layer rounded-table-header p-4">
          <SampleFileButtons onPick={pick} />
        </div>
        <div className="flex justify-end">
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              {t("common.close")}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
