import {
  applyRuleCard,
  cancelRuleCard,
  emptyRuleCard,
  openRuleCard,
  setRuleCardChannels,
  setRuleCardDraft,
  toggleRuleCardSending,
  type DraftUpdate,
  type RuleCardKind,
  type RuleCardState,
} from "@/lib/rule-card"
import {
  commitBalance,
  commitEntity,
  commitFirstDeposit,
  emptyBalance,
  emptyEntity,
  emptyFirstDeposit,
  isBalanceComplete,
  isEntityComplete,
  isFirstDepositComplete,
  type BalanceValues,
  type Channels,
  type EntityValues,
  type FirstDepositValues,
} from "@/lib/rules"

export type CardValues = {
  balance: BalanceValues
  withdrawal: EntityValues
  deposit: EntityValues
  firstDeposit: FirstDepositValues
}

export type CardKey = keyof CardValues

export type BrandCards = { [K in CardKey]: RuleCardState<CardValues[K]> }

export const CARD_KINDS: { [K in CardKey]: RuleCardKind<CardValues[K]> } = {
  balance: {
    createEmpty: emptyBalance,
    commit: commitBalance,
    isComplete: isBalanceComplete,
  },
  withdrawal: {
    createEmpty: emptyEntity,
    commit: commitEntity,
    isComplete: isEntityComplete,
  },
  deposit: {
    createEmpty: emptyEntity,
    commit: commitEntity,
    isComplete: isEntityComplete,
  },
  firstDeposit: {
    createEmpty: emptyFirstDeposit,
    commit: commitFirstDeposit,
    isComplete: isFirstDepositComplete,
  },
}

export function emptyCards(): BrandCards {
  return {
    balance: emptyRuleCard(CARD_KINDS.balance),
    withdrawal: emptyRuleCard(CARD_KINDS.withdrawal),
    deposit: emptyRuleCard(CARD_KINDS.deposit),
    firstDeposit: emptyRuleCard(CARD_KINDS.firstDeposit),
  }
}

export type CardOp<T> =
  | { kind: "open" }
  | { kind: "cancel" }
  | { kind: "apply" }
  | { kind: "toggleSending"; on: boolean }
  | { kind: "setDraft"; next: DraftUpdate<T> }
  | { kind: "setChannels"; channels: Channels }

export type CardAction = {
  [K in CardKey]: {
    type: "card"
    brand: string
    card: K
    op: CardOp<CardValues[K]>
  }
}[CardKey]

function runCardOp<T>(
  state: RuleCardState<T>,
  kind: RuleCardKind<T>,
  op: CardOp<T>
): RuleCardState<T> {
  switch (op.kind) {
    case "open":
      return openRuleCard(state, kind)
    case "cancel":
      return cancelRuleCard(state, kind)
    case "apply":
      return applyRuleCard(state, kind)
    case "toggleSending":
      return toggleRuleCardSending(state, kind, op.on)
    case "setDraft":
      return setRuleCardDraft(state, op.next)
    case "setChannels":
      return setRuleCardChannels(state, op.channels)
  }
}

export function cardsAfter(cards: BrandCards, action: CardAction): BrandCards {
  switch (action.card) {
    case "balance":
      return {
        ...cards,
        balance: runCardOp(cards.balance, CARD_KINDS.balance, action.op),
      }
    case "withdrawal":
      return {
        ...cards,
        withdrawal: runCardOp(
          cards.withdrawal,
          CARD_KINDS.withdrawal,
          action.op
        ),
      }
    case "deposit":
      return {
        ...cards,
        deposit: runCardOp(cards.deposit, CARD_KINDS.deposit, action.op),
      }
    case "firstDeposit":
      return {
        ...cards,
        firstDeposit: runCardOp(
          cards.firstDeposit,
          CARD_KINDS.firstDeposit,
          action.op
        ),
      }
  }
}
