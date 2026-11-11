/** Tri-state of "Select all" over the entities the search currently shows. */
export function visibleSelectState(
  visibleIds: readonly string[],
  selected: ReadonlySet<string>
): boolean | "indeterminate" {
  if (visibleIds.length === 0) {
    return false
  }
  let selectedCount = 0
  for (const id of visibleIds) {
    if (selected.has(id)) {
      selectedCount += 1
    }
  }
  if (selectedCount === 0) {
    return false
  }
  if (selectedCount === visibleIds.length) {
    return true
  }
  return "indeterminate"
}
