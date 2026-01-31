import { useCallback, useState, DragEvent, useRef, ChangeEvent } from 'react'
import { useUploadManager } from '../../hooks/useUploadManager'

interface UploadDropzoneProps {
  currentPath: string
  children: React.ReactNode
}

export function UploadDropzone({ currentPath, children }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { addFiles } = useUploadManager()

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

      addFiles(files, currentPath)
    },
    [addFiles, currentPath]
  )

  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : []
      if (files.length === 0) return

      addFiles(files, currentPath)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [addFiles, currentPath]
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

export function triggerUpload() {
  const trigger = document.getElementById('upload-trigger')
  if (trigger) {
    trigger.click()
  }
}
