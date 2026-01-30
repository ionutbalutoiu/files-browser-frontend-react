import { useEffect, useCallback, MouseEvent } from 'react'
import { useDirectoryQuery } from '../../hooks/queries/useDirectoryQuery'
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation'
import { useUIStore } from '../../stores/uiStore'
import { Breadcrumbs } from './Breadcrumbs'
import { FileList } from './FileList'
import { FileListHeader } from './FileListHeader'
import { Toolbar } from './Toolbar'
import { FileContextMenu } from './FileContextMenu'
import { UploadDropzone } from '../upload/UploadDropzone'
import { NewFolderDialog } from '../dialogs/NewFolderDialog'
import { DeleteConfirmDialog } from '../dialogs/DeleteConfirmDialog'
import { ShareDialog } from '../dialogs/ShareDialog'

interface FileBrowserProps {
  path: string
}

export function FileBrowser({ path }: FileBrowserProps) {
  const { data: entries = [], isLoading, error } = useDirectoryQuery(path)
  const clearSelection = useUIStore((state) => state.clearSelection)
  const closeContextMenu = useUIStore((state) => state.closeContextMenu)
  const openContextMenu = useUIStore((state) => state.openContextMenu)
  const activeDialog = useUIStore((state) => state.activeDialog)

  // Enable keyboard navigation when no dialog is open
  useKeyboardNavigation({
    entries,
    currentPath: path,
    enabled: !activeDialog && !isLoading,
  })

  // Clear selection when path changes
  useEffect(() => {
    clearSelection()
  }, [path, clearSelection])

  // Handle background right-click
  const handleBackgroundContextMenu = useCallback(
    (e: MouseEvent) => {
      // Only handle if clicking on the background (not on a file row)
      const target = e.target as HTMLElement
      if (target.closest('[data-file-row]')) {
        return
      }
      e.preventDefault()
      openContextMenu({ x: e.clientX, y: e.clientY }, null, false)
    },
    [openContextMenu]
  )

  // Handle background click to clear selection
  const handleBackgroundClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-file-row]')) {
        clearSelection()
        closeContextMenu()
      }
    },
    [clearSelection, closeContextMenu]
  )

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-up">
        <div className="mb-4 rounded-2xl bg-destructive/10 p-6">
          <svg
            className="h-10 w-10 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="font-medium text-destructive">Error loading directory</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  return (
    <UploadDropzone currentPath={path}>
      <div className="mx-auto max-w-6xl px-4 py-6 animate-fade-in">
        <div
          className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          onClick={handleBackgroundClick}
          onContextMenu={handleBackgroundContextMenu}
        >
          {/* Header with breadcrumbs and toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
            <Breadcrumbs path={path} />
            <Toolbar />
          </div>

          {/* File list */}
          <FileListHeader />
          <FileList entries={entries} currentPath={path} isLoading={isLoading} />
        </div>
      </div>

      {/* Context Menu */}
      <FileContextMenu />

      {/* Dialogs */}
      <NewFolderDialog currentPath={path} />
      <DeleteConfirmDialog />
      <ShareDialog />
    </UploadDropzone>
  )
}
