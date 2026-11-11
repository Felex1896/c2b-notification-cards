import gbFlag from "@/assets/flags/gb.svg"
import ruFlag from "@/assets/flags/ru.svg"
import type { Language } from "@/lib/language"

const FLAGS: Record<Language, string> = { en: gbFlag, ru: ruFlag }

export function LanguageFlag({ language }: { language: Language }) {
  return (
    <img
      src={FLAGS[language]}
      alt=""
      className="h-3 w-[18px] shrink-0 rounded-[2px] object-cover ring-1 ring-foreground/10"
    />
  )
}
