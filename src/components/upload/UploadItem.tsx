import { memo, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { UploadItem as UploadItemType, UploadStatus } from '../../stores/uploadStore'
import { useUploadStore } from '../../stores/uploadStore'

interface UploadItemProps {
  item: UploadItemType
}

const statusConfig: Record<
  UploadStatus,
  { bg: string; icon: React.ReactNode; showProgress: boolean }
> = {
  queued: {
    bg: 'bg-muted',
    icon: (
      <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    showProgress: false,
  },
  uploading: {
    bg: 'bg-primary',
    icon: (
      <svg className="h-4 w-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    ),
    showProgress: true,
  },
  processing: {
    bg: 'bg-primary',
    icon: (
      <svg className="h-4 w-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    ),
    showProgress: false,
  },
  done: {
    bg: 'bg-emerald-500',
    icon: (
      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    showProgress: false,
  },
  failed: {
    bg: 'bg-destructive',
    icon: (
      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    showProgress: false,
  },
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export const UploadItemComponent = memo(function UploadItem({ item }: UploadItemProps) {
  const queryClient = useQueryClient()
  const cancel = useUploadStore((state) => state.cancel)
  const retry = useUploadStore((state) => state.retry)
  const remove = useUploadStore((state) => state.remove)

  const config = statusConfig[item.status]

  const handleCancel = useCallback(() => {
    cancel(item.id)
  }, [cancel, item.id])

  const handleRetry = useCallback(() => {
    retry(item.id, queryClient)
  }, [retry, item.id, queryClient])

  const handleRemove = useCallback(() => {
    remove(item.id)
  }, [remove, item.id])

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-b-0">
      {/* Status icon badge */}
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl shadow-md ${config.bg}`}>
        {config.icon}
      </div>

      {/* File info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.fileName}</p>

        {config.showProgress ? (
          <div className="mt-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatFileSize(item.fileSize)}</span>
              <span>{item.progress}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        ) : item.status === 'queued' ? (
          <p className="mt-0.5 text-xs text-muted-foreground">Queued</p>
        ) : item.status === 'done' ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{formatFileSize(item.fileSize)}</p>
        ) : item.status === 'failed' ? (
          <p className="mt-0.5 truncate text-xs text-destructive">{item.error}</p>
        ) : (
          <p className="mt-0.5 text-xs text-muted-foreground">Processing...</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {item.status === 'failed' ? (
          <button
            onClick={handleRetry}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Retry"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        ) : null}

        {item.status === 'uploading' ? (
          <button
            onClick={handleCancel}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Cancel"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleRemove}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Remove"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
})
