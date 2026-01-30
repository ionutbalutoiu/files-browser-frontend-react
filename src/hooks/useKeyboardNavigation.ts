import { useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../stores/uiStore'
import { joinPath, dirname } from '../lib/path'
import type { DirectoryEntry } from '../schemas/directory'

interface UseKeyboardNavigationOptions {
  entries: DirectoryEntry[]
  currentPath: string
  enabled?: boolean
}

export function useKeyboardNavigation({
  entries,
  currentPath,
  enabled = true,
}: UseKeyboardNavigationOptions) {
  const navigate = useNavigate()

  const {
    selectedPaths,
    selectPath,
    selectAll,
    clearSelection,
    openDialog,
    lastSelectedPath,
  } = useUIStore()

  // Build paths array for navigation
  const allPaths = useMemo(
    () =>
      entries.map((entry) =>
        currentPath ? joinPath(currentPath, entry.name) : entry.name
      ),
    [entries, currentPath]
  )

  // Create a map from path to entry for quick lookup
  const pathToEntry = useMemo(
    () =>
      new Map(
        entries.map((entry) => {
          const path = currentPath ? joinPath(currentPath, entry.name) : entry.name
          return [path, entry]
        })
      ),
    [entries, currentPath]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      // Don't handle keyboard shortcuts if user is typing in an input
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      const currentIndex = lastSelectedPath ? allPaths.indexOf(lastSelectedPath) : -1

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          const nextIndex = currentIndex < allPaths.length - 1 ? currentIndex + 1 : 0
          const nextPath = allPaths[nextIndex]
          if (nextPath) {
            if (e.shiftKey) {
              // Extend selection
              const selected = new Set(selectedPaths)
              selected.add(nextPath)
              useUIStore.setState({
                selectedPaths: selected,
                lastSelectedPath: nextPath,
              })
            } else {
              selectPath(nextPath, false)
            }
          }
          break
        }

        case 'ArrowUp': {
          e.preventDefault()
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : allPaths.length - 1
          const prevPath = allPaths[prevIndex]
          if (prevPath) {
            if (e.shiftKey) {
              // Extend selection
              const selected = new Set(selectedPaths)
              selected.add(prevPath)
              useUIStore.setState({
                selectedPaths: selected,
                lastSelectedPath: prevPath,
              })
            } else {
              selectPath(prevPath, false)
            }
          }
          break
        }

        case 'Enter': {
          e.preventDefault()
          if (selectedPaths.size === 1) {
            const selectedPath = Array.from(selectedPaths)[0]
            if (selectedPath) {
              const entry = pathToEntry.get(selectedPath)
              if (entry?.type === 'directory') {
                navigate(`/browse/${selectedPath}`)
              } else {
                // Open file in new tab
                window.open(`/files/${selectedPath}`, '_blank')
              }
            }
          }
          break
        }

        case 'Backspace': {
          e.preventDefault()
          // Navigate to parent directory
          if (currentPath) {
            const parentPath = dirname(currentPath)
            navigate(`/browse/${parentPath}`)
          }
          break
        }

        case 'Delete': {
          e.preventDefault()
          if (selectedPaths.size > 0) {
            const paths = Array.from(selectedPaths)
            const firstPath = paths[0]
            const entry = firstPath ? pathToEntry.get(firstPath) : undefined
            openDialog('delete', {
              paths,
              isDirectory: entry?.type === 'directory',
            })
          }
          break
        }

        case 'Escape': {
          e.preventDefault()
          clearSelection()
          break
        }

        case 'a': {
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            selectAll(allPaths)
          }
          break
        }

        case 'F2': {
          e.preventDefault()
          if (selectedPaths.size === 1) {
            const selectedPath = Array.from(selectedPaths)[0]
            if (selectedPath) {
              const entry = pathToEntry.get(selectedPath)
              openDialog('rename', {
                path: selectedPath,
                isDirectory: entry?.type === 'directory',
              })
            }
          }
          break
        }
      }
    },
    [
      enabled,
      allPaths,
      lastSelectedPath,
      selectedPaths,
      pathToEntry,
      currentPath,
      navigate,
      selectPath,
      selectAll,
      clearSelection,
      openDialog,
    ]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, handleKeyDown])
}
