import { useState, useCallback, FormEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useCreateFolder } from '../../hooks/mutations/useCreateFolder'
import { useUIStore } from '../../stores/uiStore'
import { joinPath, validatePath } from '../../lib/path'

interface NewFolderDialogProps {
  currentPath: string
}

export function NewFolderDialog({ currentPath }: NewFolderDialogProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const activeDialog = useUIStore((state) => state.activeDialog)
  const closeDialog = useUIStore((state) => state.closeDialog)

  const createFolder = useCreateFolder()

  const isOpen = activeDialog === 'newFolder'

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeDialog()
        setName('')
        setError(null)
      }
    },
    [closeDialog]
  )

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()

      const trimmedName = name.trim()
      if (!trimmedName) {
        setError('Folder name is required')
        return
      }

      // Validate the folder name
      const validation = validatePath(trimmedName)
      if (!validation.valid) {
        setError(validation.error ?? 'Invalid folder name')
        return
      }

      const fullPath = currentPath ? joinPath(currentPath, trimmedName) : trimmedName

      createFolder.mutate(
        { path: fullPath },
        {
          onSuccess: () => {
            handleOpenChange(false)
          },
          onError: (err) => {
            setError(err instanceof Error ? err.message : 'Failed to create folder')
          },
        }
      )
    },
    [name, currentPath, createFolder, handleOpenChange]
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Folder</DialogTitle>
          <DialogDescription>
            Create a new folder in {currentPath || 'root'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              autoFocus
            />
            {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createFolder.isPending}>
              {createFolder.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
