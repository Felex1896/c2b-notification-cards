import { Trash2 } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { OverflowText } from "@/components/OverflowText"
import { Button } from "@/components/ui/button"
import { usePrototype } from "@/hooks/use-prototype"
import {
  connectedItems,
  usageCount,
  type ConnectionKind,
} from "@/lib/connections"

export function ManageConnections({
  kind,
  onAdd,
}: {
  kind: ConnectionKind
  onAdd: () => void
}) {
  const { t } = useTranslation()
  const { state, connections, removeConnection } = usePrototype()
  const [confirming, setConfirming] = useState<string | null>(null)
  const items = connectedItems(connections, kind)

  const remove = (id: string) => {
    removeConnection(kind, id)
    setConfirming(null)
  }

  return (
    <div className="rule-card-layer flex max-h-full min-h-0 flex-1 flex-col overflow-hidden rounded-table-header">
      <ul className="flex flex-col overflow-y-auto">
        {items.map((item) => {
          const places = usageCount(state, kind, item.id)
          return (
            <li
              key={item.id}
              className="rule-line flex flex-col gap-2 border-b px-4 py-3 last:border-b-0"
            >
              <div className="flex items-center justify-between gap-3">
                <OverflowText className="flex-1" text={item.name} />
                {confirming === item.id ? null : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("common.remove")}
                    onClick={() =>
                      places === 0 ? remove(item.id) : setConfirming(item.id)
                    }
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
              {confirming === item.id ? (
                <div className="flex flex-col gap-2">
                  <p>{t("connections.usedIn", { count: places })}</p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => remove(item.id)}
                    >
                      {t("common.remove")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setConfirming(null)}
                    >
                      {t("common.cancel")}
                    </Button>
                  </div>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
      <div className="px-4 pb-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onAdd}
        >
          {t("connections.addAnother")}
        </Button>
      </div>
    </div>
  )
}
