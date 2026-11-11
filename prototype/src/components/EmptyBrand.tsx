import {
  ArrowDown,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  Landmark,
  type LucideIcon,
} from "lucide-react"
import { Fragment, useState } from "react"
import { useTranslation } from "react-i18next"

import { UploadDialog } from "@/components/UploadDialog"
import { Button } from "@/components/ui/button"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { EXAMPLE_ROWS } from "@/data/sample-files"
import { usePrototype } from "@/hooks/use-prototype"
import type { MessageKey } from "@/i18n/keys"
import { shortAddress } from "@/lib/short-address"
import { cn } from "@/lib/utils"

/** Role names are the file's own values, so they stay untranslated. */
const ROLES: { name: string; textKey: MessageKey; icon: LucideIcon }[] = [
  { name: "deposit", textKey: "empty.roles.deposit", icon: ArrowDownToLine },
  { name: "central", textKey: "empty.roles.central", icon: Landmark },
  {
    name: "withdrawal",
    textKey: "empty.roles.withdrawal",
    icon: ArrowUpFromLine,
  },
]

const COLUMNS: MessageKey[] = [
  "empty.file.clientId",
  "empty.file.address",
  "empty.file.role",
  "empty.file.chain",
]

const CELL =
  "h-12 px-3 whitespace-nowrap shadow-[inset_0_-1px_0_0_var(--border)]"

export function EmptyBrand() {
  const { t } = useTranslation()
  const { activeBrandName } = usePrototype()
  const [uploading, setUploading] = useState(false)

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 py-4">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-2xl font-medium">
          {t("empty.title", { brand: activeBrandName })}
        </h1>
        <p className="max-w-2xl text-muted-foreground">{t("empty.intro")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <a href={`${import.meta.env.BASE_URL}wallet_template.csv`} download>
              {t("empty.file.download")}
            </a>
          </Button>
          <Button type="button" onClick={() => setUploading(true)}>
            {t("empty.upload")}
          </Button>
        </div>
      </header>

      <section className="flex w-fit max-w-full flex-col items-center gap-4 self-center rounded-table border border-border p-4">
        <h2 className="text-sm font-medium">{t("empty.roles.title")}</h2>
        <ul className="flex w-fit max-w-full flex-col items-center gap-2 min-[1024px]:flex-row min-[1024px]:justify-center">
          {ROLES.map(({ name, textKey, icon: Icon }, index) => (
            <Fragment key={name}>
              {index > 0 && (
                <li
                  aria-hidden
                  className="flex shrink-0 justify-center text-muted-foreground"
                >
                  <ArrowDown className="size-5 min-[1024px]:hidden" />
                  <ArrowRight className="hidden size-5 min-[1024px]:block" />
                </li>
              )}
              <li className="w-full max-w-[400px] min-[1024px]:min-w-0 min-[1024px]:flex-1">
                <div className="rule-card-layer flex flex-col gap-3 rounded-table-header border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground ring-1 ring-foreground/10">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <CardTitle>{name}</CardTitle>
                  </div>
                  <CardDescription>{t(textKey)}</CardDescription>
                </div>
              </li>
            </Fragment>
          ))}
        </ul>
        <p className="text-center text-sm text-muted-foreground">
          {t("empty.roles.flow")}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-center text-sm font-medium">
          {t("empty.file.title")}
        </h2>
        <div className="rounded-table border border-border">
          <div className="h-2" />
          <div className="mx-2 h-12 rounded-table-header bg-table-header">
            <table className="h-12 w-full table-fixed border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr>
                  {COLUMNS.map((key) => (
                    <th
                      key={key}
                      scope="col"
                      className="h-12 px-3 font-medium text-muted-foreground"
                    >
                      {t(key)}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
          <div className="h-2" />
          <div className="mx-2 pb-2">
            <table className="w-full table-fixed border-separate border-spacing-0 text-left text-sm">
              <tbody>
                {EXAMPLE_ROWS.map((row) => (
                  <tr key={row.address} className="group">
                    <td className={cn(CELL, "group-hover:bg-table-row-hover")}>
                      {row.clientId}
                    </td>
                    <td
                      title={row.address}
                      className={cn(CELL, "group-hover:bg-table-row-hover")}
                    >
                      {shortAddress(row.address)}
                    </td>
                    <td className={cn(CELL, "group-hover:bg-table-row-hover")}>
                      {row.role}
                    </td>
                    <td className={cn(CELL, "group-hover:bg-table-row-hover")}>
                      {row.chain}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <UploadDialog open={uploading} onOpenChange={setUploading} />
    </div>
  )
}
