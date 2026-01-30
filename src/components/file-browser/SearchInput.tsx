import { useRef, useEffect, useState, useCallback, KeyboardEvent } from 'react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  resultCount: number | undefined
}

export function SearchInput({ value, onChange, resultCount }: SearchInputProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  // Collapse when value is empty and input loses focus
  const handleBlur = useCallback(() => {
    if (!value) {
      setIsExpanded(false)
    }
  }, [value])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onChange('')
        setIsExpanded(false)
        inputRef.current?.blur()
      }
    },
    [onChange]
  )

  const handleClear = useCallback(() => {
    onChange('')
    inputRef.current?.focus()
  }, [onChange])

  const handleToggle = useCallback(() => {
    if (isExpanded && !value) {
      setIsExpanded(false)
    } else {
      setIsExpanded(true)
    }
  }, [isExpanded, value])

  // Show expanded if there's a value or if expanded state is true
  const showExpanded = isExpanded || value

  return (
    <div className="relative flex items-center">
      {showExpanded ? (
        <div className="flex items-center animate-scale-in">
          <div className="relative">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Search files..."
              className="h-8 w-48 rounded-lg border border-border bg-background pl-8 pr-8 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {value ? (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
          </div>
          {resultCount !== undefined ? (
            <span className="ml-2 text-xs text-muted-foreground whitespace-nowrap">
              {resultCount} {resultCount === 1 ? 'result' : 'results'}
            </span>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleToggle}
          className="flex h-8 items-center justify-center rounded-lg px-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Search"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
