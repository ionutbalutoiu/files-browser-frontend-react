import { useUIStore, SortBy } from '../../stores/uiStore'

export function FileListHeader() {
  const { sortBy, sortDirection, setSortBy, toggleSortDirection } = useUIStore()

  const handleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      toggleSortDirection()
    } else {
      setSortBy(newSortBy)
    }
  }

  const SortIcon = ({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) => (
    <svg
      className={`ml-1 h-4 w-4 ${active ? 'text-foreground' : 'text-transparent'}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={direction === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
      />
    </svg>
  )

  return (
    <div className="sticky top-14 z-10 flex h-10 items-center border-b border-border/50 bg-muted/50 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
      <button
        className="flex flex-1 items-center transition-colors hover:text-foreground"
        onClick={() => handleSort('name')}
      >
        Name
        <SortIcon active={sortBy === 'name'} direction={sortDirection} />
      </button>
      <button
        className="hidden sm:flex w-20 items-center justify-end transition-colors hover:text-foreground"
        onClick={() => handleSort('size')}
      >
        Size
        <SortIcon active={sortBy === 'size'} direction={sortDirection} />
      </button>
      <button
        className="hidden md:flex w-52 items-center justify-end transition-colors hover:text-foreground ml-6"
        onClick={() => handleSort('mtime')}
      >
        Modified
        <SortIcon active={sortBy === 'mtime'} direction={sortDirection} />
      </button>
      {/* Spacer for menu button column */}
      <div className="w-10 ml-4" />
    </div>
  )
}
