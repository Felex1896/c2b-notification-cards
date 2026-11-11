import { EmailConnect } from "@/components/EmailConnect"
import { SlackConnect } from "@/components/SlackConnect"
import { TelegramConnect } from "@/components/TelegramConnect"
import type { ConnectionKind } from "@/lib/connections"

export type ConnectStepsProps = {
  /** Finished. The id is the item to choose on the card that asked, if any. */
  onDone: (chosen: string | null) => void
}

/** The connect steps for one messenger. Manage and the dialog live outside. */
export function ChannelConnect({
  kind,
  onDone,
}: ConnectStepsProps & { kind: ConnectionKind }) {
  const body =
    kind === "slack" ? (
      <SlackConnect onDone={onDone} />
    ) : kind === "telegram" ? (
      <TelegramConnect onDone={onDone} />
    ) : (
      <EmailConnect onDone={onDone} />
    )
  return (
    <div className="rule-card-layer flex min-h-0 flex-col overflow-hidden rounded-table-header">
      {body}
    </div>
  )
}
