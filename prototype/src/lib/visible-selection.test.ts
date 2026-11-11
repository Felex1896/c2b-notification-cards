import { describe, expect, it } from "vitest"

import { visibleSelectState } from "@/lib/visible-selection"

describe("visibleSelectState", () => {
  it("Select all is unchecked when no visible entity is selected", () => {
    expect(visibleSelectState(["a", "b"], new Set())).toBe(false)
  })

  it("Select all is checked when every visible entity is selected", () => {
    expect(visibleSelectState(["a", "b"], new Set(["a", "b", "hidden"]))).toBe(
      true
    )
  })

  it("Select all is mixed when some visible entities are selected", () => {
    expect(visibleSelectState(["a", "b"], new Set(["a"]))).toBe("indeterminate")
  })

  it("a hidden entity does not count toward Select all", () => {
    expect(visibleSelectState(["a"], new Set(["hidden"]))).toBe(false)
    expect(visibleSelectState(["a"], new Set(["a", "hidden"]))).toBe(true)
  })

  it("Select all is unchecked when the search matches nothing", () => {
    expect(visibleSelectState([], new Set(["a"]))).toBe(false)
  })
})
