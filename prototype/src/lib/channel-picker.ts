import type { ConnectionKind } from "@/lib/connections"
import type { Channels } from "@/lib/rules"

/** Slack, Telegram, Email — the only order pickers and tabs use. */
export const CHANNEL_ORDER = ["slack", "telegram", "email"] as const

const FIELD = {
  slack: "slackChatId",
  telegram: "telegramChatId",
  email: "emailId",
} as const satisfies Record<ConnectionKind, keyof Channels>

export type ChannelTabMode = "connect" | "manage"

export function channelId(
  channels: Channels,
  kind: ConnectionKind
): string | null {
  return channels[FIELD[kind]]
}

/** Writes one messenger and leaves the other two as they were. */
export function channelsWith(
  channels: Channels,
  kind: ConnectionKind,
  id: string | null
): Channels {
  return { ...channels, [FIELD[kind]]: id }
}

/**
 * Nothing connected → connect steps. A card's Connect forces those steps
 * even when the messenger already has items. Otherwise the tab is the list.
 */
export function channelTabMode(
  connectedCount: number,
  forceConnect: boolean
): ChannelTabMode {
  if (forceConnect || connectedCount === 0) {
    return "connect"
  }
  return "manage"
}
