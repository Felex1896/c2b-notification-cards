import { ChartColumn, Sparkles, TrendingUp } from "lucide-react"
import { useTranslation } from "react-i18next"

import { AccountMenu } from "@/components/AccountMenu"
import { BrandMenu } from "@/components/BrandMenu"
import { Logo } from "@/components/Logo"
import { NotInPrototype } from "@/components/NotInPrototype"
import { ProductMenu } from "@/components/ProductMenu"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
export function AppHeader() {
  const { t } = useTranslation()

  return (
    <header className="flex flex-col">
      <div className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-4 px-4">
          <ProductMenu className="lg:hidden" />
          <Logo />
          <Tabs value="c2b" className="hidden self-stretch lg:flex">
            <TabsList aria-label={t("header.product")} className="my-auto">
              <NotInPrototype>
                <TabsTrigger value="ai" className="tab-ai px-4">
                  <Sparkles />
                  {t("header.citronAi")}
                </TabsTrigger>
              </NotInPrototype>
              <Separator orientation="vertical" className="mx-1 my-1" />
              <TabsTrigger value="c2b" className="px-4">
                <TrendingUp />
                {t("header.product.c2b")}
              </TabsTrigger>
              <NotInPrototype>
                <TabsTrigger value="b2b" className="px-4">
                  <ChartColumn />
                  {t("header.product.b2b")}
                </TabsTrigger>
              </NotInPrototype>
            </TabsList>
          </Tabs>
          <div className="ml-auto flex items-center gap-3">
            <BrandMenu />
            <AccountMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
