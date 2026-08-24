import { NotificationsPage } from "@/components/NotificationsPage"
import { useTheme } from "@/components/theme-provider"

function PrototypeToolbar() {
  const { skin, setSkin, theme, setTheme } = useTheme()

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border bg-background px-4 py-2 text-sm text-foreground">
      <span className="text-muted-foreground">Prototype</span>
      <label className="flex items-center gap-2">
        Skin
        <select
          value={skin}
          onChange={(event) =>
            setSkin(event.target.value === "sandbox" ? "sandbox" : "brand")
          }
        >
          <option value="brand">Brand</option>
          <option value="sandbox">Sandbox</option>
        </select>
      </label>
      <label className="flex items-center gap-2">
        Theme
        <select
          value={theme}
          onChange={(event) => {
            const value = event.target.value
            if (value === "light" || value === "dark" || value === "system") {
              setTheme(value)
            }
          }}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </label>
    </div>
  )
}

export function App() {
  return (
    <>
      <PrototypeToolbar />
      <NotificationsPage />
    </>
  )
}

export default App
