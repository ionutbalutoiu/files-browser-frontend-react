import { useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useUploadStore, getActiveCount, getOverallProgress } from '../stores/uploadStore'

export function useUploadManager() {
  const queryClient = useQueryClient()
  const items = useUploadStore((state) => state.items)
  const isPanelOpen = useUploadStore((state) => state.isPanelOpen)
  const storeAddFiles = useUploadStore((state) => state.addFiles)
  const storeCancel = useUploadStore((state) => state.cancel)
  const storeRetry = useUploadStore((state) => state.retry)
  const storeRemove = useUploadStore((state) => state.remove)
  const storeClearCompleted = useUploadStore((state) => state.clearCompleted)
  const storeTogglePanel = useUploadStore((state) => state.togglePanel)
  const storeSetPanel = useUploadStore((state) => state.setPanel)

  const addFiles = useCallback(
    (files: File[], targetPath: string) => {
      storeAddFiles(files, targetPath, queryClient)
    },
    [storeAddFiles, queryClient]
  )

  const cancel = useCallback(
    (id: string) => {
      storeCancel(id)
    },
    [storeCancel]
  )

  const retry = useCallback(
    (id: string) => {
      storeRetry(id, queryClient)
    },
    [storeRetry, queryClient]
  )

  const remove = useCallback(
    (id: string) => {
      storeRemove(id)
    },
    [storeRemove]
  )

  const clearCompleted = useCallback(() => {
    storeClearCompleted()
  }, [storeClearCompleted])

  const togglePanel = useCallback(() => {
    storeTogglePanel()
  }, [storeTogglePanel])

  const setPanel = useCallback(
    (open: boolean) => {
      storeSetPanel(open)
    },
    [storeSetPanel]
  )

  const activeCount = useMemo(() => getActiveCount(items), [items])
  const overallProgress = useMemo(() => getOverallProgress(items), [items])
  const hasItems = items.length > 0

  return {
    // Actions
    addFiles,
    cancel,
    retry,
    remove,
    clearCompleted,
    togglePanel,
    setPanel,

    // State selectors
    items,
    activeCount,
    hasItems,
    overallProgress,
    isPanelOpen,
  }
}
