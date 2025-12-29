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
