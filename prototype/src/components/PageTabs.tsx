import { useTranslation } from "react-i18next"

import { NotInPrototype } from "@/components/NotInPrototype"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"

/** Clients, Notifications and the Overview stub. Shown once a file is in. */
export function PageTabs() {
  const { t } = useTranslation()

  return (
    <TabsList className="w-full md:w-fit max-md:[&_:is([role=tab],.tab-pill)]:!min-w-0 max-md:[&_:is([role=tab],.tab-pill)]:overflow-hidden max-md:[&_:is([role=tab],.tab-pill)]:text-ellipsis max-md:[&_:is([role=tab],.tab-pill)]:whitespace-nowrap">
      <TabsTrigger value="clients">{t("header.tabs.clients")}</TabsTrigger>
      <TabsTrigger value="notifications">
        {t("header.tabs.notifications")}
      </TabsTrigger>
      <NotInPrototype>
        <button
          type="button"
          className="tab-pill flex-1"
          data-slot="tabs-trigger"
        >
          {t("header.tabs.overview")}
        </button>
      </NotInPrototype>
    </TabsList>
  )
}
