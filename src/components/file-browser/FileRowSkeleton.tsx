import { Skeleton } from '../ui/Skeleton'
import { getStaggerClass } from '../../lib/animation'

interface FileRowSkeletonProps {
  index?: number
}

export function FileRowSkeleton({ index = 0 }: FileRowSkeletonProps) {
  const staggerClass = getStaggerClass(index)

  return (
    <div
      className={`flex h-12 items-center border-b border-border/30 px-4 opacity-0 animate-fade-up ${staggerClass}`}
    >
      {/* Icon skeleton */}
      <Skeleton className="flex-shrink-0 mr-3 h-5 w-5 rounded" />

      {/* Name skeleton */}
      <Skeleton className="flex-1 h-4 max-w-[200px]" />

      {/* Size skeleton - hidden on mobile */}
      <Skeleton className="hidden sm:block w-14 h-3 ml-auto" />

      {/* Date skeleton - hidden on tablet */}
      <Skeleton className="hidden md:block w-36 h-3 ml-6" />

      {/* Menu button placeholder */}
      <div className="w-10 ml-4" />
    </div>
  )
}
