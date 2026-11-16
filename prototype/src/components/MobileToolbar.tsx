import {
  ChartColumn,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import { type ComponentProps } from "react"
import { useTranslation } from "react-i18next"

import { AccountSheet } from "@/components/AccountSheet"
import { NotInPrototype } from "@/components/NotInPrototype"
import { useCssHeight } from "@/hooks/use-css-height"
import { cn } from "@/lib/utils"

/** Product switch, Citron AI and the account. Phone only; tablet matches desktop. */
export function MobileToolbar() {
  const { t } = useTranslation()
  const ref = useCssHeight("--toolbar-height")

  return (
    <div
      ref={ref}
      className="fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <nav aria-label={t("header.product")} className="relative">
        <div className="flex h-14 items-stretch rounded-full border border-border bg-popover/70 backdrop-blur-md">
          <div className="flex min-w-0 flex-1">
            <ToolbarTab
              icon={TrendingUp}
              label={t("header.product.c2b.short")}
              active
            />
            <NotInPrototype>
              <ToolbarTab
                icon={ChartColumn}
                label={t("header.product.b2b.short")}
              />
            </NotInPrototype>
          </div>
          <div className="w-14 shrink-0" aria-hidden />
          <div className="flex min-w-0 flex-1">
            <AccountSheet />
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <NotInPrototype>
            <button
              type="button"
              aria-label={t("header.citronAi")}
              className="flex size-14 items-center justify-center rounded-full bg-foreground text-background shadow-md"
            >
              <Sparkles className="size-6" />
            </button>
          </NotInPrototype>
        </div>
      </nav>
    </div>
  )
}

function ToolbarTab({
  icon: Icon,
  label,
  active = false,
  className,
  ...props
}: {
  icon: LucideIcon
  label: string
  active?: boolean
} & ComponentProps<"button">) {
  return (
    <button
      {...props}
      type="button"
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-2 text-xs font-medium",
        active ? "rule-card-layer text-foreground" : "text-muted-foreground",
        className
      )}
    >
      <Icon className="size-5 shrink-0" />
      <span className="max-w-full truncate">{label}</span>
    </button>
  )
}
