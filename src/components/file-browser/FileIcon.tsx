import { extname } from '../../lib/path'

interface FileIconProps {
  name: string
  isDirectory: boolean
  className?: string
}

const EXTENSION_ICONS: Record<string, string> = {
  // Images
  '.jpg': 'image',
  '.jpeg': 'image',
  '.png': 'image',
  '.gif': 'image',
  '.svg': 'image',
  '.webp': 'image',
  // Documents
  '.pdf': 'pdf',
  '.doc': 'document',
  '.docx': 'document',
  '.txt': 'text',
  '.md': 'text',
  // Code
  '.js': 'code',
  '.ts': 'code',
  '.jsx': 'code',
  '.tsx': 'code',
  '.html': 'code',
  '.css': 'code',
  '.json': 'code',
  '.py': 'code',
  // Archives
  '.zip': 'archive',
  '.tar': 'archive',
  '.gz': 'archive',
  '.rar': 'archive',
  // Media
  '.mp3': 'audio',
  '.wav': 'audio',
  '.mp4': 'video',
  '.mov': 'video',
  '.avi': 'video',
}

function getIconType(name: string, isDirectory: boolean): string {
  if (isDirectory) return 'folder'
  const ext = extname(name).toLowerCase()
  return EXTENSION_ICONS[ext] ?? 'file'
}

export function FileIcon({ name, isDirectory, className = '' }: FileIconProps) {
  const iconType = getIconType(name, isDirectory)

  const iconPaths: Record<string, JSX.Element> = {
    folder: (
      <path
        fill="currentColor"
        d="M10 4H4c-1.11 0-2 .89-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z"
      />
    ),
    file: (
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z"
      />
    ),
    image: (
      <path
        fill="currentColor"
        d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
      />
    ),
    pdf: (
      <path
        fill="currentColor"
        d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"
      />
    ),
    document: (
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
      />
    ),
    text: (
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
      />
    ),
    code: (
      <path
        fill="currentColor"
        d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"
      />
    ),
    archive: (
      <path
        fill="currentColor"
        d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2 6h-2v2h2v2h-2v2h-2v-2h2v-2h-2v-2h2v-2h-2V8h2v2h2v2z"
      />
    ),
    audio: (
      <path
        fill="currentColor"
        d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
      />
    ),
    video: (
      <path
        fill="currentColor"
        d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"
      />
    ),
  }

  const iconColors: Record<string, string> = {
    folder: 'text-amber-500 dark:text-amber-400',
    file: 'text-muted-foreground',
    image: 'text-pink-500 dark:text-pink-400',
    pdf: 'text-red-500 dark:text-red-400',
    document: 'text-blue-500 dark:text-blue-400',
    text: 'text-slate-500 dark:text-slate-400',
    code: 'text-emerald-500 dark:text-emerald-400',
    archive: 'text-orange-500 dark:text-orange-400',
    audio: 'text-purple-500 dark:text-purple-400',
    video: 'text-violet-500 dark:text-violet-400',
  }

  return (
    <svg
      className={`h-5 w-5 flex-shrink-0 ${iconColors[iconType] ?? 'text-muted-foreground'} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="none"
    >
      {iconPaths[iconType]}
    </svg>
  )
}
