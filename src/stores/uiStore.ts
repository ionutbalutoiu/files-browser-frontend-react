import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SortBy = 'name' | 'size' | 'mtime' | 'type'
export type SortDirection = 'asc' | 'desc'

export type DialogType =
  | 'newFolder'
  | 'rename'
  | 'delete'
  | 'share'
  | 'upload'
  | null

export interface DialogData {
  path?: string
  name?: string
  paths?: string[]
  isDirectory?: boolean
}

export interface ContextMenuState {
  position: { x: number; y: number } | null
  targetPath: string | null
  targetIsDirectory: boolean
}

interface UIState {
  // View settings (persisted)
  sortBy: SortBy
  sortDirection: SortDirection

  // Selection state
  selectedPaths: Set<string>
  lastSelectedPath: string | null

  // Context menu state
  contextMenu: ContextMenuState

  // Dialog state
  activeDialog: DialogType
  dialogData: DialogData | null

  // Inline rename state
  renamingPath: string | null

  // Actions - View
  setSortBy: (sortBy: SortBy) => void
  setSortDirection: (direction: SortDirection) => void
  toggleSortDirection: () => void

  // Actions - Selection
  selectPath: (path: string, additive?: boolean) => void
  selectPaths: (paths: string[]) => void
  selectRange: (paths: string[], toPath: string) => void
  deselectPath: (path: string) => void
  clearSelection: () => void
  selectAll: (paths: string[]) => void
  isSelected: (path: string) => boolean

  // Actions - Context Menu
  openContextMenu: (position: { x: number; y: number }, targetPath: string | null, isDirectory: boolean) => void
  closeContextMenu: () => void

  // Actions - Dialogs
  openDialog: (type: DialogType, data?: DialogData) => void
  closeDialog: () => void

  // Actions - Inline rename
  startRename: (path: string) => void
  cancelRename: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      sortBy: 'name',
      sortDirection: 'asc',
      selectedPaths: new Set(),
      lastSelectedPath: null,
      contextMenu: {
        position: null,
        targetPath: null,
        targetIsDirectory: false,
      },
      activeDialog: null,
      dialogData: null,
      renamingPath: null,

      // View actions
      setSortBy: (sortBy) => set({ sortBy }),
      setSortDirection: (direction) => set({ sortDirection: direction }),
      toggleSortDirection: () =>
        set((state) => ({
          sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc',
        })),

      // Selection actions
      selectPath: (path, additive = false) =>
        set((state) => {
          const newSelected = additive ? new Set(state.selectedPaths) : new Set<string>()
          if (additive && state.selectedPaths.has(path)) {
            newSelected.delete(path)
          } else {
            newSelected.add(path)
          }
          return {
            selectedPaths: newSelected,
            lastSelectedPath: path,
          }
        }),

      selectPaths: (paths) =>
        set({
          selectedPaths: new Set(paths),
          lastSelectedPath: paths[paths.length - 1] ?? null,
        }),

      selectRange: (allPaths, toPath) =>
        set((state) => {
          const lastPath = state.lastSelectedPath
          if (!lastPath) {
            return { selectedPaths: new Set([toPath]), lastSelectedPath: toPath }
          }

          const fromIndex = allPaths.indexOf(lastPath)
          const toIndex = allPaths.indexOf(toPath)

          if (fromIndex === -1 || toIndex === -1) {
            return { selectedPaths: new Set([toPath]), lastSelectedPath: toPath }
          }

          const start = Math.min(fromIndex, toIndex)
          const end = Math.max(fromIndex, toIndex)
          const rangePaths = allPaths.slice(start, end + 1)

          return {
            selectedPaths: new Set([...state.selectedPaths, ...rangePaths]),
            lastSelectedPath: toPath,
          }
        }),

      deselectPath: (path) =>
        set((state) => {
          const newSelected = new Set(state.selectedPaths)
          newSelected.delete(path)
          return { selectedPaths: newSelected }
        }),

      clearSelection: () =>
        set({
          selectedPaths: new Set(),
          lastSelectedPath: null,
        }),

      selectAll: (paths) =>
        set({
          selectedPaths: new Set(paths),
          lastSelectedPath: paths[paths.length - 1] ?? null,
        }),

      isSelected: (path) => get().selectedPaths.has(path),

      // Context menu actions
      openContextMenu: (position, targetPath, isDirectory) =>
        set({
          contextMenu: {
            position,
            targetPath,
            targetIsDirectory: isDirectory,
          },
        }),

      closeContextMenu: () =>
        set({
          contextMenu: {
            position: null,
            targetPath: null,
            targetIsDirectory: false,
          },
        }),

      // Dialog actions
      openDialog: (type, data) =>
        set({
          activeDialog: type,
          dialogData: data ?? null,
        }),

      closeDialog: () =>
        set({
          activeDialog: null,
          dialogData: null,
        }),

      // Inline rename actions
      startRename: (path) =>
        set({
          renamingPath: path,
        }),

      cancelRename: () =>
        set({
          renamingPath: null,
        }),
    }),
    {
      name: 'file-browser-ui',
      partialize: (state) => ({
        sortBy: state.sortBy,
        sortDirection: state.sortDirection,
      }),
    }
  )
)
