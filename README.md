# File Browser Frontend

A production-ready SPA file browser built with React, TypeScript, and Vite. Integrates with a backend API for file operations (upload, mkdir, rename, move, delete) and public share management.

## Features

- **File Navigation**: Browse directories with virtualized list for performance
- **File Operations**: Create folders, upload files, rename, move (drag-and-drop), delete
- **Public Shares**: Create and manage public share links
- **Keyboard Navigation**: Full keyboard support (arrow keys, Enter, Delete, Ctrl+A, etc.)
- **Context Menu**: Right-click for quick actions
- **Drag and Drop**: Move files by dragging to folders
- **Sorting**: Sort by name, size, or date modified
- **Responsive**: Works on desktop browsers

## Tech Stack

- **React 18** with TypeScript (strict mode)
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **TanStack Query** for data fetching and caching
- **Zustand** for state management
- **Radix UI** for accessible components
- **dnd-kit** for drag-and-drop
- **TanStack Virtual** for list virtualization
- **Zod** for schema validation

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at http://localhost:3000

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# API Configuration
VITE_API_ORIGIN=       # Base URL for API endpoints (default: same origin)
VITE_FILES_ORIGIN=     # Base URL for file listings (default: same origin)
VITE_SHARE_ORIGIN=     # Base URL for share links (recommended to set)
VITE_SHARE_URL_TEMPLATE=/s/{shareId}  # Share URL template
```

## Available Scripts

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm preview    # Preview production build
pnpm test       # Run unit tests
pnpm test:e2e   # Run E2E tests (Playwright)
pnpm lint       # Run ESLint
pnpm typecheck  # Run TypeScript type checking
```

## Project Structure

```
src/
├── api/                 # API client and network layer
├── components/
│   ├── dialogs/         # Dialog components (NewFolder, Rename, Delete, Share)
│   ├── file-browser/    # Main file browser components
│   ├── shares/          # Shares management components
│   ├── ui/              # Reusable UI components (Radix wrappers)
│   └── upload/          # Upload dropzone component
├── hooks/
│   ├── mutations/       # React Query mutation hooks
│   └── queries/         # React Query query hooks
├── lib/                 # Utilities (path, cache, format, query-keys)
├── pages/               # Route pages
├── providers/           # React providers (Query, Toast)
├── schemas/             # Zod schemas
└── stores/              # Zustand stores
```

## Backend API Endpoints

The frontend expects the following API endpoints:

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

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Arrow Up/Down | Navigate through files |
| Enter | Open folder / Download file |
| Backspace | Go to parent directory |
| Delete | Delete selected items |
| Ctrl/Cmd + A | Select all |
| Escape | Clear selection |
| F2 | Rename selected item |

## Path Validation

The frontend validates paths to prevent security issues:
- Rejects absolute paths (starting with `/`)
- Rejects directory traversal (`..`)
- Rejects null bytes and backslashes
- Rejects hidden files (segments starting with `.`)

## License

MIT
