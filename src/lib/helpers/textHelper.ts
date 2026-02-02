/**
 * Truncates text to a maximum length
 * @param text - The text to truncate
 * @param maxLength - The maximum length of the text
 * @param ellipsis - The ellipsis to use
 * @returns The truncated text
 */
export const truncateText = (
  text: string,
  maxLength: number = 50,
  ellipsis: string = '...',
) => {
  if (!text) return ''
  return text.length > maxLength
    ? `${text.slice(0, maxLength)}${ellipsis}`
    : text
}
