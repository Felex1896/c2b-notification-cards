import { useTranslation } from "react-i18next"

import { isLanguage, type Language } from "@/lib/language"

export function useLanguage(): {
  language: Language
  setLanguage: (language: Language) => void
} {
  const { i18n } = useTranslation()
  return {
    language: isLanguage(i18n.language) ? i18n.language : "en",
    setLanguage: (language) => void i18n.changeLanguage(language),
  }
}
