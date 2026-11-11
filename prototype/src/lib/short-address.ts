const HEAD = 6
const TAIL = 4

/** First six characters, an ellipsis, last four. Short addresses stay whole. */
export function shortAddress(address: string): string {
  if (address.length <= HEAD + TAIL + 1) {
    return address
  }
  return `${address.slice(0, HEAD)}…${address.slice(-TAIL)}`
}
