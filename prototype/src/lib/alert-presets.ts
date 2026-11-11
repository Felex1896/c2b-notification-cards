import { CATEGORIES } from "@/data/catalog"
import type { BrandCards } from "@/lib/brand-cards"
import { addItems, type Connections } from "@/lib/connections"
import type { BrandState } from "@/lib/prototype-state"
import type { RuleCardState } from "@/lib/rule-card"
import {
  commitBalance,
  commitEntity,
  commitFirstDeposit,
  emptyBalance,
  emptyEntity,
  emptyFirstDeposit,
  subRuleForCategory,
  type BalanceValues,
  type Channels,
  type EntityValues,
  type FirstDepositValues,
} from "@/lib/rules"

/** The three items the "Alerts set up" jump connects and chooses. */
export const PRESET_SLACK = "slack-c2b"
export const PRESET_TELEGRAM = "tg-c2b"
export const PRESET_EMAIL = "alerts@example.com"

export function presetChannels(): Channels {
  return {
    slackChatId: PRESET_SLACK,
    telegramChatId: PRESET_TELEGRAM,
    emailId: PRESET_EMAIL,
  }
}

function brandIdsOf(categoryId: string): string[] {
  return (
    CATEGORIES.find((item) => item.id === categoryId)?.brands.map(
      (brand) => brand.id
    ) ?? []
  )
}

/** Wallet balance: Increase 10000 and Decrease 10000. */
export function presetBalance(): BalanceValues {
  return commitBalance({
    ...emptyBalance(),
    increaseAmount: "10000",
    decreaseAmount: "10000",
  })
}

/** Entity withdrawal: Exchange, all its brands, common minimum 5000. */
export function presetWithdrawal(): EntityValues {
  return commitEntity({
    ...emptyEntity(),
    selectedBrandIds: brandIdsOf("exchange"),
    amount: "5000",
  })
}

/** Entity deposit: Gambling, all its brands, common minimum 1000. */
export function presetDeposit(): EntityValues {
  return commitEntity({
    ...emptyEntity(),
    selectedBrandIds: brandIdsOf("gambling"),
    amount: "1000",
  })
}

/** First deposit: Gambling, all its brands, Turnover on 1000 per month, Balance off. */
export function presetFirstDeposit(): FirstDepositValues {
  return commitFirstDeposit({
    ...emptyFirstDeposit(),
    subRules: [
      {
        ...subRuleForCategory("gambling"),
        turnoverEnabled: true,
        turnoverMin: "1000",
        turnoverPeriod: "month",
        balanceEnabled: false,
        balanceMin: "",
      },
    ],
  })
}

/** Applied, complete, sending on, collapsed, with the three preset chats. */
function appliedCard<T>(commit: (value: T) => T, value: T): RuleCardState<T> {
  const applied = commit(value)
  return {
    expanded: false,
    sending: true,
    applied,
    draft: commit(applied),
    showErrors: false,
    channels: presetChannels(),
  }
}

export function presetCards(): BrandCards {
  return {
    balance: appliedCard(commitBalance, presetBalance()),
    withdrawal: appliedCard(commitEntity, presetWithdrawal()),
    deposit: appliedCard(commitEntity, presetDeposit()),
    firstDeposit: appliedCard(commitFirstDeposit, presetFirstDeposit()),
  }
}

/** Adds the three preset items; one already connected is not added twice. */
export function withPresetItems(connections: Connections): Connections {
  const slack = addItems(connections, "slack", [PRESET_SLACK])
  const telegram = addItems(slack, "telegram", [PRESET_TELEGRAM])
  return addItems(telegram, "email", [PRESET_EMAIL])
}

/** The four rules are the presets, each choosing the three preset chats. */
export function withPresetRules(brand: BrandState): BrandState {
  return { ...brand, cards: presetCards() }
}
