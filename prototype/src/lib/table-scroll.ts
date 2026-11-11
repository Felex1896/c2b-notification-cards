/** True when the rows are wider than the pane, so the bottom bar is shown. */
export function hasHorizontalOverflow(
  contentWidth: number,
  paneWidth: number
): boolean {
  return contentWidth - paneWidth > 1
}

/** How far a pane can scroll. */
export function scrollLimit(contentWidth: number, paneWidth: number): number {
  return Math.max(0, contentWidth - paneWidth)
}

/**
 * The offset shared by the header, the rows and the bottom bar.
 * Never past either end of the pane.
 */
export function syncedScrollLeft(scrollLeft: number, limit: number): number {
  if (!Number.isFinite(scrollLeft) || scrollLeft <= 0) {
    return 0
  }
  const cap = Number.isFinite(limit) && limit > 0 ? limit : 0
  return Math.min(scrollLeft, cap)
}

export type ScrollbarThumb = { width: number; offset: number }

const THUMB_MIN = 24

/**
 * Size and position of the visible thumb inside the pane.
 * `null` when the table fits and the bar is hidden.
 */
export function scrollbarThumb(
  contentWidth: number,
  paneWidth: number,
  scrollLeft: number
): ScrollbarThumb | null {
  if (!hasHorizontalOverflow(contentWidth, paneWidth) || paneWidth <= 0) {
    return null
  }
  const width = Math.min(
    paneWidth,
    Math.max(THUMB_MIN, (paneWidth * paneWidth) / contentWidth)
  )
  const limit = scrollLimit(contentWidth, paneWidth)
  const travel = Math.max(0, paneWidth - width)
  const offset =
    limit === 0 ? 0 : (syncedScrollLeft(scrollLeft, limit) / limit) * travel
  return { width, offset }
}
