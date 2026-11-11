import { ChartColumn, Check, Menu, Sparkles, TrendingUp } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { useTranslation } from "react-i18next"

import {
  HeaderMenuContent,
  HeaderMenuItem,
  HeaderMenuRadioItem,
  HeaderMenuSeparator,
} from "@/components/HeaderMenu"
import { NotInPrototype } from "@/components/NotInPrototype"
import { Button } from "@/components/ui/button"

/** The top-bar controls that fold away when the bar is too narrow. */
export function ProductMenu({ className }: { className?: string }) {
  const { t } = useTranslation()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t("header.menu")}
          className={className}
        >
          <Menu className="size-5" />
        </Button>
      </DropdownMenu.Trigger>
      <HeaderMenuContent align="start">
        <NotInPrototype>
          <HeaderMenuItem>
            <Sparkles />
            {t("header.citronAi")}
          </HeaderMenuItem>
        </NotInPrototype>
        <HeaderMenuSeparator />
        <DropdownMenu.RadioGroup value="c2b">
          <HeaderMenuRadioItem value="c2b">
            <TrendingUp />
            <span className="flex-1">{t("header.product.c2b")}</span>
            <DropdownMenu.ItemIndicator>
              <Check />
            </DropdownMenu.ItemIndicator>
          </HeaderMenuRadioItem>
          <NotInPrototype>
            <HeaderMenuRadioItem value="b2b">
              <ChartColumn />
              <span className="flex-1">{t("header.product.b2b")}</span>
            </HeaderMenuRadioItem>
          </NotInPrototype>
        </DropdownMenu.RadioGroup>
      </HeaderMenuContent>
    </DropdownMenu.Root>
  )
}
