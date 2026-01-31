import { useSharesQuery } from '../../hooks/queries/useSharesQuery'
import { ShareRow } from './ShareRow'
import { ShareRowSkeleton } from './ShareRowSkeleton'

export function SharesList() {
  const { data: shares = [], isLoading, error } = useSharesQuery()

  if (isLoading) {
    return (
      <div className="divide-y divide-border/30">
        {Array.from({ length: 5 }).map((_, i) => (
          <ShareRowSkeleton key={i} index={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 rounded-2xl bg-destructive/10 p-6">
          <svg className="h-10 w-10 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="font-medium text-destructive">Error loading shares</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  if (shares.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground animate-fade-up">
        <div className="mb-4 rounded-xl bg-muted/30 p-5">
          <svg
            className="h-10 w-10 opacity-40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium">No shared items</p>
        <p className="mt-1 text-sm text-muted-foreground/60">
          Right-click a file to create a share link
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/30">
      {shares.map((path) => (
        <ShareRow key={path} path={path} />
      ))}
    </div>
  )
}
