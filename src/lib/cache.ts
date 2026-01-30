import { QueryClient } from '@tanstack/react-query'
import { queryKeys } from './query-keys'
import { dirname, getParentPaths } from './path'

/**
 * Clears all directory queries from the cache.
 * Used when moving/renaming directories that could affect multiple cached paths.
 */
export function clearDirCache(queryClient: QueryClient): void {
  queryClient.removeQueries({ queryKey: queryKeys.dirs.all })
}

/**
 * Invalidates a specific directory and optionally its parents.
 */
export function invalidateDir(
  queryClient: QueryClient,
  path: string,
  options: { includeParents?: boolean } = {}
): Promise<void> {
  const promises: Promise<void>[] = []

  // Invalidate the specific path
  promises.push(
    queryClient.invalidateQueries({
      queryKey: queryKeys.dirs.detail(path),
    })
  )

  // Optionally invalidate parent paths
  if (options.includeParents) {
    const parentPath = dirname(path)
    if (parentPath) {
      promises.push(
        queryClient.invalidateQueries({
          queryKey: queryKeys.dirs.detail(parentPath),
        })
      )
    }
    // Also invalidate root
    promises.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.dirs.detail(''),
      })
    )
  }

  return Promise.all(promises).then(() => undefined)
}

/**
 * Invalidates a directory, its parent, and all ancestor directories.
 * Useful for operations that might affect the tree structure.
 */
export function invalidateDirTree(queryClient: QueryClient, path: string): Promise<void> {
  const promises: Promise<void>[] = []

  // Invalidate the path itself
  promises.push(
    queryClient.invalidateQueries({
      queryKey: queryKeys.dirs.detail(path),
    })
  )

  // Invalidate parent
  const parentPath = dirname(path)
  if (parentPath) {
    promises.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.dirs.detail(parentPath),
      })
    )
  }

  // Invalidate all ancestors
  const ancestors = getParentPaths(path)
  for (const ancestor of ancestors) {
    promises.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.dirs.detail(ancestor),
      })
    )
  }

  // Always invalidate root
  promises.push(
    queryClient.invalidateQueries({
      queryKey: queryKeys.dirs.detail(''),
    })
  )

  return Promise.all(promises).then(() => undefined)
}

/**
 * Invalidates shares query.
 */
export function invalidateShares(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.shares.all,
  })
}

/**
 * Handles cache invalidation for directory move/rename operations.
 * CRITICAL: Clears ALL directory caches because moved directories
 * could be cached at multiple levels and we can't know all affected paths.
 */
export function handleDirectoryMoveOrRename(
  queryClient: QueryClient,
  currentPath: string
): Promise<void> {
  // Clear ALL directory queries - safest approach for moves/renames
  clearDirCache(queryClient)

  // Then refetch current path and root
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.dirs.detail(currentPath) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dirs.detail('') }),
  ]).then(() => undefined)
}
