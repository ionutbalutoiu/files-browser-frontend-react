import { useCallback, useMemo, useState, useEffect, useRef, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import { FileRow } from './FileRow'
import { FileRowSkeleton } from './FileRowSkeleton'
import { EmptyState } from './EmptyState'
import { FileIcon } from './FileIcon'
import { useUIStore, SortBy, SortDirection } from '../../stores/uiStore'
import { useMoveItem } from '../../hooks/mutations/useMoveItem'
import { useRenameItem } from '../../hooks/mutations/useRenameItem'
import { joinPath, basename, isChildOf, dirname } from '../../lib/path'
import { getEntranceAnimationClasses } from '../../lib/animation'
import type { DirectoryEntry } from '../../schemas/directory'

interface FileListProps {
  entries: DirectoryEntry[]
  currentPath: string
  isLoading?: boolean
}

function sortEntries(
  entries: DirectoryEntry[],
  sortBy: SortBy,
  sortDirection: SortDirection
): DirectoryEntry[] {
  const sorted = [...entries].sort((a, b) => {
    // Always sort directories first
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1
    }

    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        break
      case 'size':
        comparison = (a.size ?? 0) - (b.size ?? 0)
        break
      case 'mtime':
        comparison = new Date(a.mtime).getTime() - new Date(b.mtime).getTime()
        break
      case 'type':
        comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        break
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })

  return sorted
}

interface DragItem {
  entry: DirectoryEntry
  path: string
  isDirectory: boolean
}

function ParentRow({ currentPath, shouldAnimate }: { currentPath: string; shouldAnimate: boolean }) {
  const navigate = useNavigate()
  const { setNodeRef, isOver } = useDroppable({
    id: 'drop-parent',
    data: { path: dirname(currentPath), isDirectory: true, isParent: true },
  })

  // Don't show for root directory
  if (!currentPath) return null

  const parentPath = dirname(currentPath)

  const handleClick = () => {
    navigate(parentPath ? `/browse/${parentPath}` : '/browse')
  }

  const animationClasses = getEntranceAnimationClasses(0, shouldAnimate)

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      className={`flex h-12 cursor-pointer items-center border-b border-border/30 px-4 text-muted-foreground transition-all duration-150 hover:bg-accent/40 ${animationClasses} ${
        isOver ? 'bg-primary/15 ring-1 ring-primary/50 ring-inset' : ''
      }`}
    >
      <FileIcon name=".." isDirectory className="mr-3" />
      <span className="text-sm">..</span>
    </div>
  )
}

export function FileList({ entries, currentPath, isLoading }: FileListProps) {
  const [activeDrag, setActiveDrag] = useState<DragItem | null>(null)

  // Track the path that has been animated to prevent re-animation on sort changes
  const animatedPathRef = useRef<string | null>(null)
  const [shouldAnimate, setShouldAnimate] = useState(true)

  // Only animate when directory changes, not on sort changes
  useEffect(() => {
    if (animatedPathRef.current !== currentPath) {
      animatedPathRef.current = currentPath
      setShouldAnimate(true)
      // Turn off animation after initial render to prevent re-animation on sort
      const timer = setTimeout(() => setShouldAnimate(false), 600)
      return () => clearTimeout(timer)
    }
  }, [currentPath])

  const { sortBy, sortDirection, selectPath, selectRange, openContextMenu, clearSelection, cancelRename } = useUIStore()
  const selectedPaths = useUIStore((state) => state.selectedPaths)
  const renamingPath = useUIStore((state) => state.renamingPath)

  const moveItem = useMoveItem()
  const renameItem = useRenameItem()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 8,
      },
    })
  )

  const sortedEntries = useMemo(
    () => sortEntries(entries, sortBy, sortDirection),
    [entries, sortBy, sortDirection]
  )

  const allPaths = useMemo(
    () =>
      sortedEntries.map((entry) =>
        currentPath ? joinPath(currentPath, entry.name) : entry.name
      ),
    [sortedEntries, currentPath]
  )

  const handleSelect = useCallback(
    (path: string, additive: boolean, range: boolean) => {
      if (range) {
        selectRange(allPaths, path)
      } else {
        selectPath(path, additive)
      }
    },
    [allPaths, selectPath, selectRange]
  )

  const handleContextMenu = useCallback(
    (e: MouseEvent, path: string, isDirectory: boolean) => {
      if (!selectedPaths.has(path)) {
        selectPath(path, false)
      }
      openContextMenu({ x: e.clientX, y: e.clientY }, path, isDirectory)
    },
    [selectedPaths, selectPath, openContextMenu]
  )

  const handleRename = useCallback(
    (path: string, isDirectory: boolean, newName: string) => {
      renameItem.mutate(
        { path, newName, isDirectory },
        {
          onSuccess: () => {
            cancelRename()
          },
          onError: () => {
            cancelRename()
          },
        }
      )
    },
    [renameItem, cancelRename]
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DragItem | undefined
    if (data) {
      setActiveDrag(data)
    }
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDrag(null)

      const { active, over } = event
      if (!over) return

      const dragData = active.data.current as DragItem | undefined
      const dropData = over.data.current as { path: string; isDirectory: boolean; isParent?: boolean } | undefined

      if (!dragData || !dropData || !dropData.isDirectory) return

      const sourcePath = dragData.path
      const destFolder = dropData.path
      const itemName = basename(sourcePath)
      const destPath = destFolder ? joinPath(destFolder, itemName) : itemName

      // Don't move to same location
      if (sourcePath === destPath) return

      // Don't move parent into child
      if (isChildOf(destFolder, sourcePath)) return

      // Don't move into itself
      if (destFolder === sourcePath) return

      moveItem.mutate(
        { from: sourcePath, to: destPath, isDirectory: dragData.isDirectory },
        {
          onSuccess: () => {
            clearSelection()
          },
        }
      )
    },
    [moveItem, clearSelection]
  )

  if (isLoading) {
    return (
      <div>
        {Array.from({ length: 8 }).map((_, i) => (
          <FileRowSkeleton key={i} index={i} />
        ))}
      </div>
    )
  }

  if (sortedEntries.length === 0) {
    return (
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <ParentRow currentPath={currentPath} shouldAnimate={shouldAnimate} />
        <EmptyState />
      </DndContext>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div>
        <ParentRow currentPath={currentPath} shouldAnimate={shouldAnimate} />
        {sortedEntries.map((entry, index) => {
          const entryPath = currentPath ? joinPath(currentPath, entry.name) : entry.name
          // Offset index by 1 when parent row exists to account for its animation slot
          const animationIndex = currentPath ? index + 1 : index

          return (
            <FileRow
              key={entry.name}
              entry={entry}
              currentPath={currentPath}
              isSelected={selectedPaths.has(entryPath)}
              isRenaming={renamingPath === entryPath}
              onSelect={handleSelect}
              onContextMenu={handleContextMenu}
              onRename={(newName) => handleRename(entryPath, entry.type === 'directory', newName)}
              onCancelRename={cancelRename}
              index={animationIndex}
              shouldAnimate={shouldAnimate}
            />
          )
        })}
      </div>
      <DragOverlay>
        {activeDrag ? (
          <div className="flex h-11 items-center gap-3 rounded-lg border border-border bg-card px-4 shadow-lg animate-scale-in">
            <FileIcon name={activeDrag.entry.name} isDirectory={activeDrag.isDirectory} />
            <span className="truncate font-medium">{activeDrag.entry.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
