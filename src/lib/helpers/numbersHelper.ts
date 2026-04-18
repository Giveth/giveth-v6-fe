/**
 * Normalize a decimal input string.
 *
 * Keeps digits plus a single decimal point (dot or comma), converts commas to
 * dots, strips thousands separators, and returns the cleaned string. May return
 * an empty string if the input is empty or all characters are removed during
 * normalization.
 *
 * @param raw - Raw user input containing a decimal number
 * @returns Normalized decimal string with digits and at most one dot, or an empty string
 */
export function normalizeDecimalInput(raw: string): string {
  let s = raw.trim()
  if (!s) return ''

  // Keep only digits, dot and comma
  s = s.replace(/[^\d.,]/g, '')

  const hasDot = s.includes('.')
  const hasComma = s.includes(',')

  // If both separators exist, treat the last one as decimal separator and
  // remove the others as thousands separators.
  if (hasDot && hasComma) {
    const lastDot = s.lastIndexOf('.')
    const lastComma = s.lastIndexOf(',')
    const decimalIsDot = lastDot > lastComma

    if (decimalIsDot) {
      s = s.replace(/,/g, '')
    } else {
      s = s.replace(/\./g, '')
      s = s.replace(',', '.')
    }
  } else if (hasComma) {
    s = s.replace(',', '.')
  }

  // Remove extra dots (keep first)
  const firstDot = s.indexOf('.')
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '')
  }

  // Fix leading ".5" -> "0.5"
  if (s.startsWith('.')) s = `0${s}`

  return s
}

/**
 * Round the amount to the nearest 10
 *
 * @param value - The value to round
 * @returns The rounded value
 */
export function roundAmount(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0

  const rounded = value < 10 ? Math.round(value) : Math.round(value / 10) * 10

  return rounded === 0 ? 1 : rounded
}

/**
 * Round a value to the nearest whole number.
 *
 * Returns null for non-numeric inputs.
 */
export function roundToWholeNumber(
  value?: number | string | null,
): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' && value.trim() === '') return null

  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) return null

  return Math.round(numeric)
}
