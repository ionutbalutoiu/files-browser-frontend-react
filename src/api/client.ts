import { z } from 'zod'
import { env } from '../env'
import { encodePathForApi } from '../lib/path'

/**
 * Custom error class for API errors.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public body?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let body: unknown
    let message = `${response.status} ${response.statusText}`

    try {
      body = await response.json()
      if (typeof body === 'object' && body !== null && 'error' in body) {
        message = String((body as { error: unknown }).error)
      }
    } catch {
      // Body is not JSON, use status text
    }

    return new ApiError(message, response.status, response.statusText, body)
  }
}

/**
 * Makes a JSON API request to the backend.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  schema?: z.ZodType<T>
): Promise<T> {
  const url = `${env.apiOrigin}${path}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw await ApiError.fromResponse(response)
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T
  }

  const data: unknown = await response.json()

  if (schema) {
    return schema.parse(data)
  }

  return data as T
}

/**
 * Fetches a directory listing from the files endpoint.
 * Adds trailing slash and ?format=json as required by Nginx autoindex.
 */
export async function filesFetch<T>(path: string, schema?: z.ZodType<T>): Promise<T> {
  const encodedPath = encodePathForApi(path)
  // Ensure trailing slash for directory listing, add format=json
  const normalizedPath = encodedPath ? `/${encodedPath}/` : '/'
  const url = `${env.filesOrigin}/files${normalizedPath}?format=json`

  const response = await fetch(url)

  if (!response.ok) {
    throw await ApiError.fromResponse(response)
  }

  const data: unknown = await response.json()

  if (schema) {
    return schema.parse(data)
  }

  return data as T
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void
  signal?: AbortSignal
}

/**
 * Uploads a single file using XMLHttpRequest for progress tracking.
 */
export function uploadSingleFile(
  file: File,
  destinationPath: string,
  options: UploadOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()

    formData.append('files', file)

    const encodedPath = encodePathForApi(destinationPath)
    const url = `${env.apiOrigin}/api/files?path=${encodedPath}`

    xhr.open('PUT', url)

    if (options.signal) {
      options.signal.addEventListener('abort', () => {
        xhr.abort()
        reject(new DOMException('Upload aborted', 'AbortError'))
      })
    }

    if (options.onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          options.onProgress?.({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          })
        }
      })
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        let message = `${xhr.status} ${xhr.statusText}`
        try {
          const body = JSON.parse(xhr.responseText) as unknown
          if (typeof body === 'object' && body !== null && 'error' in body) {
            message = String((body as { error: unknown }).error)
          }
        } catch {
          // Response is not JSON
        }
        reject(new ApiError(message, xhr.status, xhr.statusText))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'))
    })

    xhr.addEventListener('abort', () => {
      reject(new DOMException('Upload aborted', 'AbortError'))
    })

    xhr.send(formData)
  })
}

/**
 * Uploads multiple files using XMLHttpRequest for progress tracking.
 * @deprecated Use uploadSingleFile for individual file tracking
 */
export function uploadFetch(
  files: File[],
  destinationPath: string,
  options: UploadOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()

    for (const file of files) {
      formData.append('files', file)
    }

    const encodedPath = encodePathForApi(destinationPath)
    const url = `${env.apiOrigin}/api/files?path=${encodedPath}`

    xhr.open('PUT', url)

    if (options.signal) {
      options.signal.addEventListener('abort', () => {
        xhr.abort()
        reject(new DOMException('Upload aborted', 'AbortError'))
      })
    }

    if (options.onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          options.onProgress?.({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          })
        }
      })
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        let message = `${xhr.status} ${xhr.statusText}`
        try {
          const body = JSON.parse(xhr.responseText) as unknown
          if (typeof body === 'object' && body !== null && 'error' in body) {
            message = String((body as { error: unknown }).error)
          }
        } catch {
          // Response is not JSON
        }
        reject(new ApiError(message, xhr.status, xhr.statusText))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'))
    })

    xhr.addEventListener('abort', () => {
      reject(new DOMException('Upload aborted', 'AbortError'))
    })

    xhr.send(formData)
  })
}

/**
 * API client methods for specific endpoints.
 */
export const api = {
  /** Create a new folder */
  createFolder: (path: string) =>
    apiFetch('/api/folders', {
      method: 'POST',
      body: JSON.stringify({ path }),
    }),

  /** Delete a file or folder */
  deleteItem: (path: string) => {
    const encodedPath = encodePathForApi(path)
    return apiFetch(`/api/files?path=${encodedPath}`, {
      method: 'DELETE',
    })
  },

  /** Rename a file or folder */
  renameItem: (path: string, newName: string) =>
    apiFetch('/api/files/rename', {
      method: 'POST',
      body: JSON.stringify({ path, name: newName }),
    }),

  /** Move a file or folder */
  moveItem: (from: string, to: string) =>
    apiFetch('/api/files/move', {
      method: 'POST',
      body: JSON.stringify({ from, to }),
    }),

  /** Get all shares */
  getShares: () => apiFetch<string[]>('/api/public-shares'),

  /** Create a share */
  createShare: (path: string) =>
    apiFetch('/api/public-shares', {
      method: 'POST',
      body: JSON.stringify({ path }),
    }),

  /** Delete a share */
  deleteShare: (path: string) => {
    const encodedPath = encodePathForApi(path)
    return apiFetch(`/api/public-shares?path=${encodedPath}`, {
      method: 'DELETE',
    })
  },
}
