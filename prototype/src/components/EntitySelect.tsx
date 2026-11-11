import { useState } from "react"
import type { TFunction } from "i18next"
import { ChevronDownIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { OverflowText } from "@/components/OverflowText"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import type { Brand } from "@/data/catalog"
import { visibleSelectState } from "@/lib/visible-selection"

function entityLabel(
  brands: Brand[],
  selected: ReadonlySet<string>,
  t: TFunction
): string {
  const count = brands.filter((brand) => selected.has(brand.id)).length
  if (count === 0) {
    return t("common.select")
  }
  if (count === brands.length) {
    return t("picker.all")
  }
  return t("picker.selected", { count })
}

export function EntitySelect({
  brands,
  selected,
  open,
  onOpenChange,
  onToggleBrand,
  onSelectVisible,
}: {
  brands: Brand[]
  selected: ReadonlySet<string>
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggleBrand: (brandId: string, checked: boolean) => void
  onSelectVisible: (brandIds: string[], checked: boolean) => void
}) {
  const { t } = useTranslation()
  const onlyBrand = brands.length === 1 ? brands[0] : undefined

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-(--control-height) w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-left text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <OverflowText
            className="flex-1 text-left"
            text={entityLabel(brands, selected, t)}
          />
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="flex max-h-64 flex-col overflow-hidden p-1"
        // The open rule is a dialog. Its scroll lock cancels wheel and touch
        // events that bubble to the document, and this list is portaled
        // outside that lock, so the gesture never moves it.
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
      >
        {onlyBrand ? (
          <BrandOption
            brand={onlyBrand}
            checked={selected.has(onlyBrand.id)}
            onCheckedChange={(checked) => onToggleBrand(onlyBrand.id, checked)}
          />
        ) : (
          <EntityList
            key={open ? "open" : "closed"}
            brands={brands}
            selected={selected}
            onToggleBrand={onToggleBrand}
            onSelectVisible={onSelectVisible}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}

function EntityList({
  brands,
  selected,
  onToggleBrand,
  onSelectVisible,
}: {
  brands: Brand[]
  selected: ReadonlySet<string>
  onToggleBrand: (brandId: string, checked: boolean) => void
  onSelectVisible: (brandIds: string[], checked: boolean) => void
}) {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")

  const query = search.trim().toLowerCase()
  const visible = query
    ? brands.filter((brand) => brand.name.toLowerCase().includes(query))
    : brands

  return (
    <>
      <div className="shrink-0">
        <div className="p-1">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
              }
            }}
            placeholder={t("picker.search")}
            aria-label={t("picker.search")}
            autoComplete="off"
            autoFocus
          />
        </div>
        <label className="flex min-w-0 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
          <Checkbox
            checked={visibleSelectState(
              visible.map((brand) => brand.id),
              selected
            )}
            onCheckedChange={(checked) =>
              onSelectVisible(
                visible.map((brand) => brand.id),
                checked === true
              )
            }
          />
          <OverflowText className="flex-1" text={t("picker.selectAll")} />
        </label>
      </div>
      <Separator className="shrink-0" />
      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        {visible.map((brand) => (
          <BrandOption
            key={brand.id}
            brand={brand}
            checked={selected.has(brand.id)}
            onCheckedChange={(checked) => onToggleBrand(brand.id, checked)}
          />
        ))}
      </div>
    </>
  )
}

function BrandOption({
  brand,
  checked,
  onCheckedChange,
}: {
  brand: Brand
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <label className="flex min-w-0 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <OverflowText className="flex-1" text={brand.name} />
    </label>
  )
}
