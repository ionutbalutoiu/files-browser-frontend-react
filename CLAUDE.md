# File Browser Frontend - Project Context

## Project Status
Implementation plan complete. Ready to scaffold project and begin development.

## What This Is
Production-ready SPA file browser frontend integrating with a backend API for file operations (upload, mkdir, rename, move, delete) and public share management. Single-tenant, no auth.

## Tech Stack
- **Core**: React 18.3+ / TypeScript (strict) / Vite 5.3+ / Tailwind CSS 3.4+
- **Package Manager**: pnpm
- **Data**: @tanstack/react-query 5.50+ (caching, mutations)
- **UI**: Radix UI primitives (Dialog, ContextMenu, DropdownMenu, Tooltip, Toast, ScrollArea)
- **State**: Zustand 4.5+ (selection, sorting, dialogs)
- **DnD**: @dnd-kit/core 6.1+
- **Virtualization**: @tanstack/react-virtual 3.8+
- **Validation**: Zod 3.23+
- **Testing**: Vitest + React Testing Library + Playwright + MSW

## Backend API Endpoints
```
GET  /files/<path>?format=json     # Directory listing (Nginx autoindex JSON)
PUT  /api/files?path=<dir>         # Upload (multipart/form-data)
POST /api/folders                   # Create folder { path }
DELETE /api/files?path=<path>      # Delete item
POST /api/files/move               # Move { from, to }
POST /api/files/rename             # Rename { path, name }
GET  /api/public-shares            # List shares -> string[]
POST /api/public-shares            # Create share { path }
DELETE /api/public-shares?path=    # Delete share
```

## Critical Path Validation Rules
Reject paths that:
- Start with `/` (absolute)
- Contain `..`
- Contain null bytes or backslashes
- Have segments starting with `.` (hidden files)

## Caching Strategy (CRITICAL)
- Query key `['dir', path]` for directory listings
- Query key `['shares']` for shares
- staleTime: 10s, gcTime: 5min
- **DIRECTORY MOVE/RENAME**: Clear ALL `['dir', *]` queries, then refetch current + parents

## Key Files to Create
```
src/
├── api/client.ts          # apiFetch, filesFetch, uploadFetch with ApiError class
├── lib/path.ts            # validatePath, joinPath, dirname, basename, encodePathForApi
├── lib/query-keys.ts      # Query key factory
├── lib/cache.ts           # clearDirCache, invalidateDir helpers
├── stores/uiStore.ts      # Zustand: selection, sorting, dialogs
├── hooks/queries/         # useDirectoryQuery, useSharesQuery
├── hooks/mutations/       # useCreateFolder, useDeleteItem, useRenameItem, useMoveItem, useUploadFiles
├── components/ui/         # Radix wrappers with Tailwind
├── components/file-browser/  # FileBrowser, FileList, FileRow, Breadcrumbs, Toolbar
├── components/dialogs/    # NewFolderDialog, RenameDialog, DeleteConfirmDialog, ShareDialog
```

## Environment Variables
```
VITE_API_ORIGIN      # API base URL (default: same origin)
VITE_FILES_ORIGIN    # Files listing base URL (default: same origin)
VITE_SHARE_ORIGIN    # Share link base URL (warn if missing)
VITE_SHARE_URL_TEMPLATE  # Default: /s/{shareId}
```

## React Best Practices (from .agents/skills)
1. **Direct imports** - import `@radix-ui/react-dialog` not from barrel
2. **Lazy load dialogs** - `React.lazy(() => import('./dialogs/ShareDialog'))`
3. **Preload on hover** - `onMouseEnter={() => void import('./dialogs/ShareDialog')}`
4. **Functional setState** - use callback form for stable callbacks
5. **Set for selection** - O(1) lookup with `Set<string>`
6. **Ternary not &&** - `{items.length > 0 ? <List /> : null}`
7. **content-visibility** - CSS optimization for file rows

## Commands
```bash
pnpm dev        # Development server
pnpm build      # Production build
pnpm preview    # Preview production build
pnpm test       # Vitest unit tests
pnpm test:e2e   # Playwright E2E tests
pnpm lint       # ESLint
pnpm typecheck  # TypeScript check
```

## Implementation Order
1. Project setup (Vite, deps, configs)
2. Path utilities with tests
3. Network layer with Zod schemas
4. Query client and cache helpers
5. Zustand store
6. UI primitives (Radix wrappers)
7. Basic file browser (list, breadcrumb)
8. Mutations (mkdir, delete, rename)
9. Drag-and-drop move
10. Upload functionality
11. Shares (create, delete, view)
12. Keyboard shortcuts
13. Context menu
14. Error boundary and toasts
15. E2E tests
16. Documentation

## Full Plan
See `.claude/plans/enchanted-giggling-feigenbaum.md` for complete implementation details.
