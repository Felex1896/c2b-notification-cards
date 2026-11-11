import { useId, useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { EntitySelect } from "@/components/EntitySelect"
import { FormPlate, FormRow, FormStack } from "@/components/FormGrid"
import { Checkbox } from "@/components/ui/checkbox"
import { CATEGORIES, type Category } from "@/data/catalog"
import { categoryTriState, headerTriState, toChecked } from "@/lib/rules"
import type { SelectionIntent } from "@/lib/selection"

type CategoryBrandPickerProps = {
  selectedBrandIds: readonly string[]
  onSelect: (intent: SelectionIntent) => void
  renderSubRows: (category: Category) => ReactNode
}

export function CategoryBrandPicker({
  selectedBrandIds,
  onSelect,
  renderSubRows,
}: CategoryBrandPickerProps) {
  const { t } = useTranslation()
  const selectAllId = useId()
  /**
   * The category whose entity popover is open. Once its sub-rows have shown
   * they stay even with no brand selected, until the popover closes.
   */
  const [heldCategoryId, setHeldCategoryId] = useState<string | null>(null)
  const [heldRowsShown, setHeldRowsShown] = useState(false)
  const selected = new Set(selectedBrandIds)

  const handleOpenChange = (category: Category, open: boolean) => {
    setHeldCategoryId(open ? category.id : null)
    setHeldRowsShown(open && categoryTriState(category, selected) !== "none")
    if (!open) {
      onSelect({ kind: "releaseCategory", heldCategoryId: null })
    }
  }

  const handleHeldSelect = (intent: SelectionIntent, checked: boolean) => {
    if (checked) {
      setHeldRowsShown(true)
    }
    onSelect(intent)
  }

  return (
    <FormStack
      pinned={
        <FormPlate>
          <FormRow label={t("picker.entities")}>
            <div className="flex h-(--control-height) items-center gap-2">
              <Checkbox
                id={selectAllId}
                checked={toChecked(headerTriState(selected))}
                onCheckedChange={(checked) =>
                  onSelect({
                    kind: "allCategories",
                    checked: checked === true,
                    heldCategoryId,
                  })
                }
                aria-label={t("picker.allCategories")}
              />
              <label
                htmlFor={selectAllId}
                className="cursor-pointer text-sm whitespace-nowrap"
              >
                {t("picker.selectAll")}
              </label>
            </div>
          </FormRow>
        </FormPlate>
      }
    >
      {CATEGORIES.map((category) => {
        const active =
          categoryTriState(category, selected) !== "none" ||
          (heldCategoryId === category.id && heldRowsShown)
        return (
          <CategoryRows
            key={category.id}
            category={category}
            selected={selected}
            heldCategoryId={heldCategoryId}
            active={active}
            onOpenChange={handleOpenChange}
            onSelect={handleHeldSelect}
            renderSubRows={renderSubRows}
          />
        )
      })}
    </FormStack>
  )
}

function CategoryRows({
  category,
  selected,
  heldCategoryId,
  active,
  onOpenChange,
  onSelect,
  renderSubRows,
}: {
  category: Category
  selected: ReadonlySet<string>
  heldCategoryId: string | null
  active: boolean
  onOpenChange: (category: Category, open: boolean) => void
  onSelect: (intent: SelectionIntent, checked: boolean) => void
  renderSubRows: (category: Category) => ReactNode
}) {
  const { t } = useTranslation()

  return (
    <FormPlate>
      <FormRow label={t(category.nameKey)}>
        <EntitySelect
          brands={category.brands}
          selected={selected}
          open={heldCategoryId === category.id}
          onOpenChange={(open) => onOpenChange(category, open)}
          onToggleBrand={(brandId, checked) =>
            onSelect(
              { kind: "brand", brandId, checked, heldCategoryId },
              checked
            )
          }
          onSelectVisible={(brandIds, checked) =>
            onSelect(
              { kind: "visibleBrands", brandIds, checked, heldCategoryId },
              checked
            )
          }
        />
      </FormRow>
      {active ? renderSubRows(category) : null}
    </FormPlate>
  )
}
