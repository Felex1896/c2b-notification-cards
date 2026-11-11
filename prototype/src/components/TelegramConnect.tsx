import { useEffect, useState } from "react"
import { CopyIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { ConnectStepsProps } from "@/components/ConnectionDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TELEGRAM_BOT, TELEGRAM_CONNECT_COMMAND } from "@/data/catalog"
import { usePrototype } from "@/hooks/use-prototype"
import { nextTelegramGroup } from "@/lib/connections"

const WAIT_MS = 1500

function CopyLine({ text, label }: { text: string; label: string }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <Input readOnly value={text} aria-label={label} className="flex-1" />
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          void navigator.clipboard?.writeText(text)?.catch(() => undefined)
        }}
      >
        <CopyIcon />
        {t("common.copy")}
      </Button>
    </div>
  )
}

export function TelegramConnect({ onDone }: ConnectStepsProps) {
  const { t } = useTranslation()
  const { connections, connect } = usePrototype()
  const [stage, setStage] = useState<"steps" | "waiting" | "found">("steps")
  const group = nextTelegramGroup(connections)

  useEffect(() => {
    if (stage !== "waiting") {
      return
    }
    const id = setTimeout(() => setStage("found"), WAIT_MS)
    return () => clearTimeout(id)
  }, [stage])

  if (stage === "steps") {
    return (
      <div className="flex flex-col">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-2">
            <p>{t("telegram.addBot", { bot: TELEGRAM_BOT })}</p>
            <CopyLine
              text={TELEGRAM_BOT}
              label={t("telegram.addBot", { bot: TELEGRAM_BOT })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p>
              {t("telegram.sendCommand", { command: TELEGRAM_CONNECT_COMMAND })}
            </p>
            <CopyLine
              text={TELEGRAM_CONNECT_COMMAND}
              label={t("telegram.sendCommand", {
                command: TELEGRAM_CONNECT_COMMAND,
              })}
            />
          </div>
        </div>
        <div className="px-4 pb-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setStage("waiting")}
          >
            {t("telegram.sent")}
          </Button>
        </div>
      </div>
    )
  }

  if (stage === "waiting") {
    return <p className="p-4 text-muted-foreground">{t("telegram.looking")}</p>
  }

  if (!group) {
    return (
      <div className="flex flex-col">
        <p className="p-4">{t("telegram.notFound")}</p>
        <div className="px-4 pb-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => onDone(null)}
          >
            {t("common.done")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <p className="p-4">{t("telegram.found", { group: group.name })}</p>
      <div className="px-4 pb-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            connect("telegram", [group.id])
            onDone(group.id)
          }}
        >
          {t("common.done")}
        </Button>
      </div>
    </div>
  )
}
