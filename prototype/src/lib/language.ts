export type Language = "en" | "ru"

export const LANGUAGES: Language[] = ["en", "ru"]

export function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "ru"
}

/**
 * The link wins; otherwise the browser's first language. Any Russian variant
 * opens in Russian, every other language in English.
 */
export function pickLanguage(
  fromLink: string | null,
  browserLanguages: readonly string[]
): Language {
  if (isLanguage(fromLink)) {
    return fromLink
  }
  const first = browserLanguages[0]?.toLowerCase() ?? ""
  return first === "ru" || first.startsWith("ru-") ? "ru" : "en"
}

/** Number and currency formatting follows the interface language. */
export function numberLocale(language: Language): string {
  return language === "ru" ? "ru-RU" : "en-GB"
}
