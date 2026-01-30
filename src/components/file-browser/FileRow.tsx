import { memo, useCallback, useState, useEffect, useRef, MouseEvent, KeyboardEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { FileIcon } from './FileIcon'
import { formatFileSize, formatDate } from '../../lib/format'
import { joinPath } from '../../lib/path'
import type { DirectoryEntry } from '../../schemas/directory'

interface FileRowProps {
  entry: DirectoryEntry
  currentPath: string
  isSelected: boolean
  isRenaming: boolean
  onSelect: (path: string, additive: boolean, range: boolean) => void
  onContextMenu: (e: MouseEvent, path: string, isDirectory: boolean) => void
  onRename: (newName: string) => void
  onCancelRename: () => void
  isDragDisabled?: boolean
}

export const FileRow = memo(function FileRow({
  entry,
  currentPath,
  isSelected,
  isRenaming,
  onSelect,
  onContextMenu,
  onRename,
  onCancelRename,
  isDragDisabled = false,
}: FileRowProps) {
  const navigate = useNavigate()
  const isDirectory = entry.type === 'directory'
  const entryPath = currentPath ? joinPath(currentPath, entry.name) : entry.name
  const inputRef = useRef<HTMLInputElement>(null)
  const [renameValue, setRenameValue] = useState(entry.name)

  // Focus and select input when entering rename mode
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      setRenameValue(entry.name)
      inputRef.current.focus()
      // Select filename without extension for files
      const lastDot = entry.name.lastIndexOf('.')
      if (!isDirectory && lastDot > 0) {
        inputRef.current.setSelectionRange(0, lastDot)
      } else {
        inputRef.current.select()
      }
    }
  }, [isRenaming, entry.name, isDirectory])

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: entryPath,
    data: { entry, path: entryPath, isDirectory },
    disabled: isDragDisabled,
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${entryPath}`,
    data: { path: entryPath, isDirectory },
    disabled: !isDirectory,
  })

  const handleClick = useCallback(
    (e: MouseEvent) => {
      // Don't handle clicks when renaming
      if (isRenaming) return

      // If modifier keys are pressed, handle selection
      if (e.metaKey || e.ctrlKey || e.shiftKey) {
        e.preventDefault()
        e.stopPropagation()
        onSelect(entryPath, e.metaKey || e.ctrlKey, e.shiftKey)
        return
      }

      // Single click: navigate to directory or open file
      e.preventDefault()
      e.stopPropagation()

      if (isDirectory) {
        navigate(`/browse/${entryPath}`)
      } else {
        window.open(`/files/${entryPath}`, '_blank')
      }
    },
    [entryPath, isDirectory, isRenaming, navigate, onSelect]
  )

  const handleRenameSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const trimmed = renameValue.trim()
      if (trimmed && trimmed !== entry.name) {
        onRename(trimmed)
      } else {
        onCancelRename()
      }
    },
    [renameValue, entry.name, onRename, onCancelRename]
  )

  const handleRenameKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancelRename()
      }
    },
    [onCancelRename]
  )

  const handleRenameBlur = useCallback(() => {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== entry.name) {
      onRename(trimmed)
    } else {
      onCancelRename()
    }
  }, [renameValue, entry.name, onRename, onCancelRename])

  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      onContextMenu(e, entryPath, isDirectory)
    },
    [entryPath, isDirectory, onContextMenu]
  )

  const handleMenuClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onContextMenu(e, entryPath, isDirectory)
    },
    [entryPath, isDirectory, onContextMenu]
  )

  const rowContent = (
    <div
      ref={(node) => {
        setDragRef(node)
        if (isDirectory) {
          setDropRef(node)
        }
      }}
      data-file-row
      className={`content-auto group flex h-12 cursor-pointer items-center border-b border-border/30 px-4 transition-all duration-150 hover:bg-accent/40 ${
        isSelected ? 'bg-primary/8 hover:bg-primary/12' : ''
      } ${isDragging ? 'opacity-50 scale-[0.98]' : ''} ${isOver && isDirectory ? 'bg-primary/15 ring-1 ring-primary/50 ring-inset' : ''} ${isRenaming ? 'bg-accent/60' : ''}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      {...(isRenaming ? {} : { ...attributes, ...listeners })}
    >
      <FileIcon name={entry.name} isDirectory={isDirectory} className="flex-shrink-0 mr-3" />
      {isRenaming ? (
        <form onSubmit={handleRenameSubmit} className="flex-1 min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={handleRenameBlur}
            className="w-full bg-background border border-primary rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            onClick={(e) => e.stopPropagation()}
          />
        </form>
      ) : (
        <span className="flex-1 truncate text-sm">{entry.name}</span>
      )}
      <span className="hidden sm:block w-20 text-right text-xs text-muted-foreground">
        {formatFileSize(entry.size)}
      </span>
      <span className="hidden md:block w-52 text-right text-xs text-muted-foreground ml-6">
        {formatDate(entry.mtime)}
      </span>
      {/* Menu button */}
      {!isRenaming ? (
        <button
          type="button"
          onClick={handleMenuClick}
          className="flex-shrink-0 w-10 ml-4 p-1.5 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent/60 transition-all"
          aria-label="Open menu"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      ) : (
        <div className="w-10 ml-4" />
      )}
    </div>
  )

  return rowContent
})
