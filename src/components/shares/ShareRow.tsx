import { memo, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { useDeleteShare } from '../../hooks/mutations/useDeleteShare'
import { buildShareUrl } from '../../env'
import { dirname, basename } from '../../lib/path'

interface ShareRowProps {
  path: string
}

export const ShareRow = memo(function ShareRow({ path }: ShareRowProps) {
  const [copied, setCopied] = useState(false)
  const deleteShare = useDeleteShare()

  const name = basename(path)
  const folder = dirname(path)
  const shareUrl = buildShareUrl(path)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Ignore
    }
  }, [shareUrl])

  const handleDelete = useCallback(() => {
    deleteShare.mutate({ path })
  }, [path, deleteShare])

  return (
    <div className="group flex items-center gap-4 px-4 py-4 transition-all duration-150 hover:bg-accent/40 animate-fade-in">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{name}</div>
        <div className="text-sm text-muted-foreground truncate">
          <Link to={`/browse/${folder}`} className="transition-colors hover:text-foreground">
            {folder || '/'}
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void handleCopy()}
          className="h-8 px-3 text-sm"
        >
          {copied ? (
            <>
              <svg className="mr-1.5 h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Link
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleteShare.isPending}
          className="h-8 px-3 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {deleteShare.isPending ? '...' : 'Remove'}
        </Button>
      </div>
    </div>
  )
})
