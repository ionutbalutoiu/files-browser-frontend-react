export interface PathValidationResult {
  valid: boolean
  error?: string
  normalized?: string
}

/**
 * Validates a path against security rules.
 * Rejects paths that:
 * - Start with `/` (absolute paths)
 * - Contain `..` (directory traversal)
 * - Contain null bytes or backslashes
 * - Have segments starting with `.` (hidden files)
 */
export function validatePath(path: string): PathValidationResult {
  if (!path) {
    return { valid: true, normalized: '' }
  }

  // Check for null bytes
  if (path.includes('\0')) {
    return { valid: false, error: 'Path contains null bytes' }
  }

  // Check for backslashes
  if (path.includes('\\')) {
    return { valid: false, error: 'Path contains backslashes' }
  }

  // Check for absolute paths
  if (path.startsWith('/')) {
    return { valid: false, error: 'Absolute paths are not allowed' }
  }

  // Check for directory traversal
  if (path.includes('..')) {
    return { valid: false, error: 'Directory traversal is not allowed' }
  }

  // Normalize the path (remove trailing slashes, collapse multiple slashes)
  const normalized = path
    .split('/')
    .filter((segment) => segment.length > 0)
    .join('/')

  // Check for hidden files (segments starting with .)
  const segments = normalized.split('/')
  for (const segment of segments) {
    if (segment.startsWith('.')) {
      return { valid: false, error: 'Hidden files are not allowed' }
    }
  }

  return { valid: true, normalized }
}

/**
 * Joins multiple path segments together, normalizing the result.
 * Throws if the resulting path is invalid.
 */
export function joinPath(...segments: string[]): string {
  const parts: string[] = []

  for (const segment of segments) {
    if (!segment) continue
    const cleaned = segment.split('/').filter((s) => s.length > 0)
    parts.push(...cleaned)
  }

  const result = parts.join('/')
  const validation = validatePath(result)

  if (!validation.valid) {
    throw new Error(`Invalid path: ${validation.error}`)
  }

  return validation.normalized ?? ''
}

/**
 * Gets the directory name from a path (everything before the last segment).
 */
export function dirname(path: string): string {
  if (!path) return ''

  const segments = path.split('/').filter((s) => s.length > 0)
  if (segments.length <= 1) return ''

  return segments.slice(0, -1).join('/')
}

/**
 * Gets the base name from a path (the last segment).
 */
export function basename(path: string): string {
  if (!path) return ''

  const segments = path.split('/').filter((s) => s.length > 0)
  return segments[segments.length - 1] ?? ''
}

/**
 * Gets the file extension from a path (including the dot).
 * Returns empty string if no extension.
 */
export function extname(path: string): string {
  const base = basename(path)
  const lastDot = base.lastIndexOf('.')

  if (lastDot === -1 || lastDot === 0) {
    return ''
  }

  return base.slice(lastDot)
}

/**
 * Encodes a path for use in API URLs.
 * Each segment is URL-encoded separately to preserve the path structure.
 */
export function encodePathForApi(path: string): string {
  if (!path) return ''

  return path
    .split('/')
    .filter((s) => s.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

/**
 * Gets all parent paths for a given path, from root to immediate parent.
 * Useful for breadcrumb navigation.
 */
export function getParentPaths(path: string): string[] {
  if (!path) return []

  const segments = path.split('/').filter((s) => s.length > 0)
  const parents: string[] = []

  for (let i = 1; i < segments.length; i++) {
    parents.push(segments.slice(0, i).join('/'))
  }

  return parents
}

/**
 * Checks if a path is a child of another path.
 */
export function isChildOf(childPath: string, parentPath: string): boolean {
  if (!parentPath) return true
  if (!childPath) return false

  const normalizedChild = childPath.split('/').filter((s) => s.length > 0)
  const normalizedParent = parentPath.split('/').filter((s) => s.length > 0)

  if (normalizedChild.length <= normalizedParent.length) {
    return false
  }

  for (let i = 0; i < normalizedParent.length; i++) {
    if (normalizedChild[i] !== normalizedParent[i]) {
      return false
    }
  }

  return true
}
