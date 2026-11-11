import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import en from "@/i18n/en.json"
import ru from "@/i18n/ru.json"
import { isLanguage, pickLanguage, type Language } from "@/lib/language"

function writeLanguageToUrl(language: Language) {
  const url = new URL(window.location.href)
  url.searchParams.set("lang", language)
  window.history.replaceState(
    null,
    "",
    `${url.pathname}${url.search}${url.hash}`
  )
}

function applyToDocument() {
  document.documentElement.lang = i18n.language
  document.title = i18n.t("app.title")
}

export function bootLanguage() {
  const initial = pickLanguage(
    new URLSearchParams(window.location.search).get("lang"),
    navigator.languages
  )

  void i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, ru: { translation: ru } },
    lng: initial,
    fallbackLng: "en",
    keySeparator: false,
    interpolation: { escapeValue: false },
  })
  applyToDocument()

  i18n.on("languageChanged", (language) => {
    applyToDocument()
    if (isLanguage(language)) {
      writeLanguageToUrl(language)
    }
  })
}
