import { describe, expect, it } from "vitest"

import { shortAddress } from "@/lib/short-address"

describe("shortAddress", () => {
  it("shortens a long address to its first six and last four characters", () => {
    expect(shortAddress("0x5b1e83c07f2a94d6e0b3718c4fa92d605e8b17c3")).toBe(
      "0x5b1e…17c3"
    )
  })

  it("shortens a Tron address the same way", () => {
    expect(shortAddress("TQn9Y2khDGZfEzauZQkFhnzsSZjDnjLWqx")).toBe(
      "TQn9Y2…LWqx"
    )
  })

  it("leaves a short address whole", () => {
    expect(shortAddress("0x5b1e17c3")).toBe("0x5b1e17c3")
  })
})
