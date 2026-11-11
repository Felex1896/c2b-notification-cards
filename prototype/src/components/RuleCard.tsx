import type { LucideIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useId, useRef, type ReactNode } from "react"

import { RuleCardFace } from "@/components/RuleCardFace"
import { RuleModal } from "@/components/RuleModal"
import type { ConnectionKind } from "@/lib/connections"
import type { RuleCardStatus } from "@/lib/rule-card"
import type { Channels } from "@/lib/rules"

type RuleCardControls = {
  expanded: boolean
  sending: boolean
  status: RuleCardStatus
  channels: Channels
  open: () => void
  cancel: () => void
  apply: () => void
  toggleSending: (on: boolean) => void
  setChannels: (channels: Channels) => void
}

type RuleCardProps = {
  icon: LucideIcon
  title: string
  meaning: string
  card: RuleCardControls
  onConnectChannel: (kind: ConnectionKind) => void
  /** Rendered in the open header, above the scroll. */
  pinned?: ReactNode
  children: ReactNode
}

/** One rule: a card in the grid that grows into a modal and back. */
export function RuleCard({
  icon,
  title,
  meaning,
  card,
  onConnectChannel,
  pinned,
  children,
}: RuleCardProps) {
  const layoutId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <DialogPrimitive.Root
      open={card.expanded}
      onOpenChange={(next) => (next ? undefined : card.cancel())}
    >
      <RuleCardFace
        layoutId={layoutId}
        icon={icon}
        title={title}
        meaning={meaning}
        expanded={card.expanded}
        sending={card.sending}
        status={card.status}
        channels={card.channels}
        buttonRef={buttonRef}
        onOpen={card.open}
        onToggleSending={card.toggleSending}
        onChannels={card.setChannels}
        onConnectChannel={onConnectChannel}
      />
      <RuleModal
        open={card.expanded}
        layoutId={layoutId}
        icon={icon}
        title={title}
        meaning={meaning}
        sending={card.sending}
        onCancel={card.cancel}
        onApply={card.apply}
        onReturnFocus={() => buttonRef.current?.focus()}
        pinned={pinned}
      >
        {children}
      </RuleModal>
    </DialogPrimitive.Root>
  )
}
