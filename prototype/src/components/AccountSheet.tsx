import {
  Check,
  CircleUserRound,
  Languages,
  LogOut,
  Monitor,
  Moon,
  Sun,
  User,
  XIcon,
  Zap,
} from "lucide-react"
import { useState, type ComponentProps, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { useTranslation } from "react-i18next"

import { LanguageFlag } from "@/components/LanguageFlag"
import { NotInPrototype } from "@/components/NotInPrototype"
import { DialogCloseButton } from "@/components/DialogCloseButton"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useTheme } from "@/components/theme-provider"
import { useLanguage } from "@/hooks/use-language"
import { LANGUAGES } from "@/lib/language"
import { cn } from "@/lib/utils"

const THEMES = ["light", "dark", "system"] as const

type ThemeChoice = (typeof THEMES)[number]
type Picker = "theme" | "language" | null

function ThemeIcon({ theme }: { theme: ThemeChoice }) {
  if (theme === "system") {
    return <Monitor />
  }
  return theme === "dark" ? <Moon /> : <Sun />
}

/** Full-width account sheet. Theme and language open a centred modal. */
export function AccountSheet() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const [open, setOpen] = useState(false)
  const [picker, setPicker] = useState<Picker>(null)

  return (
    <>
      <button
        type="button"
        aria-label={t("header.account")}
        aria-expanded={open}
        className="flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 text-xs font-medium text-foreground"
        onClick={() => setOpen(true)}
      >
        <span className="flex max-w-full items-center gap-1">
          <CircleUserRound className="size-5 shrink-0" />
          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] leading-none text-primary-foreground">
            <Zap className="size-3 shrink-0 fill-current" />
            {t("header.plan")}
          </span>
        </span>
        <span
          className={cn(
            "max-w-full truncate",
            open ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {t("header.account")}
        </span>
      </button>
      {open
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-end">
              <button
                type="button"
                aria-label={t("common.close")}
                className="absolute inset-0 bg-black/30 supports-backdrop-filter:backdrop-blur-xs"
                onClick={() => setOpen(false)}
              />
              <div className="relative flex w-full flex-col gap-1 rounded-t-3xl bg-popover p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-sm">
                <div className="flex items-center justify-between gap-3 px-2.5 py-2">
                  <p className="text-base font-medium">{t("header.account")}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 shrink-0"
                    onClick={() => setOpen(false)}
                  >
                    <XIcon className="size-6" />
                    <span className="sr-only">{t("common.close")}</span>
                  </Button>
                </div>
                <NotInPrototype>
                  <SheetRow>
                    <User />
                    {t("header.profile")}
                  </SheetRow>
                </NotInPrototype>
                <SheetRow onClick={() => setPicker("theme")}>
                  <ThemeIcon theme={theme} />
                  <span className="flex-1 text-left">{t("header.theme")}</span>
                  <span className="text-muted-foreground">
                    {t(`header.theme.${theme}`)}
                  </span>
                </SheetRow>
                <SheetRow onClick={() => setPicker("language")}>
                  <Languages />
                  <span className="flex-1 text-left">
                    {t("header.language")}
                  </span>
                  <LanguageFlag language={language} />
                </SheetRow>
                <NotInPrototype>
                  <SheetRow>
                    <LogOut />
                    {t("header.logOut")}
                  </SheetRow>
                </NotInPrototype>
              </div>
            </div>,
            document.body
          )
        : null}
      <ChoiceDialog
        open={picker === "theme"}
        title={t("header.theme")}
        onClose={() => setPicker(null)}
      >
        {THEMES.map((option) => (
          <SheetRow
            key={option}
            onClick={() => {
              setTheme(option)
              setPicker(null)
            }}
          >
            <ThemeIcon theme={option} />
            <span className="flex-1 text-left">
              {t(`header.theme.${option}`)}
            </span>
            {theme === option ? <Check /> : null}
          </SheetRow>
        ))}
      </ChoiceDialog>
      <ChoiceDialog
        open={picker === "language"}
        title={t("header.language")}
        onClose={() => setPicker(null)}
      >
        {LANGUAGES.map((option) => (
          <SheetRow
            key={option}
            onClick={() => {
              setLanguage(option)
              setPicker(null)
            }}
          >
            <LanguageFlag language={option} />
            <span className="flex-1 text-left">{t(`language.${option}`)}</span>
            {language === option ? <Check /> : null}
          </SheetRow>
        ))}
      </ChoiceDialog>
    </>
  )
}

function ChoiceDialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : onClose())}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <div className="flex items-center justify-between gap-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogCloseButton inline />
        </div>
        <div className="flex flex-col gap-1">{children}</div>
      </DialogContent>
    </Dialog>
  )
}

function SheetRow({ children, className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
