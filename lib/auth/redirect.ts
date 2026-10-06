/** Only allow same-origin relative paths such as "/dashboard". */
export function safeRedirectPath(path: string | null | undefined, fallback = '/dashboard') {
  if (
    !path ||
    !path.startsWith('/') ||
    path.startsWith('//') ||
    path.includes('\\') ||
    /[\u0000-\u001f]/.test(path)
  ) {
    return fallback
  }
  return path
}
