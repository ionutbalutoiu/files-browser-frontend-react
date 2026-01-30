import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { invalidateShares } from '../../lib/cache'

interface CreateShareParams {
  path: string
}

export function useCreateShare() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ path }: CreateShareParams) => api.createShare(path),
    onSuccess: () => {
      void invalidateShares(queryClient)
    },
  })
}
