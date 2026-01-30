import { useParams } from 'react-router-dom'
import { FileBrowser } from '../components/file-browser/FileBrowser'
import { validatePath } from '../lib/path'

export function BrowserPage() {
  const params = useParams()
  const rawPath = params['*'] ?? ''

  // Validate the path
  const validation = validatePath(rawPath)

  if (!validation.valid) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 rounded-2xl bg-destructive/10 p-6">
          <svg
            className="h-10 w-10 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="font-medium text-destructive">Invalid path</p>
        <p className="mt-1 text-sm text-muted-foreground">{validation.error}</p>
      </div>
    )
  }

  return <FileBrowser path={validation.normalized ?? ''} />
}
