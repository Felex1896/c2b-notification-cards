import { useState } from "react"
import { useTranslation } from "react-i18next"

import { ClientTable } from "@/components/ClientTable"
import { PageTabs } from "@/components/PageTabs"
import { UploadDialog } from "@/components/UploadDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCssHeight } from "@/hooks/use-css-height"
import { usePrototype } from "@/hooks/use-prototype"
import { clientListView, sampleRows, type Upload } from "@/lib/client-list"

export function ClientList({ upload }: { upload: Upload }) {
  const { t } = useTranslation()
  const { list, syncing, now, setSearch, setSort, setPage, selectTab } =
    usePrototype()
  const [replacing, setReplacing] = useState(false)
  const bandRef = useCssHeight("--band-height")

  const rows = sampleRows(upload.file)
  const view = clientListView(rows, list, syncing)
  const elapsed = now - upload.startedAt

  return (
    <div className="w-full min-w-0">
      <div
        ref={bandRef}
        className="sticky top-(--chrome-height) z-40 bg-background py-3"
      >
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-4 md:flex-row md:items-center">
          <PageTabs />
          <div className="flex w-full min-w-0 flex-col gap-3 md:ml-auto md:w-auto md:flex-row md:items-center">
            <Input
              type="search"
              aria-label={t("clients.search")}
              placeholder={t("clients.search")}
              value={list.search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full min-w-0 md:w-56"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full md:w-auto"
              onClick={() => setReplacing(true)}
            >
              {t("clients.upload")}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1600px] min-w-0 flex-col gap-4 px-4 pb-[calc(2.5rem+var(--toolbar-height))]">
        {syncing && (
          <div
            role="status"
            className="rule-card-layer flex items-center justify-between gap-3 rounded-table-header border border-border px-3 py-2 text-sm"
          >
            <span>{t("clients.reading")}</span>
            <Button
              type="button"
              variant="outline"
              onClick={() => selectTab("notifications")}
            >
              {t("clients.setAlerts")}
            </Button>
          </div>
        )}

        {view.matches === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("clients.noMatch", { search: list.search })}
          </p>
        ) : (
          <ClientTable
            rows={view.items}
            sort={list.sort}
            syncing={syncing}
            elapsed={elapsed}
            onSort={setSort}
          />
        )}

        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>{t("clients.count", { count: view.matches })}</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={view.page <= 1}
              onClick={() => setPage(view.page - 1)}
            >
              {t("clients.previous")}
            </Button>
            <span>
              {t("clients.page", { page: view.page, pages: view.pageCount })}
            </span>
            <Button
              type="button"
              variant="outline"
              disabled={view.page >= view.pageCount}
              onClick={() => setPage(view.page + 1)}
            >
              {t("clients.next")}
            </Button>
          </div>
        </div>
      </div>

      <UploadDialog open={replacing} onOpenChange={setReplacing} />
    </div>
  )
}
