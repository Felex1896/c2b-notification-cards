import { ChartColumn, Sparkles, TrendingUp } from "lucide-react"
import { useTranslation } from "react-i18next"

import { AccountMenu } from "@/components/AccountMenu"
import { BrandMenu } from "@/components/BrandMenu"
import { Logo } from "@/components/Logo"
import { NotInPrototype } from "@/components/NotInPrototype"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
export function AppHeader() {
  const { t } = useTranslation()

  return (
    <header className="flex flex-col">
      <div className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-4 px-4">
          <Logo />
          <div className="hidden items-center gap-2 self-stretch md:flex">
            <NotInPrototype>
              <button
                type="button"
                className="header-ai my-auto inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[var(--radius)] bg-foreground px-4 text-sm font-medium whitespace-nowrap text-background"
              >
                <Sparkles className="size-4 shrink-0" />
                {t("header.citronAi")}
              </button>
            </NotInPrototype>
            <Tabs value="c2b" className="self-stretch">
              <TabsList aria-label={t("header.product")} className="my-auto">
                <TabsTrigger value="c2b" className="px-4">
                  <TrendingUp />
                  {t("header.product.c2b.short")}
                </TabsTrigger>
                <NotInPrototype>
                  <TabsTrigger value="b2b" className="px-4">
                    <ChartColumn />
                    {t("header.product.b2b.short")}
                  </TabsTrigger>
                </NotInPrototype>
              </TabsList>
            </Tabs>
          </div>
          <div className="ml-auto flex min-w-0 items-center justify-end gap-3">
            <BrandMenu />
            <AccountMenu className="hidden md:inline-flex" />
          </div>
        </div>
      </div>
    </header>
  )
}
