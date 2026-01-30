import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { invalidateDir, clearDirCache } from '../../lib/cache'
import { dirname } from '../../lib/path'

interface DeleteItemParams {
  path: string
  isDirectory?: boolean
}

export function useDeleteItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ path }: DeleteItemParams) => api.deleteItem(path),
    onSuccess: (_data, { path, isDirectory }) => {
      // For directories, clear all caches since subdirs might have been cached
      if (isDirectory) {
        clearDirCache(queryClient)
      }
      // Invalidate the parent directory to remove the deleted item
      const parentPath = dirname(path)
      void invalidateDir(queryClient, parentPath)
    },
  })
}
