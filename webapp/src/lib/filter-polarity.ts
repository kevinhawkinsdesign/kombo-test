// Include/Exclude polarity for filter selections.
//
// Excluded values are stored in the SAME string arrays as included ones,
// encoded with a leading "!" (e.g. ["EMEA", "!LATAM"] = include EMEA,
// exclude LATAM). A pragmatic prototype choice: AiQuery, saved searches,
// active-filter counts and chip plumbing all keep working on plain string
// arrays — only the matchers below and the chip renderers need to know
// about polarity.

export const EXCLUDE_PREFIX = "!"

export function isExcluded(v: string): boolean {
  return v.startsWith(EXCLUDE_PREFIX)
}

/** Encode a value as excluded (idempotent). */
export function excludeValue(v: string): string {
  return isExcluded(v) ? v : `${EXCLUDE_PREFIX}${v}`
}

/** Strip the exclude prefix, if any. */
export function baseValue(v: string): string {
  return isExcluded(v) ? v.slice(EXCLUDE_PREFIX.length) : v
}

/** Split a raw selection into de-prefixed include and exclude lists. */
export function splitSelection(sel: string[]): {
  include: string[]
  exclude: string[]
} {
  const include: string[] = []
  const exclude: string[] = []
  for (const v of sel) {
    if (isExcluded(v)) exclude.push(baseValue(v))
    else include.push(v)
  }
  return { include, exclude }
}

/**
 * Does a scalar record value pass the selection? False when the value is
 * excluded; false when includes exist and the value isn't one of them.
 */
export function matchValue(sel: string[], value: string): boolean {
  const { include, exclude } = splitSelection(sel)
  if (exclude.includes(value)) return false
  if (include.length > 0 && !include.includes(value)) return false
  return true
}

/**
 * Does an array-valued record field pass the selection? False when any of
 * the record's values is excluded; false when includes exist and none of
 * the record's values overlap them.
 */
export function matchAny(sel: string[], values: string[]): boolean {
  const { include, exclude } = splitSelection(sel)
  if (values.some((v) => exclude.includes(v))) return false
  if (include.length > 0 && !values.some((v) => include.includes(v))) return false
  return true
}
