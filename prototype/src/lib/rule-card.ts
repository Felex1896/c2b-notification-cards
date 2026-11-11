import { emptyChannels, hasAnyChat, type Channels } from "@/lib/rules"

export type RuleCardState<T> = {
  expanded: boolean
  sending: boolean
  applied: T | null
  draft: T
  showErrors: boolean
  /** Live chats for this card. Not part of the draft, not applied with Apply. */
  channels: Channels
}

export type RuleCardKind<T> = {
  createEmpty: () => T
  /** Fresh object, idempotent, safe to call on both Apply and Cancel. */
  commit: (value: T) => T
  isComplete: (value: T) => boolean
}

export type DraftUpdate<T> = T | ((current: T) => T)

export type RuleCardStatus = {
  /** The applied value exists and is complete. The draft does not count. */
  complete: boolean
  sendable: boolean
  blockedReason: "setUpFirst" | "chooseChat" | null
}

export function emptyRuleCard<T>(kind: RuleCardKind<T>): RuleCardState<T> {
  return {
    expanded: false,
    sending: false,
    applied: null,
    draft: kind.createEmpty(),
    showErrors: false,
    channels: emptyChannels(),
  }
}

export function ruleCardStatus<T>(
  state: RuleCardState<T>,
  kind: RuleCardKind<T>
): RuleCardStatus {
  const complete = state.applied !== null && kind.isComplete(state.applied)
  const sendable = complete && hasAnyChat(state.channels)
  if (!complete) {
    return { complete, sendable, blockedReason: "setUpFirst" }
  }
  if (!sendable) {
    return { complete, sendable, blockedReason: "chooseChat" }
  }
  return { complete, sendable, blockedReason: null }
}

export function openRuleCard<T>(
  state: RuleCardState<T>,
  kind: RuleCardKind<T>
): RuleCardState<T> {
  if (state.expanded) {
    return state
  }
  const showErrors = state.applied !== null && !kind.isComplete(state.applied)
  return { ...state, expanded: true, showErrors }
}

export function setRuleCardDraft<T>(
  state: RuleCardState<T>,
  next: DraftUpdate<T>
): RuleCardState<T> {
  const draft =
    typeof next === "function" ? (next as (current: T) => T)(state.draft) : next
  return { ...state, draft }
}

export function cancelRuleCard<T>(
  state: RuleCardState<T>,
  kind: RuleCardKind<T>
): RuleCardState<T> {
  return {
    ...state,
    draft: state.applied ? kind.commit(state.applied) : kind.createEmpty(),
    showErrors: false,
    expanded: false,
  }
}

/** Always commits and closes. Sending stays off unless the card stays sendable. */
export function applyRuleCard<T>(
  state: RuleCardState<T>,
  kind: RuleCardKind<T>
): RuleCardState<T> {
  const next = kind.commit(state.draft)
  const sendable = kind.isComplete(next) && hasAnyChat(state.channels)
  return {
    expanded: false,
    sending: sendable && state.sending,
    applied: next,
    draft: next,
    showErrors: false,
    channels: state.channels,
  }
}

/** No-op unless the applied value is complete and the card has a chat. */
export function toggleRuleCardSending<T>(
  state: RuleCardState<T>,
  kind: RuleCardKind<T>,
  on: boolean
): RuleCardState<T> {
  if (!ruleCardStatus(state, kind).sendable || state.sending === on) {
    return state
  }
  return { ...state, sending: on }
}

/** Live update. The last chat leaving forces sending off and does not turn it on. */
export function setRuleCardChannels<T>(
  state: RuleCardState<T>,
  channels: Channels
): RuleCardState<T> {
  const sending = hasAnyChat(channels) && state.sending
  if (
    state.sending === sending &&
    state.channels.slackChatId === channels.slackChatId &&
    state.channels.telegramChatId === channels.telegramChatId &&
    state.channels.emailId === channels.emailId
  ) {
    return state
  }
  return { ...state, channels, sending }
}
