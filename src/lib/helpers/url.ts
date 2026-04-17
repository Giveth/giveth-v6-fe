/**
 * Safely decode a URI component, returning the original value if decoding
 * fails (e.g. because the value contains a stray `%` that is not part of a
 * valid percent-encoded sequence).
 *
 * This is useful for consuming route parameters returned by Next.js
 * `useParams()`, which can surface URL-encoded segments when the underlying
 * slug contains reserved characters (e.g. `:`).
 */
export const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
