import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { invalidateDir } from '../../lib/cache'
import { dirname } from '../../lib/path'

interface CreateFolderParams {
  path: string
}

export function useCreateFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ path }: CreateFolderParams) => api.createFolder(path),
    onSuccess: (_data, { path }) => {
      // Invalidate the parent directory to show the new folder
      const parentPath = dirname(path)
      void invalidateDir(queryClient, parentPath)
    },
  })
}
