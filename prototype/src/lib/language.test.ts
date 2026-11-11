import { describe, expect, it } from "vitest"

import { pickLanguage } from "@/lib/language"

describe("language on open", () => {
  it("a language in the link wins over the browser", () => {
    expect(pickLanguage("en", ["ru-RU"])).toBe("en")
    expect(pickLanguage("ru", ["en-US"])).toBe("ru")
  })

  it("an unknown language in the link is ignored", () => {
    expect(pickLanguage("de", ["ru-RU"])).toBe("ru")
  })

  it("a Russian browser opens in Russian", () => {
    expect(pickLanguage(null, ["ru"])).toBe("ru")
    expect(pickLanguage(null, ["ru-RU", "en-US"])).toBe("ru")
  })

  it("any other browser language opens in English", () => {
    expect(pickLanguage(null, ["de-DE", "ru-RU"])).toBe("en")
    expect(pickLanguage(null, ["uk-UA"])).toBe("en")
  })

  it("no browser language opens in English", () => {
    expect(pickLanguage(null, [])).toBe("en")
  })
})
