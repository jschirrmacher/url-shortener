// Short Code validation pattern
const SHORT_CODE_CHARS = "[a-zA-Z0-9_\\-]"
export const SHORT_CODE_PATTERN_STRING = `^${SHORT_CODE_CHARS}{6,}$`
export const SHORT_CODE_PATTERN = new RegExp(SHORT_CODE_PATTERN_STRING, "v")

export function isValidShortCode(code: string): boolean {
  if (!code) return true
  return SHORT_CODE_PATTERN.test(code)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
