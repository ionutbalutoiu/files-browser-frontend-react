interface EmptyStateProps {
  message?: string
}

export function EmptyState({ message = 'This folder is empty' }: EmptyStateProps) {
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
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium">{message}</p>
      <p className="mt-1 text-sm text-muted-foreground/60">Drop files here or click upload</p>
    </div>
  )
}
