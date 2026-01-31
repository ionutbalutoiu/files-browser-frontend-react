import { Skeleton } from '../ui/Skeleton'

interface ShareRowSkeletonProps {
  index?: number
}

export function ShareRowSkeleton({ index = 0 }: ShareRowSkeletonProps) {
  // Cap stagger delay at 10 items
  const staggerClass = index < 10 ? `stagger-${index + 1}` : 'stagger-10'

  return (
    <div
      className={`flex items-center gap-4 px-4 py-4 opacity-0 animate-fade-up ${staggerClass}`}
    >
      {/* Icon skeleton */}
      <Skeleton className="flex-shrink-0 h-10 w-10 rounded-lg" />

      {/* Text content skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>

      {/* Buttons skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </div>
  )
}
