import { useCallback, useEffect, useRef, useState } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { triggerUpload } from '../upload/UploadDropzone'

export function FileContextMenu() {
  const menuRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState<{ x: number; y: number } | null>(null)

  const contextMenu = useUIStore((state) => state.contextMenu)
  const selectedPaths = useUIStore((state) => state.selectedPaths)
  const closeContextMenu = useUIStore((state) => state.closeContextMenu)
  const openDialog = useUIStore((state) => state.openDialog)
  const startRename = useUIStore((state) => state.startRename)

  const { position, targetPath, targetIsDirectory } = contextMenu

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu()
      }
    }

    if (position) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [position, closeContextMenu])

  // Close menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeContextMenu()
      }
    }

    if (position) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [position, closeContextMenu])

  // Adjust position to keep menu within viewport
  useEffect(() => {
    if (!position || !menuRef.current) {
      setAdjustedPosition(null)
      return
    }

    const menu = menuRef.current
    const rect = menu.getBoundingClientRect()
    const padding = 8

    let x = position.x
    let y = position.y

    // Adjust horizontal position
    if (x + rect.width > window.innerWidth - padding) {
      x = window.innerWidth - rect.width - padding
    }
    if (x < padding) {
      x = padding
    }

    // Adjust vertical position
    if (y + rect.height > window.innerHeight - padding) {
      y = window.innerHeight - rect.height - padding
    }
    if (y < padding) {
      y = padding
    }

    setAdjustedPosition({ x, y })
  }, [position])

  const handleNewFolder = useCallback(() => {
    openDialog('newFolder')
    closeContextMenu()
  }, [openDialog, closeContextMenu])

  const handleUpload = useCallback(() => {
    triggerUpload()
    closeContextMenu()
  }, [closeContextMenu])

  const handleRename = useCallback(() => {
    if (targetPath) {
      startRename(targetPath)
    }
    closeContextMenu()
  }, [targetPath, startRename, closeContextMenu])

  const handleDelete = useCallback(() => {
    const paths = selectedPaths.size > 0 ? Array.from(selectedPaths) : (targetPath ? [targetPath] : [])
    if (paths.length > 0) {
      openDialog('delete', { paths, isDirectory: targetIsDirectory })
    }
    closeContextMenu()
  }, [selectedPaths, targetPath, targetIsDirectory, openDialog, closeContextMenu])

  const handleShare = useCallback(() => {
    if (targetPath) {
      openDialog('share', { path: targetPath })
    }
    closeContextMenu()
  }, [targetPath, openDialog, closeContextMenu])

  const handleOpen = useCallback(() => {
    if (targetPath) {
      if (targetIsDirectory) {
        window.location.href = `/browse/${targetPath}`
      } else {
        window.open(`/files/${targetPath}`, '_blank')
      }
    }
    closeContextMenu()
  }, [targetPath, targetIsDirectory, closeContextMenu])

  if (!position) return null

  const multipleSelected = selectedPaths.size > 1
  const hasTarget = targetPath !== null
  const displayPosition = adjustedPosition ?? position

  return (
    <div
      ref={menuRef}
      className={`fixed z-50 min-w-[180px] rounded-lg border border-border bg-card p-1.5 shadow-lg ${
        adjustedPosition ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        left: displayPosition.x,
        top: displayPosition.y,
      }}
    >
      {/* Actions available when clicking on empty space */}
      {!hasTarget ? (
        <>
          <MenuItem onClick={handleNewFolder}>New Folder</MenuItem>
          <MenuItem onClick={handleUpload}>Upload Files</MenuItem>
        </>
      ) : null}

      {/* Actions available when clicking on an item */}
      {hasTarget && !multipleSelected ? (
        <>
          <MenuItem onClick={handleOpen}>
            {targetIsDirectory ? 'Open' : 'Download'}
          </MenuItem>
          <MenuSeparator />
          <MenuItem onClick={handleRename}>Rename</MenuItem>
          {!targetIsDirectory ? <MenuItem onClick={handleShare}>Share</MenuItem> : null}
          <MenuSeparator />
          <MenuItem onClick={handleDelete} destructive>
            Delete
          </MenuItem>
        </>
      ) : null}

      {/* Actions available when multiple items are selected */}
      {multipleSelected ? (
        <>
          <MenuItem onClick={handleDelete} destructive>
            Delete {selectedPaths.size} items
          </MenuItem>
        </>
      ) : null}
    </div>
  )
}

interface MenuItemProps {
  onClick: () => void
  children: React.ReactNode
  destructive?: boolean
}

function MenuItem({ onClick, children, destructive }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-accent transition-colors ${
        destructive ? 'text-destructive hover:text-destructive' : ''
      }`}
    >
      {children}
    </button>
  )
}

function MenuSeparator() {
  return <div className="my-1.5 h-px bg-border/50" />
}
