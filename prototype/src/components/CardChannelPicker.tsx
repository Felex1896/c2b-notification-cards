import { Check, ChevronDown, Plus, XIcon } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { useTranslation } from "react-i18next"

import {
  HeaderMenuContent,
  HeaderMenuItem,
  HeaderMenuRadioItem,
} from "@/components/HeaderMenu"
import { OverflowText } from "@/components/OverflowText"
import { usePrototype } from "@/hooks/use-prototype"
import type { MessageKey } from "@/i18n/keys"
import { connectedItems, type ConnectionKind } from "@/lib/connections"
import { fieldPrefixClassName } from "@/lib/field-chrome"
import { cn } from "@/lib/utils"

const LABELS: Record<ConnectionKind, MessageKey> = {
  slack: "channels.slack",
  telegram: "channels.telegram",
  email: "channels.email",
}

const triggerClassName =
  "flex h-(--control-height) w-full min-w-0 items-center justify-between gap-1.5 rounded-l-none rounded-r-lg border border-input bg-transparent pr-2 pl-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"

/** One messenger on a card: prefix, dropdown of connected items, Connect. */
export function CardChannelPicker({
  kind,
  value,
  onChange,
  onConnect,
}: {
  kind: ConnectionKind
  value: string | null
  onChange: (id: string | null) => void
  onConnect: () => void
}) {
  const { t } = useTranslation()
  const { connections } = usePrototype()
  const label = t(LABELS[kind])
  const items = connectedItems(connections, kind)
  const chosen = items.find((item) => item.id === value) ?? null

  return (
    <div className="flex min-w-0">
      <span className={fieldPrefixClassName}>{label}</span>
      <DropdownMenu.Root>
        <div className="relative min-w-0 flex-1">
          <DropdownMenu.Trigger asChild>
            <button type="button" className={triggerClassName}>
              <OverflowText
                className={cn(
                  "flex-1 text-left",
                  chosen ? "pr-5" : "text-muted-foreground"
                )}
                text={chosen ? chosen.name : t("common.select")}
              />
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenu.Trigger>
          {chosen ? (
            <button
              type="button"
              aria-label={t("channels.clear", { channel: label })}
              className="absolute top-1/2 right-8 z-10 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground"
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
              }}
              onClick={() => onChange(null)}
            >
              <XIcon className="size-4" />
            </button>
          ) : null}
        </div>
        <HeaderMenuContent
          align="start"
          className="w-(--radix-dropdown-menu-trigger-width)"
        >
          {items.length === 0 ? (
            <p className="px-2.5 py-2 text-sm text-muted-foreground">
              {t("channels.none")}
            </p>
          ) : (
            <DropdownMenu.RadioGroup
              value={chosen ? chosen.id : ""}
              onValueChange={onChange}
            >
              {items.map((item) => (
                <HeaderMenuRadioItem key={item.id} value={item.id}>
                  <OverflowText className="flex-1" text={item.name} />
                  <DropdownMenu.ItemIndicator>
                    <Check />
                  </DropdownMenu.ItemIndicator>
                </HeaderMenuRadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          )}
          <HeaderMenuItem className="mt-1 w-full" onSelect={onConnect}>
            <Plus />
            {t("channels.connectKind", { channel: label })}
          </HeaderMenuItem>
        </HeaderMenuContent>
      </DropdownMenu.Root>
    </div>
  )
}
