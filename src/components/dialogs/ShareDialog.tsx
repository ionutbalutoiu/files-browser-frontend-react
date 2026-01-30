import { useCallback, useState, useEffect } from 'react'
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
import { useUIStore } from '../../stores/uiStore'
import { useCreateShare } from '../../hooks/mutations/useCreateShare'
import { useDeleteShare } from '../../hooks/mutations/useDeleteShare'
import { useSharesQuery } from '../../hooks/queries/useSharesQuery'
import { buildShareUrl } from '../../env'
import { basename } from '../../lib/path'

export function ShareDialog() {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeDialog = useUIStore((state) => state.activeDialog)
  const dialogData = useUIStore((state) => state.dialogData)
  const closeDialog = useUIStore((state) => state.closeDialog)

  const createShare = useCreateShare()
  const deleteShare = useDeleteShare()
  const { data: shares = [] } = useSharesQuery()

  const isOpen = activeDialog === 'share'
  const path = dialogData?.path ?? ''
  const itemName = basename(path)

  // Check if this path is already shared
  const isShared = shares.includes(path)
  const shareUrl = isShared ? buildShareUrl(path) : ''

  // Reset copied state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setCopied(false)
      setError(null)
    }
  }, [isOpen])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeDialog()
      }
    },
    [closeDialog]
  )

  const handleCreateShare = useCallback(() => {
    setError(null)
    createShare.mutate(
      { path },
      {
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Failed to create share')
        },
      }
    )
  }, [path, createShare])

  const handleDeleteShare = useCallback(() => {
    setError(null)
    deleteShare.mutate(
      { path },
      {
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Failed to delete share')
        },
      }
    )
  }, [path, deleteShare])

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }, [shareUrl])

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share "{itemName}"</DialogTitle>
          <DialogDescription>
            {isShared
              ? 'This item is shared. Copy the link or remove the share.'
              : 'Create a public share link for this item.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isShared ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button onClick={() => void handleCopyLink()}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteShare}
                disabled={deleteShare.isPending}
                className="w-full"
              >
                {deleteShare.isPending ? 'Removing...' : 'Remove Share'}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleCreateShare}
              disabled={createShare.isPending}
              className="w-full"
            >
              {createShare.isPending ? 'Creating...' : 'Create Share Link'}
            </Button>
          )}

          {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
