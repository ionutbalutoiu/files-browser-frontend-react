import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import { queryKeys } from '../../lib/query-keys'

export function useSharesQuery() {
  return useQuery({
    queryKey: queryKeys.shares.all,
    queryFn: () => api.getShares(),
  })
}
