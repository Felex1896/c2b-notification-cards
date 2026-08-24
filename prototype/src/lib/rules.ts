import {
  ALL_BRAND_IDS,
  CATEGORIES,
  SLACK_CHATS,
  TELEGRAM_CHATS,
  type Category,
} from "@/data/catalog"

export const NONE = "__none__"
export const REQUIRED = "Required field"
export const SELECT_AT_LEAST = "Select at least 1 option"
export const ADD_CATEGORY = "Add at least one category"
export const RESET_UNIQUE = "Reset unique value"

export type Period = "day" | "week" | "month" | "year"
export type TriState = "none" | "some" | "all"

export type Channels = {
  slackChatId: string | null
  telegramChatId: string | null
}

export type BalanceValues = Channels & {
  increaseEnabled: boolean
  increaseAmount: string
  decreaseEnabled: boolean
  decreaseAmount: string
}

export type EntityValues = Channels & {
  selectedBrandIds: string[]
  amount: string
  categoryAmounts: Record<string, string>
}

export type FirstDepositSubRule = {
  id: string
  categoryId: string
  brandIds: string[]
  turnoverEnabled: boolean
  turnoverMin: string
  turnoverPeriod: Period
  balanceEnabled: boolean
  balanceMin: string
}

export type FirstDepositValues = Channels & {
  subRules: FirstDepositSubRule[]
}

export function emptyChannels(): Channels {
  return { slackChatId: null, telegramChatId: null }
}

export function emptyBalance(): BalanceValues {
  return {
    increaseEnabled: false,
    increaseAmount: "",
    decreaseEnabled: false,
    decreaseAmount: "",
    ...emptyChannels(),
  }
}

export function emptyEntity(): EntityValues {
  return {
    selectedBrandIds: [],
    amount: "",
    categoryAmounts: {},
    ...emptyChannels(),
  }
}

export function subRuleForCategory(categoryId: string): FirstDepositSubRule {
  const category = CATEGORIES.find((item) => item.id === categoryId)
  return {
    id: crypto.randomUUID(),
    categoryId,
    brandIds: category?.brands.map((brand) => brand.id) ?? [],
    turnoverEnabled: false,
    turnoverMin: "",
    turnoverPeriod: "month",
    balanceEnabled: false,
    balanceMin: "",
  }
}

export function emptyFirstDeposit(): FirstDepositValues {
  return {
    subRules: [],
    ...emptyChannels(),
  }
}

/** Fresh object, idempotent, safe to call on both Apply and Cancel. */
export function commitBalance(value: BalanceValues): BalanceValues {
  return { ...value }
}

/** Fresh object, idempotent, safe to call on both Apply and Cancel. */
export function commitEntity(value: EntityValues): EntityValues {
  const categoryAmounts: Record<string, string> = {}
  for (const [id, raw] of Object.entries(value.categoryAmounts)) {
    const committed = commitAmountInput(raw)
    if (committed !== "") {
      categoryAmounts[id] = committed
    }
  }
  return {
    ...value,
    selectedBrandIds: [...value.selectedBrandIds],
    categoryAmounts: pruneCategoryAmounts(
      categoryAmounts,
      value.selectedBrandIds
    ),
  }
}

/** Fresh object, idempotent, safe to call on both Apply and Cancel. */
export function commitSubRule(value: FirstDepositSubRule): FirstDepositSubRule {
  return { ...value, brandIds: [...value.brandIds] }
}

/** Fresh object, idempotent, safe to call on both Apply and Cancel. */
export function commitFirstDeposit(
  value: FirstDepositValues
): FirstDepositValues {
  return {
    ...value,
    subRules: value.subRules
      .filter((row) => row.brandIds.length > 0)
      .map(commitSubRule),
  }
}

export function isPositiveAmount(value: string): boolean {
  const normalized = value.trim().replace(",", ".")
  if (normalized === "") {
    return false
  }
  const amount = Number(normalized)
  return Number.isFinite(amount) && amount > 0
}

/** Digits and one decimal separator. Drops the rest (type, paste, drop). */
export function sanitizeAmountInput(raw: string): string {
  let separator: "." | "," | null = null
  let out = ""
  for (const char of raw) {
    if (char >= "0" && char <= "9") {
      out += char
      continue
    }
    if ((char === "." || char === ",") && separator === null) {
      separator = char
      out += char
    }
  }
  return out
}

/** Empty unless the string is already a positive amount. Trailing `.` / `,` stripped. */
export function commitAmountInput(raw: string): string {
  const trimmed = raw.trim().replace(/[.,]$/, "")
  return isPositiveAmount(trimmed) ? trimmed : ""
}

export function hasAnyChat(channels: Channels): boolean {
  return channels.slackChatId != null || channels.telegramChatId != null
}

export function categoryTriState(
  category: Category,
  selected: ReadonlySet<string>
): TriState {
  const ids = category.brands.map((brand) => brand.id)
  const count = ids.filter((id) => selected.has(id)).length
  if (count === 0) {
    return "none"
  }
  if (count === ids.length) {
    return "all"
  }
  return "some"
}

export function headerTriState(selected: ReadonlySet<string>): TriState {
  const count = ALL_BRAND_IDS.filter((id) => selected.has(id)).length
  if (count === 0) {
    return "none"
  }
  if (count === ALL_BRAND_IDS.length) {
    return "all"
  }
  return "some"
}

export function toChecked(state: TriState): boolean | "indeterminate" {
  if (state === "all") {
    return true
  }
  if (state === "none") {
    return false
  }
  return "indeterminate"
}

export type FieldErrors<T extends string> = Partial<Record<T, string>>

export type BalanceErrorKey = "directions" | "increaseAmount" | "decreaseAmount"

export function balanceErrors(
  values: BalanceValues
): FieldErrors<BalanceErrorKey> {
  if (!values.increaseEnabled && !values.decreaseEnabled) {
    return { directions: SELECT_AT_LEAST }
  }
  return {
    increaseAmount:
      values.increaseEnabled && !isPositiveAmount(values.increaseAmount)
        ? REQUIRED
        : undefined,
    decreaseAmount:
      values.decreaseEnabled && !isPositiveAmount(values.decreaseAmount)
        ? REQUIRED
        : undefined,
  }
}

export function isBalanceValid(values: BalanceValues): boolean {
  const errors = balanceErrors(values)
  return !errors.directions && !errors.increaseAmount && !errors.decreaseAmount
}

export type EntityErrors = FieldErrors<"brands" | "amount">

export function entityErrors(values: EntityValues): EntityErrors {
  return {
    brands: values.selectedBrandIds.length > 0 ? undefined : REQUIRED,
    amount: isPositiveAmount(values.amount) ? undefined : REQUIRED,
  }
}

export function isEntityValid(values: EntityValues): boolean {
  const errors = entityErrors(values)
  return !errors.brands && !errors.amount
}

export function categoryIdsForBrands(
  selectedBrandIds: readonly string[]
): Set<string> {
  const selected = new Set(selectedBrandIds)
  const ids = new Set<string>()
  for (const category of CATEGORIES) {
    if (categoryTriState(category, selected) !== "none") {
      ids.add(category.id)
    }
  }
  return ids
}

export function pruneCategoryAmounts(
  amounts: Record<string, string>,
  selectedBrandIds: readonly string[],
  retainCategoryId?: string | null
): Record<string, string> {
  const kept = categoryIdsForBrands(selectedBrandIds)
  if (retainCategoryId) {
    kept.add(retainCategoryId)
  }
  const next: Record<string, string> = {}
  for (const [id, value] of Object.entries(amounts)) {
    if (kept.has(id)) {
      next[id] = value
    }
  }
  return next
}

export function setCategoryAmount(
  amounts: Record<string, string>,
  categoryId: string,
  value: string
): Record<string, string> {
  const next = { ...amounts }
  if (value.trim() === "") {
    delete next[categoryId]
  } else {
    next[categoryId] = value
  }
  return next
}

export function categoryAmountOverride(
  values: EntityValues,
  categoryId: string
): string | undefined {
  const raw = values.categoryAmounts[categoryId]
  if (raw == null || raw.trim() === "") {
    return undefined
  }
  return raw
}

export function effectiveCategoryAmount(
  values: EntityValues,
  categoryId: string
): string {
  return categoryAmountOverride(values, categoryId) ?? values.amount
}

export type SubRuleErrors = FieldErrors<"brands" | "turnover" | "balance">

export type FirstDepositErrors = {
  categories?: string
  /** Keyed by sub-rule id — rows and errors are never aligned by position. */
  subRules: Record<string, SubRuleErrors>
}

/**
 * The sub-rules that count as clauses. A category holding no brand is on its
 * way off: it only survives while its popover is open.
 */
export function countedSubRules(
  values: FirstDepositValues
): FirstDepositSubRule[] {
  return values.subRules.filter((row) => row.brandIds.length > 0)
}

export function subRuleErrors(value: FirstDepositSubRule): SubRuleErrors {
  return {
    brands: value.brandIds.length > 0 ? undefined : REQUIRED,
    turnover:
      !value.turnoverEnabled || isPositiveAmount(value.turnoverMin)
        ? undefined
        : REQUIRED,
    balance:
      !value.balanceEnabled || isPositiveAmount(value.balanceMin)
        ? undefined
        : REQUIRED,
  }
}

export function firstDepositErrors(
  values: FirstDepositValues
): FirstDepositErrors {
  const counted = countedSubRules(values)
  const subRules: Record<string, SubRuleErrors> = {}
  for (const row of counted) {
    subRules[row.id] = subRuleErrors(row)
  }
  return {
    categories: counted.length === 0 ? ADD_CATEGORY : undefined,
    subRules,
  }
}

export function isFirstDepositValid(values: FirstDepositValues): boolean {
  const errors = firstDepositErrors(values)
  if (errors.categories) {
    return false
  }
  return Object.values(errors.subRules).every(
    (row) => !row.brands && !row.turnover && !row.balance
  )
}

function chatName(
  id: string | null,
  chats: { id: string; name: string }[]
): string | null {
  if (!id) {
    return null
  }
  return chats.find((chat) => chat.id === id)?.name ?? id
}

export function formatEur(amount: string): string {
  const value = Number(amount.trim().replace(",", "."))
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export type ChannelPair = {
  label: string
  value: string
}

export function channelPairs(channels: Channels): ChannelPair[] {
  if (!hasAnyChat(channels)) {
    return []
  }
  const pairs: ChannelPair[] = []
  const slack = chatName(channels.slackChatId, SLACK_CHATS)
  const telegram = chatName(channels.telegramChatId, TELEGRAM_CHATS)
  if (slack) {
    pairs.push({ label: "Slack", value: slack })
  }
  if (telegram) {
    pairs.push({ label: "Telegram", value: telegram })
  }
  return pairs
}

export type EntityFitCell = { kind: "all" } | { kind: "names"; names: string[] }

function entityFitCell(
  category: Category | undefined,
  selected: ReadonlySet<string>
): EntityFitCell {
  if (!category) {
    return { kind: "names", names: [] }
  }
  const state = categoryTriState(category, selected)
  if (state === "all") {
    return { kind: "all" }
  }
  return {
    kind: "names",
    names: category.brands
      .filter((brand) => selected.has(brand.id))
      .map((brand) => brand.name),
  }
}

export type BalanceSummaryRow = {
  direction: string
  amount: string
}

export function balanceSummaryRows(values: BalanceValues): BalanceSummaryRow[] {
  const rows: BalanceSummaryRow[] = []
  if (values.increaseEnabled) {
    rows.push({
      direction: "Increase by",
      amount: formatEur(values.increaseAmount),
    })
  }
  if (values.decreaseEnabled) {
    rows.push({
      direction: "Decrease by",
      amount: formatEur(values.decreaseAmount),
    })
  }
  return rows
}

export type EntitySummaryRow = {
  categoryName: string
  entity: EntityFitCell
  amount: string
  inherited: boolean
}

export function entitySummaryRows(values: EntityValues): EntitySummaryRow[] {
  const selected = new Set(values.selectedBrandIds)
  const rows: EntitySummaryRow[] = []
  for (const category of CATEGORIES) {
    const state = categoryTriState(category, selected)
    if (state === "none") {
      continue
    }
    rows.push({
      categoryName: category.name,
      entity: entityFitCell(category, selected),
      amount: formatEur(effectiveCategoryAmount(values, category.id)),
      inherited: categoryAmountOverride(values, category.id) == null,
    })
  }
  return rows
}

const PERIOD_LABEL: Record<Period, string> = {
  day: "day",
  week: "week",
  month: "month",
  year: "year",
}

export type FirstDepositSummaryRow = {
  categoryName: string
  entity: EntityFitCell
  turnover: string
  balance: string
}

export function firstDepositSummaryRows(
  values: FirstDepositValues
): FirstDepositSummaryRow[] {
  return countedSubRules(values).map((row) => {
    const category = CATEGORIES.find((item) => item.id === row.categoryId)
    const selected = new Set(row.brandIds)
    return {
      categoryName: category?.name ?? "Category not selected",
      entity: entityFitCell(category, selected),
      turnover: row.turnoverEnabled
        ? `${formatEur(row.turnoverMin)} / ${PERIOD_LABEL[row.turnoverPeriod]}`
        : "—",
      balance: row.balanceEnabled ? formatEur(row.balanceMin) : "—",
    }
  })
}
