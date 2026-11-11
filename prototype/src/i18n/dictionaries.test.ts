import { describe, expect, it } from "vitest"

import en from "@/i18n/en.json"
import ru from "@/i18n/ru.json"

const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/

/** A plural phrase counts once, whatever forms its language needs. */
function phrases(dictionary: Record<string, string>): string[] {
  return [
    ...new Set(
      Object.keys(dictionary).map((key) => key.replace(PLURAL_SUFFIX, ""))
    ),
  ].sort()
}

function pluralPhrases(dictionary: Record<string, string>): string[] {
  return phrases(dictionary).filter((phrase) => `${phrase}_other` in dictionary)
}

describe("dictionaries", () => {
  it("Russian has every phrase English has, and nothing else", () => {
    expect(phrases(ru)).toEqual(phrases(en))
  })

  it("English plural phrases have one and other forms", () => {
    for (const phrase of pluralPhrases(en)) {
      expect(Object.keys(en)).toEqual(
        expect.arrayContaining([`${phrase}_one`, `${phrase}_other`])
      )
    }
  })

  it("Russian plural phrases have one, few, many and other forms", () => {
    for (const phrase of pluralPhrases(en)) {
      expect(Object.keys(ru)).toEqual(
        expect.arrayContaining([
          `${phrase}_one`,
          `${phrase}_few`,
          `${phrase}_many`,
          `${phrase}_other`,
        ])
      )
    }
  })

  it("no phrase is empty", () => {
    for (const dictionary of [en, ru]) {
      for (const text of Object.values(dictionary)) {
        expect(text.trim()).not.toBe("")
      }
    }
  })
})
