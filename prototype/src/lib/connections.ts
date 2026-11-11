import { SLACK_CHATS, TELEGRAM_CHATS, type Chat } from "@/data/catalog"
import type { BrandState, PrototypeState } from "@/lib/prototype-state"
import { setRuleCardChannels, type RuleCardState } from "@/lib/rule-card"
import type { Channels } from "@/lib/rules"

export type ConnectionKind = "slack" | "telegram" | "email"

/** Account-wide: connected once, shared by every brand. */
export type Connections = {
  slack: string[]
  telegram: string[]
  email: string[]
}

export const SELECT_AT_LEAST_ONE = "errors.selectAtLeastOne"
export const INVALID_EMAIL = "errors.invalidEmail"
export const INVALID_CODE = "errors.invalidCode"

export function emptyConnections(): Connections {
  return { slack: [], telegram: [], email: [] }
}

/** Adds the ids to the kind; one already there is not added twice. */
export function addItems(
  connections: Connections,
  kind: ConnectionKind,
  ids: string[]
): Connections {
  const next = [...connections[kind]]
  for (const id of ids) {
    if (!next.includes(id)) {
      next.push(id)
    }
  }
  return { ...connections, [kind]: next }
}

export function hasConnection(
  connections: Connections,
  kind: ConnectionKind
): boolean {
  return connections[kind].length > 0
}

const CATALOGS: Record<"slack" | "telegram", Chat[]> = {
  slack: SLACK_CHATS,
  telegram: TELEGRAM_CHATS,
}

/** Display name of an item; an email's name is its address. */
export function itemName(kind: ConnectionKind, id: string): string {
  if (kind === "email") {
    return id
  }
  return CATALOGS[kind].find((chat) => chat.id === id)?.name ?? id
}

/** Connected items of a kind, in connection order, ready for a picker. */
export function connectedItems(
  connections: Connections,
  kind: ConnectionKind
): Chat[] {
  return connections[kind].map((id) => ({ id, name: itemName(kind, id) }))
}

function chosenId(channels: Channels, kind: ConnectionKind): string | null {
  switch (kind) {
    case "slack":
      return channels.slackChatId
    case "telegram":
      return channels.telegramChatId
    case "email":
      return channels.emailId
  }
}

function cardUsesItem(
  card: RuleCardState<unknown>,
  kind: ConnectionKind,
  id: string
): boolean {
  return chosenId(card.channels, kind) === id
}

function brandUsage(brand: BrandState, kind: ConnectionKind, id: string) {
  const cards: RuleCardState<unknown>[] = [
    brand.cards.balance,
    brand.cards.withdrawal,
    brand.cards.deposit,
    brand.cards.firstDeposit,
  ]
  return cards.filter((card) => cardUsesItem(card, kind, id)).length
}

/**
 * Cards whose live chats choose the item, across every brand.
 * One card counts once.
 */
export function usageCount(
  state: PrototypeState,
  kind: ConnectionKind,
  id: string
): number {
  return Object.values(state.brands).reduce(
    (sum, brand) => sum + brandUsage(brand, kind, id),
    0
  )
}

function clearChosen(
  channels: Channels,
  kind: ConnectionKind,
  id: string
): Channels {
  return {
    slackChatId:
      kind === "slack" && channels.slackChatId === id
        ? null
        : channels.slackChatId,
    telegramChatId:
      kind === "telegram" && channels.telegramChatId === id
        ? null
        : channels.telegramChatId,
    emailId:
      kind === "email" && channels.emailId === id ? null : channels.emailId,
  }
}

function clearCard<T>(
  card: RuleCardState<T>,
  kind: ConnectionKind,
  id: string
): RuleCardState<T> {
  return setRuleCardChannels(card, clearChosen(card.channels, kind, id))
}

function clearBrand(
  brand: BrandState,
  kind: ConnectionKind,
  id: string
): BrandState {
  return {
    ...brand,
    cards: {
      balance: clearCard(brand.cards.balance, kind, id),
      withdrawal: clearCard(brand.cards.withdrawal, kind, id),
      deposit: clearCard(brand.cards.deposit, kind, id),
      firstDeposit: clearCard(brand.cards.firstDeposit, kind, id),
    },
  }
}

/**
 * Drops the connection and clears the item from every card's chats in every
 * brand. A card left with no chat stops sending. Other items stay.
 */
export function removeItem(
  state: PrototypeState,
  kind: ConnectionKind,
  id: string
): PrototypeState {
  return {
    ...state,
    connections: {
      ...state.connections,
      [kind]: state.connections[kind].filter((item) => item !== id),
    },
    brands: Object.fromEntries(
      Object.entries(state.brands).map(([brandId, brand]) => [
        brandId,
        clearBrand(brand, kind, id),
      ])
    ),
  }
}

export function isValidEmail(text: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim())
}

export function isValidCode(text: string): boolean {
  return /^\d{6}$/.test(text)
}

/** The first group in rotation order not yet connected, or none. */
export function nextTelegramGroup(connections: Connections): Chat | null {
  return (
    TELEGRAM_CHATS.find((chat) => !connections.telegram.includes(chat.id)) ??
    null
  )
}

/** Slack channels still connectable: those not yet connected, in list order. */
export function connectableSlackChannels(connections: Connections): Chat[] {
  return SLACK_CHATS.filter((chat) => !connections.slack.includes(chat.id))
}
