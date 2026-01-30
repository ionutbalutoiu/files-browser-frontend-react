/**
 * Runtime configuration injected at container startup.
 */
interface RuntimeConfig {
  PUBLIC_BASE_URL?: string
}

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: RuntimeConfig
  }
}

/**
 * Get runtime config value, falling back to placeholder check.
 */
function getRuntimeConfig(): RuntimeConfig {
  const config = window.__RUNTIME_CONFIG__ ?? {}
  // Check if placeholder was not replaced (dev mode or misconfiguration)
  if (config.PUBLIC_BASE_URL === '__PUBLIC_BASE_URL__') {
    return { PUBLIC_BASE_URL: '' }
  }
  return config
}

/**
 * Environment configuration with defaults.
 */
export const env = {
  /** Base URL for API endpoints */
  apiOrigin: import.meta.env.VITE_API_ORIGIN || '',

  /** Base URL for file listings (Nginx autoindex) */
  filesOrigin: import.meta.env.VITE_FILES_ORIGIN || '',

  /** Share URL template */
  shareUrlTemplate: import.meta.env.VITE_SHARE_URL_TEMPLATE || '/{shareId}',
} as const

/**
 * Get the public base URL for share links (runtime injected).
 */
export function getPublicBaseUrl(): string {
  return getRuntimeConfig().PUBLIC_BASE_URL || ''
}

/**
 * Builds a share URL from a share ID.
 */
export function buildShareUrl(shareId: string): string {
  const template = env.shareUrlTemplate
  const path = template.replace('{shareId}', encodeURIComponent(shareId))
  const baseUrl = getPublicBaseUrl()
  return baseUrl ? `${baseUrl}${path}` : path
}
