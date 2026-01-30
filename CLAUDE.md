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

## Architecture

### File Structure
```
src/
├── api/client.ts              # apiFetch, filesFetch, uploadFetch with ApiError class
├── env.ts                     # Runtime config: getPublicBaseUrl(), buildShareUrl()
├── lib/
│   ├── path.ts                # validatePath, joinPath, dirname, basename
│   ├── query-keys.ts          # Query key factory
│   ├── cache.ts               # clearDirCache, invalidateDir helpers
│   └── format.ts              # formatFileSize, formatDate
├── stores/uiStore.ts          # Zustand: selection, sorting, dialogs, inline rename
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

### UI Store State (Zustand)
```typescript
interface UIState {
  // Sorting (persisted)
  sortBy: 'name' | 'size' | 'mtime' | 'type'
  sortDirection: 'asc' | 'desc'

  // Selection
  selectedPaths: Set<string>
  lastSelectedPath: string | null

  // Context menu
  contextMenu: { position, targetPath, targetIsDirectory }

  // Dialogs
  activeDialog: 'newFolder' | 'delete' | 'share' | null
  dialogData: { path?, paths?, isDirectory? }

  // Inline rename
  renamingPath: string | null
}
```

## UI/UX Patterns

### Mobile Support
- **Responsive columns**: Size hidden on mobile (sm+), Modified hidden on tablets (md+)
- **Touch drag**: Hold 300ms to initiate drag-and-drop move
- **Context menu**: Always-visible `⋮` button with hover highlight
- **Viewport-aware menus**: Context menu auto-repositions to stay within screen bounds
- **Scrollable breadcrumbs**: Horizontal scroll with hidden scrollbar

### Inline Rename
- Triggered via context menu "Rename" action
- Input auto-focuses and selects filename (without extension for files)
- Submit on Enter or blur, cancel on Escape
- Disables drag while editing

### Layout
- Max-width container (6xl/1152px) centered
- Card-based file browser with rounded corners and subtle shadow
- Combined breadcrumbs + search + toolbar header row
- File list with natural page scrolling (no internal scrollbar)
- Footer with folder/file counts

### Search
- Expandable search input next to breadcrumbs
- Filters entries by name (case-insensitive)
- Shows result count when active
- Escape to clear and collapse

### Text Sizes
- Base font: 17px (set in index.css)
- File names: 14px (text-sm)
- Metadata: 12px (text-xs)
- Headers: 16px (text-base)
- Navigation: 14px (text-sm)

### Table Column Widths
- Name: flex-1 (fills remaining space)
- Size: w-20, text-right
- Modified: w-52, ml-6, text-right
- Menu button: w-10, ml-4

## Critical Path Validation Rules
Reject paths that:
- Start with `/` (absolute)
- Contain `..`
- Contain null bytes or backslashes
- Have segments starting with `.` (hidden files)

## Caching Strategy
- Query key `['dir', path]` for directory listings
- Query key `['shares']` for shares
- staleTime: 10s, gcTime: 5min
- **DIRECTORY MOVE/RENAME**: Clear ALL `['dir', *]` queries, then refetch current + parents

## Environment Variables
```
VITE_API_ORIGIN          # API base URL (default: same origin)
VITE_FILES_ORIGIN        # Files listing base URL (default: same origin)
VITE_SHARE_ORIGIN        # Share link base URL (warn if missing)
VITE_SHARE_URL_TEMPLATE  # Default: /{shareId}
```

### Runtime Configuration
Share links use `PUBLIC_BASE_URL` injected at runtime via Docker:
- `public/assets/runtime-config.js` contains placeholder
- Docker entrypoint replaces `__PUBLIC_BASE_URL__` with actual value
- `src/env.ts` exports `getPublicBaseUrl()` and `buildShareUrl()`

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

## Code Patterns

### Context Menu with Viewport Bounds
```typescript
// Adjust position to keep menu within viewport
useEffect(() => {
  if (!position || !menuRef.current) return
  const rect = menuRef.current.getBoundingClientRect()
  let x = position.x, y = position.y
  if (x + rect.width > window.innerWidth - 8) x = window.innerWidth - rect.width - 8
  if (y + rect.height > window.innerHeight - 8) y = window.innerHeight - rect.height - 8
  setAdjustedPosition({ x, y })
}, [position])
```

### Touch + Pointer Sensors for DnD
```typescript
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 8 } })
)
```

### Inline Rename Input Selection
```typescript
// Select filename without extension for files
const lastDot = entry.name.lastIndexOf('.')
if (!isDirectory && lastDot > 0) {
  inputRef.current.setSelectionRange(0, lastDot)
} else {
  inputRef.current.select()
}
```

### Date Formatting
```typescript
// Consistent format: "Jan 15, 2026, 07:53 PM"
new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}).format(date)
```

## React Best Practices
1. **Direct imports** - import `@radix-ui/react-dialog` not from barrel
2. **Functional setState** - use callback form for stable callbacks
3. **Set for selection** - O(1) lookup with `Set<string>`
4. **Ternary not &&** - `{items.length > 0 ? <List /> : null}`
5. **content-visibility** - CSS optimization for file rows
6. **memo for rows** - FileRow wrapped in React.memo

## Gotchas
- `useRenameItem` param is `newName` not `name`
- Context menus need viewport bounds check (see Code Patterns)
- Mobile: always show action buttons, don't rely on hover states
- TouchSensor needs `delay` constraint, PointerSensor needs `distance`
- Tailwind responsive: `sm:` = 640px+, `md:` = 768px+
- New Folder uses dialog (not inline) - inline error display was problematic
- Share operations show toast notifications with clipboard copy on create
