import { useTranslation } from "react-i18next"

import { NotInPrototype } from "@/components/NotInPrototype"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"

/** Clients, Notifications and the Overview stub. Shown once a file is in. */
export function PageTabs() {
  const { t } = useTranslation()

  return (
    <TabsList>
      <TabsTrigger value="clients">{t("header.tabs.clients")}</TabsTrigger>
      <TabsTrigger value="notifications">
        {t("header.tabs.notifications")}
      </TabsTrigger>
      <NotInPrototype>
        <button type="button" className="tab-pill" data-slot="tabs-trigger">
          {t("header.tabs.overview")}
        </button>
      </NotInPrototype>
    </TabsList>
  )
}
