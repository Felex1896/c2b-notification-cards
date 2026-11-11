import { useState } from "react"
import { useTranslation } from "react-i18next"

import { ChannelConnect } from "@/components/ConnectionDialog"
import { DialogCloseButton } from "@/components/DialogCloseButton"
import { ManageConnections } from "@/components/ManageConnections"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePrototype } from "@/hooks/use-prototype"
import type { MessageKey } from "@/i18n/keys"
import { CHANNEL_ORDER, channelTabMode } from "@/lib/channel-picker"
import type { ConnectionKind } from "@/lib/connections"

const LABELS: Record<ConnectionKind, MessageKey> = {
  slack: "channels.slack",
  telegram: "channels.telegram",
  email: "channels.email",
}

function isKind(value: string): value is ConnectionKind {
  return (CHANNEL_ORDER as readonly string[]).includes(value)
}

/**
 * One dialog, three tabs. A tab with items shows the list; an empty tab shows
 * its connect steps. `chooseFor` forces those steps on the tab a card asked
 * for, and Done reports the new item so that card can choose it.
 */
export function ChannelsDialog({
  initialTab,
  chooseFor,
  onChoose,
  onClose,
}: {
  initialTab: ConnectionKind
  chooseFor: ConnectionKind | null
  onChoose: (id: string) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { connections } = usePrototype()
  const [tab, setTab] = useState(initialTab)
  const [adding, setAdding] = useState<ConnectionKind | null>(null)

  const finish = (kind: ConnectionKind, chosen: string | null) => {
    if (chooseFor === kind) {
      if (chosen) {
        onChoose(chosen)
      }
      onClose()
      return
    }
    setAdding((current) => (current === kind ? null : current))
  }

  const cancel = (kind: ConnectionKind) => {
    if (adding === kind) {
      setAdding(null)
      return
    }
    onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent
        showCloseButton={false}
        className="channels-dialog flex w-full flex-col gap-5 sm:max-w-[560px]"
      >
        <div className="flex items-center justify-between px-6 pt-6">
          <DialogTitle>{t("channels.dialogTitle")}</DialogTitle>
          <DialogCloseButton inline />
        </div>
        <Tabs
          value={tab}
          onValueChange={(value) => {
            if (isKind(value)) {
              setTab(value)
            }
          }}
          className="flex min-h-0 flex-1 flex-col gap-4"
        >
          <TabsList className="mx-2 w-auto">
            {CHANNEL_ORDER.map((kind) => (
              <TabsTrigger key={kind} value={kind}>
                {t(LABELS[kind])}
              </TabsTrigger>
            ))}
          </TabsList>
          {CHANNEL_ORDER.map((kind) => {
            const mode = channelTabMode(
              connections[kind].length,
              chooseFor === kind || adding === kind
            )
            return (
              <TabsContent
                key={kind}
                value={kind}
                className="mx-2 flex min-h-0 flex-1 flex-col"
              >
                {mode === "manage" ? (
                  <ManageConnections
                    kind={kind}
                    onAdd={() => setAdding(kind)}
                  />
                ) : (
                  <ChannelConnect
                    kind={kind}
                    onDone={(chosen) => finish(kind, chosen)}
                  />
                )}
              </TabsContent>
            )
          })}
        </Tabs>
        <div className="flex justify-end px-6 pb-6">
          <Button type="button" variant="ghost" onClick={() => cancel(tab)}>
            {t("common.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
