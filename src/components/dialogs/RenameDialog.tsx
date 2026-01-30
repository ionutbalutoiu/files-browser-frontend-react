import { useState, useCallback, useEffect, FormEvent } from 'react'
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
import { useRenameItem } from '../../hooks/mutations/useRenameItem'
import { useUIStore } from '../../stores/uiStore'
import { validatePath, basename } from '../../lib/path'

export function RenameDialog() {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const activeDialog = useUIStore((state) => state.activeDialog)
  const dialogData = useUIStore((state) => state.dialogData)
  const closeDialog = useUIStore((state) => state.closeDialog)

  const renameItem = useRenameItem()

  const isOpen = activeDialog === 'rename'
  const path = dialogData?.path ?? ''
  const isDirectory = dialogData?.isDirectory ?? false
  const currentName = basename(path)

  // Initialize name when dialog opens
  useEffect(() => {
    if (isOpen && currentName) {
      setName(currentName)
    }
  }, [isOpen, currentName])

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
        setError('Name is required')
        return
      }

      if (trimmedName === currentName) {
        handleOpenChange(false)
        return
      }

      // Validate the new name
      const validation = validatePath(trimmedName)
      if (!validation.valid) {
        setError(validation.error ?? 'Invalid name')
        return
      }

      renameItem.mutate(
        { path, newName: trimmedName, isDirectory },
        {
          onSuccess: () => {
            handleOpenChange(false)
          },
          onError: (err) => {
            setError(err instanceof Error ? err.message : 'Failed to rename')
          },
        }
      )
    },
    [name, path, currentName, isDirectory, renameItem, handleOpenChange]
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
          <DialogDescription>
            Enter a new name for "{currentName}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              placeholder="New name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              autoFocus
              onFocus={(e) => {
                // Select filename without extension
                const lastDot = name.lastIndexOf('.')
                if (lastDot > 0 && !isDirectory) {
                  e.target.setSelectionRange(0, lastDot)
                } else {
                  e.target.select()
                }
              }}
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
            <Button type="submit" disabled={renameItem.isPending}>
              {renameItem.isPending ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
