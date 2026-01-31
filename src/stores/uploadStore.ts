import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uploadSingleFile } from '../api/client'
import { showNotification } from './notificationStore'
import { invalidateDir } from '../lib/cache'
import type { QueryClient } from '@tanstack/react-query'

export type UploadStatus = 'queued' | 'uploading' | 'processing' | 'done' | 'failed'

export interface UploadItem {
  id: string
  fileName: string
  fileSize: number
  targetPath: string
  status: UploadStatus
  progress: number
  error?: string
  retryCount: number
  createdAt: number
  completedAt?: number
}

// We store File objects separately since they can't be serialized
const fileMap = new Map<string, File>()
const abortControllerMap = new Map<string, AbortController>()

interface UploadState {
  items: UploadItem[]
  isPanelOpen: boolean
  concurrency: number

  // Actions
  addFiles: (files: File[], targetPath: string, queryClient: QueryClient) => void
  cancel: (id: string) => void
  retry: (id: string, queryClient: QueryClient) => void
  remove: (id: string) => void
  clearCompleted: () => void
  togglePanel: () => void
  setPanel: (open: boolean) => void

  // Internal actions
  _updateItem: (id: string, updates: Partial<UploadItem>) => void
  _processQueue: (queryClient: QueryClient) => void
}

// Retry delays: 1s, 2s, 4s
const RETRY_DELAYS = [1000, 2000, 4000]
const MAX_RETRIES = 3

export const useUploadStore = create<UploadState>()(
  persist(
    (set, get) => ({
      items: [],
      isPanelOpen: false,
      concurrency: 3,

      addFiles: (files, targetPath, queryClient) => {
        const newItems: UploadItem[] = files.map((file) => {
          const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
          // Store file reference
          fileMap.set(id, file)

          return {
            id,
            fileName: file.name,
            fileSize: file.size,
            targetPath,
            status: 'queued' as const,
            progress: 0,
            retryCount: 0,
            createdAt: Date.now(),
          }
        })

        set((state) => ({
          items: [...state.items, ...newItems],
          isPanelOpen: true,
        }))

        // Start processing
        get()._processQueue(queryClient)
      },

      cancel: (id) => {
        const controller = abortControllerMap.get(id)
        if (controller) {
          controller.abort()
          abortControllerMap.delete(id)
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, status: 'failed' as const, error: 'Cancelled' } : item
          ),
        }))
      },

      retry: (id, queryClient) => {
        const item = get().items.find((i) => i.id === id)
        if (!item || item.status !== 'failed') return

        // Check retry limit
        if (item.retryCount >= MAX_RETRIES) {
          showNotification({
            type: 'error',
            title: 'Retry limit reached',
            description: `${item.fileName} has failed ${MAX_RETRIES} times`,
          })
          return
        }

        // Calculate delay
        const delay = RETRY_DELAYS[Math.min(item.retryCount, RETRY_DELAYS.length - 1)] ?? 1000

        set((state) => ({
          items: state.items.map((i) => {
            if (i.id !== id) return i
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { error: _unusedError, ...rest } = i
            return { ...rest, status: 'queued' as const, retryCount: i.retryCount + 1 }
          }),
        }))

        // Delay before retry
        setTimeout(() => {
          get()._processQueue(queryClient)
        }, delay)
      },

      remove: (id) => {
        // Cancel if uploading
        const controller = abortControllerMap.get(id)
        if (controller) {
          controller.abort()
          abortControllerMap.delete(id)
        }

        // Clean up file reference
        fileMap.delete(id)

        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      clearCompleted: () => {
        const completedIds = get()
          .items.filter((item) => item.status === 'done' || item.status === 'failed')
          .map((item) => item.id)

        // Clean up file references
        for (const id of completedIds) {
          fileMap.delete(id)
        }

        set((state) => ({
          items: state.items.filter((item) => item.status !== 'done' && item.status !== 'failed'),
        }))
      },

      togglePanel: () => {
        set((state) => ({ isPanelOpen: !state.isPanelOpen }))
      },

      setPanel: (open) => {
        set({ isPanelOpen: open })
      },

      _updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        }))
      },

      _processQueue: (queryClient) => {
        const state = get()
        const { items, concurrency, _updateItem } = state

        // Count active uploads
        const activeCount = items.filter(
          (item) => item.status === 'uploading' || item.status === 'processing'
        ).length

        // Get queued items
        const queuedItems = items.filter((item) => item.status === 'queued')

        // Start as many uploads as concurrency allows
        const slotsAvailable = concurrency - activeCount
        const itemsToStart = queuedItems.slice(0, slotsAvailable)

        for (const item of itemsToStart) {
          const file = fileMap.get(item.id)
          if (!file) {
            _updateItem(item.id, { status: 'failed', error: 'File not found' })
            continue
          }

          const controller = new AbortController()
          abortControllerMap.set(item.id, controller)

          _updateItem(item.id, { status: 'uploading', progress: 0 })

          void (async () => {
            try {
              await uploadSingleFile(file, item.targetPath, {
                signal: controller.signal,
                onProgress: (progress) => {
                  _updateItem(item.id, { progress: progress.percentage })
                },
              })

              _updateItem(item.id, {
                status: 'done',
                progress: 100,
                completedAt: Date.now(),
              })

              abortControllerMap.delete(item.id)

              // Invalidate directory cache
              void invalidateDir(queryClient, item.targetPath)

              // Show success notification
              showNotification({
                type: 'success',
                title: 'Upload complete',
                description: item.fileName,
              })

              // Check for batch completion
              const currentState = get()
              const targetPathItems = currentState.items.filter(
                (i) => i.targetPath === item.targetPath
              )
              const allDone = targetPathItems.every(
                (i) => i.status === 'done' || i.status === 'failed'
              )
              const doneCount = targetPathItems.filter((i) => i.status === 'done').length

              // Show batch notification if 3+ files completed together
              if (allDone && doneCount >= 3) {
                showNotification({
                  type: 'success',
                  title: `${doneCount} files uploaded`,
                  description: 'All uploads complete',
                })
              }

              // Process more from queue
              get()._processQueue(queryClient)
            } catch (err) {
              abortControllerMap.delete(item.id)

              const isAbort = err instanceof DOMException && err.name === 'AbortError'
              const errorMessage = isAbort
                ? 'Cancelled'
                : err instanceof Error
                  ? err.message
                  : 'Upload failed'

              _updateItem(item.id, {
                status: 'failed',
                error: errorMessage,
              })

              // Show error notification (skip for user-cancelled)
              if (!isAbort) {
                showNotification({
                  type: 'error',
                  title: 'Upload failed',
                  description: `${item.fileName} - ${errorMessage}`,
                })
              }

              // Process more from queue
              get()._processQueue(queryClient)
            }
          })()
        }
      },
    }),
    {
      name: 'file-browser-uploads',
      partialize: (state) => ({
        // Only persist metadata, not the actual files or status
        // Files will show as failed on reload since we can't persist File objects
        items: state.items
          .filter((item) => item.status === 'queued' || item.status === 'uploading')
          .map((item) => ({
            ...item,
            status: 'failed' as const,
            error: 'Upload interrupted',
          })),
      }),
    }
  )
)

// Computed selectors
export function getActiveCount(items: UploadItem[]): number {
  return items.filter((item) => item.status === 'uploading' || item.status === 'queued').length
}

export function getOverallProgress(items: UploadItem[]): number {
  const activeItems = items.filter(
    (item) => item.status === 'uploading' || item.status === 'queued' || item.status === 'done'
  )
  if (activeItems.length === 0) return 0

  const totalProgress = activeItems.reduce((sum, item) => {
    if (item.status === 'done') return sum + 100
    return sum + item.progress
  }, 0)

  return Math.round(totalProgress / activeItems.length)
}
