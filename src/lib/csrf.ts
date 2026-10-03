export function verifyCsrfOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  const referer = request.headers.get('referer')

  if (!origin && !referer) {
    // Some strict CSRF protections block requests without origin/referer entirely,
    // but this can break legitimate API consumers like curl or mobile apps.
    // For browser-based CSRF protection, we assume browsers always send one of these
    // for cross-origin POSTs.
    return true
  }

  try {
    if (origin) {
      const originUrl = new URL(origin)
      return originUrl.host === host
    } else if (referer) {
      const refererUrl = new URL(referer)
      return refererUrl.host === host
    }
  } catch {
    return false
  }

  return false
}
