/**
 * Environment configuration with defaults.
 */
export const env = {
  /** Base URL for API endpoints */
  apiOrigin: import.meta.env.VITE_API_ORIGIN || '',

  /** Base URL for file listings (Nginx autoindex) */
  filesOrigin: import.meta.env.VITE_FILES_ORIGIN || '',

  /** Base URL for share links */
  shareOrigin: import.meta.env.VITE_SHARE_ORIGIN || '',

  /** Share URL template */
  shareUrlTemplate: import.meta.env.VITE_SHARE_URL_TEMPLATE || '/s/{shareId}',
} as const

// Warn if share origin is not configured
if (!env.shareOrigin && typeof window !== 'undefined') {
  console.warn('VITE_SHARE_ORIGIN is not configured. Share links may not work correctly.')
}

/**
 * Builds a share URL from a share ID.
 */
export function buildShareUrl(shareId: string): string {
  const template = env.shareUrlTemplate
  const path = template.replace('{shareId}', encodeURIComponent(shareId))
  return env.shareOrigin ? `${env.shareOrigin}${path}` : path
}
