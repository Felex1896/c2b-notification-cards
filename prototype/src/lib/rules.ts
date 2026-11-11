import { ALL_BRAND_IDS, CATEGORIES, type Category } from "@/data/catalog"
import { numberLocale, type Language } from "@/lib/language"

export const NONE = "__none__"
export const REQUIRED = "errors.required"

/** Validation answers with a dictionary key; the screen picks the language. */
export type RuleErrorKey = typeof REQUIRED

export type Period = "day" | "week" | "month" | "year"
export type TriState = "none" | "some" | "all"

export type Channels = {
  slackChatId: string | null
  telegramChatId: string | null
  /** The address itself. */
  emailId: string | null
}

export type BalanceValues = {
  increaseAmount: string
  decreaseAmount: string
}

/** Own minimum for one category. Off keeps the typed amount until commit. */
export type CategoryOverride = {
  enabled: boolean
  amount: string
}

export type EntityValues = {
  selectedBrandIds: string[]
  /** Common minimum. Needed only while some selected category has no own amount. */
  amount: string
  categoryOverrides: Record<string, CategoryOverride>
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

export type FirstDepositValues = {
  subRules: FirstDepositSubRule[]
}

export function emptyChannels(): Channels {
  return { slackChatId: null, telegramChatId: null, emailId: null }
}

export function emptyBalance(): BalanceValues {
  return { increaseAmount: "", decreaseAmount: "" }
}

export function emptyEntity(): EntityValues {
  return { selectedBrandIds: [], amount: "", categoryOverrides: {} }
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
  return { subRules: [] }
}

/** Fresh object, idempotent, safe to call on both Apply and Cancel. */
export function commitBalance(value: BalanceValues): BalanceValues {
  return {
    increaseAmount: commitAmountInput(value.increaseAmount),
    decreaseAmount: commitAmountInput(value.decreaseAmount),
  }
}

/** Fresh object, idempotent, safe to call on both Apply and Cancel. */
export function commitEntity(value: EntityValues): EntityValues {
  const active = categoryIdsForBrands(value.selectedBrandIds)
  const categoryOverrides: Record<string, CategoryOverride> = {}
  for (const [id, override] of Object.entries(value.categoryOverrides)) {
    if (!override.enabled || !active.has(id)) {
      continue
    }
    categoryOverrides[id] = {
      enabled: true,
      amount: commitAmountInput(override.amount),
    }
  }
  return {
    selectedBrandIds: [...value.selectedBrandIds],
    amount: commitAmountInput(value.amount),
    categoryOverrides,
  }
}

/** Fresh object, idempotent, safe to call on both Apply and Cancel. */
export function commitSubRule(value: FirstDepositSubRule): FirstDepositSubRule {
  return {
    ...value,
    brandIds: [...value.brandIds],
    turnoverMin: value.turnoverEnabled
      ? commitAmountInput(value.turnoverMin)
      : "",
    balanceMin: value.balanceEnabled ? commitAmountInput(value.balanceMin) : "",
  }
}

/** Fresh object, idempotent, safe to call on both Apply and Cancel. */
export function commitFirstDeposit(
  value: FirstDepositValues
): FirstDepositValues {
  return {
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
  return (
    channels.slackChatId != null ||
    channels.telegramChatId != null ||
    channels.emailId != null
  )
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

export type FieldErrors<T extends string> = Partial<Record<T, RuleErrorKey>>

export type BalanceErrorKey = "increaseAmount" | "decreaseAmount"

export function balanceErrors(
  values: BalanceValues
): FieldErrors<BalanceErrorKey> {
  if (
    isPositiveAmount(values.increaseAmount) ||
    isPositiveAmount(values.decreaseAmount)
  ) {
    return {}
  }
  return { increaseAmount: REQUIRED, decreaseAmount: REQUIRED }
}

export function isBalanceComplete(values: BalanceValues): boolean {
  return (
    isPositiveAmount(values.increaseAmount) ||
    isPositiveAmount(values.decreaseAmount)
  )
}

export type EntityErrors = {
  amount?: RuleErrorKey
  categories: Record<string, RuleErrorKey>
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

/** True while a selected category is still using the common minimum. */
export function commonAmountNeeded(values: EntityValues): boolean {
  for (const id of categoryIdsForBrands(values.selectedBrandIds)) {
    if (!values.categoryOverrides[id]?.enabled) {
      return true
    }
  }
  return false
}

export function entityErrors(values: EntityValues): EntityErrors {
  const categories: Record<string, RuleErrorKey> = {}
  for (const id of categoryIdsForBrands(values.selectedBrandIds)) {
    const override = values.categoryOverrides[id]
    if (override?.enabled && !isPositiveAmount(override.amount)) {
      categories[id] = REQUIRED
    }
  }
  const errors: EntityErrors = { categories }
  if (commonAmountNeeded(values) && !isPositiveAmount(values.amount)) {
    errors.amount = REQUIRED
  }
  return errors
}

export function isEntityComplete(values: EntityValues): boolean {
  if (values.selectedBrandIds.length === 0) {
    return false
  }
  const errors = entityErrors(values)
  return (
    errors.amount === undefined && Object.keys(errors.categories).length === 0
  )
}

/**
 * A category with no selected brand loses its own amount, except the one whose
 * entity popover is open.
 */
export function pruneCategoryOverrides(
  overrides: Record<string, CategoryOverride>,
  selectedBrandIds: readonly string[],
  retainCategoryId?: string | null
): Record<string, CategoryOverride> {
  const kept = categoryIdsForBrands(selectedBrandIds)
  if (retainCategoryId) {
    kept.add(retainCategoryId)
  }
  const next: Record<string, CategoryOverride> = {}
  for (const [id, value] of Object.entries(overrides)) {
    if (kept.has(id)) {
      next[id] = value
    }
  }
  return next
}

/** Merges a patch. Turning the own amount off does not clear what was typed. */
export function setCategoryOverride(
  overrides: Record<string, CategoryOverride>,
  categoryId: string,
  patch: Partial<CategoryOverride>
): Record<string, CategoryOverride> {
  const current = overrides[categoryId] ?? { enabled: false, amount: "" }
  return {
    ...overrides,
    [categoryId]: { ...current, ...patch },
  }
}

export function categoryOverride(
  values: EntityValues,
  categoryId: string
): CategoryOverride | undefined {
  return values.categoryOverrides[categoryId]
}

/** Own amount when that toggle is on, otherwise the common minimum. */
export function effectiveCategoryAmount(
  values: EntityValues,
  categoryId: string
): string {
  const override = values.categoryOverrides[categoryId]
  if (override?.enabled) {
    return override.amount
  }
  return values.amount
}

export type SubRuleErrors = {
  turnover?: RuleErrorKey
  balance?: RuleErrorKey
}

export type FirstDepositErrors = {
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
  const errors: SubRuleErrors = {}
  if (value.turnoverEnabled && !isPositiveAmount(value.turnoverMin)) {
    errors.turnover = REQUIRED
  }
  if (value.balanceEnabled && !isPositiveAmount(value.balanceMin)) {
    errors.balance = REQUIRED
  }
  return errors
}

export function firstDepositErrors(
  values: FirstDepositValues
): FirstDepositErrors {
  const subRules: Record<string, SubRuleErrors> = {}
  for (const row of countedSubRules(values)) {
    subRules[row.id] = subRuleErrors(row)
  }
  return { subRules }
}

export function isFirstDepositComplete(values: FirstDepositValues): boolean {
  const counted = countedSubRules(values)
  if (counted.length === 0) {
    return false
  }
  return counted.every((row) => {
    const errors = subRuleErrors(row)
    return errors.turnover === undefined && errors.balance === undefined
  })
}

export function formatEur(amount: string, language: Language): string {
  const value = Number(amount.trim().replace(",", "."))
  return new Intl.NumberFormat(numberLocale(language), {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}
