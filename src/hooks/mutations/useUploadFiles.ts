import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadFetch, UploadProgress } from '../../api/client'
import { invalidateDir } from '../../lib/cache'

interface UploadFilesParams {
  files: File[]
  destinationPath: string
  onProgress?: (progress: UploadProgress) => void
}

export function useUploadFiles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ files, destinationPath, onProgress }: UploadFilesParams) =>
      uploadFetch(files, destinationPath, onProgress ? { onProgress } : {}),
    onSuccess: (_data, { destinationPath }) => {
      void invalidateDir(queryClient, destinationPath)
    },
  })
}
