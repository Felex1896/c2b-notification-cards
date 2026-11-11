import { useState } from "react"
import { Trans, useTranslation } from "react-i18next"

import type { ConnectStepsProps } from "@/components/ConnectionDialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FieldError, FieldLabel } from "@/components/ui/field"
import { SLACK_WORKSPACE } from "@/data/catalog"
import { usePrototype } from "@/hooks/use-prototype"
import type { MessageKey } from "@/i18n/keys"
import {
  connectableSlackChannels,
  SELECT_AT_LEAST_ONE,
} from "@/lib/connections"

const PERMISSIONS: MessageKey[] = [
  "slack.permission.view",
  "slack.permission.post",
]

export function SlackConnect({ onDone }: ConnectStepsProps) {
  const { t } = useTranslation()
  const { connections, connect } = usePrototype()
  const [allowed, setAllowed] = useState(false)
  const [checked, setChecked] = useState<string[]>([])
  const [showError, setShowError] = useState(false)
  const channels = connectableSlackChannels(connections)

  if (!allowed) {
    return (
      <div className="flex flex-col">
        <div className="flex flex-col gap-4 p-4">
          <p>
            <Trans
              i18nKey="slack.access"
              values={{ workspace: SLACK_WORKSPACE }}
              components={{ bold: <b /> }}
            />
          </p>
          <ul className="list-disc ps-5 text-muted-foreground">
            {PERMISSIONS.map((permission) => (
              <li key={permission}>{t(permission)}</li>
            ))}
          </ul>
        </div>
        <div className="px-4 pb-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setAllowed(true)}
          >
            {t("slack.allow")}
          </Button>
        </div>
      </div>
    )
  }

  if (channels.length === 0) {
    return (
      <div className="flex flex-col">
        <p className="p-4">
          {t("slack.allConnected", { workspace: SLACK_WORKSPACE })}
        </p>
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

  const done = () => {
    if (checked.length === 0) {
      setShowError(true)
      return
    }
    const ordered = channels
      .filter((channel) => checked.includes(channel.id))
      .map((channel) => channel.id)
    connect("slack", ordered)
    onDone(ordered[0])
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 p-4">
        <p>{t("slack.pick")}</p>
        <div className="flex flex-col gap-2">
          {channels.map((channel) => (
            <FieldLabel key={channel.id} className="items-center gap-2">
              <Checkbox
                checked={checked.includes(channel.id)}
                onCheckedChange={(on) =>
                  setChecked((current) =>
                    on
                      ? [...current, channel.id]
                      : current.filter((id) => id !== channel.id)
                  )
                }
              />
              {channel.name}
            </FieldLabel>
          ))}
          <FieldError>
            {showError && checked.length === 0 ? t(SELECT_AT_LEAST_ONE) : null}
          </FieldError>
        </div>
      </div>
      <div className="px-4 pb-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={done}
        >
          {t("common.done")}
        </Button>
      </div>
    </div>
  )
}
