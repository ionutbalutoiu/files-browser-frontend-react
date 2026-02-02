# File Browser Frontend - Project Context

## Project Status
Core implementation complete. Mobile-friendly UI with inline rename, file search, drag-and-drop, and public share management.

## What This Is
Production-ready SPA file browser frontend integrating with a backend API for file operations (upload, mkdir, rename, move, delete) and public share management. Single-tenant, no auth.

## Tech Stack
- **Core**: React 18.3+ / TypeScript (strict) / Vite 5.3+ / Tailwind CSS 3.4+
- **Package Manager**: pnpm
- **Data**: @tanstack/react-query 5.50+ (caching, mutations)
- **UI**: Radix UI primitives (Dialog, ContextMenu, DropdownMenu, Tooltip, Toast, ScrollArea)
- **State**: Zustand 4.5+ (selection, sorting, dialogs, inline rename)
- **DnD**: @dnd-kit/core 6.1+ (with TouchSensor for mobile)
- **Virtualization**: @tanstack/react-virtual 3.8+ (available but not currently used)
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

## File Structure
```
src/
├── api/client.ts              # apiFetch, filesFetch, uploadFetch with ApiError class
├── env.ts                     # Runtime config: getPublicBaseUrl(), buildShareUrl()
├── lib/
│   ├── path.ts                # validatePath, joinPath, dirname, basename, extname, getParentPaths, isChildOf
│   ├── query-keys.ts          # Query key factory
│   ├── cache.ts               # clearDirCache, invalidateDir helpers
│   └── format.ts              # formatFileSize, formatDate
├── stores/uiStore.ts          # Zustand: selection (Set<string>), sorting, dialogs, inline rename
├── hooks/
│   ├── queries/               # useDirectoryQuery, useSharesQuery
│   ├── mutations/             # useCreateFolder, useDeleteItem, useRenameItem, useMoveItem, useUploadFiles
│   └── useKeyboardNavigation.ts
├── components/
│   ├── ui/                    # Radix wrappers with Tailwind
│   ├── file-browser/          # FileBrowser, FileList, FileRow, Breadcrumbs, Toolbar, FileContextMenu, SearchInput
│   ├── dialogs/               # NewFolderDialog, DeleteConfirmDialog, ShareDialog
│   ├── shares/                # SharesList, ShareRow
│   └── upload/                # UploadDropzone
├── pages/                     # BrowserPage, SharesPage
└── providers/                 # QueryProvider, ToastProvider
```

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

## Workflow
- **Run `pnpm build` after each change** - User is testing production builds via Docker Compose

## Environment Variables
```
VITE_API_ORIGIN          # API base URL (default: same origin)
VITE_FILES_ORIGIN        # Files listing base URL (default: same origin)
VITE_SHARE_ORIGIN        # Share link base URL (warn if missing)
VITE_SHARE_URL_TEMPLATE  # Default: /{shareId}
```

Share links use `PUBLIC_BASE_URL` injected at runtime via Docker (`public/assets/runtime-config.js`).

## Caching Strategy
- Query key `['dir', path]` for directory listings, `['shares']` for shares
- staleTime: 10s, gcTime: 5min
- **DIRECTORY MOVE/RENAME**: Clear ALL `['dir', *]` queries, then refetch current + parents

## Path Validation
Reject paths that: start with `/`, contain `..`, contain null bytes or backslashes, have segments starting with `.`

## Key Patterns

### API Error Handling
`ApiError` class with `status`, `statusText`, `body`. Factory: `ApiError.fromResponse(response)`. Upload uses XHR for progress.

### CSS Utilities (index.css)
`.section-gradient-bg`, `.interactive-hover`, `.animate-fade-in/up/scale-in`, `.stagger-1` through `.stagger-10`, `.hover-lift`, `.focus-ring`

### DnD Sensors
PointerSensor with `distance: 8`, TouchSensor with `delay: 300, tolerance: 8`

### React Conventions
- Direct Radix imports (not barrel)
- `Set<string>` for selection (O(1) lookup)
- Ternary not && for conditionals
- FileRow uses React.memo

## Gotchas
- `useRenameItem` param is `newName` not `name`
- Context menus need viewport bounds check to stay within screen
- Mobile: always show action buttons, don't rely on hover states
- Tailwind responsive: `sm:` = 640px+, `md:` = 768px+
- New Folder uses dialog (not inline) - inline error display was problematic
- Inline rename selects filename without extension for files
- FileIcon maps extensions to types with colors: amber=folder, pink=image, red=pdf, emerald=code, purple=archive
