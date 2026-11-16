/**
 * A finger on a control waits until it lifts. If the finger moved,
 * the gesture is a scroll and the control does not run.
 * A mouse press is left alone.
 *
 * The same selector is repeated in index.css as `touch-action: manipulation`,
 * so the browser may pan even when this module cancels the press.
 */

export const TOUCH_SLOP_PX = 10
export const TOUCH_HOLD_MS = 500

export const INTERACTIVE_SELECTOR = [
  "button",
  "a",
  "input",
  "textarea",
  "select",
  "label",
  "summary",
  "[role='button']",
  "[role='tab']",
  "[role='checkbox']",
  "[role='switch']",
  "[role='radio']",
  "[role='menuitem']",
  "[role='menuitemradio']",
  "[role='menuitemcheckbox']",
  "[role='option']",
  "[role='combobox']",
  "[role='link']",
].join(", ")

export function shouldDeferTouch(input: {
  pointerType: string
  button: number
  trusted: boolean
  interactive: boolean
  activeField: boolean
}): boolean {
  if (!input.trusted || input.pointerType === "mouse" || input.button !== 0) {
    return false
  }
  if (!input.interactive || input.activeField) {
    return false
  }
  return true
}

export function pointerMovedPastSlop(
  start: { x: number; y: number },
  point: { x: number; y: number },
  slop = TOUCH_SLOP_PX
): boolean {
  const dx = point.x - start.x
  const dy = point.y - start.y
  return dx * dx + dy * dy > slop * slop
}

/** What to run when the finger lifts. `press` is the down and the click. */
export function touchRelease(input: {
  deferred: boolean
  moved: boolean
  held: boolean
}): "none" | "press" | "click" {
  if (!input.deferred || input.moved) {
    return "none"
  }
  if (input.held) {
    return "click"
  }
  return "press"
}

/** The browser's own click after this gesture would be a second run, or a scroll. */
export function swallowFollowingClick(input: {
  deferred: boolean
  moved: boolean
}): boolean {
  return input.deferred || input.moved
}

const DRAG_SELECTOR = "[data-touch-drag]"
const HELD_SELECTOR = "[data-touch-held]"
const FIELD_SELECTOR = "input, textarea, select"

export function touchTargetFlags(
  target: EventTarget | null,
  active: Element | null
): { interactive: boolean; activeField: boolean; held: boolean } {
  const element = asElement(target)
  const drag = element?.closest(DRAG_SELECTOR) != null
  const field = element?.closest(FIELD_SELECTOR) ?? null
  return {
    interactive: !drag && element?.closest(INTERACTIVE_SELECTOR) != null,
    activeField: field != null && field === active,
    held: element?.closest(HELD_SELECTOR) != null,
  }
}

function asElement(target: EventTarget | null): Element | null {
  if (target instanceof Element) {
    return target
  }
  if (target instanceof Node) {
    return target.parentElement
  }
  return null
}

type Gesture = {
  id: number
  x: number
  y: number
  deferred: boolean
  moved: boolean
  target: EventTarget | null
}

let gesture: Gesture | null = null
let swallowTrustedClick = false

function onPointerDown(event: PointerEvent) {
  if (!event.isTrusted || event.pointerType === "mouse" || event.button !== 0) {
    return
  }
  swallowTrustedClick = false
  const flags = touchTargetFlags(event.target, document.activeElement)
  const deferred = shouldDeferTouch({
    pointerType: event.pointerType,
    button: event.button,
    trusted: true,
    interactive: flags.interactive,
    activeField: flags.activeField,
  })
  gesture = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    deferred,
    moved: false,
    target: event.target,
  }
  if (deferred) {
    event.preventDefault()
  }
}

function onPointerMove(event: PointerEvent) {
  if (!gesture || event.pointerId !== gesture.id || gesture.moved) {
    return
  }
  if (pointerMovedPastSlop(gesture, { x: event.clientX, y: event.clientY })) {
    gesture.moved = true
  }
}

function finish(event: PointerEvent, cancelled: boolean) {
  if (!event.isTrusted || !gesture || event.pointerId !== gesture.id) {
    return
  }
  const current = gesture
  gesture = null
  if (cancelled) {
    current.moved = true
  }
  swallowTrustedClick = swallowFollowingClick(current)
  const element = asElement(current.target)
  if (!element) {
    return
  }
  const action = touchRelease({
    deferred: current.deferred,
    moved: current.moved,
    held: touchTargetFlags(current.target, null).held,
  })
  if (action === "press") {
    replayPress(element, event)
  } else if (action === "click") {
    replayClick(element)
  }
}

function onClickOrMouseDown(event: MouseEvent) {
  if (!event.isTrusted || !swallowTrustedClick) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  if (event.type === "click") {
    swallowTrustedClick = false
  }
}

function replayPress(element: Element, event: PointerEvent) {
  const at = {
    bubbles: true,
    cancelable: true,
    composed: true,
    clientX: event.clientX,
    clientY: event.clientY,
    screenX: event.screenX,
    screenY: event.screenY,
    button: 0,
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
    metaKey: event.metaKey,
  }
  element.dispatchEvent(
    new PointerEvent("pointerdown", {
      ...at,
      pointerId: 1,
      pointerType: "touch",
      isPrimary: true,
      buttons: 1,
    })
  )
  element.dispatchEvent(
    new PointerEvent("pointerup", {
      ...at,
      pointerId: 1,
      pointerType: "touch",
      isPrimary: true,
      buttons: 0,
    })
  )
  element.dispatchEvent(new MouseEvent("mousedown", { ...at, view: window }))
  replayClick(element)
}

function replayClick(element: Element) {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    element.focus({ preventScroll: true })
  }
  if (element instanceof HTMLElement) {
    element.click()
  }
}

const INSTALLED = Symbol.for("c2b-touch-tap")

/** One listener set for the document. Safe to call again. */
export function installTouchTap(doc: Document = document) {
  const marked = doc as Document & { [INSTALLED]?: boolean }
  if (marked[INSTALLED]) {
    return
  }
  marked[INSTALLED] = true
  doc.addEventListener("pointerdown", onPointerDown, true)
  doc.addEventListener("pointermove", onPointerMove, true)
  doc.addEventListener("pointerup", (event) => finish(event, false), true)
  doc.addEventListener("pointercancel", (event) => finish(event, true), true)
  doc.addEventListener("mousedown", onClickOrMouseDown, true)
  doc.addEventListener("click", onClickOrMouseDown, true)
}
