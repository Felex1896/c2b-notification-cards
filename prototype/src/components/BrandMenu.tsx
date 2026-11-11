import { Check, ChevronDown, Plus } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { useTranslation } from "react-i18next"

import {
  HeaderMenuContent,
  HeaderMenuItem,
  HeaderMenuRadioItem,
} from "@/components/HeaderMenu"
import { NotInPrototype } from "@/components/NotInPrototype"
import { OverflowText } from "@/components/OverflowText"
import { Overline } from "@/components/Overline"
import { Button } from "@/components/ui/button"
import { BRANDS } from "@/data/brands"
import { usePrototype } from "@/hooks/use-prototype"
import { cn } from "@/lib/utils"

function BrandAvatar({ name, size }: { name: string; size: "sm" | "md" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-secondary font-semibold text-secondary-foreground",
        size === "sm" ? "size-6 text-xs" : "size-8 text-sm"
      )}
    >
      {name.charAt(0)}
    </span>
  )
}

export function BrandMenu() {
  const { t } = useTranslation()
  const { activeBrand, selectBrand } = usePrototype()
  const active = BRANDS.find((brand) => brand.id === activeBrand) ?? BRANDS[0]

  return (
    <div className="flex items-center gap-3">
      <Overline className="hidden lg:inline">{t("header.brand")}</Overline>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button
            type="button"
            variant="outline"
            aria-label={t("header.brand")}
            title={active.name}
            className="w-52 shrink-0 justify-start gap-2.5 py-0 pr-2.5 pl-1.5 text-left"
          >
            <BrandAvatar name={active.name} size="sm" />
            <OverflowText
              className="min-w-0 flex-1 text-sm font-medium"
              text={active.name}
            />
            <ChevronDown className="text-muted-foreground" />
          </Button>
        </DropdownMenu.Trigger>
        <HeaderMenuContent className="w-72">
          <DropdownMenu.RadioGroup
            value={activeBrand}
            onValueChange={selectBrand}
          >
            {BRANDS.map((brand) => (
              <HeaderMenuRadioItem key={brand.id} value={brand.id}>
                <BrandAvatar name={brand.name} size="md" />
                <OverflowText
                  className="flex-1 font-medium"
                  text={brand.name}
                />
                <DropdownMenu.ItemIndicator>
                  <Check />
                </DropdownMenu.ItemIndicator>
              </HeaderMenuRadioItem>
            ))}
          </DropdownMenu.RadioGroup>
          <p className="px-2.5 pt-2 pb-1.5 text-xs text-muted-foreground">
            {t("header.brand.scope")}
          </p>
          <NotInPrototype>
            <HeaderMenuItem>
              <Plus />
              {t("header.brand.manage")}
            </HeaderMenuItem>
          </NotInPrototype>
        </HeaderMenuContent>
      </DropdownMenu.Root>
    </div>
  )
}
