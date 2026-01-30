import { useCallback, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/Dialog'
import { Button } from '../ui/Button'
import { useDeleteItem } from '../../hooks/mutations/useDeleteItem'
import { useUIStore } from '../../stores/uiStore'
import { basename } from '../../lib/path'

export function DeleteConfirmDialog() {
  const [error, setError] = useState<string | null>(null)

  const activeDialog = useUIStore((state) => state.activeDialog)
  const dialogData = useUIStore((state) => state.dialogData)
  const closeDialog = useUIStore((state) => state.closeDialog)
  const clearSelection = useUIStore((state) => state.clearSelection)

  const deleteItem = useDeleteItem()

  const isOpen = activeDialog === 'delete'
  const paths = dialogData?.paths ?? (dialogData?.path ? [dialogData.path] : [])
  const isDirectory = dialogData?.isDirectory ?? false

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeDialog()
        setError(null)
      }
    },
    [closeDialog]
  )

  const handleDelete = useCallback(async () => {
    setError(null)

    try {
      // Delete all items sequentially
      for (const path of paths) {
        await deleteItem.mutateAsync({ path, isDirectory })
      }
      clearSelection()
      handleOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }, [paths, isDirectory, deleteItem, clearSelection, handleOpenChange])

  const itemCount = paths.length
  const itemNames = paths.map((p) => basename(p))

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {itemCount > 1 ? `${itemCount} items` : 'item'}</DialogTitle>
          <DialogDescription>
            {itemCount === 1 ? (
              <>
                Are you sure you want to delete "{itemNames[0]}"?
                {isDirectory ? ' This folder and all its contents will be deleted.' : ''}
              </>
            ) : (
              <>
                Are you sure you want to delete {itemCount} items?
                <ul className="mt-2 max-h-32 overflow-auto text-sm">
                  {itemNames.map((name) => (
                    <li key={name} className="truncate">• {name}</li>
                  ))}
                </ul>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="py-2 text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleDelete()}
            disabled={deleteItem.isPending}
          >
            {deleteItem.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
