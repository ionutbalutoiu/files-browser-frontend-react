import { useCallback, useState, useEffect, DragEvent, useRef, ChangeEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { uploadSingleFile } from '../../api/client'
import { invalidateDir } from '../../lib/cache'
import { queryKeys } from '../../lib/query-keys'
import type { DirectoryEntry } from '../../schemas/directory'

export type FileUploadStatus = 'pending' | 'uploading' | 'success' | 'error' | 'exists'

export interface FileUploadState {
  id: string
  file: File
  status: FileUploadStatus
  progress: number
  error?: string
}

interface UploadDropzoneProps {
  currentPath: string
  children: React.ReactNode
}

export function UploadDropzone({ currentPath, children }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploads, setUploads] = useState<FileUploadState[]>([])
  const dragCounter = useRef(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const queryClient = useQueryClient()

  const updateUpload = useCallback((id: string, updates: Partial<FileUploadState>) => {
    setUploads((prev) =>
      prev.map((upload) => (upload.id === id ? { ...upload, ...updates } : upload))
    )
  }, [])

  const uploadFile = useCallback(
    async (uploadState: FileUploadState) => {
      const { id, file } = uploadState

      updateUpload(id, { status: 'uploading', progress: 0 })

      try {
        await uploadSingleFile(file, currentPath, {
          onProgress: (progress) => {
            updateUpload(id, { progress: progress.percentage })
          },
        })

        updateUpload(id, { status: 'success', progress: 100 })
        void invalidateDir(queryClient, currentPath)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'
        updateUpload(id, { status: 'error', error: errorMessage })
      }
    },
    [currentPath, queryClient, updateUpload]
  )

  const getExistingFileNames = useCallback((): Set<string> => {
    const cachedData = queryClient.getQueryData<DirectoryEntry[]>(queryKeys.dirs.detail(currentPath))
    if (!cachedData) return new Set()
    return new Set(cachedData.map((entry) => entry.name))
  }, [queryClient, currentPath])

  const startUploads = useCallback(
    (files: File[]) => {
      const existingNames = getExistingFileNames()

      const newUploads: FileUploadState[] = files.map((file) => {
        const alreadyExists = existingNames.has(file.name)
        const baseUpload = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          progress: 0,
        }
        if (alreadyExists) {
          return { ...baseUpload, status: 'exists' as const, error: 'File already exists' }
        }
        return { ...baseUpload, status: 'pending' as const }
      })

      setUploads((prev) => [...prev, ...newUploads])

      // Filter out files that already exist and upload the rest sequentially
      const uploadsToProcess = newUploads.filter((u) => u.status === 'pending')

      const uploadSequentially = async () => {
        for (const upload of uploadsToProcess) {
          await uploadFile(upload)
        }
      }

      void uploadSequentially()
    },
    [uploadFile, getExistingFileNames]
  )

  const clearCompletedUploads = useCallback(() => {
    setUploads((prev) => prev.filter((u) => u.status === 'uploading' || u.status === 'pending'))
  }, [])

  // Auto-clear uploads 10 seconds after all complete
  const hasActiveUploads = uploads.some((u) => u.status === 'uploading' || u.status === 'pending')
  const hasUploads = uploads.length > 0
  const hasCompletedUploads = uploads.some((u) => u.status === 'success' || u.status === 'error' || u.status === 'exists')

  useEffect(() => {
    if (hasUploads && !hasActiveUploads) {
      const timer = setTimeout(() => {
        setUploads([])
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [hasUploads, hasActiveUploads])

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      dragCounter.current = 0

      const files = Array.from(e.dataTransfer.files)
      if (files.length === 0) return

      startUploads(files)
    },
    [startUploads]
  )

  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : []
      if (files.length === 0) return

      startUploads(files)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [startUploads]
  )

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div
      className="relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {isDragging ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center border-2 border-dashed border-primary bg-primary/10 backdrop-blur-sm">
          <div className="text-center">
            <div className="mx-auto mb-3 rounded-2xl bg-primary/20 p-4">
              <svg
                className="h-10 w-10 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-foreground">Drop files to upload</p>
            <p className="mt-1 text-sm text-muted-foreground">Files will be uploaded to current folder</p>
          </div>
        </div>
      ) : null}

      {/* Upload Progress Panel */}
      {uploads.length > 0 ? (
        <div className="fixed bottom-4 right-4 z-50 w-80 rounded-xl border border-border bg-card/95 shadow-lg backdrop-blur-sm animate-slide-in-right">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">
              {hasActiveUploads ? 'Uploading files...' : 'Uploads complete'}
            </h3>
            {hasCompletedUploads && !hasActiveUploads ? (
              <button
                onClick={clearCompletedUploads}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear
              </button>
            ) : null}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {uploads.map((upload) => (
              <UploadItem key={upload.id} upload={upload} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Hidden button to trigger file select from toolbar */}
      <button
        id="upload-trigger"
        type="button"
        className="hidden"
        onClick={triggerFileSelect}
      />
    </div>
  )
}

function UploadItem({ upload }: { upload: FileUploadState }) {
  const { file, status, progress, error } = upload

  const statusIcon = {
    pending: (
      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
    ),
    uploading: (
      <svg className="h-4 w-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    ),
    success: (
      <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="h-4 w-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    exists: (
      <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  }

  return (
    <div className="border-b border-border/50 px-4 py-3 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{statusIcon[status]}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          {status === 'uploading' ? (
            <div className="mt-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatFileSize(file.size)}</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : status === 'error' ? (
            <p className="mt-0.5 truncate text-xs text-destructive">{error}</p>
          ) : status === 'exists' ? (
            <p className="mt-0.5 truncate text-xs text-amber-500">{error}</p>
          ) : status === 'success' ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">Waiting...</p>
          )}
        </div>
      </div>
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function triggerUpload() {
  const trigger = document.getElementById('upload-trigger')
  if (trigger) {
    trigger.click()
  }
}
