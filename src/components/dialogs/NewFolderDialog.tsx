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
import { useCreateFolder } from '../../hooks/mutations/useCreateFolder'
import { useUIStore } from '../../stores/uiStore'
import { useToast } from '../../providers/ToastProvider'
import { joinPath, validatePath } from '../../lib/path'

interface NewFolderDialogProps {
  currentPath: string
}

export function NewFolderDialog({ currentPath }: NewFolderDialogProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const activeDialog = useUIStore((state) => state.activeDialog)
  const closeDialog = useUIStore((state) => state.closeDialog)
  const { toast } = useToast()

  const createFolder = useCreateFolder()

  const isOpen = activeDialog === 'newFolder'

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setName('')
      setError(null)
    }
  }, [isOpen])

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
            toast({
              title: 'Folder created',
              description: `"${trimmedName}" has been created.`,
              variant: 'success',
            })
            handleOpenChange(false)
          },
          onError: (err) => {
            setError(err instanceof Error ? err.message : 'Failed to create folder')
          },
        }
      )
    },
    [name, currentPath, createFolder, toast, handleOpenChange]
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
              className={error ? 'border-destructive focus-visible:ring-destructive/30' : ''}
            />
            {error ? (
              <p className="mt-2 text-sm text-destructive flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            ) : null}
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
              {createFolder.isPending ? (
                <>
                  <svg className="h-4 w-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
