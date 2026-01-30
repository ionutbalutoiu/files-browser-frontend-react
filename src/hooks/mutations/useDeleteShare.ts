import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { invalidateShares } from '../../lib/cache'

interface DeleteShareParams {
  path: string
}

export function useDeleteShare() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ path }: DeleteShareParams) => api.deleteShare(path),
    onSuccess: () => {
      void invalidateShares(queryClient)
    },
  })
}
