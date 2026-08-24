import { useState } from "react"
import { ChevronDownIcon } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import type { Brand } from "@/data/catalog"
import { cn } from "@/lib/utils"

function entityLabel(brands: Brand[], selected: ReadonlySet<string>): string {
  const count = brands.filter((brand) => selected.has(brand.id)).length
  if (count === 0) {
    return "Select"
  }
  if (count === brands.length) {
    return "All"
  }
  return `Selected: ${count}`
}

function visibleSelectState(
  visible: Brand[],
  selected: ReadonlySet<string>
): boolean | "indeterminate" {
  if (visible.length === 0) {
    return false
  }
  let selectedCount = 0
  for (const brand of visible) {
    if (selected.has(brand.id)) {
      selectedCount += 1
    }
  }
  if (selectedCount === 0) {
    return false
  }
  if (selectedCount === visible.length) {
    return true
  }
  return "indeterminate"
}

export function EntitySelect({
  brands,
  selected,
  disabled,
  invalid,
  open,
  onOpenChange,
  onToggleBrand,
  onSelectVisible,
}: {
  brands: Brand[]
  selected: ReadonlySet<string>
  disabled: boolean
  invalid?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggleBrand: (brandId: string, checked: boolean) => void
  onSelectVisible: (brandIds: string[], checked: boolean) => void
}) {
  // A row the user cannot reach cannot hold an open popover.
  const isOpen = open && !disabled

  if (brands.length === 1) {
    return (
      <span className="flex h-8 w-full min-w-0 items-center text-sm">
        <span className="truncate">{brands[0].name}</span>
      </span>
    )
  }

  const trigger = (
    <button
      type="button"
      disabled={disabled}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-left text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
      )}
    >
      <span className="min-w-0 truncate">{entityLabel(brands, selected)}</span>
      <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
    </button>
  )

  if (disabled) {
    return trigger
  }

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="flex max-h-64 flex-col overflow-hidden p-1">
        {/* Keyed on open: the search box must not survive a close. */}
        <EntityList
          key={isOpen ? "open" : "closed"}
          brands={brands}
          selected={selected}
          onToggleBrand={onToggleBrand}
          onSelectVisible={onSelectVisible}
        />
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
            placeholder="Search entity"
            aria-label="Search entity"
            autoComplete="off"
            autoFocus
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
          <Checkbox
            checked={visibleSelectState(visible, selected)}
            onCheckedChange={(checked) =>
              onSelectVisible(
                visible.map((brand) => brand.id),
                checked === true
              )
            }
          />
          Select all
        </label>
      </div>
      <Separator className="shrink-0" />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {visible.map((brand) => (
          <label
            key={brand.id}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
          >
            <Checkbox
              checked={selected.has(brand.id)}
              onCheckedChange={(checked) =>
                onToggleBrand(brand.id, checked === true)
              }
            />
            {brand.name}
          </label>
        ))}
      </div>
    </>
  )
}
