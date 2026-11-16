import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import {
  bootDocumentAppearance,
  ThemeProvider,
} from "@/components/theme-provider.tsx"
import { PrototypeProvider } from "@/components/PrototypeProvider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { bootLanguage } from "@/i18n"
import { installTouchTap } from "@/lib/touch-tap"

bootDocumentAppearance()
bootLanguage()
installTouchTap()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider>
        <PrototypeProvider>
          <App />
        </PrototypeProvider>
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>
)
