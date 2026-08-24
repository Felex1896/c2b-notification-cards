import { useState, type ReactNode } from "react"

import { EntitySelect } from "@/components/EntitySelect"
import { RuleTable, RuleTableCell, RuleTableRow } from "@/components/RuleTable"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { CATEGORIES, type Category } from "@/data/catalog"
import {
  REQUIRED,
  categoryTriState,
  headerTriState,
  toChecked,
} from "@/lib/rules"
import type { SelectionIntent } from "@/lib/selection"

type CategoryBrandPickerProps = {
  selectedBrandIds: string[]
  onSelect: (intent: SelectionIntent) => void
  invalid?: boolean
  extraHeaders?: ReactNode[]
  renderExtra?: (category: Category, checked: boolean) => ReactNode
  rowEntityInvalid?: (categoryId: string) => boolean
  footerError?: string | null
}

export function CategoryBrandPicker({
  selectedBrandIds,
  onSelect,
  invalid = false,
  extraHeaders = [],
  renderExtra,
  rowEntityInvalid,
  footerError,
}: CategoryBrandPickerProps) {
  /**
   * The category whose entity popover is open. Its row stays checked and keeps
   * its extras even with no brand selected, until the popover closes.
   */
  const [heldCategoryId, setHeldCategoryId] = useState<string | null>(null)

  const selected = new Set(selectedBrandIds)
  const header = headerTriState(selected)

  const handleOpenChange = (categoryId: string, open: boolean) => {
    setHeldCategoryId(open ? categoryId : null)
    if (!open) {
      onSelect({ kind: "releaseCategory", heldCategoryId: null })
    }
  }

  return (
    <Field data-invalid={invalid || undefined}>
      <RuleTable
        headers={[
          <div key="category" className="flex h-8 items-center gap-2">
            <Checkbox
              checked={toChecked(header)}
              onCheckedChange={(checked) =>
                onSelect({
                  kind: "allCategories",
                  checked: checked === true,
                  heldCategoryId,
                })
              }
              aria-invalid={invalid || undefined}
              aria-label="All categories"
            />
            <FieldLabel className="font-medium">Category</FieldLabel>
          </div>,
          <span key="entity" className="inline-flex h-8 items-center">
            Entity
          </span>,
          ...extraHeaders,
        ]}
      >
        {CATEGORIES.map((category) => {
          const state = categoryTriState(category, selected)
          const held = heldCategoryId === category.id
          const included = state !== "none" || held
          const entityInvalid = Boolean(rowEntityInvalid?.(category.id))

          return (
            <RuleTableRow key={category.id}>
              <RuleTableCell className="align-top">
                <label className="flex h-8 items-center gap-2 text-sm">
                  <Checkbox
                    checked={held && state === "none" ? true : toChecked(state)}
                    onCheckedChange={(value) => {
                      const checked = value === true
                      // Unchecking the held row releases it with the same gesture.
                      const nextHeld = !checked && held ? null : heldCategoryId
                      setHeldCategoryId(nextHeld)
                      onSelect({
                        kind: "category",
                        categoryId: category.id,
                        checked,
                        heldCategoryId: nextHeld,
                      })
                    }}
                    aria-invalid={invalid || undefined}
                    aria-label={category.name}
                  />
                  <span className="min-w-0 truncate">{category.name}</span>
                </label>
              </RuleTableCell>
              <RuleTableCell className="min-w-[9rem] align-top">
                <EntitySelect
                  brands={category.brands}
                  selected={selected}
                  disabled={!included}
                  invalid={entityInvalid}
                  open={held}
                  onOpenChange={(open) => handleOpenChange(category.id, open)}
                  onToggleBrand={(brandId, checked) =>
                    onSelect({
                      kind: "brand",
                      brandId,
                      checked,
                      heldCategoryId,
                    })
                  }
                  onSelectVisible={(brandIds, checked) =>
                    onSelect({
                      kind: "visibleBrands",
                      brandIds,
                      checked,
                      heldCategoryId,
                    })
                  }
                />
              </RuleTableCell>
              {renderExtra?.(category, included)}
            </RuleTableRow>
          )
        })}
      </RuleTable>
      <FieldError>{footerError ?? (invalid ? REQUIRED : null)}</FieldError>
    </Field>
  )
}
