import { Link } from 'react-router-dom'

interface BreadcrumbsProps {
  path: string
}

export function Breadcrumbs({ path }: BreadcrumbsProps) {
  const segments = path ? path.split('/').filter(Boolean) : []

  return (
    <nav className="flex items-center text-sm overflow-x-auto scrollbar-none">
      <Link
        to="/browse"
        className="flex-shrink-0 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <span className="hidden sm:inline">Home</span>
      </Link>

      {segments.map((segment, index) => {
        const segmentPath = segments.slice(0, index + 1).join('/')
        const isLast = index === segments.length - 1
        return (
          <span key={segmentPath} className="flex-shrink-0 flex items-center">
            <svg
              className="h-4 w-4 text-muted-foreground/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <Link
              to={`/browse/${segmentPath}`}
              className={`rounded-md px-2.5 py-1.5 transition-colors hover:bg-accent/50 max-w-[160px] truncate ${
                isLast ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {segment}
            </Link>
          </span>
        )
      })}
    </nav>
  )
}
