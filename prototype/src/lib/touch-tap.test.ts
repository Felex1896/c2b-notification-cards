import { describe, expect, it } from "vitest"

import {
  pointerMovedPastSlop,
  shouldDeferTouch,
  swallowFollowingClick,
  touchRelease,
  TOUCH_SLOP_PX,
} from "@/lib/touch-tap"

const touchOnControl = {
  pointerType: "touch",
  button: 0,
  trusted: true,
  interactive: true,
  activeField: false,
}

describe("a finger on a control", () => {
  it("waits until the finger lifts", () => {
    expect(shouldDeferTouch(touchOnControl)).toBe(true)
  })

  it("leaves a mouse press to the browser", () => {
    expect(shouldDeferTouch({ ...touchOnControl, pointerType: "mouse" })).toBe(
      false
    )
  })

  it("leaves a drag handle to the browser", () => {
    expect(shouldDeferTouch({ ...touchOnControl, interactive: false })).toBe(
      false
    )
  })

  it("leaves a field that already has focus to the browser", () => {
    expect(shouldDeferTouch({ ...touchOnControl, activeField: true })).toBe(
      false
    )
  })

  it("ignores a press that did not come from the finger", () => {
    expect(shouldDeferTouch({ ...touchOnControl, trusted: false })).toBe(false)
  })
})

describe("scroll against a tap", () => {
  it("a finger that stays within the slop is a tap", () => {
    expect(
      pointerMovedPastSlop({ x: 0, y: 0 }, { x: TOUCH_SLOP_PX, y: 0 })
    ).toBe(false)
  })

  it("a finger that moves past the slop is a scroll", () => {
    expect(
      pointerMovedPastSlop({ x: 0, y: 0 }, { x: TOUCH_SLOP_PX + 1, y: 0 })
    ).toBe(true)
  })

  it("a scroll does not run the control", () => {
    expect(touchRelease({ deferred: true, moved: true, held: false })).toBe(
      "none"
    )
  })

  it("a tap runs the press after the finger lifts", () => {
    expect(touchRelease({ deferred: true, moved: false, held: false })).toBe(
      "press"
    )
  })

  it("a hold runs only the click, so the press is not repeated", () => {
    expect(touchRelease({ deferred: true, moved: false, held: true })).toBe(
      "click"
    )
  })

  it("a scroll swallows the click the browser would still fire", () => {
    expect(swallowFollowingClick({ deferred: false, moved: true })).toBe(true)
  })

  it("a tap swallows the browser click because the control already ran", () => {
    expect(swallowFollowingClick({ deferred: true, moved: false })).toBe(true)
  })
})
