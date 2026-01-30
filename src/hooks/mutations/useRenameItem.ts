import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { handleDirectoryMoveOrRename, invalidateDir } from '../../lib/cache'
import { dirname } from '../../lib/path'

interface RenameItemParams {
  path: string
  newName: string
  isDirectory?: boolean
}

export function useRenameItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ path, newName }: RenameItemParams) => api.renameItem(path, newName),
    onSuccess: (_data, { path, isDirectory }) => {
      const parentPath = dirname(path)

      if (isDirectory) {
        // For directories, clear all caches and refetch
        void handleDirectoryMoveOrRename(queryClient, parentPath)
      } else {
        // For files, just invalidate parent
        void invalidateDir(queryClient, parentPath)
      }
    },
  })
}
