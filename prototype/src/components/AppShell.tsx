import { AppHeader } from "@/components/AppHeader"
import { ClientsPage } from "@/components/ClientsPage"
import { NotificationsPage } from "@/components/NotificationsPage"
import { PrototypeToolbar } from "@/components/PrototypeToolbar"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useCssHeight } from "@/hooks/use-css-height"
import { usePrototype } from "@/hooks/use-prototype"
import type { AppTab } from "@/lib/prototype-state"

function isAppTab(value: string): value is AppTab {
  return value === "clients" || value === "notifications"
}

export function AppShell() {
  const { activeTab, selectTab } = usePrototype()
  const chromeRef = useCssHeight("--chrome-height")

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        if (isAppTab(value)) {
          selectTab(value)
        }
      }}
      className="gap-0"
    >
      <div ref={chromeRef} className="sticky top-0 z-40 bg-background">
        <PrototypeToolbar />
        <AppHeader />
      </div>
      <TabsContent value="clients" className="min-w-0">
        <ClientsPage />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationsPage />
      </TabsContent>
    </Tabs>
  )
}
