/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

type Theme = "dark" | "light" | "system"
type ResolvedTheme = "dark" | "light"
type Skin = "brand" | "sandbox"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  skin: Skin
  setSkin: (skin: Skin) => void
}

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)"
const THEME_VALUES: Theme[] = ["dark", "light", "system"]
const DEFAULT_STORAGE_KEY = "theme"

const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined)

function isTheme(value: string | null): value is Theme {
  if (value === null) {
    return false
  }

  return THEME_VALUES.includes(value as Theme)
}

function isSkin(value: string | null): value is Skin {
  return value === "brand" || value === "sandbox"
}

function getSkinFromUrl(): Skin {
  const value = new URLSearchParams(window.location.search).get("skin")
  if (isSkin(value)) {
    return value
  }

  return "brand"
}

function defaultThemeForSkin(skin: Skin): Theme {
  return skin === "sandbox" ? "light" : "dark"
}

function getSystemTheme(): ResolvedTheme {
  if (window.matchMedia(COLOR_SCHEME_QUERY).matches) {
    return "dark"
  }

  return "light"
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") {
    return getSystemTheme()
  }

  return theme
}

function readStoredTheme(storageKey: string): Theme | null {
  const storedTheme = localStorage.getItem(storageKey)
  if (isTheme(storedTheme)) {
    return storedTheme
  }

  return null
}

function applySkin(skin: Skin) {
  document.documentElement.setAttribute("data-skin", skin)
}

function applyResolvedTheme(theme: Theme, disableTransitionOnChange: boolean) {
  const root = document.documentElement
  const resolvedTheme = resolveTheme(theme)
  const restoreTransitions = disableTransitionOnChange
    ? disableTransitionsTemporarily()
    : null

  root.classList.remove("light", "dark")
  root.classList.add(resolvedTheme)

  if (restoreTransitions) {
    restoreTransitions()
  }
}

function writeSkinToUrl(skin: Skin) {
  const url = new URL(window.location.href)
  url.searchParams.set("skin", skin)
  window.history.replaceState(
    null,
    "",
    `${url.pathname}${url.search}${url.hash}`
  )
}

export function bootDocumentAppearance(storageKey = DEFAULT_STORAGE_KEY) {
  const skin = getSkinFromUrl()
  applySkin(skin)

  const theme = readStoredTheme(storageKey) ?? defaultThemeForSkin(skin)
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(resolveTheme(theme))
}

function disableTransitionsTemporarily() {
  const style = document.createElement("style")
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}"
    )
  )
  document.head.appendChild(style)

  return () => {
    window.getComputedStyle(document.body)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove()
      })
    })
  }
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable) {
    return true
  }

  const editableParent = target.closest(
    "input, textarea, select, [contenteditable='true']"
  )
  if (editableParent) {
    return true
  }

  return false
}

export function ThemeProvider({
  children,
  defaultTheme,
  storageKey = DEFAULT_STORAGE_KEY,
  disableTransitionOnChange = true,
  ...props
}: ThemeProviderProps) {
  const [skin, setSkinState] = React.useState<Skin>(getSkinFromUrl)
  const [theme, setThemeState] = React.useState<Theme>(() => {
    const storedTheme = readStoredTheme(storageKey)
    if (storedTheme) {
      return storedTheme
    }

    if (defaultTheme !== undefined) {
      return defaultTheme
    }

    return defaultThemeForSkin(getSkinFromUrl())
  })

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      localStorage.setItem(storageKey, nextTheme)
      setThemeState(nextTheme)
    },
    [storageKey]
  )

  const setSkin = React.useCallback((nextSkin: Skin) => {
    writeSkinToUrl(nextSkin)
    applySkin(nextSkin)
    setSkinState(nextSkin)
  }, [])

  const applyTheme = React.useCallback(
    (nextTheme: Theme) => {
      applyResolvedTheme(nextTheme, disableTransitionOnChange)
    },
    [disableTransitionOnChange]
  )

  React.useEffect(() => {
    applySkin(skin)
  }, [skin])

  React.useEffect(() => {
    applyTheme(theme)

    if (theme !== "system") {
      return undefined
    }

    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY)
    const handleChange = () => {
      applyTheme("system")
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme, applyTheme])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (isEditableTarget(event.target)) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      setThemeState((currentTheme) => {
        const nextTheme =
          currentTheme === "dark"
            ? "light"
            : currentTheme === "light"
              ? "dark"
              : getSystemTheme() === "dark"
                ? "light"
                : "dark"

        localStorage.setItem(storageKey, nextTheme)
        return nextTheme
      })
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [storageKey])

  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) {
        return
      }

      if (event.key !== storageKey) {
        return
      }

      if (isTheme(event.newValue)) {
        setThemeState(event.newValue)
        return
      }

      setThemeState(defaultTheme ?? defaultThemeForSkin(getSkinFromUrl()))
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [defaultTheme, storageKey])

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      skin,
      setSkin,
    }),
    [theme, setTheme, skin, setSkin]
  )

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
