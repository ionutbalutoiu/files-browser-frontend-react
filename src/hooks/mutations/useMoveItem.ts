import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { handleDirectoryMoveOrRename, invalidateDir } from '../../lib/cache'
import { dirname, basename } from '../../lib/path'
import { showNotification } from '../../stores/notificationStore'

interface MoveItemParams {
  from: string
  to: string
  isDirectory?: boolean
}

export function useMoveItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ from, to }: MoveItemParams) => api.moveItem(from, to),
    onSuccess: (_data, { from, to, isDirectory }) => {
      const sourceParent = dirname(from)
      const destParent = dirname(to)

      if (isDirectory) {
        // For directories, clear all caches
        void handleDirectoryMoveOrRename(queryClient, sourceParent)
      } else {
        // For files, invalidate source and destination parents
        void invalidateDir(queryClient, sourceParent)
        if (sourceParent !== destParent) {
          void invalidateDir(queryClient, destParent)
        }
      }

      // Show success notification
      const fileName = basename(from)
      const destFolder = destParent || 'root'
      showNotification({
        type: 'success',
        title: 'Moved successfully',
        description: `"${fileName}" → ${destFolder}`,
      })
    },
  })
}
