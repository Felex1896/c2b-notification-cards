import { describe, expect, it } from "vitest"

import {
  hasHorizontalOverflow,
  scrollbarThumb,
  scrollLimit,
  syncedScrollLeft,
} from "@/lib/table-scroll"

describe("the bottom scrollbar", () => {
  it("a table wider than its pane shows the bottom scrollbar", () => {
    expect(hasHorizontalOverflow(1320, 1000)).toBe(true)
  })

  it("a table that fits its pane hides the bottom scrollbar", () => {
    expect(hasHorizontalOverflow(1000, 1000)).toBe(false)
    expect(hasHorizontalOverflow(1000, 1200)).toBe(false)
  })

  it("a one-pixel rounding difference hides the bottom scrollbar", () => {
    expect(hasHorizontalOverflow(1001, 1000)).toBe(false)
  })
})

describe("one horizontal offset for the header and the rows", () => {
  it("the header stays on the same horizontal offset as the rows", () => {
    expect(syncedScrollLeft(80, scrollLimit(1320, 1000))).toBe(80)
  })

  it("the horizontal offset never passes the end of the table", () => {
    expect(syncedScrollLeft(500, scrollLimit(1320, 1000))).toBe(320)
  })

  it("the horizontal offset never goes past the start", () => {
    expect(syncedScrollLeft(-20, scrollLimit(1320, 1000))).toBe(0)
    expect(syncedScrollLeft(Number.NaN, 320)).toBe(0)
  })

  it("a table that fits stays at the start", () => {
    expect(syncedScrollLeft(40, scrollLimit(800, 1000))).toBe(0)
  })
})

describe("the visible scrollbar thumb", () => {
  it("the thumb starts at the left before any sideways scroll", () => {
    expect(scrollbarThumb(1320, 1000, 0)?.offset).toBe(0)
  })

  it("the thumb reaches the right end when the table is scrolled to the end", () => {
    const thumb = scrollbarThumb(1320, 1000, scrollLimit(1320, 1000))
    expect(thumb).not.toBeNull()
    if (!thumb) {
      return
    }
    expect(thumb.offset + thumb.width).toBeCloseTo(1000)
  })

  it("a table that fits its pane has no thumb", () => {
    expect(scrollbarThumb(1000, 1200, 0)).toBeNull()
    expect(scrollbarThumb(1001, 1000, 0)).toBeNull()
  })

  it("the thumb is shorter when more of the table is hidden", () => {
    const wider = scrollbarThumb(2000, 1000, 0)
    const narrower = scrollbarThumb(1200, 1000, 0)
    expect(wider).not.toBeNull()
    expect(narrower).not.toBeNull()
    if (!wider || !narrower) {
      return
    }
    expect(wider.width).toBeLessThan(narrower.width)
  })
})
