import { useQuery } from '@tanstack/react-query'
import { filesFetch } from '../../api/client'
import { queryKeys } from '../../lib/query-keys'
import { DirectoryListing, DirectoryListingSchema } from '../../schemas/directory'

export function useDirectoryQuery(path: string) {
  return useQuery({
    queryKey: queryKeys.dirs.detail(path),
    queryFn: () => filesFetch<DirectoryListing>(path, DirectoryListingSchema),
  })
}
