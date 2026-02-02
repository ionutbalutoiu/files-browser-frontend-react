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
  activeDialog: 'newFolder' | 'rename' | 'delete' | 'share' | 'upload' | null
  dialogData: { path?, paths?, isDirectory? }

  // Inline rename
  renamingPath: string | null
}
```

### Theme Store (themeStore.ts)
- Options: `'light'` | `'dark'` | `'system'`
- Listens to `window.matchMedia` for system preference changes
- Persists to localStorage, syncs `dark` class to `document.documentElement`

### Upload Store (uploadStore.ts)
- Concurrency: 3 simultaneous uploads
- Retry: 3 attempts with exponential backoff (1s, 2s, 4s)
- Non-serializable data (File, AbortController) stored in Maps outside Zustand
- Two-phase removal: `dismiss()` triggers exit animation, `remove()` cleans up after 200ms

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

### Keyboard Shortcuts (useKeyboardNavigation)
- **Arrow Up/Down**: Navigate (+ Shift for range selection)
- **Enter**: Open directory / open file in new tab
- **Backspace**: Navigate to parent
- **Delete**: Delete selected items
- **Escape**: Clear selection
- **Ctrl/Cmd+A**: Select all
- **F2**: Rename selected item

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

## Workflow
- **Run `pnpm build` after each change** - User is testing production builds via Docker Compose

## Plan Mode Guidelines

When in plan mode, act as a **Senior React Frontend Engineer** reviewing every proposed change through a production-quality lens. Before finalizing any implementation plan, systematically evaluate and propose improvements in these areas:

### 1. Performance Optimization
- **Render efficiency**: Identify unnecessary re-renders; propose `useMemo`, `useCallback`, `React.memo` where beneficial
- **Bundle size**: Flag new dependencies; prefer tree-shakeable imports; avoid importing entire libraries
- **Code splitting**: Consider lazy loading for routes, dialogs, heavy components
- **List virtualization**: Recommend `@tanstack/react-virtual` for lists >100 items
- **Animation performance**: Prefer CSS transforms/opacity over layout-triggering properties; use `will-change` sparingly
- **Network efficiency**: Batch API calls; leverage react-query caching; implement optimistic updates

### 2. TypeScript & Type Safety
- **Strict typing**: No `any`; use `unknown` for uncertain types; leverage discriminated unions
- **Props interfaces**: Extract and export reusable prop types; use `Pick`/`Omit` for derived types
- **Generic components**: Identify opportunities for type-safe reusable components
- **Zod schemas**: Validate external data (API responses, URL params) at boundaries
- **Exhaustive checks**: Use `never` type for switch statement exhaustiveness

### 3. React Patterns & Architecture
- **Component composition**: Prefer composition over prop drilling; use compound components for complex UI
- **Custom hooks**: Extract reusable logic into hooks; ensure proper dependency arrays
- **State colocation**: Keep state as close to usage as possible; lift only when necessary
- **Controlled vs uncontrolled**: Be intentional about form component patterns
- **Error boundaries**: Wrap feature boundaries; provide meaningful fallback UI
- **Suspense boundaries**: Use with lazy components and data fetching

### 4. Accessibility (a11y)
- **Semantic HTML**: Use correct elements (`button` not `div`, `nav`, `main`, etc.)
- **ARIA attributes**: Add `aria-label`, `aria-describedby`, `role` where needed
- **Keyboard navigation**: Ensure all interactive elements are focusable and operable
- **Focus management**: Trap focus in modals; restore focus on close; visible focus indicators
- **Screen reader announcements**: Use live regions for dynamic content updates
- **Color contrast**: Ensure sufficient contrast ratios; don't rely solely on color

### 5. Error Handling & Resilience
- **API error states**: Handle loading, error, empty states explicitly
- **Graceful degradation**: App should remain functional when features fail
- **User feedback**: Clear error messages; actionable recovery options
- **Retry mechanisms**: Implement for transient failures (network, etc.)
- **Input validation**: Validate early; show inline errors; prevent invalid submissions

### 6. Code Quality & Maintainability
- **Single responsibility**: Components do one thing well; extract when >200 lines
- **Naming conventions**: Descriptive names; consistent patterns across codebase
- **Co-location**: Keep related code together (component + styles + tests + types)
- **Avoid premature abstraction**: Wait for 3+ usages before extracting utilities
- **Comments**: Explain "why" not "what"; document non-obvious decisions

### 7. Testing Considerations
- **Testability**: Design components to be easily testable; inject dependencies
- **Test coverage**: Identify critical paths requiring unit/integration tests
- **Mock boundaries**: Plan MSW handlers for new API interactions
- **E2E scenarios**: Flag user flows needing Playwright coverage

### 8. Security
- **XSS prevention**: Avoid `dangerouslySetInnerHTML`; sanitize user content
- **URL handling**: Validate and sanitize dynamic URLs; use `encodeURIComponent`
- **Sensitive data**: Never log or expose tokens/credentials; use httpOnly cookies
- **CSRF protection**: Ensure API mutations are protected

### Plan Mode Process

1. **Understand the request**: Clarify requirements and constraints before designing
2. **Explore the codebase**: Read relevant existing code to understand patterns and dependencies
3. **Identify impacts**: List all files/components affected by the change
4. **Apply expert review**: Evaluate against ALL checklist areas above
5. **Propose improvements**: Suggest enhancements beyond the minimum requirement
6. **Present trade-offs**: Explain complexity vs benefit for optional improvements
7. **Structure the plan**: Break into atomic, reviewable implementation steps
8. **Verify completeness**: Ensure plan covers error handling, edge cases, and testing

## Code Patterns

### API Error Handling (api/client.ts)
- `ApiError` class with `status`, `statusText`, `body` properties
- Factory: `ApiError.fromResponse(response)` extracts error message from JSON
- Upload uses XHR for progress tracking with `onProgress` callback and AbortSignal

### Reusable CSS Utilities (index.css)
- `.section-gradient-bg` - gradient background for section headers
- `.interactive-hover` - depth-aware hover with lift/shadow effect
- `.animate-fade-in`, `.animate-fade-up`, `.animate-scale-in` - entry animations
- `.animate-notification-enter/exit` - responsive toast animations (right on desktop, bottom on mobile)
- `.stagger-1` through `.stagger-10` - cascading animation delays (50ms increments)
- `.hover-lift` - subtle lift with shadow on hover
- `.focus-ring` - consistent focus-visible ring

### Depth-Aware Hover Pattern
```css
hover:bg-accent/50 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
```
Use for interactive elements (buttons, links, sort headers). Applied via `.interactive-hover` utility or Button ghost variant.

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

### Path Utilities (lib/path.ts)
- `extname(path)` - extract file extension
- `getParentPaths(path)` - all ancestor paths for breadcrumbs
- `isChildOf(childPath, parentPath)` - path relationship check

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
- FileIcon maps extensions to types: image (jpg/png/gif), code (js/ts/py), document (doc/pdf), etc.
- Icon colors: amber=folder, pink=image, red=pdf, emerald=code, purple=archive
