import { CATEGORIES } from "@/data/catalog"
import {
  subRuleForCategory,
  type FirstDepositSubRule,
  type FirstDepositValues,
} from "@/lib/rules"

type SubRulePatch = Partial<
  Pick<
    FirstDepositSubRule,
    | "turnoverEnabled"
    | "turnoverMin"
    | "turnoverPeriod"
    | "balanceEnabled"
    | "balanceMin"
  >
>

/** The picker speaks brand ids; this card stores them per sub-rule. */
export function selectedBrandIds(values: FirstDepositValues): string[] {
  return values.subRules.flatMap((row) => row.brandIds)
}

/**
 * One sub-rule per category that has a selected brand. The category whose
 * entity list is open keeps its sub-rule even after its last brand is cleared.
 */
export function syncSubRules(
  prev: readonly FirstDepositSubRule[],
  selectedBrandIds: readonly string[],
  retainCategoryId?: string | null
): FirstDepositSubRule[] {
  const selected = new Set(selectedBrandIds)
  const byCategory = new Map(prev.map((row) => [row.categoryId, row]))
  const next: FirstDepositSubRule[] = []

  for (const category of CATEGORIES) {
    const brandIds = category.brands
      .map((brand) => brand.id)
      .filter((id) => selected.has(id))
    if (brandIds.length === 0) {
      if (retainCategoryId === category.id) {
        const existing = byCategory.get(category.id)
        if (existing) {
          next.push({ ...existing, brandIds: [] })
        }
      }
      continue
    }
    const existing = byCategory.get(category.id)
    if (existing) {
      next.push({ ...existing, brandIds })
    } else {
      next.push({ ...subRuleForCategory(category.id), brandIds })
    }
  }

  return next
}

/**
 * A filter edit. A category with no sub-rule yet gets one with no brands —
 * the category default would otherwise select every entity in it.
 */
export function patchCategorySubRule(
  subRules: readonly FirstDepositSubRule[],
  categoryId: string,
  patch: SubRulePatch
): FirstDepositSubRule[] {
  const index = subRules.findIndex((row) => row.categoryId === categoryId)
  if (index === -1) {
    const created: FirstDepositSubRule = {
      ...subRuleForCategory(categoryId),
      ...patch,
      brandIds: [],
    }
    return byCatalogOrder([...subRules, created])
  }
  return subRules.map((row) =>
    row.categoryId === categoryId ? { ...row, ...patch } : row
  )
}

function byCatalogOrder(
  subRules: readonly FirstDepositSubRule[]
): FirstDepositSubRule[] {
  const order = new Map(
    CATEGORIES.map((category, index) => [category.id, index])
  )
  return [...subRules].sort(
    (a, b) =>
      (order.get(a.categoryId) ?? CATEGORIES.length) -
      (order.get(b.categoryId) ?? CATEGORIES.length)
  )
}
