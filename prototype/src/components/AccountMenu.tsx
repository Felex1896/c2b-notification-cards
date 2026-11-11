import {
  Check,
  CircleUserRound,
  Languages,
  LogOut,
  Monitor,
  Moon,
  Sun,
  User,
  Zap,
} from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { useTranslation } from "react-i18next"

import {
  HeaderMenuContent,
  HeaderMenuItem,
  HeaderMenuRadioItem,
  HeaderMenuSeparator,
  HeaderMenuSubContent,
  HeaderMenuSubTrigger,
} from "@/components/HeaderMenu"
import { LanguageFlag } from "@/components/LanguageFlag"
import { NotInPrototype } from "@/components/NotInPrototype"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { useLanguage } from "@/hooks/use-language"
import { isLanguage, LANGUAGES } from "@/lib/language"

const THEMES = ["light", "dark", "system"] as const

type ThemeChoice = (typeof THEMES)[number]

function ThemeIcon({ theme }: { theme: ThemeChoice }) {
  if (theme === "system") {
    return <Monitor />
  }

  return theme === "dark" ? <Moon /> : <Sun />
}

export function AccountMenu() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t("header.account")}
          className="lg:!h-(--control-height) lg:!w-auto lg:!px-4"
        >
          <CircleUserRound />
          <span className="hidden items-center gap-1 lg:flex">
            <Zap className="size-3.5 fill-current" />
            {t("header.plan")}
          </span>
        </Button>
      </DropdownMenu.Trigger>
      <HeaderMenuContent>
        <NotInPrototype>
          <HeaderMenuItem>
            <User />
            {t("header.profile")}
          </HeaderMenuItem>
        </NotInPrototype>
        <DropdownMenu.Sub>
          <HeaderMenuSubTrigger>
            <ThemeIcon theme={theme} />
            <span className="flex-1">{t("header.theme")}</span>
            <span className="text-muted-foreground">
              {t(`header.theme.${theme}`)}
            </span>
          </HeaderMenuSubTrigger>
          <HeaderMenuSubContent>
            <DropdownMenu.RadioGroup
              value={theme}
              onValueChange={(value) => {
                const next = THEMES.find((option) => option === value)
                if (next) {
                  setTheme(next)
                }
              }}
            >
              {THEMES.map((option) => (
                <HeaderMenuRadioItem
                  key={option}
                  value={option}
                  onSelect={(event) => event.preventDefault()}
                >
                  <ThemeIcon theme={option} />
                  <span className="flex-1">{t(`header.theme.${option}`)}</span>
                  <DropdownMenu.ItemIndicator>
                    <Check />
                  </DropdownMenu.ItemIndicator>
                </HeaderMenuRadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </HeaderMenuSubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Sub>
          <HeaderMenuSubTrigger>
            <Languages />
            <span className="flex-1">{t("header.language")}</span>
            <LanguageFlag language={language} />
            <span className="text-muted-foreground">
              {language.toUpperCase()}
            </span>
          </HeaderMenuSubTrigger>
          <HeaderMenuSubContent>
            <DropdownMenu.RadioGroup
              value={language}
              onValueChange={(next) => {
                if (isLanguage(next)) {
                  setLanguage(next)
                }
              }}
            >
              {LANGUAGES.map((option) => (
                <HeaderMenuRadioItem
                  key={option}
                  value={option}
                  onSelect={(event) => event.preventDefault()}
                >
                  <LanguageFlag language={option} />
                  <span className="flex-1">{t(`language.${option}`)}</span>
                  <DropdownMenu.ItemIndicator>
                    <Check />
                  </DropdownMenu.ItemIndicator>
                </HeaderMenuRadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </HeaderMenuSubContent>
        </DropdownMenu.Sub>
        <HeaderMenuSeparator />
        <NotInPrototype>
          <HeaderMenuItem>
            <LogOut />
            {t("header.logOut")}
          </HeaderMenuItem>
        </NotInPrototype>
      </HeaderMenuContent>
    </DropdownMenu.Root>
  )
}
