import { ALL_BRAND_IDS, CATEGORIES } from "@/data/catalog"

/**
 * What the user did in the picker. Components report the gesture, owners turn
 * it into the next selection with a functional state update — so one gesture
 * over many rows ("Select all") cannot race a mirrored copy of the list.
 */
export type SelectionAction =
  | { kind: "brand"; brandId: string; checked: boolean }
  | { kind: "visibleBrands"; brandIds: string[]; checked: boolean }
  | { kind: "category"; categoryId: string; checked: boolean }
  | { kind: "allCategories"; checked: boolean }
  | { kind: "releaseCategory" }

/**
 * An action plus the category whose entity popover is open, if any. That
 * category keeps its per-row extras while it holds no brands; releasing it is
 * what drops them.
 */
export type SelectionIntent = SelectionAction & {
  heldCategoryId: string | null
}

/** Selection is a set of brand ids; the array is only its carrier. */
function normalize(ids: Iterable<string>): string[] {
  const wanted = new Set(ids)
  return ALL_BRAND_IDS.filter((id) => wanted.has(id))
}

/** The visible subset behind "Select all". Ids outside it are untouched. */
export function setBrands(
  selected: readonly string[],
  brandIds: readonly string[],
  checked: boolean
): string[] {
  const next = new Set(selected)
  for (const id of brandIds) {
    if (checked) {
      next.add(id)
    } else {
      next.delete(id)
    }
  }
  return normalize(next)
}

export function toggleBrand(
  selected: readonly string[],
  brandId: string,
  checked: boolean
): string[] {
  return setBrands(selected, [brandId], checked)
}

/** Checking a category means every brand in it. Empty never means all. */
export function toggleCategory(
  selected: readonly string[],
  categoryId: string,
  checked: boolean
): string[] {
  const category = CATEGORIES.find((item) => item.id === categoryId)
  if (!category) {
    return normalize(selected)
  }
  return setBrands(
    selected,
    category.brands.map((brand) => brand.id),
    checked
  )
}

export function selectAllCategories(): string[] {
  return [...ALL_BRAND_IDS]
}

export function clearAll(): string[] {
  return []
}

export function applySelection(
  selected: readonly string[],
  intent: SelectionIntent
): string[] {
  switch (intent.kind) {
    case "brand":
      return toggleBrand(selected, intent.brandId, intent.checked)
    case "visibleBrands":
      return setBrands(selected, intent.brandIds, intent.checked)
    case "category":
      return toggleCategory(selected, intent.categoryId, intent.checked)
    case "allCategories":
      return intent.checked ? selectAllCategories() : clearAll()
    case "releaseCategory":
      return normalize(selected)
  }
}
